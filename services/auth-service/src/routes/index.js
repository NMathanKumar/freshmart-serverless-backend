const express = require('express');
const { authenticate, authorize, validate } = require('@freshmart/service-shared').middleware;
const controller = require('../controller/auth.controller');
const {
  registerSchema,
  loginSchema,
  challengeSchema,
  refreshSchema,
  logoutSchema,
  forgotPasswordSchema,
  confirmPasswordResetSchema,
  verificationRequestSchema,
  verificationConfirmSchema,
  setupMfaSchema,
  verifyMfaSchema,
  setMfaPreferenceSchema,
  changePasswordSchema,
  adminCreateUserSchema,
} = require('../validator/auth.validator');

const router = express.Router();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/challenge', validate(challengeSchema), controller.completeChallenge);
router.post('/refresh', validate(refreshSchema), controller.refresh);
router.post('/logout', validate(logoutSchema), controller.logout);
router.get('/me', authenticate, controller.me);

router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/confirm-password', validate(confirmPasswordResetSchema), controller.confirmPasswordReset);

router.post(
  '/verification/email/request',
  authenticate,
  validate(verificationRequestSchema),
  (req, res, next) => {
    req.body.attributeName = 'email';
    return controller.sendVerificationCode(req, res, next);
  }
);
router.post(
  '/verification/email/confirm',
  authenticate,
  validate(verificationConfirmSchema),
  (req, res, next) => {
    req.body.attributeName = 'email';
    return controller.verifyAttribute(req, res, next);
  }
);
router.post(
  '/verification/phone/request',
  authenticate,
  validate(verificationRequestSchema),
  (req, res, next) => {
    req.body.attributeName = 'phone_number';
    return controller.sendVerificationCode(req, res, next);
  }
);
router.post(
  '/verification/phone/confirm',
  authenticate,
  validate(verificationConfirmSchema),
  (req, res, next) => {
    req.body.attributeName = 'phone_number';
    return controller.verifyAttribute(req, res, next);
  }
);

router.post('/change-password', authenticate, validate(changePasswordSchema), controller.changePassword);
router.post('/mfa/setup', authenticate, validate(setupMfaSchema), controller.setupMfa);
router.post('/mfa/verify', authenticate, validate(verifyMfaSchema), controller.verifyMfa);
router.post('/mfa/preference', authenticate, validate(setMfaPreferenceSchema), controller.setMfaPreference);

router.post('/admin/users', authenticate, authorize('ADMIN'), validate(adminCreateUserSchema), controller.adminCreateUser);

module.exports = router;
