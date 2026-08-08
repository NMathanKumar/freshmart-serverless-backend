import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { CircleHelp, Leaf } from 'lucide-react';
import { AuthBrand } from './auth-ui.js';

export const TransactionalLayout = ({
  children,
  supportLabel = 'Help Center',
}: PropsWithChildren<{ supportLabel?: string }>) => (
  <div className="auth-page flex min-h-screen flex-col bg-[#f4fcf0] text-[#171d16]">
    <header className="h-16 bg-[#f4fcf0]/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-10">
        <AuthBrand compact />
        <a
          className="flex items-center gap-2 text-base hover:text-[#006b2c] focus-visible:ring-2 focus-visible:ring-[#006b2c] focus-visible:outline-none"
          href="mailto:support@freshmart.com"
        >
          {supportLabel === 'Help Center' && (
            <CircleHelp aria-hidden="true" className="h-5 w-5" />
          )}
          <span
            className={
              supportLabel === 'Support' ? 'font-bold text-[#006b2c]' : ''
            }
          >
            {supportLabel}
          </span>
        </a>
      </div>
    </header>
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12 md:py-20">
      {children}
    </main>
    <footer className="border-t border-[#bdcaba]/30 bg-white py-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:grid-cols-4 md:px-10">
        <div className="md:col-span-2">
          <div className="mb-3 flex items-center gap-1 text-xl font-semibold text-[#006b2c]">
            <Leaf aria-hidden="true" className="h-5 w-5" /> FreshMart
          </div>
          <p className="max-w-sm text-base leading-7 text-[#3e4a3d]">
            © 2024 FreshMart Inc. Premium Quick Commerce. Delivering quality at
            the speed of life.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">Company</h2>
          <div className="space-y-3 text-base text-[#3e4a3d]">
            <Link className="block hover:text-[#006b2c]" to="/about">
              About Us
            </Link>
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">Support</h2>
          <div className="space-y-3 text-base text-[#3e4a3d]">
            <Link className="block hover:text-[#006b2c]" to="/help">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  </div>
);
