const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-southeast-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function seedAdmin() {
  const userId = 'c92af55c-e011-7033-da34-013955cc9da3';
  const email = 'mathankumar@gmail.com';

  await docClient.send(new PutCommand({
    TableName: 'freshmart-dev-auth-users',
    Item: {
      PK: `USER#${email}`,
      SK: 'METADATA',
      email,
      userId,
      role: 'ADMIN',
      createdAt: new Date().toISOString()
    }
  }));

  await docClient.send(new PutCommand({
    TableName: 'freshmart-dev-user-profiles',
    Item: {
      pk: `USER#${userId}`,
      sk: 'PROFILE',
      userId,
      email,
      role: 'ADMIN',
      fullName: 'Mathan Kumar',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    }
  }));

  console.log('Successfully seeded admin user mathankumar@gmail.com into DynamoDB');
}

seedAdmin().catch(console.error);
