import { freshmartSdk } from '../../../lib/sdk';

export interface StoreSettingsModel {
  storeName: string;
  supportEmail: string;
  currency: string;
  timezone: string;
  language: string;
  taxPercentage: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  twoFactorAuth: boolean;
}

export class SettingsService {
  async getSettings(): Promise<StoreSettingsModel> {
    const res = await freshmartSdk.admin.getSettings();
    const s = (res?.data || {}) as Record<string, any>;
    return {
      storeName: s.storeName,
      supportEmail: s.supportEmail,
      currency: s.currency,
      timezone: s.timezone,
      language: s.language,
      taxPercentage: s.taxPercentage,
      emailNotifications: s.emailNotifications,
      smsNotifications: s.smsNotifications,
      twoFactorAuth: s.twoFactorAuth,
    };
  }

  async updateSettings(input: Partial<StoreSettingsModel>): Promise<StoreSettingsModel> {
    const res = await freshmartSdk.admin.updateSettings(input as Record<string, unknown>);
    const s = (res?.data || {}) as Record<string, any>;
    return {
      storeName: s.storeName || input.storeName,
      supportEmail: s.supportEmail || input.supportEmail,
      currency: s.currency || input.currency,
      timezone: s.timezone || input.timezone,
      language: s.language || input.language,
      taxPercentage: s.taxPercentage || input.taxPercentage,
      emailNotifications: s.emailNotifications ?? input.emailNotifications,
      smsNotifications: s.smsNotifications ?? input.smsNotifications,
      twoFactorAuth: s.twoFactorAuth ?? input.twoFactorAuth,
    };
  }

  async getSecuritySettings(): Promise<Record<string, unknown>> {
    const res = await freshmartSdk.admin.getSecuritySettings();
    return res.data ?? {};
  }

  async updateSecuritySettings(data: Record<string, unknown>): Promise<void> {
    await freshmartSdk.admin.updateSecuritySettings(data);
  }
}

export const settingsService = new SettingsService();
