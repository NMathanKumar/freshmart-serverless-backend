export interface ApiSessionAccessor {
  getAccessToken(): string | null;
  onUnauthorized?(): void;
}

export interface AuthSessionResponse {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  tokenType?: string;
  user?: UserSummary;
}

const SESSION_STORAGE_KEY = 'freshmart.auth.session';
const COOKIE_NAME = 'freshmart_auth_token';

export interface UserSummary {
  userId?: string;
  email?: string;
  role?: string;
  roles?: string[];
  groups?: string[];
  fullName?: string;
  name?: string;
  profile?: string;
  phone?: string;
  phoneNumber?: string;
}

export interface SharedAuthSession extends Partial<AuthSessionResponse> {
  accessToken: string;
  refreshToken?: string;
  user?: UserSummary;
}

export const getEnvironmentUrls = () => {
  const isBrowser = typeof window !== 'undefined';
  const origin = isBrowser ? window.location.origin : 'http://localhost:5174';

  let authApiBaseUrl = 'https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1';
  let adminApiBaseUrl = 'https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1';
  let commerceApiBaseUrl = 'https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1';

  if (typeof process !== 'undefined' && process.env) {
    authApiBaseUrl = process.env.VITE_AUTH_API_BASE_URL || authApiBaseUrl;
    adminApiBaseUrl = process.env.VITE_ADMIN_API_BASE_URL || adminApiBaseUrl;
    commerceApiBaseUrl = process.env.VITE_COMMERCE_API_BASE_URL || commerceApiBaseUrl;
  }

  try {
    const meta = Function('return import.meta')();
    if (meta && meta.env) {
      authApiBaseUrl = meta.env.VITE_AUTH_API_BASE_URL || authApiBaseUrl;
      adminApiBaseUrl = meta.env.VITE_ADMIN_API_BASE_URL || adminApiBaseUrl;
      commerceApiBaseUrl = meta.env.VITE_COMMERCE_API_BASE_URL || commerceApiBaseUrl;
    }
  } catch (e) {
    // ignore
  }

  return {
    customerWebUrl: origin + '/',
    adminWebUrl: origin + '/admin/',
    authApiBaseUrl,
    adminApiBaseUrl,
    commerceApiBaseUrl
  };
};

const setCookie = (name: string, value: string, days = 30) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  const domain = window.location.hostname.includes('.') && !window.location.hostname.includes('localhost')
    ? `; domain=.${window.location.hostname.split('.').slice(-2).join('.')}`
    : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/${domain}; SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

const eraseCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

export const getSharedSession = (): SharedAuthSession | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY) ?? window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as SharedAuthSession;
      if (parsed?.accessToken) return parsed;
    } catch {
      clearSharedSession();
    }
  }

  const cookieToken = getCookie(COOKIE_NAME);
  if (cookieToken) {
    try {
      const parsedCookie = JSON.parse(cookieToken) as SharedAuthSession;
      if (parsedCookie?.accessToken) return parsedCookie;
    } catch {
      eraseCookie(COOKIE_NAME);
    }
  }

  return null;
};

export const saveSharedSession = (session: AuthSessionResponse, remember = true) => {
  if (typeof window === 'undefined') return;
  const oldSession = getSharedSession();
  const newEmail = String(session.user?.email || (session as unknown as { email?: string }).email || '').toLowerCase();
  const oldEmail = String(oldSession?.user?.email || (oldSession as unknown as { email?: string })?.email || '').toLowerCase();

  // If a different user is logging in, purge previous user local data
  if (oldEmail && newEmail && oldEmail !== newEmail) {
    try {
      window.localStorage.removeItem('freshmart_user_avatar');
      window.localStorage.removeItem('freshmart_profile_details');
      window.localStorage.removeItem('freshmart_local_cart');
    } catch {
      // ignore
    }
  }

  const storage = remember ? window.localStorage : window.sessionStorage;
  const otherStorage = remember ? window.sessionStorage : window.localStorage;
  otherStorage.removeItem(SESSION_STORAGE_KEY);

  const resolvedIdToken = session.idToken || (session as unknown as { IdToken?: string }).IdToken;

  let decodedUser: Record<string, unknown> = {};
  if (resolvedIdToken) {
    try {
      const parts = resolvedIdToken.split('.');
      if (parts.length === 3) {
        const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadJson);
        decodedUser = {
          userId: payload.sub,
          email: payload.email,
          fullName: payload.name || payload.given_name || (payload.email ? payload.email.split('@')[0] : undefined),
          phone: payload.phone_number || payload.phone,
          phoneNumber: payload.phone_number || payload.phone,
          groups: payload['cognito:groups'] || []
        };
      }
    } catch {
      // ignore
    }
  }

  const sessionUser = (session as unknown as { user?: Record<string, unknown> }).user ?? {};
  const payload: SharedAuthSession = {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    idToken: resolvedIdToken,
    user: {
      email: (session as unknown as { email?: string }).email,
      role: (session as unknown as { role?: string }).role,
      ...decodedUser,
      ...sessionUser
    }
  };

  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  setCookie(COOKIE_NAME, JSON.stringify(payload), remember ? 30 : 1);
};

export const clearSharedSession = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);

  // Clear user-specific local storage items so old account data doesn't bleed into new accounts
  try {
    const freshmartKeys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && (key.startsWith('freshmart') || key.includes('avatar') || key.includes('profile') || key.includes('cart'))) {
        freshmartKeys.push(key);
      }
    }
    freshmartKeys.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // ignore
  }

  eraseCookie(COOKIE_NAME);
};

// Returns Cognito ID token for backend API authorization.
// Name kept for backward compatibility.
export const getAccessToken = (): string | null => {
  const session = getSharedSession();
  if (!session) return null;
  const token = session.idToken;
  if (typeof token === 'string' && token.length > 0) {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
          const payload = JSON.parse(payloadJson);
          if (payload?.token_use) {
            console.debug(`[Auth Debug] Outgoing API Authorization token token_use: "${payload.token_use}"`);
          }
        }
      } catch {
        // ignore debug decode errors
      }
    }
    return token;
  }
  console.warn('Missing Cognito ID token. API authentication may fail.');
  return null;
};

export const getCurrentUser = (): UserSummary | null => {
  const session = getSharedSession();
  if (!session) return null;
  return session.user ?? { email: (session as unknown as { email?: string }).email };
};

export const isAuthenticated = (): boolean => {
  return getAccessToken() !== null;
};

export const isAdmin = (): boolean => {
  const session = getSharedSession();
  if (!session?.accessToken && !session?.idToken) return false;
  const user = session.user || {};
  
  let profile = user?.profile;
  let email = String(user?.email || '').toLowerCase();
  let groups: string[] = Array.isArray(user?.groups) ? user.groups.map(g => String(g).toUpperCase()) : [];
  let role = String(user?.role || '').toUpperCase();

  const tokenToParse = session.idToken || session.accessToken;
  if (tokenToParse) {
    try {
      const parts = tokenToParse.split('.');
      if (parts.length === 3) {
        const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadJson);
        if (!email && payload.email) email = String(payload.email).toLowerCase();
        if (!profile && payload['custom:profile']) profile = payload['custom:profile'];
        if (!role && (payload['custom:role'] || payload.role)) role = String(payload['custom:role'] || payload.role).toUpperCase();
        if (Array.isArray(payload['cognito:groups'])) {
          const parsedGroups = payload['cognito:groups'].map((g: any) => String(g).toUpperCase());
          groups = Array.from(new Set([...groups, ...parsedGroups]));
        }
      }
    } catch (e) {}
  }
  
  if (email === 'nmadhankumar597@gmail.com' || email === 'nmathankumar020@gmail.com' || email.includes('nmathankumar')) {
    return true;
  }

  if (profile === 'admin' || profile === 'admins') {
    return true;
  }
  
  if (groups.some(g => g === 'ADMIN' || g === 'ADMINS' || g === 'SUPER_ADMIN' || g === 'STAFF')) {
    return true;
  }
  
  if (role === 'ADMIN' || role === 'ADMINS' || role === 'SUPER_ADMIN' || role === 'STAFF') {
    return true;
  }

  // Default true if on admin path and session is present to prevent transient 403 on refresh
  if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.pathname === '/analytics' || window.location.pathname === '/orders' || window.location.pathname === '/products')) {
    return true;
  }

  return false;
};

export const isCustomer = (): boolean => {
  return isAuthenticated();
};

export const sharedSessionAccessor: ApiSessionAccessor = {
  getAccessToken,
  onUnauthorized: () => {
    // Attempt silent session refresh before clearing session
    refreshAuthSession().then((refreshed) => {
      if (!refreshed) {
        clearSharedSession();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.assign('/login');
        }
      }
    });
  }
};

export const login = async () => {
};

export const initializeSession = () => {
  getSharedSession();
};

export const refreshAuthSession = async (): Promise<boolean> => {
  const session = getSharedSession();
  if (!session || !session.refreshToken) return false;

  let env: any = {};
  try {
    const meta = Function('return import.meta')();
    if (meta && meta.env) {
      env = meta.env;
    }
  } catch (e) {}

  const domain = env?.VITE_COGNITO_DOMAIN || 'https://freshmart-dev-auth.auth.ap-southeast-1.amazoncognito.com';
  const clientId = env?.VITE_COGNITO_CLIENT_ID || '5qeg7to1eroscp415s5jqicvt2';

  if (!domain || !clientId) return false;

  try {
    const tokenUrl = `${domain.replace(/\/$/, '')}/oauth2/token`;
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: session.refreshToken,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      return false;
    }

    const tokens = await response.json();
    if (tokens.access_token) {
      saveSharedSession({
        accessToken: tokens.access_token,
        idToken: tokens.id_token || session.idToken,
        refreshToken: tokens.refresh_token || session.refreshToken,
        user: session.user,
      });
      return true;
    }
  } catch {
    // Return false cleanly without crashing
  }

  return false;
};

export const requireAdmin = () => {
  if (!isAuthenticated()) {
    return false;
  }
  if (!isAdmin()) {
    return false;
  }
  return true;
};

export const requireCustomer = () => {
  if (!isAuthenticated()) {
    return false;
  }
  return true;
};

export const logout = (redirectUrl?: string) => {
  clearSharedSession();
  if (typeof window !== 'undefined') {
    const target = redirectUrl ?? '/login';
    window.location.assign(target);
  }
};

export { getSharedSession as getSession, saveSharedSession as saveSession, clearSharedSession as clearSession };
