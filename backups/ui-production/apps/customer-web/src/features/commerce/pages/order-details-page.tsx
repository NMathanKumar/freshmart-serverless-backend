import { Suspense } from 'react';
import { Badge } from '@freshmart/design-system';
import { ArrowLeft, CalendarDays, CreditCard, MapPin, Package2, ReceiptText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import * as shared from '@freshmart/shared';

const { customerRoutePaths } = shared;
import { useGetOrderQuery } from '../api/commerce-api.js';
import { CommerceShell } from '../components/commerce-layout.js';
import { CommerceState, ListSkeleton } from '../components/commerce-state.js';
import { OrderDetailSummary, formatCurrency, formatDate } from './orders-page.js';

const OrderDetailsContent = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { data, isError, isLoading, refetch } = useGetOrderQuery(orderId);

  return (
    <CommerceShell active="orders" showBack title="Order Details">
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-28 md:px-10">
        <div className="mb-8">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#006b2c] hover:underline" to={customerRoutePaths.orders}>
            <ArrowLeft className="h-4 w-4" />Back to orders
          </Link>
        </div>

        {isLoading && <ListSkeleton count={3} />}
        {isError && <CommerceState description="We could not load this order right now. Please retry." onAction={() => void refetch()} title="Order unavailable" />}
        {!isLoading && !isError && !data && <CommerceState description="This order could not be found in your account." icon="empty" title="Order not found" />}
        {!isLoading && !isError && data && (
          <div className="space-y-6">
            <section className="rounded-3xl border border-[#bdcaba]/40 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col gap-4 border-b border-[#bdcaba]/30 pb-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold text-[#171d16]">{data.orderId}</h1>
                    <Badge tone="neutral">{data.orderStatusLabel}</Badge>
                    <Badge tone={data.paymentStatus === 'SUCCESS' ? 'success' : data.paymentStatus === 'FAILED' ? 'danger' : 'warning'}>{data.paymentStatusLabel}</Badge>
                  </div>
                  <p className="mt-2 text-[#3e4a3d]">Placed on {formatDate(data.orderDate)}</p>
                </div>
                <Link className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-fresh-500)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[color:rgba(26,127,55,0.22)] transition-colors hover:bg-[color:var(--color-fresh-600)]" to={customerRoutePaths.orders}>
                  View all orders
                </Link>
              </div>

              <div className="mt-6">
                <OrderDetailSummary order={data} />
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
              <article className="rounded-3xl border border-[#bdcaba]/40 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <div className="mb-5 flex items-center gap-2">
                  <Package2 className="h-5 w-5 text-[#006b2c]" />
                  <h2 className="text-xl font-semibold">Items</h2>
                </div>
                <div className="space-y-4">
                  {data.items.map((item) => (
                    <div className="flex flex-col gap-3 rounded-2xl bg-[#f4fcf0] p-4 md:flex-row md:items-center md:justify-between" key={`${data.orderId}-${item.productId}-${item.quantity}`}>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#171d16]">{item.productName}</p>
                        <p className="text-sm text-[#3e4a3d]">Product ID: {item.productId}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-[#3e4a3d]">
                        <span>Qty {item.quantity}</span>
                        <span>Unit {formatCurrency(item.unitPrice)}</span>
                        <span className="font-semibold text-[#171d16]">{formatCurrency(item.totalPrice)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <aside className="space-y-6">
                <article className="rounded-3xl border border-[#bdcaba]/40 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                  <div className="mb-5 flex items-center gap-2">
                    <ReceiptText className="h-5 w-5 text-[#006b2c]" />
                    <h2 className="text-xl font-semibold">Order Summary</h2>
                  </div>
                  <div className="space-y-3 text-sm text-[#3e4a3d]">
                    <SummaryLine label="Items" value={`${data.totalQuantity} unit${data.totalQuantity === 1 ? '' : 's'}`} />
                    <SummaryLine label="Subtotal" value={formatCurrency(data.subtotal)} />
                    <SummaryLine label="Tax" value={formatCurrency(data.tax)} />
                    <SummaryLine label="Discount" value={formatCurrency(data.discount)} />
                    <SummaryLine label="Total" strong value={formatCurrency(data.totalAmount)} />
                  </div>
                </article>

                <article className="rounded-3xl border border-[#bdcaba]/40 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                  <div className="mb-5 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#006b2c]" />
                    <h2 className="text-xl font-semibold">Payment</h2>
                  </div>
                  <p className="font-semibold text-[#171d16]">{data.paymentStatusLabel}</p>
                </article>

                <article className="rounded-3xl border border-[#bdcaba]/40 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                  <div className="mb-5 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#006b2c]" />
                    <h2 className="text-xl font-semibold">Delivery Address</h2>
                  </div>
                  <p className="text-sm leading-7 text-[#3e4a3d]">{data.deliveryAddress ?? 'Delivery address is not available for this order.'}</p>
                </article>

                <article className="rounded-3xl border border-[#bdcaba]/40 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                  <div className="mb-5 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-[#006b2c]" />
                    <h2 className="text-xl font-semibold">Fulfillment</h2>
                  </div>
                  <p className="text-sm text-[#3e4a3d]">{data.pickupTime ? `Pickup window: ${formatDate(data.pickupTime)}` : 'Pickup or delivery timing is not available for this order yet.'}</p>
                </article>
              </aside>
            </section>
          </div>
        )}
      </main>
    </CommerceShell>
  );
};

const SummaryLine = ({ label, strong = false, value }: { label: string; strong?: boolean; value: string }) => (
  <div className={`flex items-center justify-between gap-4 ${strong ? 'border-t border-[#bdcaba]/30 pt-3 text-base font-semibold text-[#171d16]' : ''}`}>
    <span>{label}</span>
    <span className={strong ? 'text-[#171d16]' : 'font-semibold text-[#171d16]'}>{value}</span>
  </div>
);

export default function OrderDetailsPage() {
  return <Suspense fallback={<CommerceShell active="orders" showBack title="Order Details"><main className="mx-auto max-w-6xl px-4 pb-12 pt-28 md:px-10"><ListSkeleton count={3} /></main></CommerceShell>}><OrderDetailsContent /></Suspense>;
}
