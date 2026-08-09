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
  return {
    userId: item.userId,
    email: item.email,
    name: item.name || item.fullName || '',
    fullName: item.fullName || item.name || '',
    phone: item.phone || '',
    avatarUrl: item.avatarUrl || null,
    addresses: item.addresses || [],
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
    const nameVal = data.fullName || data.name || '';
    const item = {
      ...key(data.userId),
      userId: data.userId,
      email: data.email || '',
      name: nameVal,
      fullName: nameVal,
      phone: data.phone || '',
      avatarUrl: data.avatarUrl || null,
      addresses: data.addresses || [],
      role: data.role || 'CUSTOMER',
      status: 'ACTIVE',
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

    const nameValue = data.fullName || data.name;
    if (nameValue !== undefined) {
      updateExpressions.push('#fullName = :fullName', '#name = :name');
      expressionAttributeNames['#fullName'] = 'fullName';
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':fullName'] = nameValue;
      expressionAttributeValues[':name'] = nameValue;
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

    if (data.addresses !== undefined) {
      updateExpressions.push('#addresses = :addresses');
      expressionAttributeNames['#addresses'] = 'addresses';
      expressionAttributeValues[':addresses'] = data.addresses;
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
    return toDomain(response.Attributes);
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
