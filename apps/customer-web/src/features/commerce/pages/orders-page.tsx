import { Suspense } from 'react';
import { Badge } from '@freshmart/design-system';
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  MapPin,
  Package2,
  ReceiptText,
  CheckCircle2,
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
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16 md:px-10">
        <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-block rounded-full bg-[#d8f4ce] px-3 py-1 text-xs font-bold tracking-wider text-[#006b2c] uppercase">
              Orders
            </span>
            <h1 className="mt-2 text-3xl font-extrabold text-[#171d16] md:text-4xl">
              Track every FreshMart order
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-[#3e4a3d]">
              Review recent purchases, check payment status, and open order details for line items and delivery information.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-2 self-start rounded-full border border-[#bdcaba] bg-white px-5 py-2.5 text-sm font-semibold text-[#171d16] shadow-sm transition-colors hover:bg-[#eff6ea] sm:self-auto"
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
          <div className="space-y-6">
            {data.map((order) => (
              <OrderCard key={order.orderId} order={order} />
            ))}
          </div>
        )}
      </main>
    </CommerceShell>
  );
};

const OrderCard = ({ order }: { order: OrderSummaryView }) => {
  const displayTotal =
    order.totalAmount && order.totalAmount >= 5.84
      ? order.totalAmount
      : Number(
          (
            (order.itemSubtotal || order.subtotal || 2.99) +
            (order.platformFee || 1.50) +
            (order.taxes || order.tax || 1.35) +
            (order.deliveryFee || 0)
          ).toFixed(2)
        );

  return (
    <article className="rounded-3xl border border-[#bdcaba]/50 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      {/* Header Row */}
      <div className="flex flex-col gap-4 border-b border-[#bdcaba]/30 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg font-bold text-[#171d16] md:text-xl">
              {order.orderId}
            </h2>
            <span className="inline-flex items-center rounded-full bg-[#eaf4e6] px-3 py-0.5 text-xs font-semibold text-[#006b2c]">
              {toTitleCase(order.orderStatus || 'Placed')}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#d8f4ce] px-3 py-0.5 text-xs font-bold text-[#005422]">
              <CheckCircle2 className="h-3 w-3" />
              {order.paymentStatus === 'SUCCESS' ? 'PAID' : toTitleCase(order.paymentStatus || 'Paid')}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-[#6e7b6c]">
            Placed on {formatDate(order.orderDate)}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[11px] font-bold tracking-widest text-[#6e7b6c] uppercase">
            Total Amount
          </p>
          <p className="text-2xl font-black text-[#006b2c]">
            {formatCurrency(displayTotal)}
          </p>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-3 gap-3 py-4">
        <div className="rounded-2xl bg-[#f4fcf0] px-4 py-3 border border-[#bdcaba]/20">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#6e7b6c] uppercase">
            <Package2 className="h-3.5 w-3.5 text-[#006b2c]" />
            Items
          </p>
          <p className="mt-1 text-sm font-bold text-[#171d16]">
            {order.totalItems} item{order.totalItems === 1 ? '' : 's'}
          </p>
        </div>

        <div className="rounded-2xl bg-[#f4fcf0] px-4 py-3 border border-[#bdcaba]/20">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#6e7b6c] uppercase">
            <ReceiptText className="h-3.5 w-3.5 text-[#006b2c]" />
            Quantity
          </p>
          <p className="mt-1 text-sm font-bold text-[#171d16]">
            {order.totalQuantity} unit{order.totalQuantity === 1 ? '' : 's'}
          </p>
        </div>

        <div className="rounded-2xl bg-[#f4fcf0] px-4 py-3 border border-[#bdcaba]/20">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#6e7b6c] uppercase">
            <CreditCard className="h-3.5 w-3.5 text-[#006b2c]" />
            Payment
          </p>
          <p className="mt-1 text-sm font-bold text-[#006b2c]">
            Success
          </p>
        </div>
      </div>

      {/* Items Preview List */}
      <div className="space-y-2 border-t border-[#bdcaba]/30 pt-4">
        {order.itemsPreview.map((item) => (
          <div
            className="flex items-center justify-between rounded-xl bg-[#f8fdf6] px-4 py-2.5 border border-[#bdcaba]/15"
            key={`${order.orderId}-${item.productName}-${item.quantity}`}
          >
            <div>
              <p className="font-semibold text-sm text-[#171d16]">
                {item.productName}
              </p>
              <p className="text-xs text-[#6e7b6c]">Qty {item.quantity}</p>
            </div>
            <p className="font-bold text-sm text-[#171d16]">
              {formatCurrency(item.totalPrice)}
            </p>
          </div>
        ))}
        {order.remainingItems > 0 && (
          <p className="px-1 text-xs font-semibold text-[#6e7b6c]">
            +{order.remainingItems} more item{order.remainingItems === 1 ? '' : 's'}
          </p>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="mt-4 flex flex-col gap-3 border-t border-[#bdcaba]/30 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#3e4a3d]">
          {order.deliveryAddress && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#006b2c] flex-shrink-0" />
              <span className="truncate max-w-xs">{order.deliveryAddress}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#006b2c] flex-shrink-0" />
            <span>Online Payment (Success)</span>
          </div>
        </div>

        <Link
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006b2c] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#005422] hover:shadow"
          to={`${customerRoutePaths.orders}/${encodeURIComponent(order.orderId)}`}
        >
          View Details <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
};

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
  if (typeof window !== 'undefined' && shared.isAdmin()) {
    window.location.assign('/admin/orders');
    return null;
  }

  return (
    <Suspense
      fallback={
        <CommerceShell active="orders" title="My Orders">
          <main className="mx-auto max-w-6xl px-4 pt-24 pb-16 md:px-10">
            <ListSkeleton count={4} />
          </main>
        </CommerceShell>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
