const express = require('express');
const authenticate = require('@freshmart/shared').middleware.authenticate;
const authorize = require('@freshmart/shared').middleware.authorize;
const validate = require('@freshmart/shared').middleware.validate;
const controller = require('../controllers/admin.controller');
const { adminConfigSchema, auditQuerySchema } = require('../validators/admin.validator');

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/health', controller.getHealth);
router.get('/dashboard', controller.getDashboard);
router.get('/config', controller.getConfig);
router.put('/config', validate(adminConfigSchema), controller.updateConfig);
router.get('/audit', validate(auditQuerySchema, 'query'), controller.getAudit);

module.exports = router;
