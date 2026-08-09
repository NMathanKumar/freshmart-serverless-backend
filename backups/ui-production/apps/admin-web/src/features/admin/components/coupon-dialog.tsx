import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2, Copy, Percent, Ticket, UsersRound, X } from 'lucide-react';
import { useDialogAccessibility } from '../hooks/use-dialog-accessibility.js';

export type CouponStatus = 'Active' | 'Inactive' | 'Scheduled';
export type DiscountType = 'Percentage' | 'Flat Amount';

export type CouponRecord = {
  campaign: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  expiryDate: string;
  id: string;
  startsDate: string;
  status: CouponStatus;
  usage: number;
  usageLimit: number | null;
};

export type CouponDialogKind = 'create' | 'edit' | 'details' | 'delete' | 'promotion' | 'toggle';

type CouponDialogProps = {
  coupon?: CouponRecord;
  kind: CouponDialogKind;
  onClose: () => void;
  onDelete: (coupon: CouponRecord) => void;
  onSave: (coupon: CouponRecord) => void;
  open: boolean;
};

const emptyCoupon: CouponRecord = { campaign: '', code: '', description: '', discountType: 'Percentage', discountValue: '', expiryDate: 'May 30, 2024', id: 'CPN-NEW', startsDate: 'Apr 01, 2024', status: 'Scheduled', usage: 0, usageLimit: 2500 };

export const CouponDialog = ({ coupon, kind, onClose, onDelete, onSave, open }: CouponDialogProps) => {
  const [draft, setDraft] = useState<CouponRecord>(emptyCoupon);
  const firstInput = useRef<HTMLInputElement>(null);
  useDialogAccessibility(open, onClose, firstInput);

  useEffect(() => {
    if (!open) return;
    setDraft(coupon ?? emptyCoupon);
  }, [coupon, open]);

  if (!open || (kind !== 'create' && !coupon)) return null;
  const current = coupon ?? draft;
  const titles: Record<CouponDialogKind, string> = { create: 'Create Coupon', delete: 'Delete Coupon', details: 'Coupon Details', edit: 'Edit Coupon', promotion: 'Promotion Details', toggle: current.status === 'Active' ? 'Deactivate Promotion' : 'Activate Promotion' };
  const update = (field: keyof CouponRecord, value: string | number | null) => setDraft((before) => ({ ...before, [field]: value }));
  const canSave = draft.code.trim() !== '' && draft.campaign.trim() !== '' && draft.discountValue.trim() !== '';

  return <div className="category-dialog-backdrop coupon-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="category-dialog coupon-dialog" role="dialog" aria-modal="true" aria-labelledby="coupon-dialog-title">
      <header><div><h2 id="coupon-dialog-title">{titles[kind]}</h2>{kind !== 'create' ? <p>{current.code}</p> : null}</div><button type="button" onClick={onClose} aria-label="Close dialog"><X aria-hidden="true" /></button></header>
      {(kind === 'create' || kind === 'edit') ? <form className="coupon-dialog-form" onSubmit={(event) => { event.preventDefault(); canSave && onSave(draft); }}><label><span>Coupon Code</span><input ref={firstInput} value={draft.code} onChange={(event) => update('code', event.target.value.toUpperCase())} placeholder="FRESH20" /></label><label><span>Promotion Name</span><input value={draft.campaign} onChange={(event) => update('campaign', event.target.value)} placeholder="Seasonal campaign" /></label><label><span>Discount Type</span><select value={draft.discountType} onChange={(event) => update('discountType', event.target.value)}><option>Percentage</option><option>Flat Amount</option></select></label><label><span>Discount Value</span><input value={draft.discountValue} onChange={(event) => update('discountValue', event.target.value)} placeholder="20%" /></label><label><span>Starts Date</span><input value={draft.startsDate} onChange={(event) => update('startsDate', event.target.value)} /></label><label><span>Expiry Date</span><input value={draft.expiryDate} onChange={(event) => update('expiryDate', event.target.value)} /></label><label><span>Usage Limit</span><input min="0" type="number" value={draft.usageLimit ?? ''} onChange={(event) => update('usageLimit', event.target.value ? Number(event.target.value) : null)} /></label><label><span>Status</span><select value={draft.status} onChange={(event) => update('status', event.target.value)}><option>Active</option><option>Inactive</option><option>Scheduled</option></select></label><label className="wide"><span>Description</span><textarea rows={4} value={draft.description} onChange={(event) => update('description', event.target.value)} /></label></form> : null}
      {kind === 'details' ? <div className="coupon-dialog-details"><div className="coupon-detail-code"><span><Ticket aria-hidden="true" /></span><div><small>Coupon Code</small><strong>{current.code}</strong></div><button type="button" aria-label="Copy coupon code"><Copy aria-hidden="true" /></button></div><dl><div><dt>Discount</dt><dd>{current.discountValue}</dd></div><div><dt>Type</dt><dd>{current.discountType}</dd></div><div><dt>Usage</dt><dd>{current.usage.toLocaleString()}</dd></div><div><dt>Status</dt><dd>{current.status}</dd></div></dl><section><CalendarDays aria-hidden="true" /><div><small>Validity</small><strong>{current.startsDate} - {current.expiryDate}</strong></div></section><section><UsersRound aria-hidden="true" /><div><small>Usage Limit</small><strong>{current.usageLimit ? `${current.usage.toLocaleString()} of ${current.usageLimit.toLocaleString()}` : 'Unlimited'}</strong></div></section></div> : null}
      {kind === 'promotion' ? <div className="coupon-promotion-details"><span><Percent aria-hidden="true" /></span><h3>{current.campaign}</h3><p>{current.description}</p><div><strong>{current.discountValue} off</strong><small>Valid {current.startsDate} through {current.expiryDate}</small></div></div> : null}
      {kind === 'delete' ? <div className="coupon-confirm-content"><span><AlertTriangle aria-hidden="true" /></span><h3>Delete {current.code}?</h3><p>This removes the coupon from the promotions list. Existing order history is not changed.</p></div> : null}
      {kind === 'toggle' ? <div className="coupon-confirm-content"><span className="success"><CheckCircle2 aria-hidden="true" /></span><h3>{current.status === 'Active' ? 'Deactivate this promotion?' : 'Activate this promotion?'}</h3><p>{current.status === 'Active' ? 'Customers will no longer be able to redeem this code.' : 'Customers will be able to redeem this code immediately.'}</p></div> : null}
      <footer><button type="button" onClick={onClose}>{kind === 'details' || kind === 'promotion' ? 'Close' : 'Cancel'}</button>{kind === 'create' || kind === 'edit' ? <button className="primary" disabled={!canSave} type="button" onClick={() => onSave(draft)}>{kind === 'create' ? 'Create Coupon' : 'Save Changes'}</button> : null}{kind === 'delete' ? <button className="danger" type="button" onClick={() => onDelete(current)}>Delete Coupon</button> : null}{kind === 'toggle' ? <button className="primary" type="button" onClick={() => onSave({ ...current, status: current.status === 'Active' ? 'Inactive' : 'Active' })}>{current.status === 'Active' ? 'Deactivate' : 'Activate'}</button> : null}</footer>
    </section>
  </div>;
};
