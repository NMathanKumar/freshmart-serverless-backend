const {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminGetUserCommand,
  AdminSetUserMFAPreferenceCommand,
  AdminSetUserPasswordCommand,
  ChangePasswordCommand,
  ConfirmForgotPasswordCommand,
  ForgotPasswordCommand,
  GlobalSignOutCommand,
  GetUserAttributeVerificationCodeCommand,
  GetUserCommand,
  ListUsersCommand,
  InitiateAuthCommand,
  RevokeTokenCommand,
  RespondToAuthChallengeCommand,
  SetUserMFAPreferenceCommand,
  AssociateSoftwareTokenCommand,
  VerifySoftwareTokenCommand,
  VerifyUserAttributeCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const shared = require('@freshmart/service-shared');

const config = shared.config;
const logger = shared.logger;

const defaultRegion = config.auth.cognito.region || config.aws.region;

const createClient = (client) =>
  client ||
  new CognitoIdentityProviderClient({
    region: defaultRegion,
  });

const getUsername = (value) => String(value || '').trim().toLowerCase();

const buildUserAttributes = ({ name, email, phone }) => {
  const attrs = [
    { Name: 'email', Value: String(email || '').trim().toLowerCase() },
    { Name: 'email_verified', Value: 'false' },
  ];

  if (name) {
    attrs.push({ Name: 'name', Value: String(name).trim() });
  }

  if (phone) {
    attrs.push({ Name: 'phone_number', Value: String(phone).trim() });
    attrs.push({ Name: 'phone_number_verified', Value: 'false' });
  }

  return attrs;
};

const safeLog = (message, details = {}) => {
  logger.debug(message, details);
};

const createCognitoIntegration = ({
  client = null,
  userPoolId = config.auth.cognito.userPoolId,
  userPoolClientId = config.auth.cognito.userPoolClientId,
} = {}) => {
  const cognito = createClient(client);

  const assertConfigured = () => {
    if (!userPoolId || !userPoolClientId) {
      throw new Error('Cognito user pool and app client must be configured');
    }
  };

  const adminCreateUser = async ({ username, name, email, phone, temporaryPassword }) => {
    assertConfigured();
    const normalizedUsername = getUsername(username || email);
    const result = await cognito.send(
      new AdminCreateUserCommand({
        UserPoolId: userPoolId,
        Username: normalizedUsername,
        MessageAction: 'SUPPRESS',
        TemporaryPassword: temporaryPassword,
        UserAttributes: buildUserAttributes({ name, email, phone }),
      })
    );
    safeLog('Cognito adminCreateUser success', { username: normalizedUsername });
    return result;
  };

  const adminDeleteUser = async (username) => {
    assertConfigured();
    const normalizedUsername = getUsername(username);
    await cognito.send(
      new AdminDeleteUserCommand({
        UserPoolId: userPoolId,
        Username: normalizedUsername,
      })
    );
    safeLog('Cognito adminDeleteUser success', { username: normalizedUsername });
  };

  const adminSetUserPassword = async ({ username, password, permanent = true }) => {
    assertConfigured();
    const normalizedUsername = getUsername(username);
    await cognito.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: userPoolId,
        Username: normalizedUsername,
        Password: password,
        Permanent: permanent,
      })
    );
    safeLog('Cognito adminSetUserPassword success', { username: normalizedUsername });
  };

  const adminAddUserToGroups = async ({ username, groups = [] }) => {
    assertConfigured();
    const normalizedUsername = getUsername(username);
    for (const group of groups.filter(Boolean)) {
      await cognito.send(
        new AdminAddUserToGroupCommand({
          UserPoolId: userPoolId,
          Username: normalizedUsername,
          GroupName: group,
        })
      );
    }
  };

  const adminGetUser = async (username) => {
    assertConfigured();
    const normalizedUsername = getUsername(username);
    return cognito.send(
      new AdminGetUserCommand({
        UserPoolId: userPoolId,
        Username: normalizedUsername,
      })
    );
  };

  const listUsers = async ({ filter, limit = 1 } = {}) => {
    assertConfigured();
    return cognito.send(
      new ListUsersCommand({
        UserPoolId: userPoolId,
        Filter: filter,
        Limit: limit,
      })
    );
  };

  const initiateAuth = async ({ username, password }) => {
    assertConfigured();
    return cognito.send(
      new InitiateAuthCommand({
        ClientId: userPoolClientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: getUsername(username),
          PASSWORD: password,
        },
      })
    );
  };

  const refreshAuth = async ({ refreshToken, username }) => {
    assertConfigured();
    return cognito.send(
      new InitiateAuthCommand({
        ClientId: userPoolClientId,
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
          USERNAME: username ? getUsername(username) : undefined,
        },
      })
    );
  };

  const revokeToken = async ({ refreshToken }) => {
    assertConfigured();
    return cognito.send(
      new RevokeTokenCommand({
        ClientId: userPoolClientId,
        Token: refreshToken,
      })
    );
  };

  const globalSignOut = async ({ accessToken }) => {
    assertConfigured();
    return cognito.send(
      new GlobalSignOutCommand({
        AccessToken: accessToken,
      })
    );
  };

  const forgotPassword = async ({ username }) => {
    assertConfigured();
    return cognito.send(
      new ForgotPasswordCommand({
        ClientId: userPoolClientId,
        Username: getUsername(username),
      })
    );
  };

  const confirmForgotPassword = async ({ username, code, password }) => {
    assertConfigured();
    return cognito.send(
      new ConfirmForgotPasswordCommand({
        ClientId: userPoolClientId,
        Username: getUsername(username),
        ConfirmationCode: code,
        Password: password,
      })
    );
  };

  const getVerificationCode = async ({ accessToken, attributeName }) => {
    assertConfigured();
    return cognito.send(
      new GetUserAttributeVerificationCodeCommand({
        AccessToken: accessToken,
        AttributeName: attributeName,
      })
    );
  };

  const verifyAttribute = async ({ accessToken, attributeName, code }) => {
    assertConfigured();
    return cognito.send(
      new VerifyUserAttributeCommand({
        AccessToken: accessToken,
        AttributeName: attributeName,
        Code: code,
      })
    );
  };

  const changePassword = async ({ accessToken, previousPassword, proposedPassword }) => {
    assertConfigured();
    return cognito.send(
      new ChangePasswordCommand({
        AccessToken: accessToken,
        PreviousPassword: previousPassword,
        ProposedPassword: proposedPassword,
      })
    );
  };

  const associateSoftwareToken = async ({ accessToken }) => {
    assertConfigured();
    return cognito.send(
      new AssociateSoftwareTokenCommand({
        AccessToken: accessToken,
      })
    );
  };

  const verifySoftwareToken = async ({ accessToken, userCode, friendlyDeviceName }) => {
    assertConfigured();
    return cognito.send(
      new VerifySoftwareTokenCommand({
        AccessToken: accessToken,
        UserCode: userCode,
        FriendlyDeviceName: friendlyDeviceName,
      })
    );
  };

  const setMfaPreference = async ({
    accessToken,
    preferredMfa = null,
    smsEnabled = false,
    softwareTokenEnabled = false,
  }) => {
    assertConfigured();
    if (accessToken) {
      return cognito.send(
        new SetUserMFAPreferenceCommand({
          AccessToken: accessToken,
          SMSMfaSettings: smsEnabled
            ? { Enabled: true, PreferredMfa: preferredMfa === 'SMS_MFA' }
            : undefined,
          SoftwareTokenMfaSettings: softwareTokenEnabled
            ? { Enabled: true, PreferredMfa: preferredMfa === 'SOFTWARE_TOKEN_MFA' }
            : undefined,
        })
      );
    }

    return cognito.send(
      new AdminSetUserMFAPreferenceCommand({
        UserPoolId: userPoolId,
        Username: preferredMfa?.username ? getUsername(preferredMfa.username) : undefined,
      })
    );
  };

  const respondToAuthChallenge = async ({ challengeName, session, challengeResponses }) => {
    assertConfigured();
    return cognito.send(
      new RespondToAuthChallengeCommand({
        ClientId: userPoolClientId,
        ChallengeName: challengeName,
        Session: session,
        ChallengeResponses: challengeResponses,
      })
    );
  };

  const getAuthSession = (result = {}) => result?.AuthenticationResult || result?.AuthResult || null;

  return {
    client: cognito,
    userPoolId,
    userPoolClientId,
    assertConfigured,
    adminCreateUser,
    adminDeleteUser,
    adminSetUserPassword,
    adminAddUserToGroups,
    adminGetUser,
    listUsers,
    initiateAuth,
    refreshAuth,
    revokeToken,
    globalSignOut,
    forgotPassword,
    confirmForgotPassword,
    getVerificationCode,
    verifyAttribute,
    changePassword,
    associateSoftwareToken,
    verifySoftwareToken,
    setMfaPreference,
    respondToAuthChallenge,
    getAuthSession,
  };
};

module.exports = createCognitoIntegration;
