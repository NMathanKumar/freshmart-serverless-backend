const {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/service-shared').aws;
const logger = require('@freshmart/service-shared').logger;

const getTableName = (tableName = config.dynamodb.tables.authUsers) => {
  if (!tableName) {
    throw new Error('Missing DDB_TABLE_AUTH_USERS');
  }
  return tableName;
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const userPk = (userId) => `USER#${userId}`;
const profileSk = () => 'PROFILE';
const emailPk = (email) => `EMAIL#${normalizeEmail(email)}`;
const EMAIL_INDEX_NAME = 'EmailIndex';
const EMAIL_INDEX_PK = 'GSI1PK';
const EMAIL_INDEX_SK = 'GSI1SK';

const withOptionalString = (item, key, value) => {
  if (typeof value === 'string' && value.trim() !== '') {
    item[key] = value;
  }
};

const logStep = (label, details = {}) => {
  logger.debug(label, details);
};

const logStepError = (label, error, details = {}) => {
  logger.error(label, {
    ...details,
    errorName: error?.name || null,
    errorMessage: error?.message || null,
    errorCode: error?.code || null,
    stack: error?.stack || null,
  });
};

const toDomainUser = (item) => {
  if (!item) return null;
  return {
    userId: item.userId,
    cognitoSub: item.cognitoSub || item.userId,
    username: item.username || null,
    name: item.name || null,
    email: item.email || null,
    emailLower: item.emailLower || normalizeEmail(item.email),
    role: item.role,
    phone: item.phone || null,
    status: item.status || 'ACTIVE',
    provider: item.provider || 'COGNITO',
    groups: Array.isArray(item.groups) ? item.groups : [],
    emailVerified: Boolean(item.emailVerified),
    phoneVerified: Boolean(item.phoneVerified),
    mfaEnabled: Boolean(item.mfaEnabled),
    lastLoginAt: item.lastLoginAt || null,
    lastAuthAt: item.lastAuthAt || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    version: Number(item.version || 0),
  };
};

const buildUpdateExpression = (updates = {}, timestamp = new Date().toISOString()) => {
  const setParts = ['updatedAt = :updatedAt', 'version = if_not_exists(version, :zero) + :one'];
  const removeParts = [];
  const values = {
    ':updatedAt': timestamp,
    ':zero': 0,
    ':one': 1,
  };
  const names = {};

  const assign = (field, value) => {
    const nameKey = `#${field}`;
    const valueKey = `:${field}`;
    names[nameKey] = field;
    values[valueKey] = value;
    setParts.push(`${nameKey} = ${valueKey}`);
  };

  for (const [field, value] of Object.entries(updates)) {
    if (value === undefined) {
      continue;
    }
    if (value === null) {
      removeParts.push(`#${field}`);
      names[`#${field}`] = field;
      continue;
    }
    assign(field, value);
  }

  let expression = `SET ${setParts.join(', ')}`;
  if (removeParts.length) {
    expression += ` REMOVE ${removeParts.join(', ')}`;
  }

  return { expression, values, names };
};

const createAuthRepository = ({
  client = documentClient,
  tableName = config.dynamodb.tables.authUsers || '',
  now = () => new Date(),
} = {}) => {
  const createError = (message, code) => {
    const error = new Error(message);
    error.code = code;
    return error;
  };

  const isConditionalFailure = (error) =>
    error?.name === 'ConditionalCheckFailedException' ||
    error?.Code === 'ConditionalCheckFailedException' ||
    error?.code === 'ConditionalCheckFailedException';

  const findByEmail = async (email) => {
    const resolvedTableName = getTableName(tableName);
    const normalizedEmail = normalizeEmail(email);
    logStep('Auth repository findByEmail start', {
      tableName: resolvedTableName,
      indexName: EMAIL_INDEX_NAME,
      email: normalizedEmail,
    });

    const result = await client.send(
      new QueryCommand({
        TableName: resolvedTableName,
        IndexName: EMAIL_INDEX_NAME,
        KeyConditionExpression: `${EMAIL_INDEX_PK} = :pk AND ${EMAIL_INDEX_SK} = :sk`,
        ExpressionAttributeValues: {
          ':pk': emailPk(normalizedEmail),
          ':sk': 'PROFILE',
        },
        Limit: 1,
      })
    );

    return toDomainUser(result.Items?.[0] || null);
  };

  const findById = async (userId) => {
    const resolvedTableName = getTableName(tableName);
    const result = await client.send(
      new GetCommand({
        TableName: resolvedTableName,
        Key: {
          PK: userPk(userId),
          SK: profileSk(),
        },
      })
    );
    return toDomainUser(result.Item || null);
  };

  const createProfile = async ({
    userId,
    cognitoSub = userId,
    username = null,
    name,
    email,
    role,
    phone,
    status = 'ACTIVE',
    provider = 'COGNITO',
    groups = [],
    emailVerified = false,
    phoneVerified = false,
    mfaEnabled = false,
  }) => {
    const resolvedTableName = getTableName(tableName);
    const normalizedEmail = normalizeEmail(email);
    const timestamp = now().toISOString();
    const userItem = {
      PK: userPk(userId),
      SK: profileSk(),
      userId,
      cognitoSub,
      username,
      name,
      email,
      emailLower: normalizedEmail,
      role,
      status,
      provider,
      groups,
      emailVerified,
      phoneVerified,
      mfaEnabled,
      version: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      [EMAIL_INDEX_PK]: emailPk(email),
      [EMAIL_INDEX_SK]: 'PROFILE',
      entityType: 'USER_PROFILE',
    };

    withOptionalString(userItem, 'phone', phone);

    try {
      await client.send(
        new PutCommand({
          TableName: resolvedTableName,
          Item: userItem,
          ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
        })
      );
      return toDomainUser(userItem);
    } catch (error) {
      if (isConditionalFailure(error)) {
        throw createError('An account with this email already exists', 'CONFLICT');
      }
      throw error;
    }
  };

  const updateProfile = async (userId, updates = {}) => {
    const resolvedTableName = getTableName(tableName);
    const timestamp = now().toISOString();
    const expression = buildUpdateExpression(updates, timestamp);

    const result = await client.send(
      new UpdateCommand({
        TableName: resolvedTableName,
        Key: {
          PK: userPk(userId),
          SK: profileSk(),
        },
        UpdateExpression: expression.expression,
        ExpressionAttributeNames: expression.names,
        ExpressionAttributeValues: expression.values,
        ConditionExpression: 'attribute_exists(PK)',
        ReturnValues: 'ALL_NEW',
      })
    );

    return toDomainUser(result.Attributes || null);
  };

  const syncProfile = async (profile) => {
    const existing = await findById(profile.userId);
    if (!existing) {
      return createProfile(profile);
    }
    return updateProfile(profile.userId, {
      cognitoSub: profile.cognitoSub,
      username: profile.username,
      name: profile.name,
      email: profile.email,
      phone: profile.phone ?? null,
      role: profile.role,
      status: profile.status,
      provider: profile.provider,
      groups: profile.groups,
      emailVerified: profile.emailVerified,
      phoneVerified: profile.phoneVerified,
      mfaEnabled: profile.mfaEnabled,
      lastLoginAt: profile.lastLoginAt,
      lastAuthAt: profile.lastAuthAt,
    });
  };

  const markLogout = async (userId, details = {}) =>
    updateProfile(userId, {
      lastAuthAt: details.lastAuthAt || now().toISOString(),
    });

  return {
    tableName,
    findByEmail,
    findById,
    createProfile,
    updateProfile,
    syncProfile,
    markLogout,
    normalizeEmail,
  };
};

module.exports = createAuthRepository;
