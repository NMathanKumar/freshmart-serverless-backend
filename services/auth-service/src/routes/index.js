const express = require('express');
const authenticate = require('@freshmart/shared').middleware.authenticate;
const validate = require('@freshmart/shared').middleware.validate;
const controller = require('../controller/auth.controller');
const {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} = require('../validator/auth.validator');

const router = express.Router();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshSchema), controller.refresh);
router.post('/logout', validate(logoutSchema), controller.logout);
router.get('/me', authenticate, controller.me);

module.exports = router;
