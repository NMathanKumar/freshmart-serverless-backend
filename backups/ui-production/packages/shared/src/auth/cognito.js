const config = require('../config');
const { ROLES } = require('../constants');

const normalizeGroup = (value) => String(value || '').trim().toLowerCase();

const getCognitoGroups = (claims = {}) => {
  let groups = claims['cognito:groups'];
  if (typeof groups === 'string' && groups.trim().startsWith('[')) {
    try {
      groups = JSON.parse(groups);
    } catch {
      groups = groups.replace(/[\[\]"]/g, '').split(',');
    }
  }
  if (Array.isArray(groups)) {
    return groups.filter(Boolean);
  }
  if (typeof groups === 'string' && groups.trim()) {
    return groups.split(',').map((group) => group.trim().replace(/[\[\]"]/g, '')).filter(Boolean);
  }
  return [];
};

const mapCognitoGroupsToRole = (claims = {}) => {
  const groups = getCognitoGroups(claims).map(normalizeGroup);
  const configured = config.auth.cognito.groups || {};
  const adminGroups = [configured.admins, 'admin', 'admins'].map(normalizeGroup);
  const staffGroups = [configured.staff, 'staff', 'staffs'].map(normalizeGroup);
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
  getCognitoGroups,
  mapCognitoGroupsToRole,
  extractCognitoUser,
};
