const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { genId } = require('@freshmart/shared').utils.id;
const config = require('@freshmart/shared').config;
const { ROLES } = require('@freshmart/shared').constants;
const {
  ConflictError,
  UnauthorizedError,
  InternalServerError,
} = require('@freshmart/shared').errors;
const logger = require('@freshmart/shared').logger;
const createAuthRepository = require('../repositories/auth.repository');
const {
  publishUserRegistered,
  publishUserLoggedIn,
  publishUserLoggedOut,
} = require('../events/publisher');

const authRepository = createAuthRepository();

const sanitizeUser = (user) => ({
  userId: user.userId,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || null,
  status: user.status,
  tokenVersion: Number(user.tokenVersion || 0),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastLoginAt: user.lastLoginAt || null,
});

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

const assertRegisterConfig = () => {
  const requiredVars = [
    ['DDB_TABLE_AUTH_USERS', config.dynamodb.tables.authUsers],
    ['JWT_SECRET', config.jwt.secret],
    ['JWT_REFRESH_SECRET', config.jwt.refreshSecret],
    ['BCRYPT_SALT_ROUNDS', config.auth.bcryptSaltRounds],
  ];

  const missing = requiredVars
    .filter(([, value]) => value === undefined || value === null || String(value).trim() === '')
    .map(([name]) => name);

  if (missing.length) {
    throw new Error(`Missing required register configuration: ${missing.join(', ')}`);
  }
};

const issueTokens = (user, { jti = null, traceLabel = null } = {}) => {
  const nextJti = jti || genId('RT');
  const tokenVersion = Number(user.tokenVersion || 0);
  const payload = {
    userId: user.userId,
    role: user.role,
    email: user.email,
    tokenVersion,
  };

  let accessToken;
  try {
    if (traceLabel) {
      logStep(`${traceLabel} - STEP 7 - JWT access token start`, {
        userId: user.userId,
        tokenVersion,
      });
    }
    accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    if (traceLabel) {
      logStep(`${traceLabel} - STEP 7 - JWT access token success`, {
        userId: user.userId,
      });
    }
  } catch (error) {
    if (traceLabel) {
      logStepError(`${traceLabel} - STEP 7 - JWT access token failed`, error, {
        userId: user.userId,
      });
    }
    throw error;
  }

  let refreshToken;
  try {
    if (traceLabel) {
      logStep(`${traceLabel} - STEP 8 - JWT refresh token start`, {
        userId: user.userId,
        jti: nextJti,
      });
    }
    refreshToken = jwt.sign({ ...payload, jti: nextJti }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
    if (traceLabel) {
      logStep(`${traceLabel} - STEP 8 - JWT refresh token success`, {
        userId: user.userId,
        jti: nextJti,
      });
    }
  } catch (error) {
    if (traceLabel) {
      logStepError(`${traceLabel} - STEP 8 - JWT refresh token failed`, error, {
        userId: user.userId,
        jti: nextJti,
      });
    }
    throw error;
  }

  return { accessToken, refreshToken, tokenVersion, jti: nextJti };
};

const logAuthEvent = (message, data = {}) => {
  logger.info(message, data);
};

const logAuthError = (message, error, data = {}) => {
  logger.error(message, {
    ...data,
    errorMessage: error?.message || null,
    errorName: error?.name || null,
    errorCode: error?.code || null,
    stack: error?.stack || null,
  });
};

const register = async ({ name, email, password, phone }, context = {}) => {
  const requestId = context.requestId || null;

  try {
    logStep('STEP 2 - config verification start', { requestId });
    assertRegisterConfig();
    logStep('STEP 2 - config verification success', {
      requestId,
      tableName: config.dynamodb.tables.authUsers,
      bcryptSaltRounds: config.auth.bcryptSaltRounds,
      hasJwtSecret: Boolean(config.jwt.secret),
      hasJwtRefreshSecret: Boolean(config.jwt.refreshSecret),
      eventBridgeConfigured: Boolean(config.aws.eventBusName && config.aws.eventSource),
    });
  } catch (error) {
    logStepError('STEP 2 - config verification failed', error, { requestId });
    throw error;
  }

  let existing;
  try {
    logStep('STEP 3 - findByEmail start', { requestId });
    existing = await authRepository.findByEmail(email);
    logStep('STEP 3 - findByEmail success', {
      requestId,
      found: Boolean(existing),
    });
  } catch (error) {
    logStepError('STEP 3 - findByEmail failed', error, { requestId });
    throw error;
  }

  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  let passwordHash;
  try {
    logStep('STEP 4 - bcrypt.hash start', {
      requestId,
      bcryptSaltRounds: config.auth.bcryptSaltRounds,
      bcryptLoaded: typeof bcrypt?.hash === 'function',
    });
    passwordHash = await bcrypt.hash(password, config.auth.bcryptSaltRounds);
    logStep('STEP 4 - bcrypt.hash success', {
      requestId,
      hashLength: passwordHash?.length || 0,
    });
  } catch (error) {
    logStepError('STEP 4 - bcrypt.hash failed', error, {
      requestId,
      bcryptSaltRounds: config.auth.bcryptSaltRounds,
    });
    throw error;
  }

  let user;
  let userId;

  try {
    logStep('STEP 5 - UUID generation start', { requestId });
    userId = genId('USER');
    logStep('STEP 5 - UUID generation success', { requestId, userId });
  } catch (error) {
    logStepError('STEP 5 - UUID generation failed', error, { requestId });
    throw error;
  }

  try {
    logStep('STEP 6 - AuthUsers write start', {
      requestId,
      tableName: config.dynamodb.tables.authUsers,
      userId,
    });
    user = await authRepository.createUser({
      userId,
      name,
      email,
      passwordHash,
      role: ROLES.CUSTOMER,
      phone,
    });
    logStep('STEP 6 - AuthUsers write success', {
      requestId,
      tableName: config.dynamodb.tables.authUsers,
      userId: user?.userId || userId,
    });
  } catch (error) {
    logStepError('STEP 6 - AuthUsers write failed', error, {
      requestId,
      tableName: config.dynamodb.tables.authUsers,
      userId,
    });
    if (error?.code === 'CONFLICT' || error?.name === 'ConditionalCheckFailedException') {
      throw new ConflictError('An account with this email already exists');
    }
    throw error;
  }

  const tokens = issueTokens(user, { traceLabel: 'REGISTER' });

  try {
    logStep('STEP 9 - refresh session save start', {
      requestId,
      tableName: config.dynamodb.tables.authUsers,
      userId: user.userId,
      jti: tokens.jti,
    });
    await authRepository.createRefreshSession({
      userId: user.userId,
      jti: tokens.jti,
      tokenVersion: tokens.tokenVersion,
    });
    logStep('STEP 9 - refresh session save success', {
      requestId,
      userId: user.userId,
      jti: tokens.jti,
    });
  } catch (error) {
    logStepError('STEP 9 - refresh session save failed', error, {
      requestId,
      tableName: config.dynamodb.tables.authUsers,
      userId: user.userId,
      jti: tokens.jti,
    });
    throw error;
  }

  const profile = sanitizeUser(user);
  const result = { user: profile, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };

  try {
    logStep('STEP 10 - EventBridge publish start', {
      requestId,
      eventType: 'UserRegistered.v1',
      userId: user.userId,
    });
    await publishAuthEventSafely(
      'STEP 10 - EventBridge publish',
      publishUserRegistered,
      { user: profile },
      { ...context, source: 'auth-service' },
      {
        requestId,
        eventType: 'UserRegistered.v1',
        userId: user.userId,
      }
    );
  } catch (error) {
    logStepError('STEP 10 - EventBridge publish wrapper failed', error, {
      requestId,
      eventType: 'UserRegistered.v1',
      userId: user.userId,
    });
  }

  logAuthEvent('Auth register completed', {
    eventType: 'UserRegistered.v1',
    correlationId: context.correlationId || context.requestId || null,
    requestId: context.requestId || null,
    userId: user.userId,
  });
  return result;
};

const login = async ({ email, password }, context = {}) => {
  const user = await authRepository.findByEmail(email);
  if (!user) throw new UnauthorizedError('Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new UnauthorizedError('Invalid email or password');

  const updatedUser = await authRepository.updateLoginMetadata(user.userId);
  const tokens = issueTokens(updatedUser || user);
  await authRepository.createRefreshSession({
    userId: user.userId,
    jti: tokens.jti,
    tokenVersion: tokens.tokenVersion,
  });

  const profile = sanitizeUser(updatedUser || user);
  const result = { user: profile, ...tokens };
  await publishAuthEventSafely(
    'LOGIN - EventBridge publish',
    publishUserLoggedIn,
    { user: profile },
    { ...context, source: 'auth-service' },
    { requestId: context.requestId || null, eventType: 'UserLoggedIn.v1', userId: user.userId }
  );
  logAuthEvent('Auth login completed', {
    eventType: 'UserLoggedIn.v1',
    correlationId: context.correlationId || context.requestId || null,
    requestId: context.requestId || null,
    userId: user.userId,
  });
  return result;
};

const verifyRefreshToken = (refreshToken) => {
  try {
    return jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
};

const refresh = async (refreshToken) => {
  const payload = verifyRefreshToken(refreshToken);
  const user = await authRepository.findById(payload.userId);
  if (!user) throw new UnauthorizedError('User no longer exists');

  if (Number(payload.tokenVersion || 0) !== Number(user.tokenVersion || 0)) {
    throw new UnauthorizedError('Refresh token has been revoked');
  }

  const session = await authRepository.findRefreshSession(payload.userId, payload.jti);
  if (!session || session.revokedAt) {
    throw new UnauthorizedError('Refresh token has been revoked');
  }

  const nextTokens = issueTokens(user);
  await authRepository.revokeRefreshSession(payload.userId, payload.jti);
  await authRepository.createRefreshSession({
    userId: user.userId,
    jti: nextTokens.jti,
    tokenVersion: nextTokens.tokenVersion,
  });
  return nextTokens;
};

const logout = async (refreshToken, context = {}) => {
  const payload = verifyRefreshToken(refreshToken);
  const user = await authRepository.findById(payload.userId);
  if (!user) throw new UnauthorizedError('User no longer exists');

  try {
    await authRepository.revokeRefreshSession(payload.userId, payload.jti);
    const updatedUser = await authRepository.revokeAllRefreshSessions(payload.userId);
    await publishAuthEventSafely(
      'LOGOUT - EventBridge publish',
      publishUserLoggedOut,
      {
        user: sanitizeUser(updatedUser || user),
        revokedTokenJti: payload.jti,
      },
      { ...context, source: 'auth-service' },
      {
        requestId: context.requestId || null,
        eventType: 'UserLoggedOut.v1',
        userId: payload.userId,
        jti: payload.jti,
      }
    );
    logAuthEvent('Auth logout completed', {
      eventType: 'UserLoggedOut.v1',
      correlationId: context.correlationId || context.requestId || null,
      requestId: context.requestId || null,
      userId: payload.userId,
      jti: payload.jti,
    });
    return { success: true };
  } catch (error) {
    logAuthError('Auth logout failed', error, {
      correlationId: context.correlationId || context.requestId || null,
      requestId: context.requestId || null,
      userId: payload.userId,
      jti: payload.jti,
    });
    throw new InternalServerError('Unable to process logout');
  }
};

const getProfile = async (userId) => {
  const user = await authRepository.findById(userId);
  if (!user) throw new UnauthorizedError('User no longer exists');
  return sanitizeUser(user);
};

const publishAuthEventSafely = async (label, publishFn, payload, context, details = {}) => {
  try {
    await publishFn(payload, context);
    logStep(`${label} success`, details);
    return true;
  } catch (error) {
    logStepError(`${label} failed`, error, details);
    return false;
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getProfile,
  sanitizeUser,
  issueTokens,
};
