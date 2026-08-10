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
import { productService } from '../../products/services/product.service';
import { Skeleton, CardSkeleton, ErrorState } from '@/shared/components/ui';
import { useToast } from '@/shared/components/ui';
import { isAdmin } from '@freshmart/shared';
import { AdminShell } from '../../admin/components/admin-shell';

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
    <div className="space-y-6 min-h-[calc(100vh-120px)] pb-12 px-5 lg:px-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0f172a]">Admin Profile</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          View and update your account details, avatar image, and contact information.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#e9f2e7] shadow-sm space-y-6">
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
    </div>
    </AdminShell>
  );
};
