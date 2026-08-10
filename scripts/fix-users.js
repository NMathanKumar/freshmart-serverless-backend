const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, BatchWriteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-southeast-1' });
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true }
});

const TABLES = {
  profiles: 'freshmart-dev-user-profiles',
  auth: 'freshmart-dev-auth-users'
};

async function removeMocks() {
  const fakeIds = ['CUST-001', 'CUST-002', 'CUST-003', 'CUST-004', 'CUST-005', 'CUST-006', 'CUST-007', 'CUST-008'];
  
  const profileDeletes = fakeIds.map(id => ({
    DeleteRequest: { Key: { pk: `USER#${id}`, sk: 'PROFILE' } }
  }));
  
  // Need to get emails for auth-users table deletes
  const fakeEmails = fakeIds.map(id => {
    const parts = id.split('-');
    const num = parts[1];
    const names = {
      '001': 'sarah', '002': 'david', '003': 'elena', '004': 'alex',
      '005': 'james', '006': 'maria', '007': 'kevin', '008': 'rachel'
    };
    return `${names[num]}@freshmart.com`;
  });

  const authDeletes = fakeEmails.map(email => ({
    DeleteRequest: { Key: { PK: `USER#${email}`, SK: 'METADATA' } }
  }));

  if (profileDeletes.length > 0) {
    await docClient.send(new BatchWriteCommand({
      RequestItems: { [TABLES.profiles]: profileDeletes }
    }));
  }
  
  if (authDeletes.length > 0) {
    await docClient.send(new BatchWriteCommand({
      RequestItems: { [TABLES.auth]: authDeletes }
    }));
  }

  // Fix admin user name
  const adminUserId = 'c92af55c-e011-7033-da34-013955cc9da3';
  await docClient.send(new UpdateCommand({
    TableName: TABLES.profiles,
    Key: { pk: `USER#${adminUserId}`, sk: 'PROFILE' },
    UpdateExpression: 'SET #name = :name',
    ExpressionAttributeNames: { '#name': 'name' },
    ExpressionAttributeValues: { ':name': 'Mathankumar N' }
  }));

  console.log('Successfully removed mock users and fixed admin profile.');
}

removeMocks().catch(console.error);
