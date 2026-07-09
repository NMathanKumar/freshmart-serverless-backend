const { GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/shared').aws;

const tableName = () => {
  const name = config.dynamodb.tables.userProfiles;
  if (!name) throw new Error('Missing DDB_TABLE_USER_PROFILES');
  return name;
};

const key = (userId) => ({
  pk: `USER#${userId}`,
  sk: 'PROFILE',
});

const toDomain = (item) => {
  if (!item) return null;
  return {
    userId: item.userId,
    name: item.name,
    email: item.email,
    phone: item.phone || null,
    avatarUrl: item.avatarUrl || null,
    address: item.address || null,
    preferences: item.preferences || {},
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const findById = async (userId) => {
  const result = await documentClient.send(
    new GetCommand({
      TableName: tableName(),
      Key: key(userId),
    })
  );
  return toDomain(result.Item || null);
};

const upsert = async ({ userId, name, email, phone, avatarUrl, address, preferences = {} }) => {
  const now = new Date().toISOString();
  const item = {
    ...key(userId),
    userId,
    name,
    email,
    phone: phone || null,
    avatarUrl: avatarUrl || null,
    address: address || null,
    preferences,
    createdAt: now,
    updatedAt: now,
    entityType: 'USER_PROFILE',
  };

  await documentClient.send(
    new PutCommand({
      TableName: tableName(),
      Item: item,
    })
  );

  return toDomain(item);
};

const update = async (userId, data) => {
  const updates = [];
  const names = {};
  const values = {
    ':updatedAt': new Date().toISOString(),
  };

  Object.entries(data).forEach(([keyName, value], index) => {
    if (value === undefined) return;
    const nameKey = `#f${index}`;
    const valueKey = `:v${index}`;
    updates.push(`${nameKey} = ${valueKey}`);
    names[nameKey] = keyName;
    values[valueKey] = value;
  });

  updates.push('#updatedAt = :updatedAt');
  names['#updatedAt'] = 'updatedAt';

  const result = await documentClient.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: key(userId),
      UpdateExpression: `SET ${updates.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: 'ALL_NEW',
    })
  );

  return toDomain(result.Attributes || null);
};

module.exports = { findById, upsert, update };

