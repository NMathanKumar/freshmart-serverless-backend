import { Suspense, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Badge, Button, Input, Skeleton, Switch } from '@freshmart/design-system';
import { Download, History, KeyRound, Laptop, LoaderCircle, Lock, Shield, Smartphone, Trash2, Vibrate } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useChangePasswordMutation, useGetSecuritySettingsQuery, useUpdateMfaMutation } from '../api/account-api.js';
import { AccountShell } from '../components/account-layout.js';
import type { ActiveDevice, LoginActivity } from '../model/account-content.js';

const passwordSchema = z.object({
  currentPassword: z.string().min(8, 'Enter your current password'),
  newPassword: z.string().min(10, 'Use at least 10 characters')
});

type PasswordForm = z.infer<typeof passwordSchema>;

const PrivacySecurityContent = () => {
  const { data, isError, isLoading, refetch } = useGetSecuritySettingsQuery();
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [changePassword, passwordState] = useChangePasswordMutation();
  const [updateMfa, mfaState] = useUpdateMfaMutation();
  const { formState: { errors, isSubmitSuccessful }, handleSubmit, register, reset } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const savePassword = async (values: PasswordForm) => {
    await changePassword(values).unwrap();
    reset();
  };

  const toggleMfa = async (enabled: boolean) => {
    setMfaEnabled(enabled);
    await updateMfa({ enabled }).unwrap().catch(() => setMfaEnabled(!enabled));
  };

  return (
    <AccountShell active="security">
      {isLoading && <SecuritySkeleton />}
      {isError && <section className="rounded-2xl bg-white p-10 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]" role="alert"><h2 className="mb-3 text-2xl font-semibold">Security settings unavailable</h2><p className="mb-6 text-[#3e4a3d]">We could not load your privacy controls.</p><Button onClick={() => void refetch()}>Retry</Button></section>}
      {!isLoading && !isError && data && (
        <>
          <div className="flex items-center justify-between"><h1 className="text-3xl font-bold md:text-4xl">Privacy & Security</h1></div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-3xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="mb-8 flex items-start justify-between"><div><div className="mb-1 flex items-center gap-2"><KeyRound className="h-5 w-5 text-[#006b2c]" /><h2 className="text-xl font-semibold">Password</h2></div><p className="text-[#3e4a3d]">Manage your account access</p></div><Badge>Strong</Badge></div>
              <p className="mb-6 text-sm font-semibold text-[#6e7b6c]">Last changed: {data.passwordLastChanged}</p>
              <form className="space-y-3" onSubmit={(event) => void handleSubmit(savePassword)(event)}>
                <Field error={errors.currentPassword?.message} label="Current Password"><Input className="h-12 rounded-xl" type="password" {...register('currentPassword')} /></Field>
                <Field error={errors.newPassword?.message} label="New Password"><Input className="h-12 rounded-xl" type="password" {...register('newPassword')} /></Field>
                <Button className="w-full rounded-xl" disabled={passwordState.isLoading} type="submit">{passwordState.isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}Change Password</Button>
              </form>
              {passwordState.isError && <Alert className="mt-4" tone="danger">Password could not be changed. Please retry.</Alert>}
              {isSubmitSuccessful && !passwordState.isError && <Alert className="mt-4">Password updated successfully.</Alert>}
            </section>
            <section className="rounded-3xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="mb-8 flex items-start justify-between"><div><div className="mb-1 flex items-center gap-2"><Vibrate className="h-5 w-5 text-[#006b2c]" /><h2 className="text-xl font-semibold">Two-Factor Auth</h2></div><p className="text-[#3e4a3d]">Extra layer of security</p></div><Badge tone="success">{mfaEnabled ? 'Enabled' : 'Disabled'}</Badge></div>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <Switch checked={mfaEnabled} disabled={mfaState.isLoading} label="Authenticator App" onChange={(event) => void toggleMfa(event.target.checked)} />
                <Button className="rounded-xl border border-[#bdcaba] bg-white text-[#6e7b6c] shadow-none" disabled variant="secondary">MFA setup is managed in-app</Button>
              </div>
            </section>
            <section className="rounded-3xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] lg:col-span-2">
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-[#006b2c]" /><h2 className="text-xl font-semibold">Active Devices</h2></div>
                <button aria-disabled="true" className="text-sm font-semibold text-[#9aa59a]" disabled title="Session controls are coming soon" type="button">Logout from all devices</button>
              </div>
              <div className="divide-y divide-[#bdcaba]/40">{data.activeDevices.map((device) => <DeviceRow device={device} key={device.id} />)}</div>
            </section>
            <section className="rounded-3xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="mb-6 flex items-center gap-2"><History className="h-5 w-5 text-[#006b2c]" /><h2 className="text-xl font-semibold">Login Activity</h2></div>
              <div className="relative space-y-6 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-0.5 before:bg-[#bdcaba]">{data.loginActivity.map((activity) => <ActivityRow activity={activity} key={activity.id} />)}</div>
            </section>
            <section className="rounded-3xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="mb-4 flex items-center gap-2"><Lock className="h-5 w-5 text-[#006b2c]" /><h2 className="text-xl font-semibold">Data Privacy</h2></div>
              <p className="mb-6 leading-7 text-[#3e4a3d]">Your privacy is our priority. You have full control over your personal information and how we use it.</p>
              <div className="mb-6 space-y-4"><PrivacyToggle defaultChecked label="Personalized offers" /><PrivacyToggle defaultChecked label="Share analytics for improvement" /><PrivacyToggle label="Public profile visibility" /></div>
              <div className="flex flex-col gap-3">
                <Button className="gap-2 rounded-xl border border-[#bdcaba] bg-white text-[#6e7b6c] shadow-none" disabled variant="secondary"><Download className="h-4 w-4" />Download My Data</Button>
                <Button className="gap-2 rounded-xl bg-[#f3d6d9] text-[#8d5057] shadow-none" disabled><Trash2 className="h-4 w-4" />Delete Account Unavailable</Button>
                <p className="text-sm leading-6 text-[#6e7b6c]">
                  Data export and account deletion are intentionally unavailable in the current live FreshMart backend. These controls are hidden from production flows until the backend supports them.
                </p>
              </div>
            </section>
          </div>
        </>
      )}
    </AccountShell>
  );
};

const SecuritySkeleton = () => <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <section className="rounded-3xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]" key={index}><Skeleton className="mb-4 h-7 w-1/2" /><Skeleton className="mb-8 h-5 w-2/3" /><Skeleton className="h-28 w-full" /></section>)}</div>;
const Field = ({ children, error, label }: { children: React.ReactNode; error?: string; label: string }) => <label className="space-y-1"><span className="block text-xs font-semibold text-[#3e4a3d]">{label}</span>{children}{error && <span className="text-xs font-semibold text-[#ba1a1a]">{error}</span>}</label>;
const DeviceRow = ({ device }: { device: ActiveDevice }) => <div className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"><div className="flex items-center gap-6"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eff6ea] text-[#006b2c]">{device.device.includes('iPhone') ? <Smartphone /> : <Laptop />}</div><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{device.device}</p>{device.current && <Badge tone="success">This Device</Badge>}</div><p className="text-[#3e4a3d]">{device.platform} - {device.location}</p></div></div><button aria-disabled="true" className="rounded-lg border border-[#bdcaba] px-4 py-1.5 text-sm font-semibold text-[#9aa59a]" disabled title="Session controls are coming soon" type="button">{device.current ? 'Current Device' : 'Session controls coming soon'}</button></div>;
const ActivityRow = ({ activity }: { activity: LoginActivity }) => <div className="relative pl-10"><div className={`absolute left-0 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white ${activity.status === 'failed' ? 'border-[#ba1a1a]' : activity.status === 'success' ? 'border-[#006b2c]' : 'border-[#bdcaba]'}`}><div className={`h-2 w-2 rounded-full ${activity.status === 'failed' ? 'bg-[#ba1a1a]' : activity.status === 'success' ? 'bg-[#006b2c]' : 'bg-[#bdcaba]'}`} /></div><p className={`font-semibold ${activity.status === 'failed' ? 'text-[#ba1a1a]' : 'text-[#171d16]'}`}>{activity.title}</p><p className="text-xs text-[#6e7b6c]">{activity.detail}</p></div>;
const PrivacyToggle = ({ defaultChecked = false, label }: { defaultChecked?: boolean; label: string }) => <div className="flex items-center justify-between rounded-xl bg-[#eff6ea] px-4 py-3"><span className="font-semibold">{label}</span><Switch defaultChecked={defaultChecked} /></div>;

export default function PrivacySecurityPage() {
  return <Suspense fallback={<AccountShell active="security"><SecuritySkeleton /></AccountShell>}><PrivacySecurityContent /></Suspense>;
}
