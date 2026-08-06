import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, MailCheck } from 'lucide-react';
import { Card } from '@freshmart/design-system';
import { ApiErrorMessage, SubmitContent } from '../components/auth-ui.js';
import { TransactionalLayout } from '../components/transactional-layout.js';
import {
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from '../api/auth-api.js';
import { authPaths } from '../../../app/auth-paths.js';
import { getApiErrorMessage } from '../lib/api-error.js';
import { otpSchema } from '../lib/validation.js';

interface VerifyLocationState {
  email?: string;
  accessToken?: string;
}

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as VerifyLocationState;
  const params = new URLSearchParams(location.search);
  const email = state.email ?? params.get('email') ?? 'alex.smith@example.com';
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(28);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [verifyEmail, verifyRequest] = useVerifyEmailMutation();
  const [resend, resendRequest] = useResendVerificationMutation();
  const {
    register,
    setValue,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<{ code: string }>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setInterval(
      () => setCountdown((value) => Math.max(0, value - 1)),
      1000
    );
    return () => window.clearInterval(timer);
  }, [countdown]);
  useEffect(() => {
    setValue('code', digits.join(''), { shouldValidate: false });
  }, [digits, setValue]);
  useEffect(() => {
    if (!verified) return;
    const timer = window.setTimeout(() => navigate(authPaths.login), 2200);
    return () => window.clearTimeout(timer);
  }, [navigate, verified]);

  const updateDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setDigits((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? digit : item))
    );
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (event.key === 'ArrowLeft' && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < 5)
      inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)
      .split('');
    if (!pasted.length) return;
    setDigits(Array.from({ length: 6 }, (_, index) => pasted[index] ?? ''));
    inputRefs.current[Math.min(pasted.length, 6) - 1]?.focus();
  };

  const submit = handleSubmit(async ({ code }) => {
    if (code.length !== 6) {
      setError('code', { message: 'Enter the complete 6-digit code.' });
      return;
    }
    try {
      await verifyEmail({ code, accessToken: state.accessToken }).unwrap();
      setVerified(true);
    } catch {
      // RTK Query exposes the API error through verifyRequest for the form alert.
    }
  });

  const resendCode = async () => {
    try {
      await resend({ accessToken: state.accessToken }).unwrap();
      setCountdown(30);
    } catch {
      // RTK Query exposes the API error through resendRequest for the form alert.
    }
  };

  if (!email.trim()) {
    return (
      <TransactionalLayout supportLabel="Support">
        <Card className="w-full max-w-md rounded-2xl border-0 bg-white p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <MailCheck
            aria-hidden="true"
            className="mx-auto mb-5 h-12 w-12 text-[#6e7b6c]"
          />
          <h1 className="text-2xl font-bold">No email address found</h1>
          <p className="mt-2 text-base text-[#3e4a3d]">
            Create an account or enter your email again to request a
            verification code.
          </p>
          <button
            className="auth-primary-button mt-6 h-14 w-full rounded-lg"
            onClick={() => navigate(authPaths.register)}
            type="button"
          >
            Create Account
          </button>
        </Card>
      </TransactionalLayout>
    );
  }

  return (
    <TransactionalLayout supportLabel="Support">
      <Card className="w-full max-w-md rounded-2xl border-0 bg-white p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <AnimatePresence mode="wait">
          {!verified ? (
            <motion.div exit={{ opacity: 0 }} key="verify">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#00873a]/20">
                <MailCheck
                  aria-hidden="true"
                  className="h-9 w-9 text-[#006b2c]"
                />
              </div>
              <h1 className="mb-1 text-2xl leading-8 font-bold md:text-[32px] md:leading-10">
                Verify your email
              </h1>
              <p className="mb-8 text-base leading-6 text-[#3e4a3d]">
                We've sent a 6-digit verification code to
                <br />
                <strong className="text-[#171d16]">{email}</strong>
              </p>
              <form noValidate onSubmit={submit}>
                <input type="hidden" {...register('code')} />
                <fieldset>
                  <legend className="sr-only">
                    Six-digit verification code
                  </legend>
                  <div
                    className="mx-auto mb-2 flex justify-between gap-1 sm:gap-2"
                    onPaste={handlePaste}
                  >
                    {digits.map((digit, index) => (
                      <input
                        aria-label={`Digit ${index + 1} of 6`}
                        className="h-12 w-10 rounded-lg border-2 border-[#bdcaba] bg-[#f4fcf0] text-center text-xl font-bold transition-all outline-none focus:border-[#006b2c] focus:ring-1 focus:ring-[#006b2c] sm:h-14 sm:w-12"
                        inputMode="numeric"
                        key={index}
                        maxLength={1}
                        onChange={(event) =>
                          updateDigit(index, event.target.value)
                        }
                        onKeyDown={(event) => handleKeyDown(index, event)}
                        ref={(element) => {
                          inputRefs.current[index] = element;
                        }}
                        value={digit}
                      />
                    ))}
                  </div>
                </fieldset>
                {errors.code && (
                  <p className="mb-4 text-sm text-[#ba1a1a]" role="alert">
                    {errors.code.message}
                  </p>
                )}
                <ApiErrorMessage
                  message={
                    getApiErrorMessage(verifyRequest.error) ??
                    getApiErrorMessage(resendRequest.error)
                  }
                />
                <button
                  className="auth-primary-button mt-8 h-14 w-full rounded-lg"
                  disabled={verifyRequest.isLoading}
                  type="submit"
                >
                  <SubmitContent
                    label="Verify Account"
                    loading={verifyRequest.isLoading}
                    loadingLabel="Verifying..."
                  />
                </button>
              </form>
              <div className="mt-6 space-y-3 text-sm font-semibold text-[#3e4a3d]">
                <p>
                  Didn't receive the code?{' '}
                  <button
                    className="font-bold text-[#006b2c] enabled:hover:underline disabled:cursor-not-allowed disabled:text-[#6e7b6c]"
                    disabled={countdown > 0 || resendRequest.isLoading}
                    onClick={() => void resendCode()}
                    type="button"
                  >
                    {resendRequest.isLoading ? 'Resending...' : 'Resend OTP'}{' '}
                    {countdown > 0 && `(${countdown}s)`}
                  </button>
                </p>
                <button
                  className="font-bold text-[#006b2c] hover:underline"
                  onClick={() => navigate(authPaths.register)}
                  type="button"
                >
                  Change Email Address
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="py-8"
              initial={{ opacity: 0, scale: 0.94 }}
              key="success"
            >
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#006b2c] text-[#006b2c]">
                <motion.div
                  animate={{ pathLength: 1 }}
                  initial={{ pathLength: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Check
                    aria-hidden="true"
                    className="h-12 w-12"
                    strokeWidth={3}
                  />
                </motion.div>
              </div>
              <h2 className="mb-1 text-2xl font-bold md:text-[32px]">
                Verification Successful
              </h2>
              <p className="mb-8 text-base text-[#3e4a3d]">
                Your identity has been confirmed. Redirecting you to
                FreshMart...
              </p>
              <div
                aria-label="Redirecting"
                className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#006b2c]/20 border-t-[#006b2c]"
                role="status"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </TransactionalLayout>
  );
};

export default VerifyEmailPage;
