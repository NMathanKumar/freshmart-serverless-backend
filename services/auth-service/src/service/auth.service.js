const crypto = require('crypto');
const shared = require('@freshmart/service-shared');
const { genId } = shared.utils.id;
const config = shared.config;
const logger = shared.logger;
const { ROLES } = shared.constants;
const {
  ConflictError,
  UnauthorizedError,
  InternalServerError,
} = shared.errors;
const {
  extractCognitoUser,
  decodeCompleteJwt,
} = shared.auth;
const createAuthRepository = require('../repositories/auth.repository');
const createCognitoIntegration = require('../integrations/cognito');
const {
  publishUserRegistered,
  publishUserLoggedIn,
  publishUserLoggedOut,
  publishPasswordChanged,
} = require('../events/publisher');

const defaultRepository = createAuthRepository();
const defaultCognito = createCognitoIntegration();

const getTimestamp = () => new Date().toISOString();

const sanitizeUser = (user) => ({
  userId: user.userId,
  cognitoSub: user.cognitoSub || user.userId,
  username: user.username || null,
  name: user.name || null,
  email: user.email,
  role: user.role,
  phone: user.phone || null,
  status: user.status,
  provider: user.provider || 'COGNITO',
  groups: Array.isArray(user.groups) ? user.groups : [],
  emailVerified: Boolean(user.emailVerified),
  phoneVerified: Boolean(user.phoneVerified),
  mfaEnabled: Boolean(user.mfaEnabled),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastLoginAt: user.lastLoginAt || null,
  lastAuthAt: user.lastAuthAt || null,
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

const assertAuthConfig = () => {
  const missing = [
    ['DDB_TABLE_AUTH_USERS', config.dynamodb.tables.authUsers],
    ['COGNITO_USER_POOL_ID', config.auth.cognito.userPoolId],
    ['COGNITO_USER_POOL_CLIENT_ID', config.auth.cognito.userPoolClientId],
    ['COGNITO_USER_POOL_ISSUER', config.auth.cognito.issuer],
  ]
    .filter(([, value]) => value === undefined || value === null || String(value).trim() === '')
    .map(([name]) => name);

  if (missing.length) {
    throw new Error(`Missing required auth configuration: ${missing.join(', ')}`);
  }
};

const decodeJwtPayload = (token) => {
  const payloadPart = String(token || '').split('.')[1] || '';
  if (!payloadPart) {
    return {};
  }

  const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  try {
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  } catch (error) {
    return {};
  }
};

const buildProfilePayload = ({ claims = {}, fallback = {}, role = null }) => {
  const cognitoUser = extractCognitoUser(claims);
  const email = claims.email || fallback.email || null;
  const userId = cognitoUser.userId || fallback.userId || email || genId('USER');
  const groups = cognitoUser.groups.length ? cognitoUser.groups : fallback.groups || [];

  return {
    userId,
    cognitoSub: cognitoUser.userId || userId,
    username: cognitoUser.username || fallback.username || email,
    name: claims.name || fallback.name || null,
    email,
    role: role || cognitoUser.role || fallback.role || ROLES.CUSTOMER,
    phone: claims.phone_number || fallback.phone || null,
    status: fallback.status || 'ACTIVE',
    provider: 'COGNITO',
    groups,
    emailVerified: claims.email_verified === true || String(claims.email_verified) === 'true',
    phoneVerified:
      claims.phone_number_verified === true || String(claims.phone_number_verified) === 'true',
    mfaEnabled: Boolean(fallback.mfaEnabled),
    lastLoginAt: fallback.lastLoginAt || null,
    lastAuthAt: fallback.lastAuthAt || null,
  };
};

const getTokensFromAuthResult = (authResult = {}) => {
  const result = authResult.AuthenticationResult || authResult || {};
  if (!result.AccessToken) {
    throw new UnauthorizedError('Cognito authentication did not return tokens');
  }

  return {
    accessToken: result.AccessToken,
    refreshToken: result.RefreshToken || null,
    idToken: result.IdToken || null,
    expiresIn: result.ExpiresIn || null,
    tokenType: result.TokenType || null,
    accessClaims: decodeJwtPayload(result.AccessToken),
    idClaims: result.IdToken ? decodeJwtPayload(result.IdToken) : {},
  };
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

const createAuthService = ({
  repository = defaultRepository,
  cognito = defaultCognito,
  eventPublisher = {
    publishUserRegistered,
    publishUserLoggedIn,
    publishUserLoggedOut,
    publishPasswordChanged,
  },
  now = getTimestamp,
} = {}) => {
  const createAccount = async ({
    name,
    email,
    password,
    phone = null,
    role = ROLES.CUSTOMER,
    groups = [],
    signInAfterCreate = false,
    context = {},
  }) => {
    assertAuthConfig();
    const normalizedEmail = repository.normalizeEmail(email);
    const existing = await repository.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const userGroups = Array.from(
      new Set([...(groups || []), role === ROLES.ADMIN ? config.auth.cognito.groups.admins : null])
    ).filter(Boolean);

    await cognito.adminCreateUser({
      username: normalizedEmail,
      name,
      email: normalizedEmail,
      phone,
      temporaryPassword: password,
    });

    try {
      await cognito.adminSetUserPassword({
        username: normalizedEmail,
        password,
        permanent: true,
      });
      await cognito.adminAddUserToGroups({
        username: normalizedEmail,
        groups: userGroups.length > 0 ? userGroups : [config.auth.cognito.groups.customers],
      });

      const authResult = signInAfterCreate
        ? await cognito.initiateAuth({ username: normalizedEmail, password })
        : null;

      let profileClaims = {};
      let tokens = null;

      if (authResult) {
        tokens = getTokensFromAuthResult(authResult);
        profileClaims = tokens.idClaims || tokens.accessClaims || {};
      } else {
        const user = await cognito.adminGetUser(normalizedEmail);
        profileClaims = (user?.UserAttributes || []).reduce((acc, attribute) => {
          if (attribute?.Name) {
            acc[attribute.Name] = attribute.Value;
          }
          return acc;
        }, {});
        profileClaims.sub = profileClaims.sub || normalizedEmail;
        profileClaims['cognito:username'] = profileClaims['cognito:username'] || normalizedEmail;
        profileClaims['cognito:groups'] = userGroups;
      }

      const profilePayload = buildProfilePayload({
        claims: profileClaims,
        fallback: {
          userId: profileClaims.sub || normalizedEmail,
          username: normalizedEmail,
          name,
          email: normalizedEmail,
          phone,
          role,
          groups: userGroups,
        },
        role,
      });

      const profile = await repository.syncProfile(profilePayload);
      return { profile, tokens };
    } catch (error) {
      try {
        await cognito.adminDeleteUser(normalizedEmail);
      } catch (cleanupError) {
        logStepError('Cognito cleanup after account creation failure failed', cleanupError, {
          email: normalizedEmail,
        });
      }
      throw error;
    }
  };

  const register = async ({ name, email, password, phone }, context = {}) => {
    const requestId = context.requestId || null;
    logStep('Auth register start', { requestId, email });

    const { profile, tokens } = await createAccount({
      name,
      email,
      password,
      phone,
      role: ROLES.CUSTOMER,
      groups: [config.auth.cognito.groups.customers],
      signInAfterCreate: true,
      context,
    });

    const sanitized = sanitizeUser(profile);
    const result = {
      user: sanitized,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenVersion: Number(profile.version || 0),
      jti: tokens.accessClaims?.jti || null,
    };

    await publishAuthEventSafely(
      'REGISTER - EventBridge publish',
      eventPublisher.publishUserRegistered,
      { user: sanitized },
      { ...context, source: 'auth-service' },
      { requestId, eventType: 'UserRegistered.v1', userId: profile.userId }
    );

    logStep('Auth register completed', {
      requestId,
      userId: profile.userId,
      eventType: 'UserRegistered.v1',
    });
    return result;
  };

  const login = async ({ email, password }, context = {}) => {
    assertAuthConfig();
    const requestId = context.requestId || null;
    const authResult = await cognito.initiateAuth({ username: email, password });

    if (authResult?.ChallengeName) {
      return {
        challengeName: authResult.ChallengeName,
        session: authResult.Session || null,
        challengeParameters: authResult.ChallengeParameters || {},
      };
    }

    const tokens = getTokensFromAuthResult(authResult);
    const claims = tokens.idClaims || tokens.accessClaims || {};
    const profilePayload = buildProfilePayload({
      claims,
      fallback: {
        username: claims['cognito:username'] || email,
        email: claims.email || email,
        name: claims.name || null,
        phone: claims.phone_number || null,
      },
      role: null,
    });

    profilePayload.lastLoginAt = now();
    profilePayload.lastAuthAt = now();

    const profile = await repository.syncProfile(profilePayload);
    const sanitized = sanitizeUser(profile);
    const result = {
      user: sanitized,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenVersion: Number(sanitized.version || 0),
      jti: tokens.accessClaims?.jti || null,
    };

    await publishAuthEventSafely(
      'LOGIN - EventBridge publish',
      eventPublisher.publishUserLoggedIn,
      { user: sanitized },
      { ...context, source: 'auth-service' },
      { requestId, eventType: 'UserLoggedIn.v1', userId: sanitized.userId }
    );

    logStep('Auth login completed', {
      requestId,
      userId: sanitized.userId,
      eventType: 'UserLoggedIn.v1',
    });
    return result;
  };

  const completeChallenge = async ({ challengeName, session, challengeResponses }, context = {}) => {
    assertAuthConfig();
    const authResult = await cognito.respondToAuthChallenge({
      challengeName,
      session,
      challengeResponses,
    });

    const tokens = getTokensFromAuthResult(authResult);
    const claims = tokens.idClaims || tokens.accessClaims || {};
    const profilePayload = buildProfilePayload({
      claims,
      fallback: {
        username: claims['cognito:username'] || challengeResponses?.USERNAME || null,
        email: claims.email || challengeResponses?.USERNAME || null,
      },
    });
    profilePayload.lastLoginAt = now();
    profilePayload.lastAuthAt = now();

    const profile = await repository.syncProfile(profilePayload);
    const sanitized = sanitizeUser(profile);
    await publishAuthEventSafely(
      'LOGIN - EventBridge publish',
      eventPublisher.publishUserLoggedIn,
      { user: sanitized },
      { ...context, source: 'auth-service' },
      { requestId: context.requestId || null, eventType: 'UserLoggedIn.v1', userId: sanitized.userId }
    );

    return {
      user: sanitized,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenVersion: Number(sanitized.version || 0),
      jti: tokens.accessClaims?.jti || null,
    };
  };

  const refresh = async (refreshToken) => {
    assertAuthConfig();
    const tokens = await cognito.refreshAuth({ refreshToken });
    const authTokens = getTokensFromAuthResult(tokens);
    const claims = authTokens.idClaims || authTokens.accessClaims || {};
    const profilePayload = buildProfilePayload({
      claims,
      fallback: {
        username: claims['cognito:username'] || claims.username || null,
        email: claims.email || null,
      },
    });

    const profile = await repository.syncProfile(profilePayload);

    return {
      user: sanitizeUser(profile),
      accessToken: authTokens.accessToken,
      refreshToken: authTokens.refreshToken || refreshToken,
      tokenVersion: Number(profile.version || 0),
      jti: authTokens.accessClaims?.jti || null,
    };
  };

  const logout = async ({ refreshToken = null, accessToken = null }, context = {}) => {
    assertAuthConfig();
    const requestId = context.requestId || null;
    let claims = null;

    if (accessToken) {
      claims = decodeJwtPayload(accessToken);
    }

    try {
      if (refreshToken) {
        await cognito.revokeToken({ refreshToken });
      }
    } catch (error) {
      logStepError('Cognito revokeToken failed', error, { requestId });
      throw new InternalServerError('Unable to process logout');
    }

    if (accessToken) {
      try {
        await cognito.globalSignOut({ accessToken });
      } catch (error) {
        logStepError('Cognito globalSignOut failed', error, { requestId });
      }
    }

    const userId = claims?.sub || null;
    let profile = null;
    if (userId) {
      profile = await repository.findById(userId);
      if (profile) {
        await repository.markLogout(userId, { lastAuthAt: now() });
      }
    }

    if (profile) {
      await publishAuthEventSafely(
        'LOGOUT - EventBridge publish',
        eventPublisher.publishUserLoggedOut,
        {
          user: sanitizeUser(profile),
          revokedTokenJti: claims?.jti || null,
        },
        { ...context, source: 'auth-service' },
        {
          requestId,
          eventType: 'UserLoggedOut.v1',
          userId: profile.userId,
          jti: claims?.jti || null,
        }
      );
    }

    return { success: true };
  };

  const getProfile = async (userId) => {
    const profile = await repository.findById(userId);
    if (!profile) {
      throw new UnauthorizedError('User no longer exists');
    }
    return sanitizeUser(profile);
  };

  const forgotPassword = async ({ email }) => {
    await cognito.forgotPassword({ username: email });
    return { success: true };
  };

  const confirmPasswordReset = async ({ email, code, password }, context = {}) => {
    await cognito.confirmForgotPassword({
      username: email,
      code,
      password,
    });

    const profile = await repository.findByEmail(email);
    if (profile) {
      await publishAuthEventSafely(
        'PASSWORD RESET - EventBridge publish',
        eventPublisher.publishPasswordChanged,
        { user: sanitizeUser(profile), reason: 'RESET' },
        { ...context, source: 'auth-service' },
        {
          requestId: context.requestId || null,
          eventType: 'PasswordChanged.v1',
          userId: profile.userId,
        }
      );
    }

    return { success: true };
  };

  const changePassword = async ({ accessToken, previousPassword, proposedPassword }, context = {}) => {
    await cognito.changePassword({
      accessToken,
      previousPassword,
      proposedPassword,
    });

    const claims = decodeJwtPayload(accessToken);
    const profile = claims?.sub ? await repository.findById(claims.sub) : null;
    if (profile) {
      await repository.markLogout(profile.userId, { lastAuthAt: now() });
      await publishAuthEventSafely(
        'PASSWORD CHANGE - EventBridge publish',
        eventPublisher.publishPasswordChanged,
        { user: sanitizeUser(profile), reason: 'CHANGE' },
        { ...context, source: 'auth-service' },
        {
          requestId: context.requestId || null,
          eventType: 'PasswordChanged.v1',
          userId: profile.userId,
        }
      );
    }

    return { success: true };
  };

  const sendVerificationCode = async ({ accessToken, attributeName }) =>
    cognito.getVerificationCode({ accessToken, attributeName });

  const verifyAttribute = async ({ accessToken, attributeName, code }, context = {}) => {
    await cognito.verifyAttribute({ accessToken, attributeName, code });
    const claims = decodeJwtPayload(accessToken);
    const profile = claims?.sub ? await repository.findById(claims.sub) : null;
    if (profile) {
      const patch = {};
      if (attributeName === 'email') {
        patch.emailVerified = true;
      }
      if (attributeName === 'phone_number') {
        patch.phoneVerified = true;
      }
      if (Object.keys(patch).length) {
        await repository.updateProfile(profile.userId, patch);
      }
    }
    return { success: true };
  };

  const setupMfa = async ({ accessToken }) => cognito.associateSoftwareToken({ accessToken });

  const verifyMfa = async ({ accessToken, userCode, friendlyDeviceName }) =>
    cognito.verifySoftwareToken({
      accessToken,
      userCode,
      friendlyDeviceName,
    });

  const setMfaPreference = async ({ accessToken, preferredMfa, smsEnabled, softwareTokenEnabled }) =>
    cognito.setMfaPreference({
      accessToken,
      preferredMfa,
      smsEnabled,
      softwareTokenEnabled,
    });

  const adminCreateUser = async ({ name, email, password, phone, role, groups = [] }, context = {}) => {
    const selectedRole = role || ROLES.CUSTOMER;
    const selectedGroups = groups.length > 0 ? groups : [config.auth.cognito.groups.customers];
    const { profile } = await createAccount({
      name,
      email,
      password,
      phone,
      role: selectedRole,
      groups: selectedGroups,
      signInAfterCreate: false,
      context,
    });

    return {
      user: sanitizeUser(profile),
    };
  };

  const respondToMfaChallenge = async ({ challengeName, session, challengeResponses }, context = {}) =>
    completeChallenge({ challengeName, session, challengeResponses }, context);

  return {
    register,
    login,
    completeChallenge,
    refresh,
    logout,
    getProfile,
    forgotPassword,
    confirmPasswordReset,
    sendVerificationCode,
    verifyAttribute,
    setupMfa,
    verifyMfa,
    setMfaPreference,
    changePassword,
    adminCreateUser,
    respondToMfaChallenge,
    sanitizeUser,
    decodeJwtPayload,
  };
};

module.exports = createAuthService();
module.exports.createAuthService = createAuthService;
module.exports.sanitizeUser = sanitizeUser;
module.exports.decodeJwtPayload = decodeJwtPayload;
