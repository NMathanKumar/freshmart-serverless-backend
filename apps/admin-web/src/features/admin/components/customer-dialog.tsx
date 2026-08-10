import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Home, Mail, MapPin, Package, Phone, ShoppingBag, StickyNote, Upload, X } from 'lucide-react';
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

  const handleImageFileChange = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        update('image', resizedDataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

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
          <label className="wide">
            <span>Profile Photo</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem' }}>
              {draft.image ? (
                <img src={draft.image} alt="Avatar" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #22c55e', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f1f5f9', border: '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b', fontSize: '18px', flexShrink: 0 }}>
                  {draft.name ? draft.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <input
                  type="file"
                  accept="image/*"
                  id="customer-avatar-upload"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageFileChange(file);
                  }}
                />
                <label
                  htmlFor="customer-avatar-upload"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.9rem',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    width: 'fit-content',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  <Upload size={16} />
                  {draft.image ? 'Change Image' : 'Upload Image'}
                </label>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>PNG, JPG or WEBP from your device</span>
              </div>
              {draft.image ? (
                <button
                  type="button"
                  onClick={() => update('image', '')}
                  style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Remove
                </button>
              ) : null}
            </div>
          </label>
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
