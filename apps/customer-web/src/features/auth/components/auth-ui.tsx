import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { Button, Input, cn } from '@freshmart/design-system';
import { Eye, EyeOff, Leaf, LoaderCircle } from 'lucide-react';

export const AuthBrand = ({ compact = false }: { compact?: boolean }) => (
  <div
    className={cn(
      'flex items-center gap-2 font-bold tracking-tight text-[#006b2c]',
      compact ? 'text-xl' : 'text-[32px] leading-10'
    )}
  >
    {compact && <Leaf aria-hidden="true" className="h-5 w-5" />}
    <span>FreshMart</span>
  </div>
);

export const SubmitContent = ({
  loading,
  label,
  loadingLabel,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
}) => (
  <>
    <span>{loading ? loadingLabel : label}</span>
    {loading && (
      <LoaderCircle
        aria-hidden="true"
        className="h-[18px] w-[18px] animate-spin"
      />
    )}
  </>
);

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
}

export const FormField = ({
  label,
  error,
  icon,
  className,
  id: suppliedId,
  ...props
}: FieldProps) => {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1">
      <label
        className="block text-sm leading-5 font-semibold tracking-[0.01em] text-[#3e4a3d]"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#6e7b6c]">
            {icon}
          </span>
        )}
        <Input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className={cn(
            'h-[62px] rounded-2xl border-[#bdcaba] bg-[#f4fcf0] px-4 text-base text-[#171d16] placeholder:text-[#667085] focus:border-[#006b2c] focus:ring-[#006b2c]',
            icon && 'pl-12',
            error && 'border-[#ba1a1a] focus:ring-[#ba1a1a]',
            className
          )}
          id={id}
          {...props}
        />
      </div>
      {error && (
        <p
          className="text-xs leading-4 font-medium text-[#ba1a1a]"
          id={errorId}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export const PasswordField = ({ label, error, icon, ...props }: FieldProps) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <FormField
        label={label}
        error={error}
        icon={icon}
        type={visible ? 'text' : 'password'}
        className="pr-12"
        {...props}
      />
      <button
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute top-[42px] right-4 -translate-y-1/2 rounded-md p-1 text-[#6e7b6c] hover:text-[#171d16] focus-visible:ring-2 focus-visible:ring-[#006b2c] focus-visible:outline-none"
        onClick={() => setVisible((value) => !value)}
        type="button"
      >
        {visible ? (
          <EyeOff aria-hidden="true" className="h-5 w-5" />
        ) : (
          <Eye aria-hidden="true" className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};

export const ApiErrorMessage = ({ message }: { message?: string }) =>
  message ? (
    <div
      className="rounded-xl bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]"
      role="alert"
      tabIndex={-1}
    >
      {message}
    </div>
  ) : null;

export const SocialButtons = () => (
  <div className="grid grid-cols-3 gap-4" aria-label="Social sign in options">
    <button
      aria-label="Continue with Google"
      className="social-button"
      type="button"
    >
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09A6.5 6.5 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84Z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
          fill="#EA4335"
        />
      </svg>
    </button>
    <button
      aria-label="Continue with Apple"
      className="social-button"
      type="button"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.11.8 1.12-.1 2.32-.77 3.63-.67 1.54.13 2.68.71 3.37 1.74-3.14 1.88-2.64 6.22.41 7.46-.62 1.57-1.45 3.12-2.52 4.64ZM12.04 7.23c-.14-3.14 2.58-5.83 5.48-6.1.33 3.5-3.12 6.14-5.48 6.1Z" />
      </svg>
    </button>
    <button
      aria-label="Continue with Microsoft"
      className="social-button"
      type="button"
    >
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
        <path
          d="M0 0h11.4v11.4H0zM12.6 0H24v11.4H12.6zM0 12.6h11.4V24H0zM12.6 12.6H24V24H12.6z"
          fill="#00a4ef"
        />
      </svg>
    </button>
  </div>
);

export const AuthButton = Button;
