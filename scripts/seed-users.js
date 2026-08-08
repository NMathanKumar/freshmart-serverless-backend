const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-southeast-1' });
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true }
});

const TABLES = {
  profiles: 'freshmart-dev-user-profiles',
  auth: 'freshmart-dev-auth-users'
};

async function batchPut(tableName, items) {
  console.log(`Inserting ${items.length} items into ${tableName}...`);
  for (let i = 0; i < items.length; i += 25) {
    const chunk = items.slice(i, i + 25);
    const putRequests = chunk.map((item) => ({ PutRequest: { Item: item } }));
    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: putRequests
        }
      })
    );
  }
}

async function main() {
  const now = new Date().toISOString();
  const profileItems = [];
  const authUserItems = [];

  const adminUserId = 'c92af55c-e011-7033-da34-013955cc9da3';
  const adminEmail = 'nmadhankumar597@gmail.com'; // Using user's real email

  profileItems.push({
    pk: `USER#${adminUserId}`,
    sk: 'PROFILE',
    userId: adminUserId,
    email: adminEmail,
    fullName: 'Mathan Kumar',
    phone: '+1-555-0100',
    role: 'ADMIN',
    status: 'ACTIVE',
    addresses: [{ id: 'ADDR-ADMIN', street: '1 Admin Way', city: 'Singapore', postalCode: '018989', isDefault: true }],
    createdAt: now,
    updatedAt: now
  });

  authUserItems.push({
    PK: `USER#${adminEmail}`,
    SK: 'METADATA',
    email: adminEmail,
    userId: adminUserId,
    role: 'ADMIN',
    createdAt: now
  });

  const customers = [
    { id: 'CUST-001', name: 'Sarah Jenkins', email: 'sarah@freshmart.com', phone: '+1-555-0101' },
    { id: 'CUST-002', name: 'David Chen', email: 'david@freshmart.com', phone: '+1-555-0102' },
    { id: 'CUST-003', name: 'Elena Martinez', email: 'elena@freshmart.com', phone: '+1-555-0103' },
    { id: 'CUST-004', name: 'Alex Rivera', email: 'alex@freshmart.com', phone: '+1-555-0104' },
    { id: 'CUST-005', name: 'James Wilson', email: 'james@freshmart.com', phone: '+1-555-0105' },
    { id: 'CUST-006', name: 'Maria Garcia', email: 'maria@freshmart.com', phone: '+1-555-0106' },
    { id: 'CUST-007', name: 'Kevin Lee', email: 'kevin@freshmart.com', phone: '+1-555-0107' },
    { id: 'CUST-008', name: 'Rachel Green', email: 'rachel@freshmart.com', phone: '+1-555-0108' }
  ];

  customers.forEach((c) => {
    profileItems.push({
      pk: `USER#${c.id}`,
      sk: 'PROFILE',
      userId: c.id,
      email: c.email,
      name: c.name, // using name here since normalization in repo expects name
      phone: c.phone,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      addresses: [{ id: `ADDR-${c.id}`, street: '123 Main St', city: 'Singapore', postalCode: '123456', isDefault: true }],
      createdAt: now,
      updatedAt: now
    });
    
    authUserItems.push({
      PK: `USER#${c.email}`,
      SK: 'METADATA',
      email: c.email,
      userId: c.id,
      role: 'CUSTOMER',
      createdAt: now
    });
  });

  await batchPut(TABLES.profiles, profileItems);
  await batchPut(TABLES.auth, authUserItems);

  console.log('Successfully seeded users!');
}

main().catch(console.error);
