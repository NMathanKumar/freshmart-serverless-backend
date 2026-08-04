const { CognitoIdentityProviderClient, AdminDeleteUserCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const cognito = new CognitoIdentityProviderClient({ region: 'ap-southeast-1' });
const ddbClient = new DynamoDBClient({ region: 'ap-southeast-1' });
const ddb = DynamoDBDocumentClient.from(ddbClient);

const USER_POOL_ID = 'ap-southeast-1_RXGKIq89c';
const TABLE_NAME = 'freshmart-dev-auth-users';
const EMAIL = 'nmadhankumar597@gmail.com';

async function run() {
  try {
    console.log(`Deleting from Cognito...`);
    await cognito.send(new AdminDeleteUserCommand({ UserPoolId: USER_POOL_ID, Username: EMAIL }));
    console.log('Cognito user deleted.');
  } catch (err) {
    console.error('Cognito delete error:', err.message);
  }

  try {
    console.log(`Querying DynamoDB...`);
    const q = await ddb.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :sk',
      ExpressionAttributeValues: {
        ':pk': `EMAIL#${EMAIL}`,
        ':sk': 'PROFILE'
      }
    }));

    if (q.Items && q.Items.length > 0) {
      for (const item of q.Items) {
        console.log(`Deleting DDB user: ${item.PK}`);
        await ddb.send(new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { PK: item.PK, SK: item.SK }
        }));
      }
    } else {
      console.log('User not found in DynamoDB.');
    }
  } catch (err) {
    console.error('DynamoDB delete error:', err.message);
  }
}

run();
