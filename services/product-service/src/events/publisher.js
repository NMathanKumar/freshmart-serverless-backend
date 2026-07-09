const {
  publishProductCreated,
  publishProductUpdated,
  publishProductDeleted,
  publishProductAvailabilityChanged,
} = require('@freshmart/shared').eventPublisher;

module.exports = {
  publishProductCreated,
  publishProductUpdated,
  publishProductDeleted,
  publishProductAvailabilityChanged,
};
