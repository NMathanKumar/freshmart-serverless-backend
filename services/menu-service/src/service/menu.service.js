const { genId } = require('@freshmart/service-shared').utils.id;
const { NotFoundError } = require('@freshmart/service-shared').errors;
const baseLogger = require('@freshmart/service-shared').logger;
const createMenuRepository = require('../repositories/menu.repository');
const {
	publishFoodCreated,
	publishFoodUpdated,
	publishFoodDeleted,
	publishFoodAvailabilityChanged,
} = require('../events/publisher');

const logger = baseLogger.child({ service: 'menu-service' });
const menuRepository = createMenuRepository();

// Wraps every publish call so an EventBridge/SNS failure never rolls back a
// successful DynamoDB write. Logs a warning and continues.
const safePublish = async (publishFn, payload, context, eventName) => {
	try {
		await publishFn(payload, { ...context, source: 'menu-service' });
	} catch (err) {
		logger.warn(`Event publish failed: ${eventName}`, {
			service: 'menu-service',
			eventName,
			foodId: payload.foodId || null,
			correlationId: context.correlationId || null,
			requestId: context.requestId || null,
			error: err.message,
		});
	}
};

const logMenuEvent = (message, foodId, context = {}) => {
	logger.info(message, {
		service: 'menu-service',
		foodId: foodId || null,
		correlationId: context.correlationId || null,
		requestId: context.requestId || null,
	});
};

const createFood = async (data, context = {}) => {
	const foodId = genId('FOOD');
	const food = await menuRepository.createFood(foodId, data);
	await safePublish(publishFoodCreated, { food }, context, 'FOOD_CREATED');
	logMenuEvent('Menu food created', foodId, context);
	return food;
};

const getFoodById = async (foodId) => {
	const food = await menuRepository.findById(foodId);
	if (!food) throw new NotFoundError(`Food item '${foodId}' not found`);
	return food;
};

// Fix #1 — repository now returns { items, nextCursor }, not { items, total }.
// Removed buildMeta and page/total logic. Passes cursor + limit through to repo.
const listFood = async ({ limit, cursor, category } = {}) => {
	const { items, nextCursor } = await menuRepository.findAll({ limit, cursor, category });
	return { items, nextCursor };
};

// Fix #2 — same contract fix as listFood.
const searchFood = async (term, { limit, cursor } = {}) => {
	const { items, nextCursor } = await menuRepository.search(term, { limit, cursor });
	return { items, nextCursor };
};

// Fix #3 — removed redundant getFoodById read before updateFood.
// menuRepository.updateFood calls getMain internally; returning null means not found.
const updateFood = async (foodId, data, context = {}) => {
	const updatedFood = await menuRepository.updateFood(foodId, data);
	if (!updatedFood) throw new NotFoundError(`Food item '${foodId}' not found`);
	await safePublish(publishFoodUpdated, { foodId, food: updatedFood }, context, 'FOOD_UPDATED');
	logMenuEvent('Menu food updated', foodId, context);
	return updatedFood;
};

// Fix #4 — removed redundant getFoodById read before setAvailability.
// Fix #5 — both publish calls wrapped in safePublish.
const setAvailability = async (foodId, available, context = {}) => {
	const updatedFood = await menuRepository.setAvailability(foodId, available);
	if (!updatedFood) throw new NotFoundError(`Food item '${foodId}' not found`);
	await safePublish(publishFoodUpdated, { foodId, food: updatedFood }, context, 'FOOD_UPDATED');
	await safePublish(
		publishFoodAvailabilityChanged,
		{ foodId, food: updatedFood, available: !!available },
		context,
		'FOOD_AVAILABILITY_CHANGED'
	);
	logMenuEvent('Menu food availability changed', foodId, context);
	return updatedFood;
};

// deleteFood keeps the getFoodById read — the entity is required to publish
// the FOOD_DELETED event with the full food payload for downstream consumers.
const deleteFood = async (foodId, context = {}) => {
	const food = await getFoodById(foodId);
	const deleted = await menuRepository.remove(foodId);
	if (deleted) {
		await safePublish(publishFoodDeleted, { foodId, food }, context, 'FOOD_DELETED');
		logMenuEvent('Menu food deleted', foodId, context);
	}
	return deleted;
};

module.exports = {
	createFood,
	getFoodById,
	listFood,
	searchFood,
	updateFood,
	setAvailability,
	deleteFood,
};
