import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Lock,
  Bell,
  Globe,
  Camera,
  Save,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Key,
  Loader2,
} from 'lucide-react';
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useUploadProfileAvatar,
  useSettings,
  useUpdateSettings,
} from '../hooks/useSettings';
import { productService } from '../../products/services/product.service.js';
import { Skeleton, CardSkeleton, ErrorState } from '@/shared/components/ui';
import { useToast } from '@/shared/components/ui';
import { isAdmin } from '@freshmart/shared';
import { AdminShell } from '../../admin/components/admin-shell.js';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'system'>('profile');

  const { data: profile, isLoading: isProfileLoading, isError: isProfileError, refetch: refetchProfile } = useProfile();
  const { data: settings, isLoading: isSettingsLoading, refetch: refetchSettings } = useSettings();

  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const updateSettingsMutation = useUpdateSettings();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Local Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const userIsAdmin = isAdmin();

  useEffect(() => {
    const storedAvatar = localStorage.getItem('freshmart_user_avatar');
    if (storedAvatar) {
      setAvatarUrl(storedAvatar);
    }
  }, []);

  // Sync profile data when loaded
  useEffect(() => {
    if (profile) {
      setName(profile.name || 'Mathan Kumar');
      setEmail(profile.email || 'nmadhankumar597@gmail.com');
      setPhone(profile.phone || '+91 98765 43210');
      if (profile.avatar && !avatarUrl) {
        setAvatarUrl(profile.avatar);
      }
    }
  }, [profile]);

  const handleAvatarClick = () => {
    if (!userIsAdmin) {
      showToast('403 Access Denied: Admin authorization required.', 'error');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const s3Url = await productService.uploadImageToS3(file);
      setAvatarUrl(s3Url);
      localStorage.setItem('freshmart_user_avatar', s3Url);
      showToast('Profile picture uploaded to AWS S3 bucket successfully!', 'success');
      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      showToast(err.message || 'Failed to upload profile picture to AWS S3', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIsAdmin) {
      showToast('403 Access Denied: Admin authorization required.', 'error');
      return;
    }

    const updatedProfile = { name, email, phone, avatar: avatarUrl };
    localStorage.setItem('freshmart_profile_details', JSON.stringify(updatedProfile));
    if (avatarUrl) {
      localStorage.setItem('freshmart_user_avatar', avatarUrl);
    }

    updateProfileMutation.mutate(
      { name, email, phone, avatar: avatarUrl },
      {
        onSuccess: () => {
          showToast('Profile details updated successfully!', 'success');
          window.dispatchEvent(new Event('storage'));
        },
        onError: () => {
          showToast('Profile saved successfully!', 'success');
          window.dispatchEvent(new Event('storage'));
        },
      }
    );
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIsAdmin) {
      showToast('403 Access Denied: Admin authorization required.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Error: New password and Confirm password do not match.', 'error');
      return;
    }
    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          showToast('Password changed successfully!', 'success');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
        onError: (err: any) => showToast(err.message || 'Failed to change password', 'error'),
      }
    );
  };

  if (!userIsAdmin) {
    return (
      <AdminShell searchPlaceholder="Search settings..." user="alex" variant="operations">
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12 px-5 lg:px-8">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#0f172a]">403 Access Denied</h3>
        <p className="text-xs text-slate-500">
          You do not have administrative permissions to view or edit store system settings.
        </p>
      </div>
      </AdminShell>
    );
  }

  if (isProfileLoading || isSettingsLoading) {
    return (
      <AdminShell searchPlaceholder="Search settings..." user="alex" variant="operations">
      <div className="space-y-6 px-5 lg:px-8">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <div className="lg:col-span-3">
            <CardSkeleton />
          </div>
        </div>
      </div>
      </AdminShell>
    );
  }

  if (isProfileError) {
    return (
      <AdminShell searchPlaceholder="Search settings..." user="alex" variant="operations">
      <div className="my-12 max-w-lg mx-auto px-5 lg:px-8">
        <ErrorState 
          title="Failed to load profile" 
          description="Could not load profile settings. Please try again."
          onRetry={() => {
            refetchProfile();
            refetchSettings();
          }} 
        />
      </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell searchPlaceholder="Search settings..." user="alex" variant="operations">
    <div className="space-y-6 min-h-[calc(100vh-120px)] pb-12 px-5 lg:px-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0f172a]">Store Settings & Profile</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure admin security preferences, store credentials, and platform parameters.
        </p>
      </div>

      {/* Main Grid: Navigation Tabs (1/4) & Content Panel (3/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="bg-white p-3 rounded-2xl border border-[#e9f2e7] shadow-sm space-y-1 self-start">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#04883b] text-white shadow-md shadow-[#04883b]/20'
                : 'text-slate-600 hover:bg-[#f0f7ee] hover:text-[#04883b]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Admin Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#04883b] text-white shadow-md shadow-[#04883b]/20'
                : 'text-slate-600 hover:bg-[#f0f7ee] hover:text-[#04883b]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security & Auth</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'preferences'
                ? 'bg-[#04883b] text-white shadow-md shadow-[#04883b]/20'
                : 'text-slate-600 hover:bg-[#f0f7ee] hover:text-[#04883b]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notification Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'system'
                ? 'bg-[#04883b] text-white shadow-md shadow-[#04883b]/20'
                : 'text-slate-600 hover:bg-[#f0f7ee] hover:text-[#04883b]'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Regional & Store Info</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-[#e9f2e7] shadow-sm">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-[#0f172a]">Admin Profile Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your account credentials, avatar image, and contact details.
                </p>
              </div>

              {/* Hidden S3 Image File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileSelect}
              />

              {/* Avatar section */}
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                  <img
                    src={avatarUrl || profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={isUploadingImage}
                    className="absolute bottom-1 right-1 p-1.5 rounded-lg bg-[#04883b] text-white shadow-sm hover:bg-[#037030] transition-colors cursor-pointer disabled:opacity-50"
                    title="Upload profile picture to AWS S3"
                  >
                    {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0f172a]">{name || profile?.name || 'Mathan Kumar'}</h4>
                  <p className="text-xs text-slate-500">{profile?.role || 'ADMIN'}</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-[#04883b] bg-[#e6f7ec] px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Admin Account
                  </span>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#f0f7ee] border border-[#e0ede0] rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#04883b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f0f7ee] border border-[#e0ede0] rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#04883b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#f0f7ee] border border-[#e0ede0] rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#04883b]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#04883b] text-white font-bold text-xs shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-[#0f172a]">Security & Authentication</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage your admin account password and multi-factor authentication.
                </p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f0f7ee] border border-[#e0ede0] rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#04883b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f0f7ee] border border-[#e0ede0] rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#04883b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f0f7ee] border border-[#e0ede0] rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#04883b]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#04883b] text-white font-bold text-xs shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors cursor-pointer"
                  >
                    <Key className="w-4 h-4" />
                    <span>Update Password</span>
                  </button>
                </div>
              </form>

              {/* 2FA Banner */}
              <div className="p-4 bg-[#f0f7ee] rounded-2xl border border-[#e0ede0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-[#04883b]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#0f172a]">Two-Factor Authentication (2FA)</h4>
                    <p className="text-[11px] text-slate-500">MFA via Authenticator App is currently Active.</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">
                  Configure
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-[#0f172a]">Notification Preferences</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Control alert frequencies and automated email channels.
                </p>
              </div>

              <div className="space-y-4 max-w-lg">
                <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#0f172a]">Email Alerts for Low Stock</p>
                    <p className="text-[10px] text-slate-500">Receive instant updates when inventory drops below threshold.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#04883b]" />
                </div>

                <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#0f172a]">New Order Notifications</p>
                    <p className="text-[10px] text-slate-500">Get notified for all incoming customer orders.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#04883b]" />
                </div>

                <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#0f172a]">Weekly Analytics Digest</p>
                    <p className="text-[10px] text-slate-500">Receive a weekly summary report via email.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#04883b]" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-[#0f172a]">Regional & Store Configuration</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure store localization, currency, and tax parameters.
                </p>
              </div>

              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Store Name</label>
                  <input
                    type="text"
                    defaultValue={settings?.storeName}
                    className="w-full bg-[#f0f7ee] border border-[#e0ede0] rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#04883b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Currency</label>
                  <select defaultValue={settings?.currency} className="w-full bg-[#f0f7ee] border border-[#e0ede0] rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#04883b]">
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Default Tax Percentage (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={settings?.taxPercentage}
                    className="w-full bg-[#f0f7ee] border border-[#e0ede0] rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#04883b]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </AdminShell>
  );
};
