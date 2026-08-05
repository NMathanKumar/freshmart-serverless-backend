import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react';
import { ApiErrorMessage, AuthBrand, FormField, PasswordField, SocialButtons, SubmitContent } from '../components/auth-ui.js';
import { useRegisterMutation } from '../api/auth-api.js';
import { authPaths } from '../../../app/auth-paths.js';
import { getApiErrorMessage } from '../lib/api-error.js';
import { registerSchema, type RegisterValues } from '../lib/validation.js';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [createAccount, request] = useRegisterMutation();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', phone: '', password: '', confirmPassword: '', terms: false }
  });
  const password = watch('password');
  const rules = [password.length >= 8, /[A-Z]/.test(password), /[0-9]|[^A-Za-z0-9]/.test(password)];

  const submit = handleSubmit(async (values) => {
    try {
      await createAccount(values).unwrap();
      window.location.assign('/');
    } catch {
      // RTK Query exposes the API error through request for the form alert.
    }
  });

  return (
    <div className="auth-page flex min-h-screen flex-col items-center justify-center bg-[#f4fcf0] px-4 py-12 text-[#171d16] md:px-10">
      <header className="mb-8 text-center"><AuthBrand /><p className="mt-1 text-base text-[#3e4a3d]">Premium Quick Commerce Experience</p></header>
      <main className="w-full max-w-[480px] overflow-hidden rounded-xl border border-[#bdcaba] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="p-6 md:p-8">
          <header className="mb-6"><h1 className="text-xl font-bold leading-7">Create Account</h1><p className="text-base text-[#3e4a3d]">Join our community of urban professionals.</p></header>
          <form className="space-y-4" noValidate onSubmit={submit}>
            <ApiErrorMessage message={getApiErrorMessage(request.error)} />
            <FormField autoComplete="name" autoFocus error={errors.fullName?.message} icon={<UserRound className="h-5 w-5" />} label="Full Name" placeholder="Enter your full name" {...register('fullName')} />
            <FormField autoComplete="email" error={errors.email?.message} icon={<Mail className="h-5 w-5" />} label="Email Address" placeholder="name@company.com" type="email" {...register('email')} />
            <FormField autoComplete="tel" error={errors.phone?.message} icon={<Phone className="h-5 w-5" />} label="Phone Number" placeholder="+1 (555) 000-0000" type="tel" {...register('phone')} />
            <div>
              <PasswordField autoComplete="new-password" error={errors.password?.message} icon={<LockKeyhole className="h-5 w-5" />} label="Password" placeholder="Create a secure password" {...register('password')} />
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#e3eadf]"><div className="h-full bg-[#006b2c] transition-[width]" style={{ width: `${(rules.filter(Boolean).length / 3) * 100}%` }} /></div>
              <p className="mt-1 text-xs font-medium text-[#3e4a3d]">{password ? `${rules.filter(Boolean).length === 3 ? 'Strong' : 'Keep going'} password` : 'Enter a password to check strength'}</p>
              <div className="mt-2 rounded-xl bg-[#e9f0e5] p-3 text-xs font-medium text-[#6e7b6c]"><strong className="mb-1 block text-[#171d16]">Requirements:</strong>{['At least 8 characters', 'One uppercase letter', 'One number or symbol'].map((label, index) => <span className="flex items-center gap-1" key={label}><CheckCircle2 className={rules[index] ? 'h-4 w-4 text-[#006b2c]' : 'h-4 w-4'} />{label}</span>)}</div>
            </div>
            <PasswordField autoComplete="new-password" error={errors.confirmPassword?.message} icon={<LockKeyhole className="h-5 w-5" />} label="Confirm Password" placeholder="Repeat your password" {...register('confirmPassword')} />
            <div><label className="flex cursor-pointer items-start gap-3 text-xs font-medium text-[#3e4a3d]"><input className="mt-0.5 h-5 w-5 shrink-0 rounded border-[#bdcaba] accent-[#006b2c]" type="checkbox" {...register('terms')} /><span>I agree to the <a className="font-bold text-[#006b2c] hover:underline" href="#terms">Terms of Service</a> and <a className="font-bold text-[#006b2c] hover:underline" href="#privacy">Privacy Policy</a>.</span></label>{errors.terms && <p className="mt-1 text-xs text-[#ba1a1a]" role="alert">{errors.terms.message}</p>}</div>
            <button className="auth-primary-button h-[56px] w-full rounded-xl" disabled={request.isLoading} type="submit"><SubmitContent label="Create Account" loading={request.isLoading} loadingLabel="Creating Account..." /></button>
          </form>
          <div className="relative my-8 flex items-center justify-center"><div className="absolute w-full border-t border-[#bdcaba]" /><span className="relative bg-white px-4 text-xs font-medium text-[#3e4a3d]">Or sign up with</span></div>
          <SocialButtons />
          <p className="mt-8 text-center text-base text-[#3e4a3d]">Already have an account? <Link className="font-bold text-[#006b2c] hover:underline" to={authPaths.login}>Login</Link></p>
        </div>
      </main>
      <nav aria-label="Support links" className="mt-6 flex gap-6 text-xs font-medium text-[#6e7b6c]"><a href="#help">Help Center</a><a href="#sustainability">Sustainability</a><a href="#partners">Partner with Us</a></nav>
    </div>
  );
};

export default RegisterPage;
