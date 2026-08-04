const express = require('express');
const { middleware } = require('@freshmart/service-shared');
const controller = require('../controllers/category.controller');
const { categoryIdSchema, categoryListSchema } = require('../validators/category.validator');

const router = express.Router();

router.get('/', middleware.validate(categoryListSchema, 'query'), controller.list);
router.get('/:categoryId', middleware.validate(categoryIdSchema, 'params'), controller.getById);

module.exports = router;
