import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand, waitUntilInvalidationCompleted } from '@aws-sdk/client-cloudfront';
import fs from 'fs';
import path from 'path';

const s3 = new S3Client({ region: 'ap-southeast-1' });
const cloudfront = new CloudFrontClient({ region: 'ap-southeast-1' });

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
};

const getCacheControl = (filePath) => {
  const relativePath = filePath.replace(/\\/g, '/');
  if (relativePath.endsWith('index.html')) {
    return 'no-cache,max-age=0,must-revalidate';
  }
  if (relativePath.includes('/assets/')) {
    return 'public, max-age=31536000, immutable';
  }
  return 'public, max-age=3600';
};

const uploadDir = async (dirPath, bucketName, baseDir = dirPath, keyPrefix = '') => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await uploadDir(fullPath, bucketName, baseDir, keyPrefix);
    } else {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      const s3Key = keyPrefix ? `${keyPrefix}${relativePath}` : relativePath;
      const fileStream = fs.createReadStream(fullPath);
      const contentType = getContentType(fullPath);
      const cacheControl = getCacheControl(relativePath);

      console.log(`Uploading ${s3Key} -> S3://${bucketName} (${contentType})`);
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: fileStream,
          ContentType: contentType,
          CacheControl: cacheControl
        })
      );
    }
  }
};

const invalidateDistribution = async (distributionId) => {
  console.log(`Creating CloudFront invalidation for distribution ${distributionId}...`);
  const response = await cloudfront.send(
    new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `deploy-${Date.now()}`,
        Paths: {
          Quantity: 1,
          Items: ['/*']
        }
      }
    })
  );
  const invalidationId = response.Invalidation?.Id;
  console.log(`Waiting for invalidation ${invalidationId} to complete...`);
  
  await waitUntilInvalidationCompleted(
    { client: cloudfront, maxWaitTime: 600 },
    { DistributionId: distributionId, Id: invalidationId }
  );
  console.log(`Invalidation completed.`);
};

const run = async () => {
  const args = process.argv.slice(2);
  const target = args[0] || 'customer';
  const env = args[1] || process.env.ENVIRONMENT || process.env.TF_VAR_environment || 'dev';

  const customerBucket = env === 'prod' 
    ? 'freshmart-prod-customer-web-769044546162' 
    : 'freshmart-dev-customer-web-769044546162';

  const adminBucket = env === 'prod'
    ? 'freshmart-prod-admin-web-769044546162'
    : 'freshmart-dev-admin-web-769044546162';

  // Unified CloudFront distribution (single entry point)
  // After terraform apply, update these with the unified distribution IDs
  // Falls back to customer distribution IDs for backward compatibility
  const unifiedDistribution = env === 'prod' 
    ? (process.env.UNIFIED_CF_PROD || 'E1ZJQ37X0661FO')
    : (process.env.UNIFIED_CF_DEV || 'E2AYXUW7XETQYZ');

  try {
    if (target === 'customer' || target === 'all') {
      const customerDistPath = fs.existsSync(path.resolve('apps/customer-web/dist'))
        ? path.resolve('apps/customer-web/dist')
        : path.resolve('apps/customer-web/.output/public');
      if (!fs.existsSync(customerDistPath)) {
        throw new Error(`Customer build output not found at ${customerDistPath}. Run build first!`);
      }
      console.log(`--- Deploying Customer Frontend (${env.toUpperCase()}) ---`);
      await uploadDir(customerDistPath, customerBucket);
    }

    if (target === 'admin' || target === 'all') {
      const adminDistPath = fs.existsSync(path.resolve('apps/admin-web/dist'))
        ? path.resolve('apps/admin-web/dist')
        : path.resolve('apps/admin-web/.output/public');
      if (!fs.existsSync(adminDistPath)) {
        throw new Error(`Admin build output not found at ${adminDistPath}. Run build first!`);
      }
      console.log(`--- Deploying Admin Frontend (${env.toUpperCase()}) ---`);
      await uploadDir(adminDistPath, adminBucket, adminDistPath, 'admin/');
    }

    console.log(`--- Invalidating CloudFront (${env.toUpperCase()}) ---`);
    await invalidateDistribution(unifiedDistribution);

    console.log('Deployment completed successfully!');
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
};

run();
