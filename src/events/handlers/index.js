const handleDomainEvent = async (event) => ({
  received: true,
  eventId: event.eventId,
  eventType: event.eventType,
});

module.exports = {
  handleDomainEvent,
};
