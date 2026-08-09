import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Home, Mail, MapPin, Package, Phone, ShoppingBag, StickyNote, X } from 'lucide-react';
import { useDialogAccessibility } from '../hooks/use-dialog-accessibility.js';

export type CustomerStatus = 'Active' | 'Blocked';
export type CustomerMembership = 'Standard' | 'Premium' | 'VIP';

export type CustomerRecord = {
  address: string;
  email: string;
  id: string;
  image?: string;
  initials?: string;
  joined: string;
  lastActive: string;
  membership: CustomerMembership;
  name: string;
  notes: string;
  orders: number;
  phone: string;
  spending: string;
  status: CustomerStatus;
};

export type CustomerDialogKind = 'details' | 'edit' | 'orders' | 'addresses' | 'notes' | 'block';

type CustomerDialogProps = {
  customer?: CustomerRecord;
  kind: CustomerDialogKind;
  onClose: () => void;
  onSave: (customer: CustomerRecord) => void;
  onToggleBlock: (customer: CustomerRecord) => void;
  open: boolean;
};

const orderHistory = [
  { date: 'Oct 24, 2023', id: '#FM-8932', status: 'Delivered', total: '$142.00' },
  { date: 'Oct 18, 2023', id: '#FM-8874', status: 'Delivered', total: '$86.50' },
  { date: 'Oct 05, 2023', id: '#FM-8791', status: 'Delivered', total: '$214.25' }
];

export const CustomerDialog = ({ customer, kind, onClose, onSave, onToggleBlock, open }: CustomerDialogProps) => {
  const [draft, setDraft] = useState<CustomerRecord | undefined>(customer);
  const firstInput = useRef<HTMLInputElement>(null);
  useDialogAccessibility(open, onClose, firstInput);

  useEffect(() => {
    if (!open || !customer) return;
    setDraft(customer);
  }, [customer, open]);

  if (!open || !customer || !draft) return null;

  const titles: Record<CustomerDialogKind, string> = {
    addresses: 'Address List',
    block: customer.status === 'Blocked' ? 'Unblock Customer' : 'Block Customer',
    details: 'Customer Details',
    edit: customer.id === '#CUST-NEW' ? 'Add Customer' : 'Edit Customer',
    notes: 'Customer Notes',
    orders: 'Order History'
  };
  const update = (field: keyof CustomerRecord, value: string) => setDraft((current) => current ? { ...current, [field]: value } : current);
  const canSave = draft.name.trim() !== '' && draft.email.trim() !== '' && draft.phone.trim() !== '';

  return (
    <div className="category-dialog-backdrop customer-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="category-dialog customer-dialog" role="dialog" aria-modal="true" aria-labelledby="customer-dialog-title">
        <header>
          <div><h2 id="customer-dialog-title">{titles[kind]}</h2><p>{customer.id}</p></div>
          <button type="button" onClick={onClose} aria-label="Close dialog"><X aria-hidden="true" /></button>
        </header>

        {kind === 'details' ? <div className="customer-dialog-details">
          <div className="customer-dialog-profile">{customer.image ? <img alt="" src={customer.image} /> : <span>{customer.initials}</span>}<div><h3>{customer.name}</h3><p>{customer.membership} member</p><b className={customer.status.toLowerCase()}>{customer.status}</b></div></div>
          <dl><div><dt>Total Orders</dt><dd>{customer.orders}</dd></div><div><dt>Total Spend</dt><dd>{customer.spending}</dd></div><div><dt>Joined</dt><dd>{customer.joined}</dd></div><div><dt>Last Active</dt><dd>{customer.lastActive}</dd></div></dl>
          <section><Mail aria-hidden="true" /><div><small>Email</small><strong>{customer.email}</strong></div></section>
          <section><Phone aria-hidden="true" /><div><small>Phone</small><strong>{customer.phone}</strong></div></section>
          <section><MapPin aria-hidden="true" /><div><small>Primary Address</small><strong>{customer.address}</strong></div></section>
        </div> : null}

        {kind === 'edit' ? <form className="customer-dialog-form" onSubmit={(event) => { event.preventDefault(); canSave && onSave(draft); }}>
          <label><span>Full Name</span><input ref={firstInput} value={draft.name} onChange={(event) => update('name', event.target.value)} /></label>
          <label><span>Email Address</span><input type="email" value={draft.email} onChange={(event) => update('email', event.target.value)} /></label>
          <label><span>Phone Number</span><input value={draft.phone} onChange={(event) => update('phone', event.target.value)} /></label>
          <label><span>Membership</span><select value={draft.membership} onChange={(event) => update('membership', event.target.value)}><option>Standard</option><option>Premium</option><option>VIP</option></select></label>
          <label className="wide"><span>Primary Address</span><input value={draft.address} onChange={(event) => update('address', event.target.value)} /></label>
        </form> : null}

        {kind === 'orders' ? <div className="customer-order-history">{orderHistory.map((order) => <article key={order.id}><span><ShoppingBag aria-hidden="true" /></span><div><strong>{order.id}</strong><small>{order.date} - {order.status}</small></div><b>{order.total}</b></article>)}</div> : null}

        {kind === 'addresses' ? <div className="customer-address-list"><article><span><Home aria-hidden="true" /></span><div><strong>Primary Address</strong><p>{customer.address}</p><small>Default delivery address</small></div></article><article><span><Package aria-hidden="true" /></span><div><strong>Office</strong><p>240 Market Street, Suite 402, San Francisco, CA 94105</p><small>Alternate delivery address</small></div></article></div> : null}

        {kind === 'notes' ? <div className="customer-notes-content"><span><StickyNote aria-hidden="true" /></span><label><span>Internal customer note</span><textarea value={draft.notes} onChange={(event) => update('notes', event.target.value)} rows={6} /></label><small>Visible to FreshMart administrators only.</small></div> : null}

        {kind === 'block' ? <div className="customer-block-content"><span><AlertTriangle aria-hidden="true" /></span><h3>{customer.status === 'Blocked' ? 'Restore account access?' : 'Restrict account access?'}</h3><p>{customer.status === 'Blocked' ? `${customer.name} will be able to sign in and place orders again.` : `${customer.name} will no longer be able to sign in or place new orders.`}</p></div> : null}

        <footer>
          <button type="button" onClick={onClose}>{kind === 'details' || kind === 'orders' || kind === 'addresses' ? 'Close' : 'Cancel'}</button>
          {kind === 'edit' ? <button className="primary" type="button" disabled={!canSave} onClick={() => onSave(draft)}>{customer.id === '#CUST-NEW' ? 'Add Customer' : 'Save Changes'}</button> : null}
          {kind === 'notes' ? <button className="primary" type="button" onClick={() => onSave(draft)}>Save Note</button> : null}
          {kind === 'block' ? <button className={customer.status === 'Blocked' ? 'primary' : 'danger'} type="button" onClick={() => onToggleBlock(customer)}>{customer.status === 'Blocked' ? 'Unblock Customer' : 'Block Customer'}</button> : null}
        </footer>
      </section>
    </div>
  );
};
