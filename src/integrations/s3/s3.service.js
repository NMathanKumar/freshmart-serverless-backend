const {
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { genId } = require('../../core/utils/id');
const { BadRequestError } = require('../../core/errors/ApiError');
const logger = require('../../core/utils/logger');
const awsConfig = require('../aws/aws.config');
const { s3Client } = require('../aws/aws.client');
const { awsOperationError } = require('../aws/aws.errors');
const { logAwsRequest, logAwsFailure } = require('../aws/aws.logger');

const ensureBucket = () => {
  if (!awsConfig.s3Bucket) {
    return null;
  }
  return awsConfig.s3Bucket;
};

const normalizeBody = (body) => {
  if (body === undefined || body === null) {
    throw new BadRequestError('S3 upload body is required');
  }
  return body;
};

const buildObjectKey = (prefix, key) => key || `${prefix}/${genId('OBJ')}`;

const buildMockObjectResponse = (bucket, key, extra = {}) => ({
  bucket,
  key,
  ...extra,
});

const sendS3Command = async (operation, request, failureMessage, command) => {
  try {
    const response = await s3Client.send(command);
    logAwsRequest({
      service: 's3',
      operation,
      requestId: response?.$metadata?.requestId,
      request,
      response: {
        httpStatusCode: response?.$metadata?.httpStatusCode,
        etag: response?.ETag,
        versionId: response?.VersionId,
      },
    });
    return response;
  } catch (error) {
    logAwsFailure({
      service: 's3',
      operation,
      requestId: error?.$metadata?.requestId,
      request,
      error,
    });
    throw awsOperationError(failureMessage);
  }
};

class S3Service {
  async uploadFoodImage({ key, body, contentType, metadata = {} } = {}) {
    const Bucket = ensureBucket();
    const Key = buildObjectKey('food-images', key);
    if (!Bucket) {
      const response = buildMockObjectResponse('mock-bucket', Key, {
        url: `https://mock-s3.local/${encodeURI(Key)}`,
        etag: `mock-etag-${genId('ETAG')}`,
        versionId: `mock-version-${genId('VER')}`,
        requestId: `mock-request-${genId('REQ')}`,
      });
      logger.info('Mock S3 uploadFoodImage', { key: Key, contentType });
      return response;
    }
    const request = { Bucket, Key, contentType };
    const response = await sendS3Command(
      'UploadFoodImage',
      request,
      'Failed to upload food image to S3',
      new PutObjectCommand({
        Bucket,
        Key,
        Body: normalizeBody(body),
        ContentType: contentType,
        Metadata: metadata,
      })
    );

    return {
      bucket: Bucket,
      key: Key,
      etag: response?.ETag || null,
      versionId: response?.VersionId || null,
      requestId: response?.$metadata?.requestId || null,
    };
  }

  async uploadInvoice({ key, body, contentType, metadata = {} } = {}) {
    const Bucket = ensureBucket();
    const Key = buildObjectKey('invoices', key);
    if (!Bucket) {
      const response = buildMockObjectResponse('mock-bucket', Key, {
        url: `https://mock-s3.local/${encodeURI(Key)}`,
        etag: `mock-etag-${genId('ETAG')}`,
        versionId: `mock-version-${genId('VER')}`,
        requestId: `mock-request-${genId('REQ')}`,
      });
      logger.info('Mock S3 uploadInvoice', { key: Key, contentType: contentType || 'application/pdf' });
      return response;
    }
    const request = { Bucket, Key, contentType };
    const response = await sendS3Command(
      'UploadInvoice',
      request,
      'Failed to upload invoice to S3',
      new PutObjectCommand({
        Bucket,
        Key,
        Body: normalizeBody(body),
        ContentType: contentType || 'application/pdf',
        Metadata: metadata,
      })
    );

    return {
      bucket: Bucket,
      key: Key,
      etag: response?.ETag || null,
      versionId: response?.VersionId || null,
      requestId: response?.$metadata?.requestId || null,
    };
  }

  async uploadReport({ key, body, contentType, metadata = {} } = {}) {
    const Bucket = ensureBucket();
    const Key = buildObjectKey('reports', key);
    if (!Bucket) {
      const response = buildMockObjectResponse('mock-bucket', Key, {
        url: `https://mock-s3.local/${encodeURI(Key)}`,
        etag: `mock-etag-${genId('ETAG')}`,
        versionId: `mock-version-${genId('VER')}`,
        requestId: `mock-request-${genId('REQ')}`,
      });
      logger.info('Mock S3 uploadReport', { key: Key, contentType: contentType || 'text/csv' });
      return response;
    }
    const request = { Bucket, Key, contentType };
    const response = await sendS3Command(
      'UploadReport',
      request,
      'Failed to upload report to S3',
      new PutObjectCommand({
        Bucket,
        Key,
        Body: normalizeBody(body),
        ContentType: contentType || 'text/csv',
        Metadata: metadata,
      })
    );

    return {
      bucket: Bucket,
      key: Key,
      etag: response?.ETag || null,
      versionId: response?.VersionId || null,
      requestId: response?.$metadata?.requestId || null,
    };
  }

  async deleteObject({ key } = {}) {
    const Bucket = ensureBucket();
    if (!key) {
      throw new BadRequestError('S3 object key is required');
    }
    if (!Bucket) {
      logger.info('Mock S3 deleteObject', { key });
      return { deleted: true, bucket: 'mock-bucket', key };
    }

    await sendS3Command(
      'DeleteObject',
      { Bucket, Key: key },
      'Failed to delete object from S3',
      new DeleteObjectCommand({ Bucket, Key: key })
    );

    return { deleted: true, bucket: Bucket, key };
  }

  async generatePresignedUrl({ key, expiresInSeconds = 900, contentType } = {}) {
    const Bucket = ensureBucket();
    const Key = buildObjectKey('uploads', key);
    if (!Bucket) {
      const url = `https://mock-s3.local/upload/${encodeURI(Key)}`;
      logger.info('Mock S3 generatePresignedUrl', { key: Key, expiresInSeconds, contentType });
      return { bucket: 'mock-bucket', key: Key, url, expiresInSeconds };
    }
    try {
      const command = new PutObjectCommand({
        Bucket,
        Key,
        ContentType: contentType,
      });
      const url = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
      logAwsRequest({
        service: 's3',
        operation: 'GeneratePresignedUrl',
        requestId: null,
        request: { Bucket, Key, expiresInSeconds, contentType },
        response: { url },
      });
      return { bucket: Bucket, key: Key, url, expiresInSeconds };
    } catch (error) {
      logAwsFailure({
        service: 's3',
        operation: 'GeneratePresignedUrl',
        requestId: error?.$metadata?.requestId,
        request: { Bucket, Key, expiresInSeconds, contentType },
        error,
      });
      throw awsOperationError('Failed to generate S3 presigned URL');
    }
  }
}

module.exports = new S3Service();
