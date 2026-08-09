import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Leaf,
  LockKeyhole,
  Mail,
  Phone,
  ShoppingBasket,
  UserRound,
  Zap,
} from 'lucide-react';
import {
  ApiErrorMessage,
  AuthBrand,
  FormField,
  PasswordField,
  SocialButtons,
  SubmitContent,
} from '../components/auth-ui.js';
import { useRegisterMutation } from '../api/auth-api.js';
import { authPaths } from '../../../app/auth-paths.js';
import { getApiErrorMessage } from '../lib/api-error.js';
import { registerSchema, type RegisterValues } from '../lib/validation.js';

const highlights = [
  [Leaf, 'Fresh Products Source Directly'],
  [Zap, 'Fast 15-Minute Delivery'],
  [LockKeyhole, '100% Secure Encrypted Payment'],
] as const;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [createAccount, request] = useRegisterMutation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });
  const password = watch('password');
  const rules = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]|[^A-Za-z0-9]/.test(password),
  ];

  const submit = handleSubmit(async (values) => {
    try {
      await createAccount(values).unwrap();
      window.location.assign('/');
    } catch {
      // RTK Query exposes the API error through request for the form alert.
    }
  });

  return (
    <div className="auth-page flex min-h-[100dvh] items-center justify-center bg-[#f4fcf0] p-4 text-[#171d16]">
      <main className="flex w-full max-w-[1000px] overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] my-6">
        <section
          className="login-marketing relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#16a34a] to-[#006c4a] p-8 md:flex"
          aria-label="FreshMart benefits"
        >
          <div className="login-grid" />
          <div className="relative z-10">
            <div className="mb-8 flex items-center gap-3 text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#16a34a]">
                <ShoppingBasket aria-hidden="true" className="h-6 w-6" />
              </span>
              <span className="text-xl font-extrabold tracking-tight">
                FreshMart
              </span>
            </div>
            <h1 className="mb-4 text-[32px] leading-10 font-normal text-white">
              Join FreshMart Today
            </h1>
            <p className="max-w-md text-lg leading-7 text-white/90">
              Create an account to start shopping farm-fresh organic produce with 15-minute delivery.
            </p>
          </div>
          <div className="relative z-10 flex flex-grow items-center justify-center py-6">
            <div className="aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-105">
              <img
                alt="A wooden crate filled with fresh vegetables in a bright kitchen"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbwOitHwfznWD3fqE9QjizeMVOBjiNdFFBVxClzMU_r2dzIu_hGxZ5mKOemN7_1pizhJ5mI4LUfkBQc_WqQDjdArcPW2EsZuFzNs6gWeD7alQqA0wvjpz4i5Erw1saagybNZW0EtluVbs3ArrWu9NTLqIbsahXqG_uI8HsKZVaaVyPHzSZmyJyKbWEoqmqJnAjLFg7RI11bwLyULiVWVEz1pYOSdwKxLs9jgLH2on82PkedOBiS0cN44WvX7fkg8M57Dw2aXjmuJvy"
              />
            </div>
          </div>
          <div className="relative z-10 grid gap-3">
            {highlights.map(([Icon, label]) => (
              <div
                className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 text-white backdrop-blur-md"
                key={label}
              >
                <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                <span className="text-sm font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex w-full items-center justify-center overflow-y-auto bg-white p-6 md:w-1/2 md:p-10">
          <div className="w-full max-w-[400px]">
            <div className="mb-4 flex justify-center md:hidden">
              <AuthBrand />
            </div>
            <header className="mb-6">
              <h2 className="text-2xl leading-tight font-semibold">Create Account</h2>
              <p className="text-sm text-[#3e4a3d]">
                Join our community of urban professionals.
              </p>
            </header>
            <form className="space-y-4" noValidate onSubmit={submit}>
              <ApiErrorMessage message={getApiErrorMessage(request.error)} />
              <FormField
                autoComplete="name"
                autoFocus
                error={errors.fullName?.message}
                icon={<UserRound className="h-5 w-5" />}
                label="Full Name"
                placeholder="Enter your full name"
                {...register('fullName')}
              />
              <FormField
                autoComplete="email"
                error={errors.email?.message}
                icon={<Mail className="h-5 w-5" />}
                label="Email Address"
                placeholder="name@company.com"
                type="email"
                {...register('email')}
              />
              <FormField
                autoComplete="tel"
                error={errors.phone?.message}
                icon={<Phone className="h-5 w-5" />}
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                type="tel"
                {...register('phone')}
              />
              <div>
                <PasswordField
                  autoComplete="new-password"
                  error={errors.password?.message}
                  icon={<LockKeyhole className="h-5 w-5" />}
                  label="Password"
                  placeholder="Create a secure password"
                  {...register('password')}
                />
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#e3eadf]">
                  <div
                    className="h-full bg-[#006b2c] transition-[width]"
                    style={{
                      width: `${(rules.filter(Boolean).length / 3) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs font-medium text-[#3e4a3d]">
                  {password
                    ? `${rules.filter(Boolean).length === 3 ? 'Strong' : 'Keep going'} password`
                    : 'Enter a password to check strength'}
                </p>
                <div className="mt-2 rounded-xl bg-[#e9f0e5] p-3 text-xs font-medium text-[#6e7b6c]">
                  <strong className="mb-1 block text-[#171d16]">
                    Requirements:
                  </strong>
                  {[
                    'At least 8 characters',
                    'One uppercase letter',
                    'One number or symbol',
                  ].map((label, index) => (
                    <span className="flex items-center gap-1" key={label}>
                      <CheckCircle2
                        className={
                          rules[index] ? 'h-4 w-4 text-[#006b2c]' : 'h-4 w-4'
                        }
                      />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <PasswordField
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                icon={<LockKeyhole className="h-5 w-5" />}
                label="Confirm Password"
                placeholder="Repeat your password"
                {...register('confirmPassword')}
              />
              <div>
                <label className="flex cursor-pointer items-start gap-3 text-xs font-medium text-[#3e4a3d]">
                  <input
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-[#bdcaba] accent-[#006b2c]"
                    type="checkbox"
                    {...register('terms')}
                  />
                  <span>
                    I agree to the{' '}
                    <a
                      className="font-bold text-[#006b2c] hover:underline"
                      href="#terms"
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      className="font-bold text-[#006b2c] hover:underline"
                      href="#privacy"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-1 text-xs text-[#ba1a1a]" role="alert">
                    {errors.terms.message}
                  </p>
                )}
              </div>
              <button
                className="auth-primary-button mt-2 h-[48px] w-full rounded-xl bg-[#16a34a]"
                disabled={request.isLoading}
                type="submit"
              >
                <SubmitContent
                  label="Create Account"
                  loading={request.isLoading}
                  loadingLabel="Creating Account..."
                />
              </button>
            </form>
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute w-full border-t border-[#bdcaba]" />
              <span className="relative bg-white px-4 text-xs font-medium text-[#3e4a3d]">
                Or sign up with
              </span>
            </div>
            <SocialButtons />
            <p className="mt-6 text-center text-sm text-[#3e4a3d]">
              Already have an account?{' '}
              <Link
                className="font-bold text-[#16a34a] hover:underline"
                to={authPaths.login}
              >
                Login
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RegisterPage;
