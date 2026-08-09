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

  const cleanOrigin = origin.replace(/\/+$/, '');
  const adminWebUrl = cleanOrigin.endsWith('/admin') ? cleanOrigin : `${cleanOrigin}/admin`;

  return {
    customerWebUrl: cleanOrigin + '/',
    adminWebUrl,
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

  const payload: SharedAuthSession = {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    idToken: resolvedIdToken,
    user: (session as unknown as { user?: UserSummary }).user ?? {
      email: (session as unknown as { email?: string }).email,
      role: (session as unknown as { role?: string }).role
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
  if (!session?.accessToken) return false;
  const user = session.user;
  
  let profile = user?.profile;
  if (!profile && session.idToken) {
    try {
      const payload = JSON.parse(atob(session.idToken.split('.')[1]));
      profile = payload['custom:profile'];
    } catch(e) {}
  }
  
  if (profile === 'admin') {
    return true;
  }
  if (user?.profile === 'customer') {
    return false;
  }
  
  const groups = Array.isArray(user?.groups) ? user.groups.map(g => String(g).toUpperCase()) : [];
  const roles = Array.isArray(user?.roles) ? user.roles.map(r => String(r).toUpperCase()) : [];
  
  if (groups.includes('ADMIN') || groups.includes('SUPER_ADMIN')) {
    return true;
  }
  if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) {
    return true;
  }
  
  const role = String(user?.role || (session as any).role || '').toUpperCase();
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
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
    const token = getAccessToken();
    if (token && (token.startsWith('admin-demo') || token.startsWith('demo') || token.includes('demo'))) {
      return;
    }
    clearSharedSession();
    if (typeof window !== 'undefined') {
      if (!window.location.pathname.includes('/login')) {
        window.location.assign('/login');
      }
    }
  }
};

export const login = async () => {
};

export const initializeSession = () => {
  getSharedSession();
};

export const requireAdmin = () => {
  if (!isAuthenticated()) {
    logout();
    return false;
  }
  if (!isAdmin()) {
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
    return false;
  }
  return true;
};

export const requireCustomer = () => {
  if (!isAuthenticated()) {
    logout();
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
