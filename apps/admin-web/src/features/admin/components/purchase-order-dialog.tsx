import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, PackageCheck, Printer, X } from 'lucide-react';
import { useDialogAccessibility } from '../hooks/use-dialog-accessibility.js';

export type PurchaseOrderStatus = 'Draft' | 'Pending' | 'Approved' | 'Received' | 'Cancelled';
export type PurchasePaymentStatus = 'Paid' | 'Pending' | 'Unpaid';

export type PurchaseOrderItem = {
  detail: string;
  price: string;
  title: string;
};

export type PurchaseOrderRecord = {
  created: string;
  expected: string;
  id: string;
  items: PurchaseOrderItem[];
  itemsCount: number;
  paymentStatus: PurchasePaymentStatus;
  status: PurchaseOrderStatus;
  supplier: string;
  total: number;
};

export type PurchaseOrderDialogKind = 'create' | 'edit' | 'details' | 'receive' | 'cancel' | 'print';

type PurchaseOrderDialogProps = {
  kind: PurchaseOrderDialogKind;
  onClose: () => void;
  onSave: (order: PurchaseOrderRecord) => void;
  open: boolean;
  order?: PurchaseOrderRecord;
};

const emptyPurchaseOrder: PurchaseOrderRecord = {
  created: 'Oct 25, 2023',
  expected: 'Nov 01, 2023',
  id: 'PO-NEW',
  items: [],
  itemsCount: 0,
  paymentStatus: 'Pending',
  status: 'Draft',
  supplier: '',
  total: 0
};

export const PurchaseOrderDialog = ({ kind, onClose, onSave, open, order }: PurchaseOrderDialogProps) => {
  const [draft, setDraft] = useState<PurchaseOrderRecord>(emptyPurchaseOrder);
  const firstInput = useRef<HTMLInputElement>(null);
  useDialogAccessibility(open, onClose, firstInput);

  useEffect(() => {
    if (!open) return;
    setDraft(order ?? emptyPurchaseOrder);
  }, [open, order]);

  if (!open || (kind !== 'create' && !order)) return null;

  const current = order ?? draft;
  const titles: Record<PurchaseOrderDialogKind, string> = {
    cancel: 'Cancel Purchase Order',
    create: 'Create Purchase Order',
    details: 'Purchase Order Details',
    edit: 'Edit Purchase Order',
    print: 'Print Purchase Order',
    receive: 'Receive Goods'
  };
  const updateDraft = (field: keyof PurchaseOrderRecord, value: string | number) => setDraft((before) => ({ ...before, [field]: value }));
  const canSave = draft.supplier.trim() !== '' && draft.total > 0;

  return (
    <div className="category-dialog-backdrop purchase-order-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="category-dialog purchase-order-dialog" role="dialog" aria-modal="true" aria-labelledby="purchase-order-dialog-title">
        <header><div><h2 id="purchase-order-dialog-title">{titles[kind]}</h2>{kind !== 'create' ? <p>{current.id}</p> : null}</div><button type="button" onClick={onClose} aria-label="Close dialog"><X aria-hidden="true" /></button></header>

        {(kind === 'create' || kind === 'edit') ? <form className="purchase-order-form" onSubmit={(event) => { event.preventDefault(); canSave && onSave(draft); }}><label className="wide"><span>Supplier</span><input ref={firstInput} value={draft.supplier} onChange={(event) => updateDraft('supplier', event.target.value)} placeholder="Supplier name" /></label><label><span>Order Date</span><input value={draft.created} onChange={(event) => updateDraft('created', event.target.value)} /></label><label><span>Expected Delivery</span><input value={draft.expected} onChange={(event) => updateDraft('expected', event.target.value)} /></label><label><span>Total Amount</span><input min="0" step="0.01" type="number" value={draft.total} onChange={(event) => updateDraft('total', Number(event.target.value))} /></label><label><span>Items</span><input min="0" step="1" type="number" value={draft.itemsCount} onChange={(event) => updateDraft('itemsCount', Number(event.target.value))} /></label><label><span>Status</span><select value={draft.status} onChange={(event) => updateDraft('status', event.target.value as PurchaseOrderStatus)}><option>Draft</option><option>Pending</option><option>Approved</option><option>Received</option><option>Cancelled</option></select></label><label><span>Payment Status</span><select value={draft.paymentStatus} onChange={(event) => updateDraft('paymentStatus', event.target.value as PurchasePaymentStatus)}><option>Paid</option><option>Pending</option><option>Unpaid</option></select></label></form> : null}

        {kind === 'details' ? <div className="purchase-order-details-content"><div className="purchase-order-dialog-summary"><div><small>Supplier</small><strong>{current.supplier}</strong></div><span>{current.status}</span></div><dl><div><dt>Order Date</dt><dd>{current.created}</dd></div><div><dt>Expected Delivery</dt><dd>{current.expected}</dd></div><div><dt>Items</dt><dd>{current.itemsCount}</dd></div><div><dt>Payment</dt><dd>{current.paymentStatus}</dd></div></dl><section>{current.items.length ? current.items.map((item) => <article key={item.title}><div><strong>{item.title}</strong><small>{item.detail}</small></div><b>{item.price}</b></article>) : <p>No line-item preview is available.</p>}</section><div className="purchase-order-dialog-total"><span>Total Amount</span><strong>${current.total.toFixed(2)}</strong></div></div> : null}

        {kind === 'receive' ? <div className="purchase-order-receive-content"><span><PackageCheck aria-hidden="true" /></span><h3>Confirm goods received</h3><p>Mark all {current.itemsCount} items from <strong>{current.supplier}</strong> as received for {current.id}.</p><label><span>Receiving Note</span><input ref={firstInput} placeholder="Optional receiving note" /></label></div> : null}

        {kind === 'cancel' ? <div className="purchase-order-cancel-content"><span><AlertTriangle aria-hidden="true" /></span><p>Cancel <strong>{current.id}</strong> from {current.supplier}? This action updates the local purchase-order preview.</p></div> : null}

        {kind === 'print' ? <div className="purchase-order-print-content"><header><div><strong>FreshMart Admin</strong><small>Enterprise Portal</small></div><span>PURCHASE ORDER</span></header><section><div><small>Supplier</small><strong>{current.supplier}</strong><p>Expected delivery: {current.expected}</p></div><div><small>PO Number</small><strong>{current.id}</strong><p>Created: {current.created}</p></div></section><table><thead><tr><th>Description</th><th>Items</th><th>Amount</th></tr></thead><tbody><tr><td>Purchase order goods</td><td>{current.itemsCount}</td><td>${current.total.toFixed(2)}</td></tr></tbody><tfoot><tr><th colSpan={2}>Total</th><td>${current.total.toFixed(2)}</td></tr></tfoot></table></div> : null}

        <footer><button type="button" onClick={onClose}>{kind === 'details' || kind === 'print' ? 'Close' : 'Cancel'}</button>{(kind === 'create' || kind === 'edit') ? <button className="primary" type="button" disabled={!canSave} onClick={() => onSave(draft)}>{kind === 'create' ? 'Create Purchase Order' : 'Save Changes'}</button> : null}{kind === 'receive' ? <button className="primary" type="button" onClick={() => onSave({ ...current, status: 'Received' })}><CheckCircle2 aria-hidden="true" />Receive Goods</button> : null}{kind === 'cancel' ? <button className="danger" type="button" onClick={() => onSave({ ...current, status: 'Cancelled' })}>Cancel Purchase Order</button> : null}{kind === 'print' ? <button className="primary" type="button"><Printer aria-hidden="true" />Print</button> : null}</footer>
      </section>
    </div>
  );
};
