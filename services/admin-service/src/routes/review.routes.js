const express = require('express');
const { middleware } = require('@freshmart/service-shared');
const controller = require('../controllers/review.controller');
const {
  reviewIdSchema,
  reviewListSchema,
  updateReviewSchema,
} = require('../validators/review.validator');

const router = express.Router();
router.use(middleware.authenticate);
router.use(middleware.authorize('ADMIN'));

router.get('/', middleware.validate(reviewListSchema, 'query'), controller.list);
router.get('/statistics', controller.getStatistics);
router.get('/:reviewId', middleware.validate(reviewIdSchema, 'params'), controller.getById);
router.patch('/:reviewId', middleware.validate(reviewIdSchema, 'params'), middleware.validate(updateReviewSchema), controller.moderate);
router.delete('/:reviewId', middleware.validate(reviewIdSchema, 'params'), controller.remove);

module.exports = router;
