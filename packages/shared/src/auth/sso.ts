import { getEnvironmentUrls, clearSession } from '../shared-auth.js';

// Base64URL encoding function
const base64UrlEncode = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// Generate a random string for the code verifier
const generateRandomString = (length: number): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  for (let i = 0; i < length; i++) {
    result += charset[values[i] % charset.length];
  }
  return result;
};

// Generate SHA-256 hash for the code challenge
const sha256 = async (message: string): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  return await crypto.subtle.digest('SHA-256', data);
};

// Generate PKCE Challenge and Verifier
export const generatePKCE = async (): Promise<{ codeVerifier: string; codeChallenge: string }> => {
  const codeVerifier = generateRandomString(128);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(hashed);
  return { codeVerifier, codeChallenge };
};

export const redirectToSSO = async (redirectUri: string, returnUrl?: string): Promise<void> => {
  let env: any = {};
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      env = import.meta.env;
    }
  } catch (e) {}

  const domain = env?.VITE_COGNITO_DOMAIN || 'https://freshmart-dev-auth.auth.ap-southeast-1.amazoncognito.com';
  const clientId = env?.VITE_COGNITO_CLIENT_ID || '5qeg7to1eroscp415s5jqicvt2';
  const scopes = env?.VITE_OAUTH_SCOPES || 'openid email profile';

  if (!domain || !clientId) {
    console.error('SSO Configuration missing. Cannot redirect.');
    return;
  }

  const { codeVerifier, codeChallenge } = await generatePKCE();
  sessionStorage.setItem('pkce_verifier', codeVerifier);
  sessionStorage.setItem('oauth_redirect_uri', redirectUri);
  if (returnUrl) {
    sessionStorage.setItem('oauth_return_url', returnUrl);
  }

  const authUrl = new URL(`${domain.replace(/\/$/, '')}/oauth2/authorize`);
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', scopes);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('code_challenge_method', 'S256');
  authUrl.searchParams.append('code_challenge', codeChallenge);

  window.location.href = authUrl.toString();
};

export const exchangeCodeForTokens = async (code: string): Promise<any> => {
  let env: any = {};
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      env = import.meta.env;
    }
  } catch (e) {}

  const domain = env?.VITE_COGNITO_DOMAIN || 'https://freshmart-dev-auth.auth.ap-southeast-1.amazoncognito.com';
  const clientId = env?.VITE_COGNITO_CLIENT_ID || '5qeg7to1eroscp415s5jqicvt2';
  const redirectUri = sessionStorage.getItem('oauth_redirect_uri');
  const codeVerifier = sessionStorage.getItem('pkce_verifier');

  if (!domain || !clientId || !redirectUri || !codeVerifier) {
    throw new Error('Missing required PKCE configuration or state.');
  }

  const tokenUrl = `${domain.replace(/\/$/, '')}/oauth2/token`;
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    code: code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${errorBody}`);
  }

  // Clear PKCE state
  sessionStorage.removeItem('pkce_verifier');
  sessionStorage.removeItem('oauth_redirect_uri');

  const tokens = await response.json();
  return {
    accessToken: tokens.access_token,
    idToken: tokens.id_token,
    refreshToken: tokens.refresh_token,
    expiresIn: tokens.expires_in,
  };
};

export const logoutFromSSO = (redirectUri?: string): void => {
  let env: any = {};
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      env = import.meta.env;
    }
  } catch (e) {}

  const domain = env?.VITE_COGNITO_DOMAIN || 'https://freshmart-dev-auth.auth.ap-southeast-1.amazoncognito.com';
  const clientId = env?.VITE_COGNITO_CLIENT_ID || '5qeg7to1eroscp415s5jqicvt2';

  if (!domain || !clientId) {
    console.error('SSO Configuration missing. Cannot execute logout redirect.');
    return;
  }

  const defaultRedirect = redirectUri || window.location.origin;
  const logoutUrl = new URL(`${domain.replace(/\/$/, '')}/logout`);
  logoutUrl.searchParams.append('client_id', clientId);
  logoutUrl.searchParams.append('logout_uri', defaultRedirect);

  clearSession();
  window.location.href = logoutUrl.toString();
};
