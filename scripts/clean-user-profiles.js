const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'ap-southeast-1' }));

async function clean() {
  const res = await client.send(new ScanCommand({ TableName: 'freshmart-dev-user-profiles' }));
  const items = res.Items || [];

  const mainCognitoId = 'c97a853c-10a1-7006-e96b-a9c42d2e7c22';
  const targetEmail = 'nmathankumar597@gmail.com';

  const duplicates = items.filter(i => (i.email || '').toLowerCase().trim() === targetEmail && i.userId !== mainCognitoId);

  console.log('Main Cognito User Profile:', items.find(i => i.userId === mainCognitoId));
  console.log('Duplicates found:', duplicates.length);

  let latestName = 'Mathankumar';
  let latestPhone = '8825901415';
  let latestAvatar = null;
  let latestAddresses = [];

  for (const d of [...duplicates, items.find(i => i.userId === mainCognitoId)].filter(Boolean)) {
    if (d.name && d.name !== 'kash') latestName = d.name;
    if (d.phone) latestPhone = d.phone;
    if (d.avatarUrl) latestAvatar = d.avatarUrl;
    if (Array.isArray(d.addresses) && d.addresses.length > 0) latestAddresses = d.addresses;
    if (d.address && latestAddresses.length === 0) latestAddresses = [d.address];
  }

  const now = new Date().toISOString();
  await client.send(new UpdateCommand({
    TableName: 'freshmart-dev-user-profiles',
    Key: { pk: 'USER#' + mainCognitoId, sk: 'PROFILE' },
    UpdateExpression: 'SET #name = :name, #fullName = :fullName, email = :email, phone = :phone, avatarUrl = :avatarUrl, addresses = :addresses, updatedAt = :updatedAt',
    ExpressionAttributeNames: { '#name': 'name', '#fullName': 'fullName' },
    ExpressionAttributeValues: {
      ':name': latestName,
      ':fullName': latestName,
      ':email': targetEmail,
      ':phone': latestPhone,
      ':avatarUrl': latestAvatar,
      ':addresses': latestAddresses,
      ':updatedAt': now
    }
  }));

  console.log('Updated main Cognito user profile successfully with:', { latestName, latestPhone, targetEmail });

  // Clean up duplicate non-Cognito profiles so Admin Web list is clean and unambiguous
  for (const dup of duplicates) {
    if (dup.pk && dup.sk) {
      await client.send(new DeleteCommand({
        TableName: 'freshmart-dev-user-profiles',
        Key: { pk: dup.pk, sk: dup.sk }
      }));
      console.log('Deleted duplicate profile:', dup.pk);
    }
  }
}

clean().catch(console.error);
