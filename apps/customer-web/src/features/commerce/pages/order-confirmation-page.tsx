import { useState, Suspense } from 'react';
import {
  Download,
  MapPin,
  Share2,
  ShoppingCart,
  Truck,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { HomeHeader } from '../../home/components/home-header.js';
import { HomeFooter } from '../../home/components/home-footer.js';
import { useGetOrderQuery } from '../api/commerce-api.js';

const formatINR = (amount: number) => `₹${Number(amount || 0).toFixed(2)}`;

const CONFETTI_PIECES = Array.from({ length: 45 }, (_, i) => ({
  id: i,
  left: `${(i * 2.2 + (i % 5) * 3) % 98}%`,
  delay: `${(i * 0.15) % 4.5}s`,
  duration: `${3 + (i % 4) * 0.8}s`,
  color: [
    '#006b2c',
    '#005422',
    '#2b4c1d',
    '#e05263',
    '#b81d13',
    '#f4b400',
    '#0f9d58',
    '#4285f4',
  ][i % 8],
  size:
    i % 3 === 0
      ? 'w-2.5 h-2.5 rounded-full'
      : i % 3 === 1
        ? 'w-3 h-1.5 rounded-xs'
        : 'w-2 h-2 rotate-45',
}));

const ConfettiRain = () => (
  <div
    className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    aria-hidden="true"
  >
    <style>{`
      @keyframes confettiRain {
        0% {
          transform: translateY(-20px) rotate(0deg);
          opacity: 1;
        }
        80% {
          opacity: 0.8;
        }
        100% {
          transform: translateY(105vh) rotate(720deg);
          opacity: 0;
        }
      }
    `}</style>
    {CONFETTI_PIECES.map((piece) => (
      <span
        key={piece.id}
        className={`absolute top-0 opacity-0 shadow-xs ${piece.size}`}
        style={{
          left: piece.left,
          backgroundColor: piece.color,
          animation: `confettiRain ${piece.duration} linear infinite`,
          animationDelay: piece.delay,
        }}
      />
    ))}
  </div>
);

const OrderConfirmationContent = () => {
  const [searchParams] = useSearchParams();
  const rawOrderId = searchParams.get('orderId') || 'FM-102938';
  const { data: realOrder } = useGetOrderQuery(rawOrderId, { pollingInterval: 10000 });
  const [copied, setCopied] = useState(false);

  const displayOrderId = realOrder?.orderId || rawOrderId;
  const displayStatus = (realOrder?.orderStatus || realOrder?.status || 'PLACED').toUpperCase();
  const displayPaymentId = realOrder?.paymentId || (realOrder as any)?.paymentStatus === 'SUCCESS' ? 'PAY_SUCCESS' : null;
  const displayAddress =
    realOrder?.deliveryAddress ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('freshmart_selected_address') : null) ||
    'Flat 402, Green Park Apartments, Indiranagar, Bengaluru 560038';
  
  const displaySubtotal = Number(realOrder?.itemSubtotal ?? realOrder?.subtotal ?? 2.99);
  const displayPlatformFee = Number(realOrder?.platformFee ?? 1.50);
  const displayTax = Number(realOrder?.taxes ?? realOrder?.tax ?? 1.35);
  const displayDeliveryFee = Number(realOrder?.deliveryFee ?? 0);
  const displayTotal = Number((displaySubtotal + displayPlatformFee + displayTax + displayDeliveryFee).toFixed(2));
  const items = (realOrder?.items && realOrder.items.length > 0)
    ? realOrder.items
    : [
        {
          productId: 'PROD-001',
          productName: 'Artisanal Whole Wheat Bread',
          quantity: 1,
          unitPrice: displaySubtotal,
          totalPrice: displaySubtotal,
        },
      ];

  const handleDownloadInvoice = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>FreshMart_Invoice_${displayOrderId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #171d16; margin: 0; padding: 40px; background: #fff; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #006b2c; padding-bottom: 20px; }
    .brand { font-size: 28px; font-weight: 900; color: #006b2c; }
    .invoice-title { font-size: 20px; font-weight: 800; text-align: right; }
    .meta-grid { display: flex; justify-content: space-between; margin-top: 30px; }
    .meta-box h4 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #8b9888; font-weight: 800; }
    .meta-box p { margin: 0; font-size: 13px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-top: 30px; }
    th { background: #eff6ea; text-align: left; padding: 12px 16px; font-size: 11px; text-transform: uppercase; color: #006b2c; font-weight: 800; }
    td { padding: 14px 16px; border-bottom: 1px solid #e2ebdE; font-size: 13px; font-weight: 600; }
    .totals { margin-top: 25px; width: 320px; margin-left: auto; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; font-weight: 600; color: #3e4a3d; }
    .totals-row.grand { border-top: 2px solid #006b2c; padding-top: 12px; margin-top: 8px; font-size: 18px; font-weight: 900; color: #006b2c; }
    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #8b9888; border-top: 1px solid #e2ebdE; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">FreshMart•</div>
      <p style="margin:4px 0 0 0;font-size:12px;color:#6e7b6c;">Premium Organic Groceries & Fresh Produce</p>
    </div>
    <div class="invoice-title">
      TAX INVOICE<br />
      <span style="font-size:12px;font-weight:600;color:#8b9888;">Order #${displayOrderId}</span>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-box">
      <h4>Billed & Delivered To</h4>
      <p>${displayAddress}</p>
    </div>
    <div class="meta-box" style="text-align:right;">
      <h4>Order Information</h4>
      <p>Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
      <p>Payment: PAID (Credit / Debit / UPI)</p>
      <p>Status: CONFIRMED</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item Description</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Unit Price</th>
        <th style="text-align:right;">Total Amount</th>
      </tr>
    </thead>
    <tbody>
      ${items
        .map(
          (item: any) => `
        <tr>
          <td>${item.productName || item.name || 'Organic Product'}</td>
          <td style="text-align:center;">${item.quantity || 1}</td>
          <td style="text-align:right;">${formatINR(item.unitPrice || item.price || displaySubtotal)}</td>
          <td style="text-align:right;">${formatINR(item.totalPrice || (item.price || displaySubtotal) * (item.quantity || 1))}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Item Subtotal:</span>
      <span>${formatINR(displaySubtotal)}</span>
    </div>
    <div class="totals-row">
      <span>Delivery Fee:</span>
      <span style="color:#006b2c;">FREE</span>
    </div>
    <div class="totals-row">
      <span>Platform Fee:</span>
      <span>${formatINR(displayPlatformFee)}</span>
    </div>
    <div class="totals-row">
      <span>Taxes (GST):</span>
      <span>${formatINR(displayTax)}</span>
    </div>
    <div class="totals-row grand">
      <span>Grand Total:</span>
      <span>${formatINR(displayTotal)}</span>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for shopping with FreshMart! For customer support, visit support.freshmart.com</p>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FreshMart_Invoice_${displayOrderId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareOrder = async () => {
    const shareData = {
      title: 'FreshMart Order Details',
      text: `Track my FreshMart order #${displayOrderId}!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (_) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (_) {
      // Ignore
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4fcf0] font-sans text-[#171d16]">
      <ConfettiRain />
      <HomeHeader variant="cart" />

      {/* Floating Copied Toast */}
      {copied && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[#006b2c] px-4 py-3 text-xs font-bold text-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="h-4 w-4" />
          <span>Order tracking link copied to clipboard!</span>
        </div>
      )}

      <main className="mx-auto max-w-4xl space-y-8 px-4 pt-24 pb-16 sm:px-6 md:px-8">
        {/* Hero Celebration Banner */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="relative flex h-56 w-full max-w-sm items-center justify-center">
            <div className="absolute inset-0 scale-110 animate-pulse rounded-full bg-[#006b2c]/10 opacity-60 blur-3xl" />
            <img
              alt="Grocery bag with fresh produce"
              className="relative z-10 h-full w-full object-contain mix-blend-multiply"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKOY3UJuc1cVmubfkC2th74wHXp7fxwoDXs7fSUGT5cx_zNrp08pRLj3QN6OcZdPlft-ZvvfblppHNqIn_SLxk39hV-lTEIkLdReh4UOQ4D3kBL1P5RB8pR4535juKQY7EkyPgWnYcjFTBdnoHh1H7U8K0P8CooeTfID7crgupsM5-ap97XLMa5hV9oRIX_R01HaFngZbFVX-InBOh6eWAeZuCOUKQYMnl_Gw8uVt0P8BIs7VdxiQUIKAJ5qFeC2MAasteTEJSlkUj"
            />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-[#171d16] sm:text-4xl">
              Thank You!
            </h1>
            <p className="max-w-lg text-sm font-semibold text-[#8b9888] sm:text-base">
              Order{' '}
              <strong className="text-[#171d16]">#{displayOrderId}</strong>{' '}
              successfully placed! Sit back and relax while we prepare your
              fresh finds.
            </p>
          </div>
        </div>

        {/* Delivery Tracking Card */}
        <div className="space-y-6 rounded-[28px] border border-[#e2ebdE] bg-white p-6 shadow-xs sm:p-8">
          {/* Estimated Delivery Banner */}
          <div className="flex items-center gap-3 rounded-2xl border border-[#bdcaba]/30 bg-[#eff6ea] p-4 text-[#006c4a]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#006b2c] text-white shadow-xs">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[11px] font-black tracking-wider text-[#8b9888] uppercase">
                Estimated Delivery
              </span>
              <span className="text-base font-black text-[#171d16]">
                Arriving in 12 mins
              </span>
            </div>
          </div>

          {/* Order Meta Grid */}
          <div className="grid grid-cols-1 gap-6 border-b border-[#e2ebdE] pb-6 sm:grid-cols-2">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#8b9888]" />
              <div>
                <p className="text-xs font-bold text-[#8b9888]">
                  Delivery Address
                </p>
                <p className="mt-1 text-xs leading-relaxed font-extrabold text-[#171d16]">
                  {displayAddress}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-[#8b9888]" />
              <div>
                <p className="text-xs font-bold text-[#8b9888]">
                  Payment & Total
                </p>
                <p className="mt-1 text-xs leading-relaxed font-extrabold text-[#171d16]">
                  Paid Online (Card / UPI)
                  <br />
                  <strong className="text-sm font-black text-[#006c4a]">
                    {formatINR(displayTotal)} Paid
                  </strong>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              className="flex h-13 w-full items-center justify-center rounded-2xl bg-[#006b2c] text-sm font-extrabold text-white shadow-md transition-all hover:bg-[#005422] active:scale-98"
              to={`/orders/${encodeURIComponent(displayOrderId)}`}
            >
              Track Order
            </Link>

            <div className="grid grid-cols-3 gap-3">
              {/* Professional Printable Invoice Button */}
              <button
                className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#e2ebdE] bg-white p-3.5 text-xs font-extrabold text-[#3e4a3d] shadow-2xs transition-all hover:border-[#006b2c] hover:bg-[#eff6ea] active:scale-95"
                onClick={handleDownloadInvoice}
                title="Download / Print Official Tax Invoice"
                type="button"
              >
                <Download className="h-4 w-4 text-[#006b2c]" />
                <span>Invoice</span>
              </button>

              {/* Continue Shopping Button */}
              <Link
                className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#e2ebdE] bg-white p-3.5 text-xs font-extrabold text-[#3e4a3d] shadow-2xs transition-all hover:border-[#006b2c] hover:bg-[#eff6ea] active:scale-95"
                title="Continue Shopping"
                to="/"
              >
                <ShoppingCart className="h-4 w-4 text-[#006b2c]" />
                <span>Continue</span>
              </Link>

              {/* Share Order Link Button */}
              <button
                className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#e2ebdE] bg-white p-3.5 text-xs font-extrabold text-[#3e4a3d] shadow-2xs transition-all hover:border-[#006b2c] hover:bg-[#eff6ea] active:scale-95"
                onClick={handleShareOrder}
                title="Share Order Tracking Link"
                type="button"
              >
                <Share2 className="h-4 w-4 text-[#006b2c]" />
                <span>{copied ? 'Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
};

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4fcf0]" />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
