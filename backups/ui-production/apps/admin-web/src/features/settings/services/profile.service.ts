import { freshmartSdk } from '../../../lib/sdk';

export interface ProfileModel {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  status: string;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordInput {
  currentPassword?: string;
  newPassword?: string;
}

export class ProfileService {
  async getProfile(): Promise<ProfileModel> {
    const res = await freshmartSdk.admin.getProfile();
    const p = (res?.data || {}) as Record<string, any>;
    return {
      id: p.userId || p.id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      role: p.role,
      avatar: p.avatarUrl || p.avatar,
      status: p.status,
    };
  }

  async updateProfile(input: UpdateProfileInput): Promise<ProfileModel> {
    const res = await freshmartSdk.admin.updateProfile(input as Record<string, unknown>);
    const p = (res?.data || {}) as Record<string, any>;
    return {
      id: p.userId || p.id,
      name: p.name || input.name,
      email: p.email || input.email,
      phone: p.phone || input.phone,
      role: p.role,
      avatar: p.avatarUrl || input.avatar,
      status: p.status,
    };
  }

  async changePassword(input: ChangePasswordInput): Promise<void> {
    await freshmartSdk.admin.changePassword(input as Record<string, unknown>);
  }

  async uploadAvatar(fileName: string, contentType: string): Promise<{ uploadUrl: string; avatarUrl: string }> {
    const res = await freshmartSdk.admin.uploadProfileAvatar(fileName, contentType);
    return res.data;
  }
}

export const profileService = new ProfileService();
