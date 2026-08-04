import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail, MailCheck, RotateCcwKey } from 'lucide-react';
import { Card } from '@freshmart/design-system';
import { ApiErrorMessage, FormField, SubmitContent } from '../components/auth-ui.js';
import { TransactionalLayout } from '../components/transactional-layout.js';
import { useForgotPasswordMutation } from '../api/auth-api.js';
import { authPaths } from '../../../app/auth-paths.js';
import { getApiErrorMessage } from '../lib/api-error.js';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../lib/validation.js';

const ForgotPasswordPage = () => {
  const [sentEmail, setSentEmail] = useState<string>();
  const [sendReset, request] = useForgotPasswordMutation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' }
  });

  const send = handleSubmit(async ({ email }) => {
    try {
      await sendReset({ email }).unwrap();
      setSentEmail(email);
    } catch {
      // RTK Query exposes the API error through request for the form alert.
    }
  });

  const retry = () => {
    setSentEmail(undefined);
    request.reset();
    reset({ email: '' });
  };

  return (
    <TransactionalLayout>
      <div className="relative w-full max-w-md">
        <div className="absolute -left-12 -top-12 h-24 w-24 rounded-full bg-[#006b2c]/5 blur-2xl" />
        <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-[#006c4a]/10 blur-3xl" />
        <AnimatePresence mode="wait">
          {!sentEmail ? (
            <motion.div key="form" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
              <Card className="rounded-2xl border-0 bg-white p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#85f8c4]"><RotateCcwKey aria-hidden="true" className="h-8 w-8 text-[#006c4a]" /></div>
                <h1 className="mb-4 text-2xl font-bold leading-8 md:text-[32px] md:leading-10">Forgot Password?</h1>
                <p className="mx-auto mb-8 max-w-sm text-base leading-7 text-[#171d16]">No worries, it happens to the best of us.<br />Enter your email and we'll send you a recovery link.</p>
                <form className="space-y-6 text-left" noValidate onSubmit={send}>
                  <ApiErrorMessage message={getApiErrorMessage(request.error)} />
                  <FormField autoComplete="email" autoFocus error={errors.email?.message} icon={<Mail className="h-5 w-5" />} label="Email Address" placeholder="name@company.com" type="email" {...register('email')} />
                  <button className="auth-primary-button h-16 w-full rounded-2xl" disabled={request.isLoading} type="submit"><SubmitContent label="Continue" loading={request.isLoading} loadingLabel="Sending..." />{!request.isLoading && <ArrowRight aria-hidden="true" className="h-5 w-5" />}</button>
                  <div className="text-center"><Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#006b2c] hover:underline" to={authPaths.login}><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to Login</Link></div>
                </form>
              </Card>
            </motion.div>
          ) : (
            <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 12 }} key="success" transition={{ duration: 0.3 }}>
              <Card className="auth-dot-pattern rounded-2xl border border-[#006b2c]/20 bg-white p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#006b2c]/10"><MailCheck aria-hidden="true" className="h-8 w-8 text-[#006b2c]" /></div>
                <h2 className="text-xl font-semibold">Password reset link sent</h2>
                <p className="mt-4 text-base text-[#3e4a3d]">We've sent a secure link to <strong>{sentEmail}</strong>. Please check your inbox and follow the instructions.</p>
                <div className="mt-8 grid gap-2"><a className="auth-primary-button flex h-14 items-center justify-center rounded-2xl" href="mailto:">Open Email App</a><button className="h-14 rounded-2xl bg-[#e3eadf] font-semibold hover:bg-[#dde5d9]" onClick={() => void sendReset({ email: sentEmail }).unwrap().catch(() => undefined)} type="button">Resend Email</button></div>
                <button className="mt-5 text-sm font-semibold text-[#006b2c] hover:underline" onClick={retry} type="button">Try another email address</button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TransactionalLayout>
  );
};

export default ForgotPasswordPage;
