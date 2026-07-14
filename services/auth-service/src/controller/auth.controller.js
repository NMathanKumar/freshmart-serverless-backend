const asyncHandler = require('@freshmart/service-shared').utils.asyncHandler;
const { success, created, noContent } = require('@freshmart/service-shared').response;
const logger = require('@freshmart/service-shared').logger;
const authService = require('../service/auth.service');

const logStep = (label, details = {}) => {
  logger.debug(label, details);
};

const logStepError = (label, error, details = {}) => {
  logger.error(label, {
    ...details,
    errorName: error?.name || null,
    errorMessage: error?.message || null,
    errorCode: error?.code || null,
    stack: error?.stack || null,
  });
};

const register = asyncHandler(async (req, res) => {
  logStep('Auth controller register entry', {
    path: req.originalUrl,
    method: req.method,
    requestId: req.eventContext?.requestId || null,
  });

  const result = await authService.register(req.body, req.eventContext);
  created(res, { message: 'Account created successfully', data: result });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, req.eventContext);

  if (result?.challengeName) {
    success(res, { message: 'Additional verification required', data: result });
    return;
  }

  success(res, { message: 'Login successful', data: result });
});

const completeChallenge = asyncHandler(async (req, res) => {
  const result = await authService.respondToMfaChallenge(req.body, req.eventContext);
  success(res, { message: 'Login successful', data: result });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refresh(refreshToken);
  success(res, { message: 'Token refreshed', data: tokens });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || null;
  const accessToken = req.body.accessToken || req.headers.authorization?.split(' ')[1] || null;
  await authService.logout({ refreshToken, accessToken }, req.eventContext);
  noContent(res, { message: 'Logged out successfully' });
});

const me = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.userId);
  success(res, { message: 'Profile fetched', data: profile });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body, req.eventContext);
  success(res, { message: 'Password reset code sent', data: result });
});

const confirmPasswordReset = asyncHandler(async (req, res) => {
  const result = await authService.confirmPasswordReset(req.body, req.eventContext);
  success(res, { message: 'Password reset confirmed', data: result });
});

const sendVerificationCode = asyncHandler(async (req, res) => {
  const accessToken = req.body.accessToken || req.headers.authorization?.split(' ')[1] || null;
  const result = await authService.sendVerificationCode({
    accessToken,
    attributeName: req.body.attributeName,
  });
  success(res, { message: 'Verification code sent', data: result });
});

const verifyAttribute = asyncHandler(async (req, res) => {
  const accessToken = req.body.accessToken || req.headers.authorization?.split(' ')[1] || null;
  const result = await authService.verifyAttribute(
    {
      accessToken,
      attributeName: req.body.attributeName,
      code: req.body.code,
    },
    req.eventContext
  );
  success(res, { message: 'Verification completed', data: result });
});

const setupMfa = asyncHandler(async (req, res) => {
  const accessToken = req.body.accessToken || req.headers.authorization?.split(' ')[1] || null;
  const result = await authService.setupMfa({ accessToken });
  success(res, { message: 'MFA setup started', data: result });
});

const verifyMfa = asyncHandler(async (req, res) => {
  const accessToken = req.body.accessToken || req.headers.authorization?.split(' ')[1] || null;
  const result = await authService.verifyMfa({
    accessToken,
    userCode: req.body.userCode,
    friendlyDeviceName: req.body.friendlyDeviceName,
  });
  success(res, { message: 'MFA verified', data: result });
});

const setMfaPreference = asyncHandler(async (req, res) => {
  const accessToken = req.body.accessToken || req.headers.authorization?.split(' ')[1] || null;
  const result = await authService.setMfaPreference({ accessToken, ...req.body });
  success(res, { message: 'MFA preference updated', data: result });
});

const changePassword = asyncHandler(async (req, res) => {
  const accessToken = req.body.accessToken || req.headers.authorization?.split(' ')[1] || null;
  const result = await authService.changePassword(
    {
      accessToken,
      previousPassword: req.body.previousPassword,
      proposedPassword: req.body.proposedPassword,
    },
    req.eventContext
  );
  success(res, { message: 'Password changed successfully', data: result });
});

const adminCreateUser = asyncHandler(async (req, res) => {
  const result = await authService.adminCreateUser(req.body, req.eventContext);
  created(res, { message: 'User created successfully', data: result });
});

module.exports = {
  register,
  login,
  completeChallenge,
  refresh,
  logout,
  me,
  forgotPassword,
  confirmPasswordReset,
  sendVerificationCode,
  verifyAttribute,
  setupMfa,
  verifyMfa,
  setMfaPreference,
  changePassword,
  adminCreateUser,
};
