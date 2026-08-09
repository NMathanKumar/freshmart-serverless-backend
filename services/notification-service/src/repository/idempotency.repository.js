const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const inMemoryStore = new Map();

/**
 * Idempotency Repository
 * Prevents double-processing of duplicate eventId values sent via EventBridge
 */
class IdempotencyRepository {
  constructor(tableName = process.env.DDB_TABLE_NOTIFICATIONS || 'freshmart-dev-notifications') {
    this.tableName = tableName;
  }

  /**
   * Checks if an eventId has already been processed
   */
  async isProcessed(eventId) {
    if (!eventId) return false;

    // In-memory check first
    if (inMemoryStore.has(`IDEMPOTENCY#${eventId}`)) {
      return true;
    }

    try {
      const { documentClient } = require('@freshmart/service-shared').aws;
      const command = new GetCommand({
        TableName: this.tableName,
        Key: {
          pk: `IDEMPOTENCY#${eventId}`,
          sk: 'LOCK',
        },
      });
      const result = await documentClient.send(command);
      if (result.Item) {
        inMemoryStore.set(`IDEMPOTENCY#${eventId}`, true);
        return true;
      }
      return false;
    } catch {
      return inMemoryStore.has(`IDEMPOTENCY#${eventId}`);
    }
  }

  /**
   * Marks an eventId as processed with expiration
   */
  async markProcessed(eventId, metadata = {}) {
    if (!eventId) return;

    inMemoryStore.set(`IDEMPOTENCY#${eventId}`, true);

    try {
      const { documentClient } = require('@freshmart/service-shared').aws;
      const ttl = Math.floor(Date.now() / 1000) + 86400 * 7; // 7 days TTL
      const command = new PutCommand({
        TableName: this.tableName,
        Item: {
          pk: `IDEMPOTENCY#${eventId}`,
          sk: 'LOCK',
          eventId,
          status: 'PROCESSED',
          processedAt: new Date().toISOString(),
          ttl,
          ...metadata,
        },
      });
      await documentClient.send(command);
    } catch {
      // Fallback silently if DynamoDB condition/connection fails
    }
  }
}

module.exports = new IdempotencyRepository();
