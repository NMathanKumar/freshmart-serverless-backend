import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Clock3, Mail, MapPin, Package, Phone, Star, X } from 'lucide-react';
import { useDialogAccessibility } from '../hooks/use-dialog-accessibility.js';

export type SupplierStatus = 'Active' | 'Pending' | 'Inactive';

export type SupplierRecord = {
  address: string;
  category: string;
  company: string;
  contact: string;
  email: string;
  id: string;
  image: string;
  lastDelivery: string;
  location: string;
  name: string;
  notes: string;
  phone: string;
  products: number;
  rating: number;
  status: SupplierStatus;
};

export type SupplierDialogKind = 'add' | 'edit' | 'details' | 'delete' | 'products' | 'history';

type SupplierDialogProps = {
  kind: SupplierDialogKind;
  onClose: () => void;
  onDelete: (supplier: SupplierRecord) => void;
  onSave: (supplier: SupplierRecord) => void;
  open: boolean;
  supplier?: SupplierRecord;
};

const emptySupplier: SupplierRecord = {
  address: '',
  category: 'Produce',
  company: '',
  contact: '',
  email: '',
  id: 'SUP-NEW',
  image: '',
  lastDelivery: 'Not available',
  location: '',
  name: '',
  notes: '',
  phone: '',
  products: 0,
  rating: 0,
  status: 'Pending'
};

const productNames = ['Organic Avocados', 'Fresh Lettuce', 'Baby Spinach', 'Seasonal Produce'];

export const SupplierDialog = ({ kind, onClose, onDelete, onSave, open, supplier }: SupplierDialogProps) => {
  const [draft, setDraft] = useState<SupplierRecord>(emptySupplier);
  const firstInput = useRef<HTMLInputElement>(null);
  useDialogAccessibility(open, onClose, firstInput);

  useEffect(() => {
    if (!open) return;
    setDraft(supplier ?? emptySupplier);
  }, [open, supplier]);

  if (!open || (kind !== 'add' && !supplier)) return null;

  const current = supplier ?? draft;
  const titles: Record<SupplierDialogKind, string> = {
    add: 'Add Supplier',
    delete: 'Delete Supplier',
    details: 'Supplier Details',
    edit: 'Edit Supplier',
    history: 'Purchase History',
    products: 'Supplier Products'
  };
  const updateDraft = (field: keyof SupplierRecord, value: string | number) => setDraft((valueBefore) => ({ ...valueBefore, [field]: value }));
  const canSave = draft.name.trim() !== '' && draft.contact.trim() !== '' && draft.email.trim() !== '';

  return (
    <div className="category-dialog-backdrop supplier-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="category-dialog supplier-dialog" role="dialog" aria-modal="true" aria-labelledby="supplier-dialog-title">
        <header><div><h2 id="supplier-dialog-title">{titles[kind]}</h2>{kind !== 'add' ? <p>{current.id}</p> : null}</div><button type="button" onClick={onClose} aria-label="Close dialog"><X aria-hidden="true" /></button></header>

        {(kind === 'add' || kind === 'edit') ? (
          <form className="supplier-form" onSubmit={(event) => { event.preventDefault(); canSave && onSave(draft); }}>
            <label><span>Supplier Name</span><input ref={firstInput} value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} placeholder="Supplier name" /></label>
            <label><span>Company</span><input value={draft.company} onChange={(event) => updateDraft('company', event.target.value)} placeholder="Company name" /></label>
            <label><span>Contact Person</span><input value={draft.contact} onChange={(event) => updateDraft('contact', event.target.value)} placeholder="Primary contact" /></label>
            <label><span>Email</span><input type="email" value={draft.email} onChange={(event) => updateDraft('email', event.target.value)} placeholder="contact@example.com" /></label>
            <label><span>Category</span><select value={draft.category} onChange={(event) => updateDraft('category', event.target.value)}><option>Produce</option><option>Fruit</option><option>Dairy</option><option>Bakery</option><option>Beverages</option></select></label>
            <label><span>Status</span><select value={draft.status} onChange={(event) => updateDraft('status', event.target.value as SupplierStatus)}><option>Active</option><option>Pending</option><option>Inactive</option></select></label>
            <label className="wide"><span>Address</span><input value={draft.address} onChange={(event) => updateDraft('address', event.target.value)} placeholder="Supplier address" /></label>
          </form>
        ) : null}

        {kind === 'details' ? (
          <div className="supplier-details-content">
            <div className="supplier-dialog-profile"><img alt="" src={current.image} /><div><h3>{current.name}</h3><p>{current.company}</p><span>{current.status}</span></div></div>
            <dl><div><dt>Category</dt><dd>{current.category}</dd></div><div><dt>Products</dt><dd>{current.products}</dd></div><div><dt>Rating</dt><dd><Star aria-hidden="true" />{current.rating}</dd></div><div><dt>Last Delivery</dt><dd>{current.lastDelivery}</dd></div></dl>
            <section><Mail aria-hidden="true" /><div><small>Email</small><strong>{current.email}</strong></div></section><section><Phone aria-hidden="true" /><div><small>Phone</small><strong>{current.phone}</strong></div></section><section><MapPin aria-hidden="true" /><div><small>Address</small><strong>{current.address}</strong></div></section>
          </div>
        ) : null}

        {kind === 'products' ? <div className="supplier-products-content">{productNames.map((name, index) => <article key={name}><span><Package aria-hidden="true" /></span><div><strong>{name}</strong><small>SKU group {current.id}-{index + 1}</small></div><b>{Math.max(1, Math.round(current.products / (index + 2)))} items</b></article>)}</div> : null}

        {kind === 'history' ? <div className="supplier-history-content">{[['PO-8821', 'Mar 14, 2024', '$12,480.00'], ['PO-8794', 'Mar 02, 2024', '$8,920.00'], ['PO-8740', 'Feb 18, 2024', '$10,140.00']].map(([id, date, amount]) => <article key={id}><span><Clock3 aria-hidden="true" /></span><div><strong>{id}</strong><small>{date} - Delivered</small></div><b>{amount}</b></article>)}</div> : null}

        {kind === 'delete' ? <div className="supplier-delete-content"><span><AlertTriangle aria-hidden="true" /></span><p>Delete <strong>{current.name}</strong>? This removes the supplier from the management list.</p></div> : null}

        <footer><button type="button" onClick={onClose}>{kind === 'details' || kind === 'products' || kind === 'history' ? 'Close' : 'Cancel'}</button>{(kind === 'add' || kind === 'edit') ? <button className="primary" type="button" disabled={!canSave} onClick={() => onSave(draft)}>{kind === 'add' ? 'Add Supplier' : 'Save Changes'}</button> : null}{kind === 'delete' ? <button className="danger" type="button" onClick={() => onDelete(current)}>Delete Supplier</button> : null}</footer>
      </section>
    </div>
  );
};
