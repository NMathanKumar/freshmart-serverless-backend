const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-southeast-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

async function verify() {
  const userId = '890a958c-3031-708e-6346-b3316364e4e0';
  await ddbDocClient.send(new UpdateCommand({
    TableName: 'freshmart-dev-user-profiles',
    Key: { pk: `USER#${userId}`, sk: `PROFILE#${userId}` },
    UpdateExpression: 'SET emailVerified = :v',
    ExpressionAttributeValues: { ':v': true }
  }));
  console.log('Done');
}
verify().catch(console.error);
