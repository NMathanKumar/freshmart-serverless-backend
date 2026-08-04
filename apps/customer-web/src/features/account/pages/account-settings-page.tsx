import { Suspense, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Badge, Button, Input, Progress, Skeleton, Switch } from '@freshmart/design-system';
import { CheckCircle2, Edit3, Link2, LoaderCircle, Lock, Mail, Palette, ReceiptText, Settings, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useGetAccountSettingsQuery, useUpdateAccountProfileMutation } from '../api/account-api.js';
import { AccountShell } from '../components/account-layout.js';
import { accountProfile } from '../model/account-content.js';

const profileSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  fullName: z.string().min(2, 'Enter your full name'),
  phone: z.string().min(8, 'Enter a valid phone number'),
  storeLocation: z.string()
});

type ProfileForm = z.infer<typeof profileSchema>;

const AccountSettingsContent = () => {
  const { data, isError, isLoading, refetch } = useGetAccountSettingsQuery();
  const [updateProfile, updateState] = useUpdateAccountProfileMutation();
  const profile = data?.profile ?? accountProfile;
  const { formState: { errors, isSubmitSuccessful }, handleSubmit, register, reset } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile
  });

  useEffect(() => reset(profile), [profile, reset]);

  const save = async (values: ProfileForm) => {
    await updateProfile({ ...profile, ...values }).unwrap();
  };

  return (
    <AccountShell active="settings">
      {isLoading && <SettingsSkeleton />}
      {isError && <AccountError onRetry={() => void refetch()} />}
      {!isLoading && !isError && data && (
        <>
          <section className="rounded-2xl border border-[#bdcaba]/30 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]" id="profile">
            <form onSubmit={(event) => void handleSubmit(save)(event)}>
              <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div><h2 className="text-xl font-semibold">Profile Settings</h2><p className="text-[#3e4a3d]">Manage your personal information and identity.</p></div>
                <Button className="rounded-full" disabled={updateState.isLoading} type="submit">{updateState.isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}Save Changes</Button>
              </div>
              <div className="flex flex-col items-start gap-8 md:flex-row">
                <div className="relative">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-[#e9f0e5] md:h-32 md:w-32"><img alt={`${profile.fullName} profile`} className="h-full w-full object-cover" src={profile.avatarUrl} /></div>
                  <button aria-disabled="true" aria-label="Profile photo editing coming soon" className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-[#8bb49a] p-2 text-white shadow-lg" disabled title="Profile photo editing is coming soon" type="button"><Edit3 className="h-4 w-4" /></button>
                </div>
                <div className="grid w-full flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                  <Field error={errors.fullName?.message} label="Full Name"><Input className="h-12 rounded-xl" {...register('fullName')} /></Field>
                  <Field error={errors.email?.message} label="Email Address"><Input className="h-12 rounded-xl" type="email" {...register('email')} /></Field>
                  <Field error={errors.phone?.message} label="Phone Number"><Input className="h-12 rounded-xl" type="tel" {...register('phone')} /></Field>
                  <Field label="Store Location"><div className="relative"><Input className="h-12 rounded-xl bg-[#eff6ea] pr-10" readOnly {...register('storeLocation')} /><Lock className="absolute right-4 top-3.5 h-4 w-4 text-[#3e4a3d]" /></div></Field>
                </div>
              </div>
              {updateState.isError && <Alert className="mt-6" tone="danger">Profile changes could not be saved. Please retry.</Alert>}
              {isSubmitSuccessful && !updateState.isError && <Alert className="mt-6" icon={<CheckCircle2 className="h-4 w-4" />}>Profile settings saved.</Alert>}
            </form>
          </section>
          <section className="rounded-2xl border border-[#bdcaba]/30 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]" id="notifications">
            <h2 className="text-xl font-semibold">Notification Preferences</h2><p className="mb-8 text-[#3e4a3d]">Choose how and when you want to be contacted.</p>
            <div className="space-y-2">
              <NotificationRow icon={<ReceiptText />} title="Order Updates" text="Real-time tracking and delivery status" push email />
              <NotificationRow icon={<Tag />} title="Offers & Rewards" text="Exclusive discounts and loyalty points" email />
              <NotificationRow icon={<Settings />} title="System Alerts" text="Security notifications and system updates" push email />
            </div>
          </section>
          <section className="rounded-2xl border border-[#bdcaba]/30 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]" id="appearance">
            <h2 className="text-xl font-semibold">Theme</h2><p className="mb-8 text-[#3e4a3d]">Choose your preferred visual style for the app.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ThemeCard active title="Light Mode" />
              <ThemeCard dark title="Dark Mode" />
              <ThemeCard split title="System" />
            </div>
          </section>
          <section className="rounded-2xl border border-[#bdcaba]/30 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]" id="regional">
            <h2 className="text-xl font-semibold">Language & Region</h2><p className="mb-8 text-[#3e4a3d]">Tailor your browsing and shopping experience.</p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2"><SelectField label="Display Language" options={['English (United States)', 'Español (México)', 'Français (Canada)', 'Português (Brasil)']} /><SelectField label="Preferred Currency" options={['USD ($) - US Dollar', 'EUR (€) - Euro', 'GBP (£) - British Pound', 'MXN ($) - Mexican Peso']} /></div>
          </section>
          <section className="rounded-2xl border border-[#bdcaba]/30 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]" id="accounts">
            <h2 className="text-xl font-semibold">Connected Accounts</h2><p className="mb-8 text-[#3e4a3d]">Speed up your login and sync your grocery lists.</p>
            <div className="space-y-4">{data.connectedAccounts.map((account) => <ConnectedAccountRow account={account} key={account.id} />)}</div>
            <div className="mt-8"><label className="mb-2 block text-sm font-semibold text-[#3e4a3d]">Profile Completion</label><Progress value={75} /></div>
          </section>
        </>
      )}
    </AccountShell>
  );
};

const SettingsSkeleton = () => <AccountShell active="settings"><div className="space-y-6">{Array.from({ length: 4 }).map((_, index) => <div className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]" key={index}><Skeleton className="mb-4 h-7 w-1/3" /><Skeleton className="mb-8 h-5 w-1/2" /><Skeleton className="h-32 w-full" /></div>)}</div></AccountShell>;
const AccountError = ({ onRetry }: { onRetry: () => void }) => <section className="rounded-2xl bg-white p-10 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]" role="alert"><h2 className="mb-3 text-2xl font-semibold">Settings unavailable</h2><p className="mb-6 text-[#3e4a3d]">We could not load your account settings.</p><Button onClick={onRetry}>Retry</Button></section>;
const Field = ({ children, error, label }: { children: React.ReactNode; error?: string; label: string }) => <label className="space-y-1"><span className="block px-1 text-xs font-semibold text-[#3e4a3d]">{label}</span>{children}{error && <span className="text-xs font-semibold text-[#ba1a1a]">{error}</span>}</label>;
const NotificationRow = ({ email, icon, push, text, title }: { email?: boolean; icon: React.ReactNode; push?: boolean; text: string; title: string }) => <div className="flex flex-col justify-between gap-4 border-b border-[#bdcaba]/30 py-4 last:border-0 sm:flex-row sm:items-center"><div className="flex gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#82f5c1]/30 text-[#006c4a]">{icon}</div><div><p className="font-semibold">{title}</p><p className="text-xs text-[#3e4a3d]">{text}</p></div></div><div className="flex gap-6"><Switch defaultChecked={push} label="Push" /><Switch defaultChecked={email} label="Email" /></div></div>;
const ThemeCard = ({ active = false, dark = false, split = false, title }: { active?: boolean; dark?: boolean; split?: boolean; title: string }) => <button className={`commerce-focus rounded-xl border-2 p-3 text-left transition-colors ${active ? 'border-[#006b2c]' : 'border-[#bdcaba]/40 hover:bg-[#f4fcf0]'}`} type="button"><div className={`mb-3 aspect-[4/3] overflow-hidden rounded-lg border border-[#bdcaba]/30 ${dark ? 'bg-[#171d16]' : 'bg-[#f4fcf0]'} ${split ? 'grid grid-cols-2' : 'p-2'}`}>{split ? <><div className="bg-[#f4fcf0] p-2"><div className="h-2 rounded bg-[#3e4a3d]/20" /><div className="mt-2 h-10 rounded bg-white" /></div><div className="bg-[#171d16] p-2"><div className="h-2 rounded bg-white/20" /><div className="mt-2 h-10 rounded bg-[#2b322b]" /></div></> : <><div className={`h-2 w-1/2 rounded ${dark ? 'bg-white/20' : 'bg-[#3e4a3d]/20'}`} /><div className="mt-2 grid flex-1 grid-cols-2 gap-1"><div className={`h-16 rounded ${dark ? 'bg-[#2b322b]' : 'bg-white'}`} /><div className={`h-16 rounded ${dark ? 'bg-[#2b322b]' : 'bg-white'}`} /></div></>}</div><div className="flex items-center justify-between"><span className="font-semibold">{title}</span>{active ? <CheckCircle2 className="h-5 w-5 text-[#006b2c]" /> : <span className="h-5 w-5 rounded-full border-2 border-[#bdcaba]" />}</div></button>;
const SelectField = ({ label, options }: { label: string; options: string[] }) => <label className="space-y-1"><span className="block px-1 text-xs font-semibold text-[#3e4a3d]">{label}</span><select className="h-12 w-full rounded-xl border border-[#bdcaba] bg-white px-4 focus:border-[#006b2c] focus:outline-none focus:ring-2 focus:ring-[#006b2c]/20">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
const ConnectedAccountRow = ({ account }: { account: { account: string; isConnected: boolean; label: string; provider: string } }) => <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#bdcaba]/40 p-4 transition-colors hover:bg-[#eff6ea] sm:flex-row sm:items-center"><div className="flex items-center gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"><Link2 className="h-5 w-5 text-[#006b2c]" /></div><div><p className="font-semibold">{account.label}</p><p className={`text-xs ${account.isConnected ? 'text-[#006b2c]' : 'text-[#3e4a3d]'}`}>{account.isConnected ? `Connected as ${account.account}` : account.account}</p></div></div><Button className="rounded-full border border-[#bdcaba] bg-white text-[#6e7b6c] shadow-none" disabled variant="secondary">{account.isConnected ? 'Managed elsewhere' : 'Coming Soon'}</Button></div>;

export default function AccountSettingsPage() {
  return <Suspense fallback={<SettingsSkeleton />}><AccountSettingsContent /></Suspense>;
}
