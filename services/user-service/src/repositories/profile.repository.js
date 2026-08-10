const { GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/service-shared').aws;

const tableName = () => {
  return config.dynamodb.tables.userProfiles || process.env.DDB_TABLE_USER_PROFILES || 'freshmart-dev-user-profiles';
};

const key = (userId) => ({
  pk: `USER#${userId}`,
  sk: 'PROFILE',
});

const toDomain = (item) => {
  if (!item) return null;
  const nameVal = item.name || item.fullName || '';
  return {
    userId: item.userId,
    email: item.email || '',
    fullName: nameVal,
    name: nameVal,
    phone: item.phone || '',
    avatarUrl: item.avatarUrl || null,
    address: item.address || null,
    addresses: item.addresses || (item.address ? [item.address] : []),
    role: item.role || 'CUSTOMER',
    status: item.status || 'ACTIVE',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const createProfileRepository = ({ client = documentClient } = {}) => {
  const getProfile = async (userId) => {
    const response = await client.send(
      new GetCommand({
        TableName: tableName(),
        Key: key(userId),
      })
    );
    return toDomain(response.Item);
  };

  const createProfile = async (data) => {
    const now = new Date().toISOString();
    const nameVal = data.name || data.fullName || '';
    const item = {
      ...key(data.userId),
      userId: data.userId,
      email: data.email || '',
      name: nameVal,
      fullName: nameVal,
      phone: data.phone || '',
      avatarUrl: data.avatarUrl || null,
      address: data.address || null,
      addresses: data.addresses || (data.address ? [data.address] : []),
      role: data.role || 'CUSTOMER',
      status: data.status || 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    await client.send(
      new PutCommand({
        TableName: tableName(),
        Item: item,
      })
    );
    return toDomain(item);
  };

  const updateProfile = async (userId, data) => {
    const now = new Date().toISOString();
    const updateExpressions = ['#updatedAt = :updatedAt'];
    const expressionAttributeNames = { '#updatedAt': 'updatedAt' };
    const expressionAttributeValues = { ':updatedAt': now };

    if (data.name !== undefined || data.fullName !== undefined) {
      const nameVal = data.name !== undefined ? data.name : data.fullName;
      updateExpressions.push('#fullName = :fullName', '#name = :name');
      expressionAttributeNames['#fullName'] = 'fullName';
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':fullName'] = nameVal;
      expressionAttributeValues[':name'] = nameVal;
    }

    if (data.email !== undefined) {
      updateExpressions.push('#email = :email');
      expressionAttributeNames['#email'] = 'email';
      expressionAttributeValues[':email'] = data.email;
    }

    if (data.phone !== undefined) {
      updateExpressions.push('#phone = :phone');
      expressionAttributeNames['#phone'] = 'phone';
      expressionAttributeValues[':phone'] = data.phone;
    }

    if (data.avatarUrl !== undefined) {
      updateExpressions.push('#avatarUrl = :avatarUrl');
      expressionAttributeNames['#avatarUrl'] = 'avatarUrl';
      expressionAttributeValues[':avatarUrl'] = data.avatarUrl;
    }

    if (data.address !== undefined) {
      updateExpressions.push('#address = :address');
      expressionAttributeNames['#address'] = 'address';
      expressionAttributeValues[':address'] = data.address;
    }

    if (data.addresses !== undefined) {
      updateExpressions.push('#addresses = :addresses');
      expressionAttributeNames['#addresses'] = 'addresses';
      expressionAttributeValues[':addresses'] = data.addresses;
    }

    if (data.status !== undefined) {
      updateExpressions.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = data.status;
    }

    const response = await client.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: key(userId),
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );
    const updatedDomain = toDomain(response.Attributes);
    if (updatedDomain && updatedDomain.email) {
      try {
        const { ScanCommand: LocalScan } = require('@aws-sdk/lib-dynamodb');
        const scanRes = await client.send(new LocalScan({
          TableName: tableName(),
          FilterExpression: 'email = :email AND userId <> :uid',
          ExpressionAttributeValues: { ':email': updatedDomain.email, ':uid': userId }
        }));
        for (const item of (scanRes.Items || [])) {
          if (item.userId) {
            await client.send(new UpdateCommand({
              TableName: tableName(),
              Key: key(item.userId),
              UpdateExpression: `SET ${updateExpressions.join(', ')}`,
              ExpressionAttributeNames: expressionAttributeNames,
              ExpressionAttributeValues: expressionAttributeValues,
            })).catch(() => {});
          }
        }
      } catch (_) {}
    }
    return updatedDomain;
  };

  const findById = getProfile;
  const upsert = createProfile;
  const update = updateProfile;

  return { getProfile, createProfile, updateProfile, findById, upsert, update };
};

const defaultRepository = createProfileRepository();

module.exports = {
  ...defaultRepository,
  createProfileRepository,
};
