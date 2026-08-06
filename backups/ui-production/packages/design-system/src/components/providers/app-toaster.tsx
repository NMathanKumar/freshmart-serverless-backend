import { Toaster } from 'sonner';

export const AppToaster = () => (
  <Toaster
    richColors
    position="top-right"
    toastOptions={{
      classNames: {
        toast: '!rounded-2xl !border !border-[color:var(--border)] !bg-[color:var(--surface-elevated)] !text-[color:var(--foreground)]'
      }
    }}
  />
);
