const { UnauthorizedError } = require('../errors/ApiError');
const { ROLES } = require('../constants');
const config = require('../config');
const { extractCognitoUser, getCognitoGroups } = require('./cognito');

const normalizeGroup = (value) => String(value || '').trim().toLowerCase();

const normalizeScope = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(' ').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const getAuthorizerClaims = (req = {}) => {
  const eventClaims = req.apiGateway?.event?.requestContext?.authorizer?.jwt?.claims;
  if (eventClaims && typeof eventClaims === 'object') {
    return eventClaims;
  }

  const requestClaims = req.requestContext?.authorizer?.jwt?.claims;
  if (requestClaims && typeof requestClaims === 'object') {
    return requestClaims;
  }

  const legacyClaims = req.apiGateway?.event?.requestContext?.authorizer?.claims
    || req.requestContext?.authorizer?.claims;
  if (legacyClaims && typeof legacyClaims === 'object') {
    return legacyClaims;
  }

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = Buffer.from(parts[1], 'base64').toString('utf8');
          const parsed = JSON.parse(payload);
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        }
      } catch (_) {
        // Ignored
      }
    }
  }

  return null;
};

const mapCognitoGroupsToRoles = (claims = {}) => {
  const groups = getCognitoGroups(claims).map(normalizeGroup);
  const configuredGroups = config.auth?.cognito?.groups || {};
  const adminGroups = [configuredGroups.admins, 'admin', 'admins'].map(normalizeGroup);
  const staffGroups = [configuredGroups.staff, 'staff', 'manager', 'managers'].map(normalizeGroup);
  const customerGroups = [configuredGroups.customers, 'customer', 'customers'].map(normalizeGroup);
  const roles = [];

  if (groups.some((group) => adminGroups.includes(group))) {
    roles.push(ROLES.ADMIN);
  }

  if (groups.some((group) => staffGroups.includes(group))) {
    roles.push(ROLES.STAFF);
  }

  if (groups.some((group) => customerGroups.includes(group))) {
    roles.push(ROLES.CUSTOMER);
  }

  if (roles.length === 0) {
    roles.push(ROLES.CUSTOMER);
  }

  return [...new Set(roles)];
};

const buildCurrentUserFromClaims = (claims = {}) => {
  const user = extractCognitoUser(claims);
  const roles = mapCognitoGroupsToRoles(claims);

  return {
    userId: user.userId,
    role: roles[0] || user.role || ROLES.CUSTOMER,
    roles,
    email: user.email,
    username: user.username,
    groups: user.groups,
    scope: normalizeScope(claims.scope),
    tokenUse: claims.token_use || null,
    cognito: claims,
  };
};

const requireCurrentUser = (req = {}) => {
  const claims = getAuthorizerClaims(req);
  if (!claims) {
    throw new UnauthorizedError('Missing JWT authorizer claims');
  }

  const user = buildCurrentUserFromClaims(claims);
  if (!user.userId) {
    throw new UnauthorizedError('JWT authorizer claims are missing a subject');
  }

  return user;
};

module.exports = {
  getAuthorizerClaims,
  mapCognitoGroupsToRoles,
  buildCurrentUserFromClaims,
  requireCurrentUser,
};
