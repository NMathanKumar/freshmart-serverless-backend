const {
  publishFoodCreated,
  publishFoodUpdated,
  publishFoodDeleted,
  publishFoodAvailabilityChanged,
} = require('@freshmart/service-shared').eventPublisher;

module.exports = {
  publishFoodCreated,
  publishFoodUpdated,
  publishFoodDeleted,
  publishFoodAvailabilityChanged,
};
