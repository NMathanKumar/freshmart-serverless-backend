const jwt = require('jsonwebtoken');
const { createPublicKey } = require('crypto');
const config = require('../config');
const { ROLES } = require('../constants');
const { UnauthorizedError } = require('../errors/ApiError');

const jwksCache = new Map();

const normalizeIssuer = (issuer) => String(issuer || '').trim().replace(/\/+$/, '');

const normalizeGroup = (value) => String(value || '').trim().toLowerCase();

const decodeCompleteJwt = (token) => {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || typeof decoded !== 'object' || !decoded.header || !decoded.payload) {
    throw new UnauthorizedError('Invalid Cognito token');
  }
  return decoded;
};

const resolveJwksUrl = (issuer, jwksUrl) => {
  if (jwksUrl) {
    return jwksUrl;
  }
  if (!issuer) {
    throw new UnauthorizedError('Cognito issuer is not configured');
  }
  return `${normalizeIssuer(issuer)}/.well-known/jwks.json`;
};

const fetchJwks = async (issuer, jwksUrl) => {
  const normalizedIssuer = normalizeIssuer(issuer);
  const cacheKey = `${normalizedIssuer}::${jwksUrl || ''}`;
  const cached = jwksCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.keys;
  }

  const response = await fetch(resolveJwksUrl(normalizedIssuer, jwksUrl), {
    headers: { accept: 'application/json' },
  });

  if (!response.ok) {
    throw new UnauthorizedError('Unable to fetch Cognito signing keys');
  }

  const body = await response.json();
  const keys = new Map();

  for (const jwk of body?.keys || []) {
    if (jwk?.kid) {
      keys.set(jwk.kid, jwk);
    }
  }

  const cacheControl = response.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const ttlMs = maxAgeMatch ? Number(maxAgeMatch[1]) * 1000 : 60 * 60 * 1000;
  jwksCache.set(cacheKey, {
    keys,
    expiresAt: Date.now() + ttlMs,
  });

  return keys;
};

const getPublicKeyForToken = async (token, options = {}) => {
  const decoded = decodeCompleteJwt(token);
  const issuer = normalizeIssuer(options.issuer || config.auth.cognito.issuer);
  const jwksUrl = options.jwksUrl || config.auth.cognito.jwksUrl || '';
  const keys = await fetchJwks(issuer, jwksUrl);
  const jwk = keys.get(decoded.header.kid);

  if (!jwk) {
    throw new UnauthorizedError('Cognito signing key is unavailable');
  }

  return {
    publicKey: createPublicKey({ key: jwk, format: 'jwk' }),
    decoded,
    issuer,
  };
};

const verifyCognitoJwt = async (token, options = {}) => {
  const cognitoConfig = config.auth.cognito;
  if (!cognitoConfig.userPoolClientId || !cognitoConfig.issuer) {
    throw new UnauthorizedError('Cognito authentication is not configured');
  }

  const allowedTokenUse = options.allowedTokenUse || ['access', 'id'];
  const { publicKey, decoded, issuer } = await getPublicKeyForToken(token, options);
  const verified = jwt.verify(token, publicKey, {
    algorithms: [decoded.header.alg || 'RS256'],
    issuer,
    clockTolerance: 5,
  });

  if (!allowedTokenUse.includes(verified.token_use)) {
    throw new UnauthorizedError('Invalid Cognito token type');
  }

  if (verified.token_use === 'access') {
    if (verified.client_id !== cognitoConfig.userPoolClientId) {
      throw new UnauthorizedError('Invalid Cognito token audience');
    }
  } else if (verified.aud !== cognitoConfig.userPoolClientId) {
    throw new UnauthorizedError('Invalid Cognito token audience');
  }

  return verified;
};

const getCognitoGroups = (claims = {}) => {
  const groups = claims['cognito:groups'];
  if (Array.isArray(groups)) {
    return groups.filter(Boolean);
  }
  if (typeof groups === 'string' && groups.trim()) {
    return groups.split(',').map((group) => group.trim()).filter(Boolean);
  }
  return [];
};

const mapCognitoGroupsToRole = (claims = {}) => {
  const groups = getCognitoGroups(claims).map(normalizeGroup);
  const configured = config.auth.cognito.groups || {};
  const adminGroups = [configured.admins, 'admin'].map(normalizeGroup);
  const staffGroups = [configured.staff, 'staff'].map(normalizeGroup);
  const customerGroups = [configured.customers, 'customer', 'customers'].map(normalizeGroup);

  if (groups.some((group) => adminGroups.includes(group))) {
    return ROLES.ADMIN;
  }

  if (groups.some((group) => staffGroups.includes(group))) {
    return ROLES.STAFF;
  }

  if (groups.some((group) => customerGroups.includes(group))) {
    return ROLES.CUSTOMER;
  }

  return ROLES.CUSTOMER;
};

const extractCognitoUser = (claims = {}) => ({
  userId: claims.sub || claims.username || null,
  username: claims['cognito:username'] || claims.username || null,
  email: claims.email || null,
  phone: claims.phone_number || null,
  role: mapCognitoGroupsToRole(claims),
  groups: getCognitoGroups(claims),
  emailVerified: String(claims.email_verified) === 'true',
  phoneVerified: String(claims.phone_number_verified) === 'true',
  tokenUse: claims.token_use || null,
  clientId: claims.client_id || claims.aud || null,
  expiresAt: claims.exp || null,
});

module.exports = {
  verifyCognitoJwt,
  getCognitoGroups,
  mapCognitoGroupsToRole,
  extractCognitoUser,
  decodeCompleteJwt,
};
