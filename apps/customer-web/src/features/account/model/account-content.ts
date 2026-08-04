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
  phone: '+1 (555) 123-4567',
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

export const mergeProfile = (remote: unknown): AccountProfile => {
  const user = isRecord(remote) && isRecord(remote.user) ? remote.user : remote;
  if (!isRecord(user)) return accountProfile;

  const firstName = text(user, ['firstName'], '');
  const lastName = text(user, ['lastName'], '');
  const fullName = text(user, ['fullName', 'name'], [firstName, lastName].filter(Boolean).join(' ') || accountProfile.fullName);

  return {
    avatarUrl: text(user, ['avatarUrl', 'avatar'], accountProfile.avatarUrl),
    email: text(user, ['email'], accountProfile.email),
    fullName,
    phone: text(user, ['phoneNumber', 'phone'], accountProfile.phone),
    storeLocation: text(user, ['storeLocation', 'preferredStore'], accountProfile.storeLocation)
  };
};
