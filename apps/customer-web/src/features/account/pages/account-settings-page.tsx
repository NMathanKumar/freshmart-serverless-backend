import { Suspense, useState } from 'react';
import { ChevronRight, Heart, MapPin, Bell, HelpCircle, Settings, Info, LogOut, Package, CreditCard, Pencil, ArrowRight, Truck, RefreshCw, User, Mail, Phone } from 'lucide-react';
import { Button } from '@freshmart/design-system';
import { Link, useNavigate } from 'react-router-dom';
import { useGetAccountSettingsQuery } from '../api/account-api.js';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';

const SAMPLE_PROFILE = {
  fullName: 'Alex Thompson',
  email: 'alex.thompson@premium.com',
  phone: '+1 (555) 000-1234',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  memberSince: '2022',
  tier: 'Gold Member',
  creditBalance: '$42.50',
  totalSaved: '$128.40',
  wishlistCount: 12
};

const AccountSettingsContent = () => {
  const navigate = useNavigate();
  const { data } = useGetAccountSettingsQuery();
  const profile = data?.profile ? { ...SAMPLE_PROFILE, ...data.profile } : SAMPLE_PROFILE;

  const [activeTab, setActiveTab] = useState<'settings' | 'orders' | 'wishlist' | 'addresses' | 'notifications' | 'help' | 'about'>('settings');

  return (
    <div className="min-h-screen bg-[#f4fcf0] text-[#171d16] font-sans">
      <HomeHeader variant="cart" />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pb-16 pt-24 space-y-8">

        {/* Top Hero Banner: User Identity & Credit */}
        <div className="rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar with Edit Badge */}
            <div className="relative">
              <img
                alt={profile.fullName}
                className="h-20 w-20 rounded-full object-cover border-2 border-[#006b2c] p-0.5"
                src={profile.avatarUrl}
              />
              <button
                className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-[#006b2c] border-2 border-white text-white flex items-center justify-center shadow-xs hover:bg-[#005422] transition-all cursor-pointer"
                title="Edit photo"
                type="button"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>

            {/* Name & Badges */}
            <div className="space-y-1.5">
              <h1 className="text-2xl font-black text-[#171d16] tracking-tight">
                Good afternoon, {profile.fullName.split(' ')[0]}
              </h1>
              <p className="text-xs font-semibold text-[#8b9888]">
                {profile.email} • Member since {profile.memberSince}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="rounded-full bg-[#dcfce7] px-3 py-0.5 text-[11px] font-black text-[#006c4a]">
                  {profile.tier}
                </span>
                <span className="rounded-full bg-[#f1f5f9] px-3 py-0.5 text-[11px] font-black text-[#64748b]">
                  Free Delivery Active
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Credit Badge Button */}
          <div className="flex sm:justify-end">
            <div className="inline-flex items-center gap-2.5 rounded-2xl bg-[#006b2c] px-5 py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#005422] transition-all cursor-pointer">
              <CreditCard className="h-4 w-4" />
              <span>Credit: {profile.creditBalance}</span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">

          {/* Left Column: Sidebar Menu */}
          <div className="rounded-[28px] border border-[#e2ebdE] bg-white p-3 shadow-xs space-y-1">
            
            <Link
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-extrabold text-[#3e4a3d] hover:bg-[#eff6ea] hover:text-[#006b2c] transition-all"
              to="/orders"
            >
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-[#006b2c]" />
                <span>My Orders</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#8b9888]" />
            </Link>

            <Link
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-extrabold text-[#3e4a3d] hover:bg-[#eff6ea] hover:text-[#006b2c] transition-all"
              to="/wishlist"
            >
              <div className="flex items-center gap-3">
                <Heart className="h-4 w-4 text-[#006b2c]" />
                <span>Wishlist</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#8b9888]" />
            </Link>

            <Link
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-extrabold text-[#3e4a3d] hover:bg-[#eff6ea] hover:text-[#006b2c] transition-all"
              to="/addresses"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[#006b2c]" />
                <span>Addresses</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#8b9888]" />
            </Link>

            <button
              className="w-full flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-extrabold text-[#3e4a3d] hover:bg-[#eff6ea] hover:text-[#006b2c] transition-all cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-[#006b2c]" />
                <span>Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <ChevronRight className="h-4 w-4 text-[#8b9888]" />
              </div>
            </button>

            <button
              className="w-full flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-extrabold text-[#3e4a3d] hover:bg-[#eff6ea] hover:text-[#006b2c] transition-all cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="h-4 w-4 text-[#006b2c]" />
                <span>Help Center</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#8b9888]" />
            </button>

            <button
              className="w-full flex items-center justify-between rounded-2xl bg-[#eff6ea] px-4 py-3 text-xs font-black text-[#006b2c] shadow-2xs cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 text-[#006b2c]" />
                <span>Settings</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#006b2c]" />
            </button>

            <button
              className="w-full flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-extrabold text-[#3e4a3d] hover:bg-[#eff6ea] hover:text-[#006b2c] transition-all cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-3">
                <Info className="h-4 w-4 text-[#006b2c]" />
                <span>About FreshMart</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#8b9888]" />
            </button>

            <div className="pt-2 border-t border-[#e2ebdE]">
              <button
                className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-black text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
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
                <h2 className="text-base font-black text-[#171d16]">Recent Order</h2>
                <Link className="text-xs font-black text-[#006b2c] hover:underline" to="/orders">
                  View All
                </Link>
              </div>

              <div className="rounded-[24px] border border-[#e2ebdE] bg-white p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Status */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-[#eff6ea] flex items-center justify-center text-[#006b2c]">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-xs font-extrabold text-[#171d16]">On the way</span>
                      <span className="text-[11px] font-semibold text-[#8b9888]">Estimated arrival: 12:45 PM</span>
                    </div>
                  </div>

                  {/* Order Preview Pill */}
                  <div className="flex items-center gap-3 rounded-2xl bg-[#f8fbf5] border border-[#e2ebdE] px-3.5 py-2">
                    <div className="text-left">
                      <span className="block text-[10px] font-bold text-[#8b9888]">Order #FM-9942</span>
                      <span className="text-xs font-black text-[#171d16]">$34.90</span>
                    </div>
                    <div className="flex -space-x-2">
                      <img alt="" className="h-7 w-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=100" />
                      <img alt="" className="h-7 w-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100" />
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#006b2c] text-[10px] font-black text-white">+4</span>
                    </div>
                  </div>
                </div>

                {/* Tracking Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="relative h-2 w-full rounded-full bg-[#eff6ea] overflow-hidden">
                    <div className="h-full w-2/3 rounded-full bg-[#006b2c]" />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-[#8b9888]">
                    <span>Packed</span>
                    <span className="text-[#006b2c] font-black">In Transit</span>
                    <span>Delivered</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 2: 2 Quick Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Wishlist Summary Card */}
              <div className="rounded-[24px] border border-[#e2ebdE] bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-[#eff6ea] flex items-center justify-center text-[#006b2c]">
                    <Heart className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[#eff6ea] px-3 py-1 text-[11px] font-black text-[#006c4a]">
                    {profile.wishlistCount} Items
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black text-[#171d16]">Wishlist</h3>
                  <p className="text-xs font-semibold text-[#8b9888] mt-0.5">Save your favorites for later</p>
                </div>
              </div>

              {/* Total Saved Card */}
              <div className="rounded-[24px] border border-[#e2ebdE] bg-[#eff6ea]/60 p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center text-[#006b2c] shadow-2xs">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-[#006c4a] shadow-2xs">
                    Total Saved
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#006c4a]">{profile.totalSaved}</div>
                  <p className="text-xs font-semibold text-[#8b9888] mt-0.5">You saved this month!</p>
                </div>
              </div>

            </div>

            {/* Widget 3: Account Details Card */}
            <div className="rounded-[24px] border border-[#e2ebdE] bg-white p-6 shadow-xs space-y-5">
              <h2 className="text-base font-black text-[#171d16]">Account Details</h2>

              <div className="space-y-3.5 text-xs font-extrabold">
                <div className="flex items-center justify-between border-b border-[#e2ebdE] pb-3">
                  <span className="text-[#8b9888]">Full Name</span>
                  <span className="text-[#171d16] font-black">{profile.fullName}</span>
                </div>

                <div className="flex items-center justify-between border-b border-[#e2ebdE] pb-3">
                  <span className="text-[#8b9888]">Email Address</span>
                  <span className="text-[#171d16] font-black">{profile.email}</span>
                </div>

                <div className="flex items-center justify-between pb-1">
                  <span className="text-[#8b9888]">Phone Number</span>
                  <span className="text-[#171d16] font-black">{profile.phone}</span>
                </div>
              </div>

              <div className="pt-2">
                <a className="inline-flex items-center gap-1.5 text-xs font-black text-[#006b2c] hover:underline" href="#edit">
                  <span>Edit Account Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

          </div>

        </div>

      </main>

      <HomeFooter />
    </div>
  );
};

export default function AccountSettingsPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#f4fcf0]" />}><AccountSettingsContent /></Suspense>;
}
