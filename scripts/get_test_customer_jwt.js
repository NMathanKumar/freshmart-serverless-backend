const { CognitoIdentityProviderClient, InitiateAuthCommand, AdminSetUserPasswordCommand, SignUpCommand, AdminConfirmSignUpCommand } = require('@aws-sdk/client-cognito-identity-provider');

const cognito = new CognitoIdentityProviderClient({ region: 'ap-southeast-1' });

const USER_POOL_ID = 'ap-southeast-1_RXGKIq89c';
const CLIENT_ID = '5qeg7to1eroscp415s5jqicvt2';
const TEST_EMAIL = 'verify-1786075082235@freshmart-test.com';
const TEST_PASSWORD = 'Password123!';

async function getJwt() {
  try {
    // Set password to ensure known state
    await cognito.send(new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: TEST_EMAIL,
      Password: TEST_PASSWORD,
      Permanent: true
    }));
    console.log('Password set for test user:', TEST_EMAIL);

    const authRes = await cognito.send(new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: TEST_EMAIL,
        PASSWORD: TEST_PASSWORD
      }
    }));

    const token = authRes.AuthenticationResult.AccessToken;
    console.log('Successfully obtained AccessToken!');
    console.log('TOKEN_PREFIX:' + token.substring(0, 30));
    console.log('FULL_TOKEN:' + token);
  } catch (err) {
    console.error('Error getting JWT:', err);
  }
}

getJwt();
