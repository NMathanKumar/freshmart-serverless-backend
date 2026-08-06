import { Suspense } from 'react';
import { Badge } from '@freshmart/design-system';
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  MapPin,
  Package2,
  ReceiptText,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as shared from '@freshmart/shared';

const { customerRoutePaths } = shared;
import { useGetOrdersQuery } from '../api/commerce-api.js';
import { CommerceShell } from '../components/commerce-layout.js';
import { CommerceState, ListSkeleton } from '../components/commerce-state.js';
import type {
  OrderDetailView,
  OrderSummaryView,
} from '../model/order-content.js';

const OrdersContent = () => {
  const { data = [], isError, isLoading, refetch } = useGetOrdersQuery();

  return (
    <CommerceShell active="orders" title="My Orders">
      <main className="mx-auto max-w-6xl px-4 pt-28 pb-12 md:px-10">
        <section className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-[#006b2c] uppercase">
              Orders
            </p>
            <h1 className="text-3xl font-bold md:text-4xl">
              Track every FreshMart order
            </h1>
            <p className="mt-2 max-w-2xl text-[#3e4a3d]">
              Review recent purchases, check payment status, and open order
              details for line items and delivery information.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-2 self-start rounded-full border border-[#bdcaba] bg-white px-5 py-3 text-sm font-semibold text-[#171d16] transition-colors hover:bg-[#eff6ea]"
            to={customerRoutePaths.home}
          >
            Continue shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {isLoading && <ListSkeleton count={4} />}
        {isError && (
          <CommerceState
            description="We could not load your orders right now. Please retry."
            onAction={() => void refetch()}
            title="Orders unavailable"
          />
        )}
        {!isLoading && !isError && data.length === 0 && (
          <CommerceState
            description="Your completed purchases will appear here as soon as you place your first order."
            icon="empty"
            title="No orders yet"
          />
        )}
        {!isLoading && !isError && data.length > 0 && (
          <div className="space-y-5">
            {data.map((order) => (
              <OrderCard key={order.orderId} order={order} />
            ))}
          </div>
        )}
      </main>
    </CommerceShell>
  );
};

const OrderCard = ({ order }: { order: OrderSummaryView }) => (
  <article className="rounded-3xl border border-[#bdcaba]/40 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
    <div className="flex flex-col gap-4 border-b border-[#bdcaba]/30 pb-5 md:flex-row md:items-start md:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold text-[#171d16]">
            {order.orderId}
          </h2>
          <StatusBadge tone="neutral" value={order.orderStatus} />
          <StatusBadge
            tone={
              order.paymentStatus === 'SUCCESS'
                ? 'success'
                : order.paymentStatus === 'FAILED'
                  ? 'danger'
                  : 'warning'
            }
            value={order.paymentStatus}
          />
        </div>
        <p className="mt-2 text-sm text-[#3e4a3d]">
          Placed on {formatDate(order.orderDate)}
        </p>
      </div>
      <div className="text-left md:text-right">
        <p className="text-sm font-semibold tracking-[0.18em] text-[#6e7b6c] uppercase">
          Total
        </p>
        <p className="text-2xl font-bold text-[#006b2c]">
          {formatCurrency(order.totalAmount)}
        </p>
      </div>
    </div>

    <div className="grid gap-4 py-5 md:grid-cols-3">
      <InfoRow
        icon={<Package2 className="h-4 w-4" />}
        label="Items"
        value={`${order.totalItems} item${order.totalItems === 1 ? '' : 's'}`}
      />
      <InfoRow
        icon={<ReceiptText className="h-4 w-4" />}
        label="Quantity"
        value={`${order.totalQuantity} unit${order.totalQuantity === 1 ? '' : 's'}`}
      />
      <InfoRow
        icon={<CalendarDays className="h-4 w-4" />}
        label="Payment"
        value={order.paymentStatusLabel}
      />
    </div>

    <div className="space-y-3 border-t border-[#bdcaba]/30 pt-5">
      {order.itemsPreview.map((item) => (
        <div
          className="flex items-center justify-between gap-4 rounded-2xl bg-[#f4fcf0] px-4 py-3"
          key={`${order.orderId}-${item.productName}-${item.quantity}`}
        >
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#171d16]">
              {item.productName}
            </p>
            <p className="text-sm text-[#3e4a3d]">Qty {item.quantity}</p>
          </div>
          <p className="font-semibold whitespace-nowrap text-[#171d16]">
            {formatCurrency(item.totalPrice)}
          </p>
        </div>
      ))}
      {order.remainingItems > 0 && (
        <p className="text-sm font-semibold text-[#3e4a3d]">
          +{order.remainingItems} more item
          {order.remainingItems === 1 ? '' : 's'}
        </p>
      )}
    </div>

    <div className="mt-5 flex flex-col gap-3 border-t border-[#bdcaba]/30 pt-5 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        {order.deliveryAddress && (
          <div className="flex items-start gap-2 text-sm text-[#3e4a3d]">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#006b2c]" />
            <span>{order.deliveryAddress}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-[#3e4a3d]">
          <CreditCard className="h-4 w-4 text-[#006b2c]" />
          <span>{order.paymentStatusLabel}</span>
        </div>
      </div>
      <Link
        className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-fresh-500)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:rgba(26,127,55,0.22)] transition-colors hover:bg-[color:var(--color-fresh-600)]"
        to={`${customerRoutePaths.orders}/${encodeURIComponent(order.orderId)}`}
      >
        View Details
      </Link>
    </div>
  </article>
);

const StatusBadge = ({
  tone,
  value,
}: {
  tone: 'danger' | 'neutral' | 'success' | 'warning';
  value: string;
}) => <Badge tone={tone}>{toTitleCase(value)}</Badge>;

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="rounded-2xl bg-[#eff6ea] px-4 py-3">
    <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-[#6e7b6c] uppercase">
      {icon}
      {label}
    </p>
    <p className="font-semibold text-[#171d16]">{value}</p>
  </div>
);

export const OrderDetailSummary = ({ order }: { order: OrderDetailView }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <SummaryCard label="Order date" value={formatDate(order.orderDate)} />
    <SummaryCard label="Order status" value={toTitleCase(order.orderStatus)} />
    <SummaryCard label="Payment status" value={order.paymentStatusLabel} />
    <SummaryCard label="Total" value={formatCurrency(order.totalAmount)} />
  </div>
);

const SummaryCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl bg-[#eff6ea] px-4 py-4">
    <p className="text-xs font-semibold tracking-[0.18em] text-[#6e7b6c] uppercase">
      {label}
    </p>
    <p className="mt-2 font-semibold text-[#171d16]">{value}</p>
  </div>
);

export const formatDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
    Number.isFinite(value) ? value : 0
  );

const toTitleCase = (value: string) =>
  value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <CommerceShell active="orders" title="My Orders">
          <main className="mx-auto max-w-6xl px-4 pt-28 pb-12 md:px-10">
            <ListSkeleton count={4} />
          </main>
        </CommerceShell>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
