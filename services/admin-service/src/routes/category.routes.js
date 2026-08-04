const express = require('express');
const { middleware } = require('@freshmart/service-shared');
const controller = require('../controllers/category.controller');
const { categoryIdSchema, categoryListSchema, createCategorySchema, updateCategorySchema } = require('../validators/category.validator');

const router = express.Router();
router.use(middleware.authenticate);
router.use(middleware.authorize('ADMIN'));

router.get('/', middleware.validate(categoryListSchema, 'query'), controller.list);
router.get('/:categoryId', middleware.validate(categoryIdSchema, 'params'), controller.getById);
router.post('/', middleware.validate(createCategorySchema), controller.create);
router.put('/:categoryId', middleware.validate(categoryIdSchema, 'params'), middleware.validate(updateCategorySchema), controller.update);
router.delete('/:categoryId', middleware.validate(categoryIdSchema, 'params'), controller.remove);

module.exports = router;
