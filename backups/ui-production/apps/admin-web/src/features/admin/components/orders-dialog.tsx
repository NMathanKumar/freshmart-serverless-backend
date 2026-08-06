import { useEffect, useRef, useState } from 'react';
import { Check, Clock3, CreditCard, MapPin, PackageCheck, Printer, UserRound, X } from 'lucide-react';
import { useDialogAccessibility } from '../hooks/use-dialog-accessibility.js';

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Unpaid' | 'Refunded';
export type DeliveryStatus = 'Preparing' | 'In Transit' | 'Delivered' | 'Not Scheduled' | 'Cancelled';

export type OrderRecord = {
  address: string;
  amount: number;
  customer: string;
  date: string;
  deliveryStatus: DeliveryStatus;
  email: string;
  id: string;
  initials: string;
  itemsCount: number;
  orderStatus: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  phone: string;
  products: string[];
};

export type OrdersDialogKind = 'details' | 'status' | 'customer' | 'payment' | 'delivery' | 'invoice';

type OrdersDialogProps = {
  kind: OrdersDialogKind;
  onClose: () => void;
  onNavigate: (kind: OrdersDialogKind) => void;
  onSave: (order: OrderRecord) => void;
  open: boolean;
  order?: OrderRecord;
};

const deliverySteps = ['Order Placed', 'Payment Confirmed', 'Processing and Packing', 'Shipped', 'Delivered'];

export const OrdersDialog = ({ kind, onClose, onNavigate, onSave, open, order }: OrdersDialogProps) => {
  const [nextStatus, setNextStatus] = useState<OrderStatus>('Pending');
  const selectRef = useRef<HTMLSelectElement>(null);
  useDialogAccessibility(open, onClose, selectRef);

  useEffect(() => {
    if (!open || !order) return;
    setNextStatus(order.orderStatus);
  }, [open, order]);

  if (!open || !order) return null;

  const titles: Record<OrdersDialogKind, string> = {
    customer: 'Customer Information',
    delivery: 'Delivery Timeline',
    details: 'Order Details',
    invoice: 'Invoice Preview',
    payment: 'Payment Details',
    status: 'Update Order Status'
  };
  const completedSteps = order.orderStatus === 'Delivered' ? 5 : order.orderStatus === 'Shipped' ? 4 : order.orderStatus === 'Processing' ? 3 : 2;

  return (
    <div className="category-dialog-backdrop orders-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="category-dialog orders-dialog" role="dialog" aria-modal="true" aria-labelledby="orders-dialog-title">
        <header>
          <div><h2 id="orders-dialog-title">{titles[kind]}</h2><p>{order.id} - {order.date}</p></div>
          <button type="button" onClick={onClose} aria-label="Close dialog"><X aria-hidden="true" /></button>
        </header>

        {kind === 'details' ? (
          <div className="orders-details-content">
            <section className="orders-dialog-customer"><span>{order.initials}</span><div><strong>{order.customer}</strong><small>{order.email} - {order.phone}</small></div></section>
            <dl>
              <div><dt>Order Total</dt><dd>${order.amount.toFixed(2)}</dd></div>
              <div><dt>Items</dt><dd>{order.itemsCount}</dd></div>
              <div><dt>Payment</dt><dd>{order.paymentStatus}</dd></div>
              <div><dt>Order Status</dt><dd>{order.orderStatus}</dd></div>
              <div><dt>Delivery</dt><dd>{order.deliveryStatus}</dd></div>
              <div><dt>Method</dt><dd>{order.paymentMethod}</dd></div>
            </dl>
            <section className="orders-dialog-address"><MapPin aria-hidden="true" /><div><small>Delivery Address</small><strong>{order.address}</strong></div></section>
            <section className="orders-dialog-products">{order.products.map((product) => <img alt="" key={product} src={product} />)}<span>{order.itemsCount} items in this order</span></section>
            <nav className="orders-dialog-links" aria-label="Order detail sections"><button type="button" onClick={() => onNavigate('customer')}>Customer Details</button><button type="button" onClick={() => onNavigate('payment')}>Payment Details</button><button type="button" onClick={() => onNavigate('delivery')}>Delivery Timeline</button></nav>
          </div>
        ) : null}

        {kind === 'status' ? (
          <form className="orders-status-form" onSubmit={(event) => { event.preventDefault(); onSave({ ...order, orderStatus: nextStatus }); }}>
            <label><span>Current Status</span><strong>{order.orderStatus}</strong></label>
            <label><span>New Order Status</span><select ref={selectRef} value={nextStatus} onChange={(event) => setNextStatus(event.target.value as OrderStatus)}><option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option></select></label>
            <p>Status changes are reflected in this preview only.</p>
          </form>
        ) : null}

        {kind === 'customer' ? (
          <div className="orders-customer-content">
            <span className="orders-customer-avatar"><UserRound aria-hidden="true" /></span><h3>{order.customer}</h3><p>{order.initials} customer profile</p>
            <dl><div><dt>Email</dt><dd>{order.email}</dd></div><div><dt>Phone</dt><dd>{order.phone}</dd></div><div><dt>Delivery Address</dt><dd>{order.address}</dd></div><div><dt>Order</dt><dd>{order.id}</dd></div></dl>
          </div>
        ) : null}

        {kind === 'payment' ? (
          <div className="orders-payment-content">
            <span><CreditCard aria-hidden="true" /></span><h3>${order.amount.toFixed(2)}</h3><p>{order.paymentStatus}</p>
            <dl><div><dt>Payment Method</dt><dd>{order.paymentMethod}</dd></div><div><dt>Transaction</dt><dd>TXN-{order.id.replace(/\D/g, '')}-FM</dd></div><div><dt>Payment Date</dt><dd>{order.date}</dd></div><div><dt>Billing Customer</dt><dd>{order.customer}</dd></div></dl>
          </div>
        ) : null}

        {kind === 'delivery' ? (
          <div className="orders-delivery-content">
            {deliverySteps.map((step, index) => <article className={index < completedSteps ? 'complete' : ''} key={step}><span>{index < completedSteps ? <Check aria-hidden="true" /> : <Clock3 aria-hidden="true" />}</span><div><strong>{step}</strong><small>{index < completedSteps ? index === completedSteps - 1 ? 'Current stage' : 'Completed' : 'Pending'}</small></div></article>)}
            <section><PackageCheck aria-hidden="true" /><div><small>Delivery destination</small><strong>{order.address}</strong></div></section>
          </div>
        ) : null}

        {kind === 'invoice' ? (
          <div className="orders-invoice-content">
            <header><div><strong>FreshMart Admin</strong><small>Enterprise Portal</small></div><span>INVOICE</span></header>
            <section><div><small>Bill To</small><strong>{order.customer}</strong><p>{order.email}<br />{order.address}</p></div><div><small>Invoice Number</small><strong>{order.id}</strong><small>Issued {order.date}</small></div></section>
            <table><thead><tr><th>Description</th><th>Quantity</th><th>Amount</th></tr></thead><tbody><tr><td>FreshMart order items</td><td>{order.itemsCount}</td><td>${order.amount.toFixed(2)}</td></tr></tbody><tfoot><tr><th colSpan={2}>Total</th><td>${order.amount.toFixed(2)}</td></tr></tfoot></table>
          </div>
        ) : null}

        <footer>
          <button type="button" onClick={onClose}>Close</button>
          {kind === 'status' ? <button className="primary" type="button" disabled={nextStatus === order.orderStatus} onClick={() => onSave({ ...order, orderStatus: nextStatus })}>Update Status</button> : null}
          {kind === 'invoice' ? <button className="primary" type="button"><Printer aria-hidden="true" />Print Invoice</button> : null}
        </footer>
      </section>
    </div>
  );
};
