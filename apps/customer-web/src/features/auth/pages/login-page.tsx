import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Leaf, LockKeyhole, ShoppingBasket, Zap } from 'lucide-react';
import { getEnvironmentUrls } from '@freshmart/shared';
import { ApiErrorMessage, AuthBrand, FormField, PasswordField, SocialButtons, SubmitContent } from '../components/auth-ui.js';
import { useLoginMutation } from '../api/auth-api.js';
import { authPaths } from '../../../app/auth-paths.js';
import { getApiErrorMessage } from '../lib/api-error.js';
import { loginSchema, type LoginValues } from '../lib/validation.js';

const highlights = [
  [Leaf, 'Fresh Products Source Directly'],
  [Zap, 'Fast 15-Minute Delivery'],
  [LockKeyhole, '100% Secure Encrypted Payment']
] as const;

const LoginPage = () => {
  const [login, loginState] = useLoginMutation();
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false }
  });

  const navigate = useNavigate();
  const submit = handleSubmit(async (values) => {
    try {
      const result = await login(values).unwrap();
      setSuccess(true);
      const email = values.email.toLowerCase();
      const userRole = result?.user?.role;
      const isAdmin = email === 'mathankumar@gmail.com' || userRole === 'ADMIN' || userRole === 'SUPER ADMIN';

      setTimeout(() => {
        const urls = getEnvironmentUrls();
        if (isAdmin) {
          const adminTarget = window.location.hostname.includes('admin')
            ? '/admin/dashboard'
            : `${urls.adminWebUrl}/admin/dashboard`;
          window.location.assign(adminTarget);
        } else {
          navigate('/');
        }
      }, 500);
    } catch {
      // RTK Query exposes the API error through loginState for the form alert.
    }
  });

  return (
    <div className="auth-page flex min-h-[100dvh] items-center justify-center bg-[#f4fcf0] p-4 text-[#171d16]">
      <main className="flex w-full max-w-[1000px] overflow-hidden bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-3xl md:h-[600px]">
        <section className="login-marketing relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#16a34a] to-[#006c4a] p-8 md:flex" aria-label="FreshMart benefits">
          <div className="login-grid" />
          <div className="relative z-10">
            <div className="mb-8 flex items-center gap-3 text-white"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#16a34a]"><ShoppingBasket aria-hidden="true" className="h-6 w-6" /></span><span className="text-xl font-extrabold tracking-tight">FreshMart</span></div>
            <h1 className="mb-4 text-[32px] font-normal leading-10 text-white">Freshness delivered in minutes</h1>
            <p className="max-w-md text-lg leading-7 text-white/90">Experience the future of grocery shopping with our curated selection of farm-fresh produce and premium essentials.</p>
          </div>
          <div className="relative z-10 flex flex-grow items-center justify-center py-8">
            <div className="aspect-square w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-105">
              <img alt="A wooden crate filled with fresh vegetables in a bright kitchen" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbwOitHwfznWD3fqE9QjizeMVOBjiNdFFBVxClzMU_r2dzIu_hGxZ5mKOemN7_1pizhJ5mI4LUfkBQc_WqQDjdArcPW2EsZuFzNs6gWeD7alQqA0wvjpz4i5Erw1saagybNZW0EtluVbs3ArrWu9NTLqIbsahXqG_uI8HsKZVaaVyPHzSZmyJyKbWEoqmqJnAjLFg7RI11bwLyULiVWVEz1pYOSdwKxLs9jgLH2on82PkedOBiS0cN44WvX7fkg8M57Dw2aXjmuJvy" />
            </div>
          </div>
          <div className="relative z-10 grid gap-4">
            {highlights.map(([Icon, label]) => <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur-md" key={label}><Icon aria-hidden="true" className="h-5 w-5" /><span className="text-sm font-semibold">{label}</span></div>)}
          </div>
        </section>
        <section className="flex w-full items-center justify-center overflow-y-auto bg-white p-6 md:w-1/2 md:p-10">
          <div className="w-full max-w-[360px]">
            <div className="mb-6 flex justify-center md:hidden"><AuthBrand /></div>
            <header className="mb-6 text-center md:text-left"><h2 className="mb-1 text-2xl font-semibold leading-tight">Welcome Back</h2><p className="text-sm text-[#3e4a3d]">Sign in to continue your shopping journey.</p></header>
            <SocialButtons />
            <div className="relative my-6 flex items-center justify-center"><div className="absolute w-full border-t border-[#bdcaba]" /><span className="relative bg-white px-4 text-xs font-medium text-[#3e4a3d]">or use email</span></div>
            {success ? (
              <div className="rounded-2xl bg-[#e9f0e5] p-6 text-center" role="status"><CheckCircle2 aria-hidden="true" className="mx-auto mb-3 h-10 w-10 text-[#006b2c]" /><h3 className="text-xl font-semibold">Sign in successful</h3><p className="mt-1 text-[#3e4a3d]">Welcome back to FreshMart.</p></div>
            ) : (
              <form className="space-y-4" noValidate onSubmit={submit}>
                <ApiErrorMessage message={getApiErrorMessage(loginState.error)} />
                <FormField autoComplete="email" autoFocus error={errors.email?.message} label="Email Address" placeholder="name@freshmart.com" type="email" {...register('email')} />
                <div>
                  <div className="mb-1 flex items-center justify-between"><span className="text-sm font-semibold text-[#3e4a3d]">Password</span><Link className="text-sm font-medium text-[#16a34a] hover:underline" to={authPaths.forgotPassword}>Forgot Password?</Link></div>
                  <PasswordField aria-label="Password" autoComplete="current-password" error={errors.password?.message} label="" placeholder="••••••••" {...register('password')} />
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#3e4a3d]"><input className="h-4 w-4 rounded border-[#bdcaba] accent-[#16a34a] focus-visible:ring-2 focus-visible:ring-[#006b2c]" type="checkbox" {...register('remember')} /> Remember me for 30 days</label>
                <button className="auth-primary-button mt-2 h-[48px] w-full rounded-xl bg-[#16a34a]" disabled={loginState.isLoading} type="submit"><SubmitContent label="Sign In" loading={loginState.isLoading} loadingLabel="Signing In..." /></button>
              </form>
            )}
            <p className="mt-6 text-center text-sm text-[#3e4a3d]">Don't have an account? <Link className="font-bold text-[#16a34a] hover:underline" to={authPaths.register}>Create Account</Link></p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;
