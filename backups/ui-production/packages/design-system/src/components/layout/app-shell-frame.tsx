import type { PropsWithChildren, ReactNode } from 'react';
import { cn } from '../../lib/cn.js';

export const AppShellFrame = ({
  sidebar,
  topbar,
  children,
  className
}: PropsWithChildren<{ sidebar?: ReactNode; topbar?: ReactNode; className?: string }>) => (
  <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
    <div className="mx-auto flex min-h-screen w-full max-w-[1680px]">
      {sidebar ? <aside className="hidden w-72 border-r border-[color:var(--border)] xl:block">{sidebar}</aside> : null}
      <div className={cn('flex min-h-screen flex-1 flex-col', className)}>
        {topbar ? <header className="border-b border-[color:var(--border)]">{topbar}</header> : null}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  </div>
);
