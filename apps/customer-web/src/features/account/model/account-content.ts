export interface AccountProfile {
  avatarUrl: string;
  email: string;
  fullName: string;
  phone: string;
  storeLocation: string;
}

export interface ConnectedAccount {
  id: string;
  account: string;
  isConnected: boolean;
  label: string;
  provider: 'google' | 'apple' | 'microsoft';
}

export interface ActiveDevice {
  id: string;
  current?: boolean;
  device: string;
  location: string;
  platform: string;
}

export interface LoginActivity {
  id: string;
  detail: string;
  status: 'success' | 'failed' | 'neutral';
  title: string;
}

export const accountProfile: AccountProfile = {
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlifnxAGfHukI5klS6odpwT1JrtKCsNO2xqItDaT9bkeS6gae127EmbK2_wG1wNayN6F_j21H-_Owg1olb8Wdn1DFl4S0jaLedLPrPMJDg03hf8Ve6EMqIJeIYYJ0xJLTc-XwQLx1CfLEVYbLLfrCZOqkAOSUSUu2ozWugiMwx6xGLSxSpVgOgaRCQO9Z-IX_A7o-m3L-6aFkCpA9BTkjxQfZKjsK1vGDv3U7vNrxOc58-SLezfhlmr5rLIQF2iuaDFRKYmsiDqSSN',
  email: 'julian.a@freshmarket.com',
  fullName: 'Julian Alexander',
  phone: '',
  storeLocation: 'San Francisco Main'
};

export const connectedAccounts: ConnectedAccount[] = [
  { id: 'google', account: 'julian.a@gmail.com', isConnected: true, label: 'Google Account', provider: 'google' },
  { id: 'apple', account: 'Not connected', isConnected: false, label: 'Apple ID', provider: 'apple' },
  { id: 'microsoft', account: 'Not connected', isConnected: false, label: 'Microsoft Account', provider: 'microsoft' }
];

export const activeDevices: ActiveDevice[] = [
  { id: 'macbook', current: true, device: 'MacBook Pro M2', location: 'Seattle, USA', platform: 'Chrome' },
  { id: 'iphone', device: 'iPhone 15 Pro', location: 'San Francisco, USA', platform: 'App' }
];

export const loginActivity: LoginActivity[] = [
  { id: 'login-1', detail: 'Today, 09:42 AM - 192.168.1.1', status: 'success', title: 'Successful login from Chrome' },
  { id: 'login-2', detail: 'Yesterday, 11:20 PM - Paris, FR', status: 'failed', title: 'Failed login attempt' },
  { id: 'login-3', detail: 'Oct 20, 02:15 PM - New York, USA', status: 'neutral', title: 'Successful login from Mobile App' }
];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const text = (record: Record<string, unknown>, keys: string[], fallback: string) =>
  keys.map((key) => record[key]).find((value): value is string => typeof value === 'string' && value.length > 0) ?? fallback;
import { getCurrentUser } from '@freshmart/shared';

const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());

export const mergeProfile = (remote: unknown): AccountProfile => {
  const record = isRecord(remote) && isRecord(remote.data) ? (remote.data as Record<string, unknown>) : remote;
  const user = isRecord(record) && isRecord(record.user) ? record.user : record;

  const sessionUser = getCurrentUser() || {};
  const emailVal = isRecord(user) ? text(user, ['email'], sessionUser.email || accountProfile.email) : (sessionUser.email || accountProfile.email);
  const emailFallbackName = emailVal && emailVal.includes('@') ? emailVal.split('@')[0] : accountProfile.fullName;

  if (!isRecord(user)) {
    const rawFallback = sessionUser.fullName || sessionUser.name || '';
    const safeFallback = isUuid(rawFallback) ? emailFallbackName : (rawFallback || emailFallbackName);
    const phoneVal = sessionUser.phone || sessionUser.phoneNumber || 'Not provided';
    return {
      ...accountProfile,
      email: emailVal,
      fullName: safeFallback,
      phone: phoneVal
    };
  }

  const firstName = text(user, ['firstName', 'given_name'], '');
  const lastName = text(user, ['lastName', 'family_name'], '');
  const generatedFullName = [firstName, lastName].filter(Boolean).join(' ');

  let rawName = text(user, ['fullName', 'name'], '');
  if (isUuid(rawName)) {
    rawName = '';
  }

  const rawSessionFallback = sessionUser.name || sessionUser.fullName || '';
  const safeSessionFallback = isUuid(rawSessionFallback) ? '' : rawSessionFallback;
  const fallbackName = safeSessionFallback || emailFallbackName;
  const fullName = generatedFullName || rawName || fallbackName;

  const rawPhone = text(user, ['phone', 'phoneNumber', 'phone_number'], sessionUser.phone || sessionUser.phoneNumber || '');
  const phone = rawPhone || 'Not provided';

  let cachedAvatar = '';
  try {
    cachedAvatar = localStorage.getItem('freshmart_user_avatar') || '';
  } catch (_) {}

  return {
    avatarUrl: text(user, ['avatarUrl', 'avatar'], cachedAvatar || accountProfile.avatarUrl),
    email: emailVal,
    fullName,
    phone,
    storeLocation: text(user, ['storeLocation', 'preferredStore'], accountProfile.storeLocation)
  };
};
