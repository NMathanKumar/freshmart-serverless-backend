import { S3Client, ListObjectVersionsCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';

const s3 = new S3Client({ region: 'ap-southeast-1' });
const cloudfront = new CloudFrontClient({ region: 'ap-southeast-1' });

const rollback = async (bucketName, distributionId) => {
  console.log(`Checking versions for bucket S3://${bucketName}...`);
  const response = await s3.send(
    new ListObjectVersionsCommand({
      Bucket: bucketName,
      MaxKeys: 100
    })
  );

  const versions = response.Versions || [];
  if (versions.length === 0) {
    console.log('No object versions found. Rollback requires S3 versioning enabled.');
    return;
  }

  // Find index.html previous versions
  const indexVersions = versions.filter((v) => v.Key === 'index.html');
  if (indexVersions.length < 2) {
    console.log('No previous version of index.html found to roll back to.');
    return;
  }

  const previousVersion = indexVersions[1];
  console.log(`Reverting index.html to version ID: ${previousVersion.VersionId} (Last modified: ${previousVersion.LastModified})`);

  // Restore previous index.html by copying it over the latest
  await s3.send(
    new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/index.html?versionId=${previousVersion.VersionId}`,
      Key: 'index.html'
    })
  );

  // Invalidate CloudFront
  const invalidationResponse = await cloudfront.send(
    new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `rollback-${Date.now()}`,
        Paths: {
          Quantity: 1,
          Items: ['/index.html']
        }
      }
    })
  );

  console.log(`Rollback completed successfully! Invalidation ID: ${invalidationResponse.Invalidation?.Id}`);
};

const run = async () => {
  const args = process.argv.slice(2);
  const target = args[0] || 'all';

  const customerBucket = 'freshmart-dev-customer-web-769044546162';
  const customerDistribution = 'E2AYXUW7XETQYZ';
  const adminBucket = 'freshmart-dev-admin-web-769044546162';
  const adminDistribution = 'E3PIAKBDQ9M7HW';

  try {
    if (target === 'customer' || target === 'all') {
      console.log('--- Rolling back Customer Web ---');
      await rollback(customerBucket, customerDistribution);
    }
    if (target === 'admin' || target === 'all') {
      console.log('--- Rolling back Admin Web ---');
      await rollback(adminBucket, adminDistribution);
    }
  } catch (error) {
    console.error('Rollback failed:', error);
    process.exit(1);
  }
};

run();
