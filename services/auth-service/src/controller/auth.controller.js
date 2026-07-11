const asyncHandler = require('@freshmart/shared').utils.asyncHandler;
const { success, created, noContent } = require('@freshmart/shared').response;
const logger = require('@freshmart/shared').logger;
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
  logStep('STEP 0 - controller register entry', {
    path: req.originalUrl,
    method: req.method,
    requestId: req.eventContext?.requestId || null,
  });

  const result = await authService.register(req.body, req.eventContext);

  try {
    logStep('STEP 11 - response creation start', {
      requestId: req.eventContext?.requestId || null,
      userId: result?.user?.userId || null,
    });
    created(res, { message: 'Account created successfully', data: result });
    logStep('STEP 11 - response creation success', {
      requestId: req.eventContext?.requestId || null,
      userId: result?.user?.userId || null,
    });
  } catch (error) {
    logStepError('STEP 11 - response creation failed', error, {
      requestId: req.eventContext?.requestId || null,
      userId: result?.user?.userId || null,
    });
    throw error;
  }
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, req.eventContext);
  success(res, { message: 'Login successful', data: result });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refresh(refreshToken);
  success(res, { message: 'Token refreshed', data: tokens });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || null;
  const token = refreshToken || req.headers.authorization?.split(' ')[1];
  await authService.logout(token, req.eventContext);
  noContent(res, { message: 'Logged out successfully' });
});

const me = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.userId);
  success(res, { message: 'Profile fetched', data: profile });
});

module.exports = { register, login, refresh, logout, me };
