import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, CreditCard, LockKeyhole, LogOut, MapPin, Menu, Palette, ReceiptText, Settings, Shield, ShoppingCart, Store, Tag, UserRound } from 'lucide-react';
import * as shared from '@freshmart/shared';

const { customerRoutePaths } = shared;

const sidebarItems = [
  { href: customerRoutePaths.settings, icon: UserRound, label: 'Profile' },
  { href: `${customerRoutePaths.settings}#notifications`, icon: Bell, label: 'Notifications' },
  { href: `${customerRoutePaths.settings}#appearance`, icon: Palette, label: 'Appearance' },
  { href: `${customerRoutePaths.settings}#regional`, icon: Settings, label: 'Language & Region' },
  { href: '/privacy-security', icon: Shield, label: 'Privacy & Security' },
  { href: `${customerRoutePaths.settings}#accounts`, icon: LockKeyhole, label: 'Connected Accounts' }
];

export const AccountShell = ({ active, children }: { active: 'settings' | 'security' | 'system'; children: ReactNode }) => {
  const location = useLocation();

  return (
    <div className="account-page min-h-screen bg-[#f4fcf0] pb-20 text-[#171d16] md:pb-0">
      <header className="commerce-glass fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[#bdcaba] bg-white/80 px-4 shadow-sm md:h-20 md:px-10">
        <Link className="commerce-focus text-2xl font-bold tracking-[-0.01em] text-[#006b2c]" to={customerRoutePaths.home}>FreshMarket Enterprise</Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link className="text-sm font-semibold text-[#3e4a3d] hover:text-[#006b2c]" to={customerRoutePaths.home}>Shop</Link>
          <Link className="text-sm font-semibold text-[#3e4a3d] hover:text-[#006b2c]" to={customerRoutePaths.orders}>Orders</Link>
          <a className="text-sm font-semibold text-[#3e4a3d] hover:text-[#006b2c]" href="#offers">Offers</a>
          <Link className="border-b-2 border-[#006b2c] py-1 text-sm font-semibold text-[#006b2c]" to={active === 'security' ? '/privacy-security' : customerRoutePaths.settings}>Support</Link>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <button aria-label="Location" className="commerce-focus rounded-full p-2 text-[#3e4a3d] hover:bg-[#eff6ea]" type="button"><MapPin className="h-5 w-5" /></button>
          <button aria-label="Cart" className="commerce-focus rounded-full p-2 text-[#3e4a3d] hover:bg-[#eff6ea]" type="button"><ShoppingCart className="h-5 w-5" /></button>
          <button aria-label="Account" className="commerce-focus rounded-full p-2 text-[#006b2c] hover:bg-[#eff6ea]" type="button"><UserRound className="h-5 w-5" /></button>
        </div>
        <button aria-label="Open menu" className="commerce-focus rounded-full p-2 md:hidden" type="button"><Menu className="h-5 w-5" /></button>
      </header>
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-12 pt-24 md:flex-row md:px-10 md:pt-28">
        <aside className="w-full flex-shrink-0 md:w-64">
          <div className="sticky top-28 space-y-2">
            <h1 className="mb-4 px-4 text-xl font-semibold">Settings</h1>
            <nav className="space-y-1" aria-label="Settings navigation">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href.split('#')[0] || (active === 'settings' && item.href.startsWith(customerRoutePaths.settings) && item.href.includes('#') === false);
                return (
                  <Link className={`commerce-focus flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${isActive ? 'bg-[#d8f4ce] text-[#006b2c]' : 'text-[#3e4a3d] hover:bg-[#eff6ea]'}`} key={item.label} to={item.href}>
                    <Icon aria-hidden="true" className="h-5 w-5" />{item.label}
                  </Link>
                );
              })}
              <div className="mt-4 border-t border-[#bdcaba] pt-4"><button aria-disabled="true" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#9aa59a]" disabled title="Sign out is coming soon in customer settings" type="button"><LogOut className="h-5 w-5" />Sign Out</button></div>
            </nav>
          </div>
        </aside>
        <section className="min-w-0 flex-1 space-y-6">{children}</section>
      </main>
      <footer className="hidden border-t border-[#bdcaba] bg-[#eff6ea] md:block">
        <div className="mx-auto grid max-w-7xl grid-cols-4 gap-6 px-10 py-12">
          <div><h2 className="mb-4 text-xl font-semibold text-[#006b2c]">FreshMarket Enterprise</h2><p className="text-[#3e4a3d]">Elevating urban grocery shopping through quality and precision.</p></div>
          <FooterColumn title="Company" items={['About Us', 'Sustainability', 'Bulk Orders']} />
          <FooterColumn title="Legal" items={['Terms of Service', 'Privacy Policy']} />
          <FooterColumn title="Connect" items={['Contact Support', '© 2024 FreshMarket Enterprise.']} />
        </div>
      </footer>
      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-[#bdcaba] bg-[#f4fcf0] shadow-lg md:hidden" aria-label="Mobile navigation">
        <MobileItem icon={<Store />} label="Shop" to={customerRoutePaths.home} />
        <MobileItem icon={<ReceiptText />} label="Orders" to={customerRoutePaths.orders} />
        <MobileItem icon={<Tag />} label="Offers" to={`${customerRoutePaths.home}#offers`} />
        <MobileItem active icon={<Settings />} label={active === 'system' ? 'Support' : 'Support'} to={active === 'security' ? '/privacy-security' : customerRoutePaths.settings} />
      </nav>
    </div>
  );
};

const FooterColumn = ({ items, title }: { items: string[]; title: string }) => <div><h3 className="mb-4 text-sm font-bold">{title}</h3><ul className="space-y-2">{items.map((item) => <li key={item}><a className="text-[#3e4a3d] hover:text-[#006b2c] hover:underline" href={`#${item.toLowerCase().replaceAll(' ', '-')}`}>{item}</a></li>)}</ul></div>;
const MobileItem = ({ active = false, icon, label, to }: { active?: boolean; icon: ReactNode; label: string; to: string }) => <Link className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-xs font-semibold ${active ? 'text-[#006b2c]' : 'text-[#3e4a3d]'}`} to={to}>{icon}<span>{label}</span></Link>;
