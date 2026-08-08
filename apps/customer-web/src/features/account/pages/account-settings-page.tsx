import { Suspense, useState } from 'react';
import {
  ChevronRight,
  Heart,
  MapPin,
  Bell,
  HelpCircle,
  Settings,
  Info,
  LogOut,
  Package,
  CreditCard,
  Pencil,
  ArrowRight,
  Truck,
  RefreshCw,
  User,
  Mail,
  Phone,
  X,
  Check,
} from 'lucide-react';
import { Button, Input } from '@freshmart/design-system';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '@freshmart/shared';
import {
  useGetAccountSettingsQuery,
  useUpdateAccountProfileMutation,
} from '../api/account-api.js';
import { useGetOrdersQuery, useGetWishlistQuery } from '../../commerce/api/commerce-api.js';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';
import { useNotifications } from '../hooks/use-notifications.js';

const SAMPLE_PROFILE = {
  fullName: 'Alex Thompson',
  email: 'alex.thompson@premium.com',
  phone: 'Not provided',
  storeLocation: 'San Francisco, CA',
  avatarUrl:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  memberSince: '2025',
  tier: 'Gold Member',
  creditBalance: '₹42.50',
  totalSaved: '₹128.40',
};

const AccountSettingsContent = () => {
  const navigate = useNavigate();
  const { data: accountData } = useGetAccountSettingsQuery();
  const { data: orders = [] } = useGetOrdersQuery();
  const { data: wishlist = [] } = useGetWishlistQuery();
  const [updateProfile, updateState] = useUpdateAccountProfileMutation();
  const { unreadCount } = useNotifications();

  const profile = accountData?.profile
    ? { ...SAMPLE_PROFILE, ...accountData.profile }
    : SAMPLE_PROFILE;
  const recentOrder = orders.length > 0 ? orders[0] : null;
  const liveWishlistCount = wishlist.length;

  // Edit Profile Modal state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        ...profile,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      }).unwrap();
    } catch (_) {
      // Fallback update
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#f4fcf0] font-sans text-[#171d16]">
      <HomeHeader variant="cart" />

      <main className="mx-auto max-w-6xl space-y-7 px-4 pt-24 pb-16 sm:px-6 md:px-8">
        {/* Top Hero Banner: User Identity */}
        <div className="flex flex-col justify-between gap-6 rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xs sm:flex-row sm:items-center">
          <div className="flex items-center gap-5">
            {/* Avatar with Edit Badge */}
            <div className="relative">
              <img
                alt={profile.fullName}
                className="h-20 w-20 rounded-full border-2 border-white object-cover p-0.5 shadow-xs"
                src={profile.avatarUrl}
              />
              <button
                className="absolute right-0 bottom-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#006b2c] text-white shadow-xs transition-all hover:bg-[#005422]"
                onClick={() => {
                  setFormData({
                    fullName: profile.fullName,
                    email: profile.email,
                    phone: profile.phone,
                  });
                  setIsEditing(true);
                }}
                title="Edit photo & details"
                type="button"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>

            {/* Name & Badges */}
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight text-[#171d16]">
                Good afternoon, {profile.fullName.split(' ')[0]}
              </h1>
              <p className="text-xs font-semibold text-[#8b9888]">
                {profile.email} • Member since {profile.memberSince}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="rounded-full bg-[#6ee7b7]/30 px-3 py-0.5 text-[11px] font-extrabold text-[#006c4a]">
                  {profile.tier}
                </span>
                <span className="rounded-full bg-[#e2ebdE]/50 px-3 py-0.5 text-[11px] font-extrabold text-[#6e7b6c]">
                  Free Delivery Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 items-start gap-7 md:grid-cols-[260px_1fr]">
          {/* Left Column: Sidebar Menu */}
          <div className="space-y-1 rounded-[28px] border border-[#e2ebdE] bg-white p-3 shadow-xs">
            <Link
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-extrabold text-[#3e4a3d] transition-all hover:bg-[#eff6ea] hover:text-[#006b2c]"
              to="/orders"
            >
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-[#006b2c]" />
                <span>My Orders</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#bdcaba]" />
            </Link>

            <Link
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-extrabold text-[#3e4a3d] transition-all hover:bg-[#eff6ea] hover:text-[#006b2c]"
              to="/wishlist"
            >
              <div className="flex items-center gap-3">
                <Heart className="h-4 w-4 text-[#006b2c]" />
                <span>Wishlist</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#bdcaba]" />
            </Link>

            <Link
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-extrabold text-[#3e4a3d] transition-all hover:bg-[#eff6ea] hover:text-[#006b2c]"
              to="/addresses"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[#006b2c]" />
                <span>Addresses</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#bdcaba]" />
            </Link>

            <Link
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-extrabold text-[#3e4a3d] transition-all hover:bg-[#eff6ea] hover:text-[#006b2c]"
              to="/notifications"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-[#006b2c]" />
                <span>Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && <span className="h-2 w-2 rounded-full bg-rose-500" />}
                <ChevronRight className="h-4 w-4 text-[#bdcaba]" />
              </div>
            </Link>

            <Link
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-extrabold text-[#3e4a3d] transition-all hover:bg-[#eff6ea] hover:text-[#006b2c]"
              to="/help"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="h-4 w-4 text-[#006b2c]" />
                <span>Help Center</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#bdcaba]" />
            </Link>

            <Link
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-extrabold text-[#3e4a3d] transition-all hover:bg-[#eff6ea] hover:text-[#006b2c]"
              to="/about"
            >
              <div className="flex items-center gap-3">
                <Info className="h-4 w-4 text-[#006b2c]" />
                <span>About Us</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#bdcaba]" />
            </Link>

            <div className="border-t border-[#e2ebdE] pt-2">
              <button
                className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-xs font-black text-rose-600 transition-all hover:bg-rose-50"
                onClick={() => logout()}
                type="button"
              >
                <LogOut className="h-4 w-4 text-rose-600" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Right Column: Dashboard Content */}
          <div className="space-y-6">
            {/* Widget 1: Recent Order */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base font-black text-[#171d16]">
                  Recent Order
                </h2>
                <Link
                  className="text-xs font-black text-[#006b2c] hover:underline"
                  to="/orders"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-4 rounded-[24px] border border-[#e2ebdE] bg-white p-5 shadow-xs">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  {/* Status */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#006b2c] text-white shadow-xs">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-xs font-extrabold text-[#171d16]">
                        {recentOrder?.orderStatusLabel ?? 'On the way'}
                      </span>
                      <span className="text-[11px] font-semibold text-[#8b9888]">
                        Estimated arrival: 12:45 PM
                      </span>
                    </div>
                  </div>

                  {/* Order Preview Pill */}
                  <div className="flex items-center gap-3 rounded-2xl border border-[#e2ebdE] bg-[#f8fbf5] px-3.5 py-2">
                    <div className="text-left">
                      <span className="block text-[10px] font-bold text-[#8b9888]">
                        Order #{recentOrder?.orderId ?? 'FM-9942'}
                      </span>
                      <span className="text-xs font-black text-[#171d16]">
                        $
                        {recentOrder?.totalAmount
                          ? recentOrder.totalAmount.toFixed(2)
                          : '34.90'}
                      </span>
                    </div>
                    <div className="flex -space-x-2">
                      <img
                        alt=""
                        className="h-7 w-7 rounded-full border-2 border-white object-cover"
                        src="https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=100"
                      />
                      <img
                        alt=""
                        className="h-7 w-7 rounded-full border-2 border-white object-cover"
                        src="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100"
                      />
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#e2ebdE] text-[10px] font-black text-[#3e4a3d]">
                        +{recentOrder?.totalItems ?? 4}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tracking Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#eff6ea]">
                    <div className="h-full w-2/3 rounded-full bg-[#006b2c]" />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-[#8b9888]">
                    <span>Packed</span>
                    <span className="font-black text-[#006b2c]">
                      In Transit
                    </span>
                    <span>Delivered</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 2: 2 Quick Metric Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Wishlist Summary Card */}
              <div
                className="flex cursor-pointer flex-col justify-between space-y-4 rounded-[24px] border border-[#e2ebdE] bg-white p-5 shadow-xs transition-all hover:border-[#bdcaba] hover:shadow-md"
                onClick={() => navigate('/wishlist')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eff6ea] text-[#006b2c]">
                    <Heart className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[#eff6ea] px-3 py-1 text-[11px] font-black text-[#006c4a]">
                    {liveWishlistCount} {liveWishlistCount === 1 ? 'Item' : 'Items'}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black text-[#171d16]">
                    Wishlist
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold text-[#8b9888]">
                    Save your favorites for later
                  </p>
                </div>
              </div>

              {/* Total Saved Card */}
              <div className="flex flex-col justify-between space-y-4 rounded-[24px] border border-[#e2ebdE] bg-[#eff6ea]/60 p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#006b2c] shadow-2xs">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-[#006c4a] shadow-2xs">
                    Total Saved
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#006c4a]">
                    {profile.totalSaved}
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-[#8b9888]">
                    You saved this month!
                  </p>
                </div>
              </div>
            </div>

            {/* Widget 3: Account Details Card */}
            <div className="space-y-5 rounded-[24px] border border-[#e2ebdE] bg-white p-6 shadow-xs">
              <h2 className="text-base font-black text-[#171d16]">
                Account Details
              </h2>

              <div className="space-y-3.5 text-xs font-extrabold">
                <div className="flex items-center justify-between border-b border-[#e2ebdE] pb-3">
                  <span className="text-[#8b9888]">Full Name</span>
                  <span className="font-black text-[#171d16]">
                    {profile.fullName}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#e2ebdE] pb-3">
                  <span className="text-[#8b9888]">Email Address</span>
                  <span className="font-black text-[#171d16]">
                    {profile.email}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-1">
                  <span className="text-[#8b9888]">Phone Number</span>
                  <span className="font-black text-[#171d16]">
                    {profile.phone}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-black text-[#006b2c] hover:underline"
                  onClick={() => {
                    setFormData({
                      fullName: profile.fullName,
                      email: profile.email,
                      phone: profile.phone,
                    });
                    setIsEditing(true);
                  }}
                  type="button"
                >
                  <span>Edit Account Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Account Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md space-y-5 rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e2ebdE] pb-4">
              <h3 className="text-base font-black text-[#171d16]">
                Edit Account Profile
              </h3>
              <button
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b] transition-all hover:bg-[#e2e8f0]"
                onClick={() => setIsEditing(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => void handleSaveProfile(e)}
            >
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#3e4a3d]">
                  Full Name
                </label>
                <input
                  className="h-11 w-full rounded-2xl border border-[#bdcaba]/60 bg-[#f8fbf5] px-3.5 text-xs font-bold text-[#171d16] focus:border-[#006b2c] focus:outline-none"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  required
                  type="text"
                  value={formData.fullName}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#3e4a3d]">
                  Email Address
                </label>
                <input
                  className="h-11 w-full rounded-2xl border border-[#bdcaba]/60 bg-[#f8fbf5] px-3.5 text-xs font-bold text-[#171d16] focus:border-[#006b2c] focus:outline-none"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  type="email"
                  value={formData.email}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#3e4a3d]">
                  Phone Number
                </label>
                <input
                  className="h-11 w-full rounded-2xl border border-[#bdcaba]/60 bg-[#f8fbf5] px-3.5 text-xs font-bold text-[#171d16] focus:border-[#006b2c] focus:outline-none"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  required
                  type="tel"
                  value={formData.phone}
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <Button
                  className="h-11 flex-1 rounded-2xl bg-[#006b2c] text-xs font-extrabold text-white shadow-xs transition-all hover:bg-[#005422]"
                  disabled={updateState.isLoading}
                  type="submit"
                >
                  {updateState.isLoading
                    ? 'Saving to AWS...'
                    : 'Save Profile Changes'}
                </Button>
                <button
                  className="h-11 cursor-pointer rounded-2xl border border-[#bdcaba]/60 px-5 text-xs font-extrabold text-[#64748b] transition-all hover:bg-[#f1f5f9]"
                  onClick={() => setIsEditing(false)}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <HomeFooter />
    </div>
  );
};

export default function AccountSettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4fcf0]" />}>
      <AccountSettingsContent />
    </Suspense>
  );
}
