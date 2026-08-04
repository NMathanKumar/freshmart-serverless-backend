import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-1' }));
const TableName = process.env.IAM_TABLE_NAME || 'freshmart-dev-iam-service';

const permissions = [
  'product.read', 'product.create', 'product.update', 'product.delete',
  'inventory.read', 'inventory.adjust',
  'order.read', 'order.update',
  'delivery.assign', 'delivery.update',
  'customer.read', 'customer.update',
  'review.approve',
  'role.manage', 'admin.manage',
  '*' // SUPER_ADMIN wildcard
];

const roles = [
  'SUPER_ADMIN',
  'ADMIN',
  'ORDER_MANAGER',
  'INVENTORY_MANAGER',
  'DELIVERY_MANAGER',
  'CUSTOMER_SUPPORT',
  'ANALYST'
];

async function seed() {
  console.log(`Seeding table ${TableName}...`);
  try {
    // 1. Seed Permissions
    for (let i = 0; i < permissions.length; i += 25) {
      const batch = permissions.slice(i, i + 25);
      await client.send(new BatchWriteCommand({
        RequestItems: {
          [TableName]: batch.map(p => ({
            PutRequest: {
              Item: {
                pk: `PERMISSION#${p}`,
                sk: '#META#',
                name: p,
                createdAt: new Date().toISOString()
              }
            }
          }))
        }
      }));
    }
    console.log('Permissions seeded.');

    // 2. Seed Roles
    for (let i = 0; i < roles.length; i += 25) {
      const batch = roles.slice(i, i + 25);
      await client.send(new BatchWriteCommand({
        RequestItems: {
          [TableName]: batch.map(r => ({
            PutRequest: {
              Item: {
                pk: `ROLE#${r}`,
                sk: '#META#',
                name: r,
                createdAt: new Date().toISOString()
              }
            }
          }))
        }
      }));
    }
    console.log('Roles seeded.');

    // 3. Seed SUPER_ADMIN mapping
    await client.send(new PutCommand({
      TableName,
      Item: {
        pk: 'ROLE#SUPER_ADMIN',
        sk: 'PERMISSION#*',
        createdAt: new Date().toISOString()
      }
    }));
    console.log('SUPER_ADMIN mapping seeded.');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
