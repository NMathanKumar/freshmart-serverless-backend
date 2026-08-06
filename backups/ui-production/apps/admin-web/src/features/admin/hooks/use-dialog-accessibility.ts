import { useEffect, type RefObject } from 'react';

export const useDialogAccessibility = <T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
  initialFocus?: RefObject<T | null>
) => {
  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    const focusTimer = window.setTimeout(() => {
      const fallback = document.querySelector<HTMLElement>('[role="dialog"] button, [role="dialog"] input, [role="dialog"] select, [role="dialog"] textarea');
      (initialFocus?.current ?? fallback)?.focus();
    }, 0);
    const handleDialogKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
      const focusable = dialog
        ? Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'))
        : [];
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleDialogKeys);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleDialogKeys);
      previouslyFocused?.focus();
    };
  }, [initialFocus, onClose, open]);
};
