const asyncHandler = require('@freshmart/shared').utils.asyncHandler;
const { success, created, noContent } = require('@freshmart/shared').response;
const menuService = require('../service/menu.service');

// Builds the context object passed to every service call.
// Reads x-correlation-id explicitly from headers — requestLogger sets
// correlationId = requestId by default, which loses the caller's trace ID.
const buildContext = (req) => ({
	correlationId: req.headers['x-correlation-id'] || req.requestId || null,
	requestId: req.requestId || null,
});

const createFood = asyncHandler(async (req, res) => {
	const food = await menuService.createFood(req.body, buildContext(req));
	created(res, { message: 'Food item created', data: food });
});

const getFoodById = asyncHandler(async (req, res) => {
	const food = await menuService.getFoodById(req.params.id);
	success(res, { message: 'Food item fetched', data: food });
});

// Fix — service now returns { items, nextCursor }, not { items, meta }.
// Extracts cursor + limit + category from query. Does NOT pass page.
const listFood = asyncHandler(async (req, res) => {
	const { limit, cursor, category } = req.query;
	const { items, nextCursor } = await menuService.listFood({ limit, cursor, category });
	success(res, { message: 'Food items fetched', data: items, meta: { nextCursor } });
});

// Fix — same contract correction as listFood.
// q is the search term. cursor + limit drive pagination. page is not passed.
const searchFood = asyncHandler(async (req, res) => {
	const { q, limit, cursor } = req.query;
	const { items, nextCursor } = await menuService.searchFood(q, { limit, cursor });
	success(res, { message: 'Search results', data: items, meta: { nextCursor } });
});

const updateFood = asyncHandler(async (req, res) => {
	const food = await menuService.updateFood(req.params.id, req.body, buildContext(req));
	success(res, { message: 'Food item updated', data: food });
});

const setAvailability = asyncHandler(async (req, res) => {
	const food = await menuService.setAvailability(
		req.params.id,
		req.body.available,
		buildContext(req)
	);
	success(res, {
		message: `Food item marked as ${req.body.available ? 'available' : 'unavailable'}`,
		data: food,
	});
});

const deleteFood = asyncHandler(async (req, res) => {
	await menuService.deleteFood(req.params.id, buildContext(req));
	noContent(res, { message: 'Food item deleted' });
});

module.exports = {
	createFood,
	getFoodById,
	listFood,
	searchFood,
	updateFood,
	setAvailability,
	deleteFood,
};
