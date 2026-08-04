const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, DeleteCommand, PutCommand, TransactWriteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1',
  endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DDB_TABLE_INVENTORY || 'freshmart-dev-inventory';
const DEFAULT_WAREHOUSE_ID = process.env.DEFAULT_WAREHOUSE_ID || 'WH-MAIN';

async function migrateMultiWarehouse() {
  console.log(`Starting migration to multi-warehouse model in table: ${TABLE_NAME}`);
  console.log(`Using default warehouse: ${DEFAULT_WAREHOUSE_ID}`);

  let lastEvaluatedKey = undefined;
  let itemsMigrated = 0;
  
  do {
    const scanResponse = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'sk = :legacySk',
      ExpressionAttributeValues: {
        ':legacySk': 'INVENTORY'
      },
      ExclusiveStartKey: lastEvaluatedKey
    }));

    const items = scanResponse.Items || [];
    console.log(`Found ${items.length} legacy items to migrate in this batch...`);

    for (const item of items) {
      const productId = item.pk.replace('PRODUCT#', '');
      
      const newItem = {
        ...item,
        sk: `WAREHOUSE#${DEFAULT_WAREHOUSE_ID}`,
        warehouseId: DEFAULT_WAREHOUSE_ID
      };

      try {
        await docClient.send(new TransactWriteCommand({
          TransactItems: [
            {
              Put: {
                TableName: TABLE_NAME,
                Item: newItem
              }
            },
            {
              Delete: {
                TableName: TABLE_NAME,
                Key: {
                  pk: item.pk,
                  sk: item.sk
                }
              }
            }
          ]
        }));
        itemsMigrated++;
        console.log(`Migrated product ${productId}`);
      } catch (err) {
        console.error(`Failed to migrate product ${productId}:`, err.message);
      }
    }

    lastEvaluatedKey = scanResponse.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  console.log(`Migration complete! Successfully migrated ${itemsMigrated} inventory records.`);
}

migrateMultiWarehouse().catch(err => {
  console.error('Migration script failed:', err);
  process.exit(1);
});
