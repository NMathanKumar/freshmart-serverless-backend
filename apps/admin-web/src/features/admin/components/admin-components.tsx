import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { Link, NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  CalendarDays,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  EllipsisVertical,
  Eye,
  Filter,
  Grid2x2,
  HelpCircle,
  LogOut,
  Menu,
  Plus,
  Printer,
  Search,
  Share2,
  SlidersHorizontal,
  Star,
  Upload,
  UserRound
} from 'lucide-react';
import { cn } from '@freshmart/design-system';
import type { Metric, NavItem, TopbarUser } from '../../../shared/types/admin.js';

type SidebarProps = {
  brandTitle?: string;
  brandSubtitle?: string;
  homeLabel?: string;
  nav: NavItem[];
  footerPrimaryLabel?: string;
  footerUser?: TopbarUser;
  precision?: boolean;
  precisionVariant?: 'reviews' | 'products' | 'categories' | 'inventory' | 'orders' | 'suppliers' | 'purchase-orders' | 'customers' | 'delivery' | 'coupons';
};

export const AdminSidebar = ({
  brandSubtitle = 'Admin Portal',
  brandTitle = 'FreshMart',
  footerPrimaryLabel = 'New Product',
  footerUser,
  homeLabel,
  nav,
  precision = false,
  precisionVariant = 'reviews'
}: SidebarProps) => (
  <aside className={cn('admin-sidebar admin-panel flex w-full flex-col justify-between p-3.5 xl:p-5 h-full overflow-y-auto scrollbar-thin lg:w-64 xl:w-72 lg:max-w-[288px]', precision && 'admin-sidebar-precision', precisionVariant === 'products' && 'admin-sidebar-products', precisionVariant === 'categories' && 'admin-sidebar-categories', precisionVariant === 'inventory' && 'admin-sidebar-inventory', precisionVariant === 'orders' && 'admin-sidebar-orders', precisionVariant === 'suppliers' && 'admin-sidebar-suppliers', precisionVariant === 'purchase-orders' && 'admin-sidebar-purchase-orders', precisionVariant === 'customers' && 'admin-sidebar-customers', precisionVariant === 'delivery' && 'admin-sidebar-delivery', precisionVariant === 'coupons' && 'admin-coupons-layout')}>
    <div>
      <div className={cn('mb-4 xl:mb-6 flex items-start gap-3', precision && 'admin-brand-precision')}>
        {!precision || precisionVariant === 'inventory' ? (
          <div className="flex h-11 w-11 xl:h-13 xl:w-13 items-center justify-center rounded-[14px] xl:rounded-[16px] bg-[var(--admin-primary)] text-white shadow-[0_10px_25px_rgba(6,119,47,0.2)] shrink-0">
            <Grid2x2 className="h-5 w-5 xl:h-6 xl:w-6" aria-hidden="true" />
          </div>
        ) : null}
        <div className="min-w-0">
          <div className="text-[19px] xl:text-[22px] font-bold tracking-[-0.02em] text-[var(--admin-primary)] truncate">{brandTitle}</div>
          <div className="mt-0.5 text-[12px] xl:text-[14px] uppercase tracking-[0.12em] text-[var(--admin-muted)] truncate">{brandSubtitle}</div>
          {homeLabel ? <div className="mt-0.5 text-xs text-[var(--admin-muted)] truncate">{homeLabel}</div> : null}
        </div>
      </div>
      <nav className="space-y-1 xl:space-y-1.5" aria-label="Primary">
        {nav.map(({ icon: Icon, label, path }) => (
          <NavLink key={path} to={path} className={({ isActive }) => cn('admin-nav-link', isActive && 'active')}>
            <Icon className="h-5 w-5 xl:h-5.5 xl:w-5.5" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
    <div className={cn('mt-4 xl:mt-6 border-t border-[var(--admin-outline-soft)] pt-3.5 xl:pt-5 shrink-0', precision && 'admin-sidebar-footer-precision')}>
      {(precisionVariant === 'products' || precisionVariant === 'categories') && footerUser ? (
        <div className="admin-sidebar-user">
          {precisionVariant === 'categories' ? (
            <img alt="" className="admin-sidebar-user-photo" src={footerUser.avatar} />
          ) : (
            <span className="admin-sidebar-user-avatar"><UserRound className="h-5 w-5" aria-hidden="true" /></span>
          )}
          <span className="min-w-0">
            <strong className="truncate block text-xs xl:text-sm">{footerUser.name}</strong>
            <small className="truncate block text-[11px]">{footerUser.role}</small>
          </span>
        </div>
      ) : (
        <Link to="/products?action=new" className="admin-button admin-button-primary mb-3 xl:mb-4 w-full flex items-center justify-center gap-2">
          <Plus className="h-4 w-4 xl:h-5 xl:w-5" aria-hidden="true" />
          <span className="truncate">{footerPrimaryLabel}</span>
        </Link>
      )}
      {!precision || precisionVariant === 'inventory' || precisionVariant === 'orders' || precisionVariant === 'suppliers' || precisionVariant === 'purchase-orders' ? (
        <div className="space-y-1.5 xl:space-y-2 text-[13px] xl:text-[14px] text-[var(--admin-text)]">
          <button type="button" className="flex items-center gap-2.5 text-left transition hover:text-[var(--admin-primary)] py-1 w-full">
            <HelpCircle className="h-4 w-4 xl:h-5 xl:w-5 shrink-0" aria-hidden="true" />
            <span>Help Center</span>
          </button>
          <button type="button" className="flex items-center gap-2.5 text-left transition hover:text-[var(--admin-primary)] py-1 w-full">
            <LogOut className="h-4 w-4 xl:h-5 xl:w-5 shrink-0" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      ) : null}
    </div>
  </aside>
);

type TopbarProps = {
  placeholder: string;
  user: TopbarUser;
  compactUser?: boolean;
  hideUser?: boolean;
  precision?: boolean;
  precisionVariant?: 'reviews' | 'products' | 'categories' | 'inventory' | 'orders' | 'suppliers' | 'purchase-orders' | 'customers' | 'delivery' | 'coupons';
  onSearch?: (value: string) => void;
};

export const AdminTopbar = ({ compactUser = false, hideUser = false, onSearch, placeholder, precision = false, precisionVariant = 'reviews', user }: TopbarProps) => (
  <header className={cn('admin-topbar admin-panel sticky top-0 z-20 flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6 xl:px-8 xl:py-4', precision && 'admin-topbar-precision', precisionVariant === 'products' && 'admin-topbar-products', precisionVariant === 'categories' && 'admin-topbar-categories', precisionVariant === 'inventory' && 'admin-topbar-inventory', precisionVariant === 'orders' && 'admin-topbar-orders', precisionVariant === 'suppliers' && 'admin-topbar-suppliers', precisionVariant === 'purchase-orders' && 'admin-topbar-purchase-orders', precisionVariant === 'customers' && 'admin-topbar-customers', precisionVariant === 'delivery' && 'admin-topbar-delivery', precisionVariant === 'coupons' && 'admin-coupons-layout')}>
    <label className="admin-search flex min-h-[48px] xl:min-h-[56px] items-center gap-2.5 rounded-[18px] xl:rounded-[22px] px-4 w-full max-w-[360px] lg:max-w-[420px] xl:max-w-[540px]">
      <Search className="h-5 w-5 text-[var(--admin-muted)] shrink-0" aria-hidden="true" />
      <input
        aria-label="Search"
        className="w-full border-none bg-transparent text-[15px] xl:text-[17px] text-[var(--admin-text)] outline-none placeholder:text-[#6a7568]"
        placeholder={placeholder}
        type="search"
        onChange={(event) => onSearch?.(event.target.value)}
      />
    </label>
    <div className="flex items-center justify-between gap-3 lg:justify-end shrink-0">
      <div className="flex items-center gap-2 xl:gap-3">
        <button type="button" className={cn('admin-icon-button', precision && 'admin-topbar-icon-precision')} aria-label="Notifications">
          <Menu className="h-5 w-5 lg:hidden" aria-hidden="true" />
          <span className="hidden lg:inline"><Bell className="h-5 w-5" aria-hidden="true" /></span>
          {precisionVariant === 'categories' ? <span className="category-notification-dot" /> : null}
        </button>
        <button type="button" className={cn('admin-icon-button hidden lg:inline-flex', precision && 'admin-topbar-icon-precision')} aria-label="Help">
          <HelpCircle className="h-5 w-5" aria-hidden="true" />
        </button>
        {!compactUser ? (
          <button type="button" className={cn('admin-icon-button hidden lg:inline-flex', precision && 'admin-topbar-icon-precision')} aria-label="Apps">
            <Grid2x2 className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {!hideUser ? <div className="hidden h-9 xl:h-11 w-px bg-[var(--admin-outline-soft)] lg:block" /> : null}
      {!hideUser ? <div className="flex items-center gap-2.5 xl:gap-3">
        {!compactUser ? <div className="text-right">
          <div className="text-[14px] xl:text-[16px] font-semibold leading-5 truncate max-w-[180px]">{user.name}</div>
          <div className="text-[12px] xl:text-[14px] text-[var(--admin-muted)] truncate">{user.role}</div>
        </div> : null}
        <img alt={user.name} className="h-11 w-11 xl:h-13 xl:w-13 rounded-full border-2 border-white object-cover shadow-[0_8px_18px_rgba(7,48,16,0.12)] shrink-0" src={user.avatar} />
      </div> : null}
    </div>
  </header>
);

type LayoutProps = {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
  precision?: boolean;
  precisionVariant?: 'reviews' | 'products' | 'categories' | 'inventory' | 'orders' | 'suppliers' | 'purchase-orders' | 'customers' | 'delivery' | 'coupons';
};

export const AdminLayout = ({ sidebar, topbar, children, precision = false, precisionVariant = 'reviews' }: LayoutProps) => (
  <div className={cn('admin-page h-screen overflow-hidden p-2 sm:p-3 lg:p-4 xl:p-5 flex flex-col w-full min-w-0', precision && 'admin-reference-layout', precisionVariant === 'products' && 'admin-products-layout', precisionVariant === 'categories' && 'admin-categories-layout', precisionVariant === 'inventory' && 'admin-inventory-layout', precisionVariant === 'orders' && 'admin-orders-layout', precisionVariant === 'suppliers' && 'admin-suppliers-layout', precisionVariant === 'purchase-orders' && 'admin-purchase-orders-layout', precisionVariant === 'customers' && 'admin-customers-layout', precisionVariant === 'delivery' && 'admin-delivery-layout', precisionVariant === 'coupons' && 'admin-coupons-layout')}>
    <div className="mx-auto flex max-w-[1720px] flex-col gap-3 lg:gap-4 xl:gap-5 lg:flex-row h-full w-full min-w-0">
      <div className="shrink-0 lg:h-[calc(100vh-32px)] xl:h-[calc(100vh-40px)] flex flex-col">
        {sidebar}
      </div>
      <div className={cn('min-w-0 flex-1 flex flex-col h-full overflow-hidden', !precision && 'space-y-3 lg:space-y-4')}>
        <div className="shrink-0 z-20 relative">{topbar}</div>
        <div className="flex-1 overflow-y-auto pb-10 pr-1 lg:pr-2 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  </div>
);

type HeaderAction = {
  disabled?: boolean;
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  title?: string;
  tone?: 'primary' | 'secondary';
};

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: HeaderAction[];
};

export const AdminPageHeader = ({ eyebrow, title, description, actions = [] }: PageHeaderProps) => (
  <section className="flex flex-col gap-6 px-2 pt-4 lg:flex-row lg:items-start lg:justify-between lg:px-4">
    <div>
      {eyebrow ? <div className="mb-2 text-[15px] text-[var(--admin-muted)]">{eyebrow}</div> : null}
      <h1 className="text-[32px] font-bold leading-none tracking-[-0.03em] text-[var(--admin-text)] lg:text-[56px]">{title}</h1>
      <p className="mt-3 max-w-[760px] text-[18px] text-[#495648] lg:text-[20px]">{description}</p>
    </div>
    {actions.length ? (
      <div className="flex flex-wrap gap-4">
        {actions.map(({ disabled, label, icon: Icon, onClick, title, tone = 'secondary' }) => (
          <button key={label} type="button" disabled={disabled} onClick={onClick} title={title} className={cn('admin-button', tone === 'primary' ? 'admin-button-primary' : 'admin-button-secondary')}>
            {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : null}
            {label}
          </button>
        ))}
      </div>
    ) : null}
  </section>
);

const iconToneClasses = {
  success: 'bg-[#e4f5e9] text-[var(--admin-primary)]',
  danger: 'bg-[#ffe7eb] text-[var(--admin-danger)]',
  neutral: 'bg-[#eef4e8] text-[#6a7568]'
} as const;

export const MetricsGrid = ({ items }: { items: Metric[] }) => (
  <div className="grid gap-5 px-2 lg:grid-cols-4 lg:px-4">
    {items.map(({ badge, icon: Icon, subtitle, title, tone = 'neutral', value }) => (
      <article key={title} className="admin-metric-card p-6 lg:p-8">
        <div className="mb-8 flex items-start justify-between gap-3">
          <span className={cn('inline-flex h-18 w-18 items-center justify-center rounded-[22px]', iconToneClasses[tone])}>
            <Icon className="h-8 w-8" aria-hidden="true" />
          </span>
          {badge ? (
            <span className={cn('admin-stat-badge', tone === 'danger' ? 'bg-[#ffe6eb] text-[var(--admin-danger)]' : 'bg-[#e0f8ea] text-[var(--admin-primary)]')}>
              {badge}
            </span>
          ) : null}
        </div>
        <div className="text-[18px] text-[#4e5b4d]">{title}</div>
        <div className={cn('mt-2 text-[34px] font-bold leading-none lg:text-[56px]', tone === 'danger' && 'text-[var(--admin-danger)]')}>{value}</div>
        {subtitle ? <div className={cn('mt-4 text-[14px] lg:text-[16px]', tone === 'danger' ? 'text-[var(--admin-danger)]' : 'text-[#566253]')}>{subtitle}</div> : null}
      </article>
    ))}
  </div>
);

export const FilterChipRow = ({
  items,
  activeItem,
  trailing
}: {
  items: string[];
  activeItem: string;
  trailing?: ReactNode;
}) => (
  <div className="admin-panel admin-mobile-scroll flex flex-col gap-4 overflow-x-auto px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-7">
    <div className="flex min-w-max gap-3">
      {items.map((item) => (
        <button key={item} type="button" className={cn('admin-chip-button', item === activeItem && 'active')}>
          {item}
        </button>
      ))}
    </div>
    {trailing}
  </div>
);

export const DateFilter = ({ label }: { label: string }) => (
  <div className="flex items-center gap-4">
    <button type="button" className="admin-chip-button min-w-[320px] justify-start">
      <CalendarDays className="h-5 w-5" aria-hidden="true" />
      {label}
    </button>
    <button type="button" className="admin-icon-button" aria-label="More filters">
      <Filter className="h-5 w-5" aria-hidden="true" />
    </button>
  </div>
);

export const PanelHeader = ({
  title,
  badge,
  actions
}: {
  title: string;
  badge?: string;
  actions?: ReactNode;
}) => (
  <div className="flex flex-col gap-4 border-b border-[var(--admin-outline-soft)] px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
    <div className="flex items-center gap-4">
      <h2 className="text-[24px] font-semibold tracking-[-0.02em]">{title}</h2>
      {badge ? <span className="admin-mini-tag">{badge}</span> : null}
    </div>
    {actions}
  </div>
);

export const SelectButton = ({ label }: { label: string }) => (
  <button type="button" className="admin-button admin-button-secondary min-w-[180px] justify-between px-4">
    {label}
    <ChevronDown className="h-5 w-5" aria-hidden="true" />
  </button>
);

export const ToolbarButton = ({
  label,
  icon = SlidersHorizontal
}: {
  label: string;
  icon?: LucideIcon;
}) => {
  const Icon = icon;

  return (
    <button type="button" className="admin-button admin-button-secondary">
      <Icon className="h-5 w-5" aria-hidden="true" />
      {label}
    </button>
  );
};

export const ExportButton = ({ label = 'Export' }: { label?: string }) => (
  <button type="button" className="admin-button admin-button-secondary">
    <Download className="h-5 w-5" aria-hidden="true" />
    {label}
  </button>
);

export const PrintButton = ({ label = 'Print Invoice' }: { label?: string }) => (
  <button type="button" className="admin-button admin-button-secondary">
    <Printer className="h-5 w-5" aria-hidden="true" />
    {label}
  </button>
);

export const Pagination = ({ pages = ['1', '2', '3'], active = '1', withEllipsis = false, tail }: { pages?: string[]; active?: string; withEllipsis?: boolean; tail?: string }) => (
  <div className="flex items-center gap-3">
    <button type="button" className="admin-pagination-button" aria-label="Previous page">
      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
    </button>
    {pages.map((page) => (
      <button key={page} type="button" className={cn('admin-pagination-button', page === active && 'active')}>
        {page}
      </button>
    ))}
    {withEllipsis ? <span className="px-2 text-lg text-[var(--admin-muted)]">…</span> : null}
    {tail ? <button type="button" className="admin-pagination-button">{tail}</button> : null}
    <button type="button" className="admin-pagination-button" aria-label="Next page">
      <ChevronRight className="h-5 w-5" aria-hidden="true" />
    </button>
  </div>
);

export const StatusPill = ({ value }: { value: string }) => {
  const normalized = value.toLowerCase();
  const toneClass = normalized.includes('inactive') || normalized.includes('blocked') || normalized.includes('flagged') || normalized.includes('delayed')
    ? 'admin-status admin-status-danger'
    : normalized.includes('pending') || normalized.includes('unpaid')
      ? 'admin-status admin-status-muted'
      : normalized.includes('scheduled')
        ? 'admin-status admin-status-scheduled'
        : 'admin-status admin-status-success';

  return <span className={toneClass}>{value}</span>;
};

export const DataTable = ({
  columns,
  rows,
  footer,
  rightPanel
}: {
  columns: string[];
  rows: ReactNode[];
  footer?: ReactNode;
  rightPanel?: ReactNode;
}) => (
  <div className={cn('grid gap-6', rightPanel && 'lg:grid-cols-[minmax(0,1fr)_380px]')}>
    <div className="admin-panel overflow-hidden">
      <div className="grid min-w-full grid-cols-1">
        <div className="hidden border-b border-[var(--admin-outline-soft)] px-8 py-7 text-[15px] font-semibold uppercase tracking-[0.08em] text-[#536151] lg:grid" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
          {columns.map((column) => (
            <div key={column}>{column}</div>
          ))}
        </div>
        <div>{rows.map((row, index) => <Fragment key={index}>{row}</Fragment>)}</div>
      </div>
      {footer ? <div className="flex flex-col gap-4 border-t border-[var(--admin-outline-soft)] px-6 py-5 text-[15px] text-[#4a5748] lg:flex-row lg:items-center lg:justify-between lg:px-8">{footer}</div> : null}
    </div>
    {rightPanel}
  </div>
);

export const RowActions = () => (
  <div className="flex items-center justify-end gap-4">
    <button type="button" className="text-[#344433] transition hover:text-[var(--admin-primary)]" aria-label="Preview item">
      <Eye className="h-6 w-6" aria-hidden="true" />
    </button>
    <button type="button" className="text-[#344433] transition hover:text-[var(--admin-primary)]" aria-label="More actions">
      <EllipsisVertical className="h-6 w-6" aria-hidden="true" />
    </button>
  </div>
);

export const TableToggle = ({ checked = true }: { checked?: boolean }) => (
  <span className={cn('relative inline-flex h-10 w-16 items-center rounded-full transition', checked ? 'bg-[var(--admin-primary)]' : 'bg-[#cbd7c8]')}>
    <span className={cn('inline-block h-8 w-8 rounded-full bg-white shadow-[0_4px_10px_rgba(7,48,16,0.16)] transition', checked ? 'translate-x-8' : 'translate-x-1')} />
  </span>
);

export const AvatarBadge = ({ initials, image, tone = 'success' }: { initials?: string; image?: string; tone?: 'success' | 'danger' | 'neutral' }) => (
  image ? (
    <img alt="" className="h-14 w-14 rounded-full object-cover" src={image} />
  ) : (
    <span className={cn('inline-flex h-14 w-14 items-center justify-center rounded-full font-semibold', tone === 'danger' ? 'bg-[#ffe7eb] text-[var(--admin-danger)]' : tone === 'neutral' ? 'bg-[#ecefe9] text-[#596658]' : 'bg-[#d9f8e7] text-[var(--admin-primary)]')}>
      {initials}
    </span>
  )
);

export const TinyProductStack = ({ images, extra }: { images: string[]; extra?: string }) => (
  <div className="flex items-center gap-1">
    {images.map((image, index) => (
      <img key={`${image}-${index}`} alt="" className="h-10 w-10 rounded-xl border-2 border-white object-cover shadow-[0_4px_10px_rgba(7,48,16,0.08)]" src={image} />
    ))}
    {extra ? <span className="admin-mini-tag px-3 py-2 text-[13px]">{extra}</span> : null}
  </div>
);

export const SimpleSparkBars = ({ values }: { values: number[] }) => (
  <div className="mt-8 flex h-[132px] items-end gap-3">
    {values.map((value, index) => (
      <div key={index} className="w-10 rounded-t-[8px] bg-[#0b7b40]" style={{ height: `${value}%` }} />
    ))}
  </div>
);

export const MiniMap = ({ dots }: { dots: { left: string; top: string }[] }) => (
  <div className="relative h-[300px] overflow-hidden rounded-[24px] border border-[var(--admin-outline-soft)] bg-[linear-gradient(135deg,#ecefe9_0%,#dfe6dc_100%)]">
    <div className="absolute inset-0 opacity-55" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
    {dots.map((dot, index) => (
      <span key={index} className="absolute h-3 w-3 rounded-full bg-[var(--admin-primary)] shadow-[0_0_0_8px_rgba(6,119,47,0.14)]" style={dot} />
    ))}
  </div>
);

export const AuthDivider = () => (
  <div className="relative flex items-center justify-center py-2">
    <div className="absolute inset-x-0 border-t border-[var(--admin-outline)]" />
    <span className="relative bg-white px-4 text-sm uppercase tracking-[0.12em] text-[var(--admin-muted)]">Or sign in with</span>
  </div>
);

export const SecurityFooter = ({ links }: { links: string[] }) => (
  <footer className="mt-10 text-center">
    <div className="text-[18px] text-[#6c7869]">Protected by enterprise-grade 256-bit encryption.</div>
    <div className="mt-5 flex flex-wrap items-center justify-center gap-8 text-[15px] text-[var(--admin-text)]">
      {links.map((link) => (
        <Link key={link} className="transition hover:text-[var(--admin-primary)]" to="/">
          {link}
        </Link>
      ))}
    </div>
  </footer>
);

export const ActionRow = ({ left, right }: { left: ReactNode; right: ReactNode }) => (
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div className="flex flex-wrap gap-4">{left}</div>
    <div className="flex flex-wrap gap-4">{right}</div>
  </div>
);

export const ActionIcons = () => (
  <div className="flex items-center justify-end gap-5 text-[#2f3e2e]">
    <button type="button" className="transition hover:text-[var(--admin-primary)]" aria-label="Share">
      <Share2 className="h-6 w-6" aria-hidden="true" />
    </button>
    <button type="button" className="transition hover:text-[var(--admin-primary)]" aria-label="Upload">
      <Upload className="h-6 w-6" aria-hidden="true" />
    </button>
  </div>
);

export const Stars = () => (
  <div className="flex gap-1 text-[var(--admin-primary)]">
    {Array.from({ length: 5 }).map((_, index) => (
      <Star key={index} className="h-4 w-4 fill-current" aria-hidden="true" />
    ))}
  </div>
);
