const {
  publishProductCreated,
  publishProductUpdated,
  publishProductDeleted,
  publishProductAvailabilityChanged,
} = require('@freshmart/service-shared').eventPublisher;

module.exports = {
  publishProductCreated,
  publishProductUpdated,
  publishProductDeleted,
  publishProductAvailabilityChanged,
};
