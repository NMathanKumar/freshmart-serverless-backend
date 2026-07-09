const {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  TransactWriteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('@freshmart/shared').aws;

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
const refreshSk = (jti) => `REFRESH#${jti}`;
const EMAIL_INDEX_NAME = 'EmailIndex';
const EMAIL_INDEX_PK = 'GSI1PK';
const EMAIL_INDEX_SK = 'GSI1SK';
const withOptionalString = (item, key, value) => {
  if (typeof value === 'string' && value.trim() !== '') {
    item[key] = value;
  }
};

const logStep = (label, details = {}) => {
  // Temporary trace logs for Lambda/CloudWatch step-by-step register debugging.
  console.log(label, details);
};

const logStepError = (label, error, details = {}) => {
  console.error(label, {
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
    name: item.name,
    email: item.email,
    emailLower: item.emailLower,
    passwordHash: item.passwordHash,
    role: item.role,
    phone: item.phone || null,
    status: item.status || 'ACTIVE',
    tokenVersion: Number(item.tokenVersion || 0),
    version: Number(item.version || 0),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    lastLoginAt: item.lastLoginAt || null,
    revokedAt: item.revokedAt || null,
  };
};

const toRefreshSession = (item) => {
  if (!item) return null;
  return {
    userId: item.userId,
    jti: item.jti,
    tokenVersion: Number(item.tokenVersion || 0),
    revokedAt: item.revokedAt || null,
    expiresAt: Number(item.expiresAt || 0),
    createdAt: item.createdAt,
  };
};

const createAuthRepository = ({
  client = documentClient,
  tableName = getTableName(),
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
    logStep('STEP 3A - repository QueryCommand start', {
      tableName,
      indexName: EMAIL_INDEX_NAME,
      keyConditionExpression: `${EMAIL_INDEX_PK} = :pk AND ${EMAIL_INDEX_SK} = :sk`,
      expressionAttributeValues: {
        ':pk': emailPk(email),
        ':sk': 'PROFILE',
      },
    });

    let result;
    try {
      result = await client.send(
        new QueryCommand({
          TableName: tableName,
          IndexName: EMAIL_INDEX_NAME,
          KeyConditionExpression: `${EMAIL_INDEX_PK} = :pk AND ${EMAIL_INDEX_SK} = :sk`,
          ExpressionAttributeValues: {
            ':pk': emailPk(email),
            ':sk': 'PROFILE',
          },
          Limit: 1,
        })
      );
    } catch (error) {
      logStepError('STEP 3A - repository QueryCommand failed', error, {
        tableName,
        indexName: EMAIL_INDEX_NAME,
        email,
      });
      throw error;
    }

    logStep('STEP 3A - repository QueryCommand success', {
      tableName,
      indexName: EMAIL_INDEX_NAME,
      itemCount: result.Items?.length || 0,
    });
    return toDomainUser(result.Items?.[0] || null);
  };

  const findById = async (userId) => {
    const result = await client.send(
      new GetCommand({
        TableName: tableName,
        Key: {
          PK: userPk(userId),
          SK: profileSk(),
        },
      })
    );
    return toDomainUser(result.Item || null);
  };

  const createUser = async ({
    userId,
    name,
    email,
    passwordHash,
    role,
    phone,
    status = 'ACTIVE',
  }) => {
    const emailLower = normalizeEmail(email);
    const timestamp = now().toISOString();
    const userItem = {
      PK: userPk(userId),
      SK: profileSk(),
      userId,
      name,
      email,
      emailLower,
      passwordHash,
      role,
      status,
      tokenVersion: 0,
      version: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      [EMAIL_INDEX_PK]: emailPk(email),
      [EMAIL_INDEX_SK]: 'PROFILE',
      entityType: 'USER_PROFILE',
    };
    withOptionalString(userItem, 'phone', phone);

    const emailLock = {
      PK: emailPk(email),
      SK: 'PROFILE',
      emailLower,
      userId,
      createdAt: timestamp,
      entityType: 'EMAIL_LOCK',
    };

    try {
      logStep('STEP 6A - repository TransactWriteCommand start', {
        tableName,
        userPk: userItem.PK,
        userSk: userItem.SK,
        emailLockPk: emailLock.PK,
        emailLockSk: emailLock.SK,
        userAttributes: Object.keys(userItem),
        emailLockAttributes: Object.keys(emailLock),
      });
      console.log('========== USER ITEM ==========');
      console.dir(userItem, { depth: null });

      console.log('========== EMAIL LOCK ==========');
      console.dir(emailLock, { depth: null });

      console.log('========== TRANSACTION INPUT ==========');
      console.dir(
        {
          userItem,
          emailLock,
        },
        { depth: null }
      );
      await client.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Put: {
                TableName: tableName,
                Item: emailLock,
                ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
              },
            },
            {
              Put: {
                TableName: tableName,
                Item: userItem,
                ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
              },
            },
          ],
        })
      );
      logStep('STEP 6A - repository TransactWriteCommand success', {
        tableName,
        userPk: userItem.PK,
        userSk: userItem.SK,
      });
      return toDomainUser(userItem);
    } catch (error) {
      console.error('STEP 6A - TransactWrite FAILED');
      console.error({
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
        cancellationReasons: error.CancellationReasons,
        requestId: error.$metadata?.requestId,
        httpStatusCode: error.$metadata?.httpStatusCode,
        attempts: error.$metadata?.attempts,
      });
      if (error.CancellationReasons) {
        console.dir(error.CancellationReasons, { depth: null });
      }
      logStepError('STEP 6A - repository TransactWriteCommand failed', error, {
        tableName,
        userPk: userItem.PK,
        userSk: userItem.SK,
        emailLockPk: emailLock.PK,
        emailLockSk: emailLock.SK,
      });
      if (isConditionalFailure(error)) {
        throw createError('An account with this email already exists', 'CONFLICT');
      }
      throw error;
    }
  };

  const updateLoginMetadata = async (userId, { lastLoginAt = now().toISOString() } = {}) => {
    const result = await client.send(
      new UpdateCommand({
        TableName: tableName,
        Key: {
          PK: userPk(userId),
          SK: profileSk(),
        },
        UpdateExpression:
          'SET lastLoginAt = :lastLoginAt, updatedAt = :updatedAt ADD #version :one',
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeNames: {
          '#version': 'version',
        },
        ExpressionAttributeValues: {
          ':lastLoginAt': lastLoginAt,
          ':updatedAt': now().toISOString(),
          ':one': 1,
        },
        ReturnValues: 'ALL_NEW',
      })
    );
    return toDomainUser(result.Attributes || null);
  };

  const bumpTokenVersion = async (userId) => {
    const result = await client.send(
      new UpdateCommand({
        TableName: tableName,
        Key: {
          PK: userPk(userId),
          SK: profileSk(),
        },
        UpdateExpression:
          'SET revokedAt = :revokedAt, updatedAt = :updatedAt ADD tokenVersion :one, #version :one',
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeNames: {
          '#version': 'version',
        },
        ExpressionAttributeValues: {
          ':revokedAt': now().toISOString(),
          ':updatedAt': now().toISOString(),
          ':one': 1,
        },
        ReturnValues: 'ALL_NEW',
      })
    );
    return toDomainUser(result.Attributes || null);
  };

  const createRefreshSession = async ({
    userId,
    jti,
    tokenVersion,
    ttlSeconds = 7 * 24 * 60 * 60,
  }) => {
    const timestamp = now().toISOString();
    const expiresAt = Math.floor(now().getTime() / 1000) + Number(ttlSeconds);
    const item = {
      PK: userPk(userId),
      SK: refreshSk(jti),
      userId,
      jti,
      tokenVersion: Number(tokenVersion || 0),
      revokedAt: null,
      expiresAt,
      ttl: expiresAt,
      createdAt: timestamp,
      updatedAt: timestamp,
      entityType: 'REFRESH_SESSION',
    };

    logStep('STEP 9A - repository PutCommand refresh session start', {
      tableName,
      PK: item.PK,
      SK: item.SK,
      attributes: Object.keys(item),
    });

    try {
      await client.send(
        new PutCommand({
          TableName: tableName,
          Item: item,
          ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
        })
      );
    } catch (error) {
      logStepError('STEP 9A - repository PutCommand refresh session failed', error, {
        tableName,
        PK: item.PK,
        SK: item.SK,
      });
      throw error;
    }

    logStep('STEP 9A - repository PutCommand refresh session success', {
      tableName,
      PK: item.PK,
      SK: item.SK,
    });

    return toRefreshSession(item);
  };

  const findRefreshSession = async (userId, jti) => {
    const result = await client.send(
      new GetCommand({
        TableName: tableName,
        Key: {
          PK: userPk(userId),
          SK: refreshSk(jti),
        },
      })
    );
    return toRefreshSession(result.Item || null);
  };

  const revokeRefreshSession = async (userId, jti) => {
    const result = await client.send(
      new UpdateCommand({
        TableName: tableName,
        Key: {
          PK: userPk(userId),
          SK: refreshSk(jti),
        },
        UpdateExpression: 'SET revokedAt = :revokedAt, updatedAt = :updatedAt',
        ConditionExpression: 'attribute_exists(PK)',
        ExpressionAttributeValues: {
          ':revokedAt': now().toISOString(),
          ':updatedAt': now().toISOString(),
        },
        ReturnValues: 'ALL_NEW',
      })
    );
    return toRefreshSession(result.Attributes || null);
  };

  const revokeAllRefreshSessions = async (userId) => bumpTokenVersion(userId);

  return {
    tableName,
    findByEmail,
    findById,
    createUser,
    updateLoginMetadata,
    createRefreshSession,
    findRefreshSession,
    revokeRefreshSession,
    revokeAllRefreshSessions,
    normalizeEmail,
  };
};

module.exports = createAuthRepository;
