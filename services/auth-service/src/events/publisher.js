const { publishDomainEvent } = require('@freshmart/shared').eventPublisher;

const publishUserRegistered = (payload = {}, context = {}) =>
  publishDomainEvent('UserRegistered.v1', payload, context);

const publishUserLoggedIn = (payload = {}, context = {}) =>
  publishDomainEvent('UserLoggedIn.v1', payload, context);

const publishUserLoggedOut = (payload = {}, context = {}) =>
  publishDomainEvent('UserLoggedOut.v1', payload, context);

module.exports = {
  publishUserRegistered,
  publishUserLoggedIn,
  publishUserLoggedOut,
};

