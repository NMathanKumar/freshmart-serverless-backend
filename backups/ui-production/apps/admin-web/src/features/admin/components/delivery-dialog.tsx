import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Mail, MapPin, Phone, Truck, UserRound, X } from 'lucide-react';
import { useDialogAccessibility } from '../hooks/use-dialog-accessibility.js';

export type DeliveryStatus = 'Pending' | 'Picked Up' | 'Out for Delivery' | 'Delivered' | 'Delayed' | 'Failed' | 'Cancelled';

export type DeliveryRecord = {
  address: string;
  customer: string;
  customerEmail: string;
  customerPhone: string;
  deliveredTime: string;
  distance: string;
  driver: string;
  driverPhone: string;
  estimatedTime: string;
  id: string;
  notes: string;
  orderId: string;
  progress: number;
  rating?: string;
  status: DeliveryStatus;
};

export type DeliveryDialogKind = 'details' | 'assign' | 'status' | 'timeline' | 'driver' | 'cancel';

type DeliveryDialogProps = {
  delivery?: DeliveryRecord;
  kind: DeliveryDialogKind;
  onClose: () => void;
  onSave: (delivery: DeliveryRecord) => void;
  open: boolean;
};

const timelineSteps = ['Order confirmed', 'Prepared for pickup', 'Picked up by courier', 'Out for delivery', 'Delivered'];

export const DeliveryDialog = ({ delivery, kind, onClose, onSave, open }: DeliveryDialogProps) => {
  const [draft, setDraft] = useState<DeliveryRecord | undefined>(delivery);
  useDialogAccessibility(open, onClose);

  useEffect(() => {
    if (!open || !delivery) return;
    setDraft(delivery);
  }, [delivery, open]);

  if (!open || !delivery || !draft) return null;

  const titles: Record<DeliveryDialogKind, string> = { assign: 'Assign Driver', cancel: 'Cancel Delivery', details: 'Delivery Details', driver: 'Driver Information', status: 'Update Delivery Status', timeline: 'Delivery Timeline' };
  const update = (field: keyof DeliveryRecord, value: string | number) => setDraft((current) => current ? { ...current, [field]: value } : current);
  const save = () => onSave(draft);

  return <div className="category-dialog-backdrop delivery-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="category-dialog delivery-dialog" role="dialog" aria-modal="true" aria-labelledby="delivery-dialog-title">
      <header><div><h2 id="delivery-dialog-title">{titles[kind]}</h2><p>{delivery.id} - {delivery.orderId}</p></div><button type="button" onClick={onClose} aria-label="Close dialog"><X aria-hidden="true" /></button></header>

      {kind === 'details' ? <div className="delivery-dialog-details">
        <div className="delivery-dialog-summary"><span><Truck aria-hidden="true" /></span><div><h3>{delivery.status}</h3><p>{delivery.address}</p></div><b>{delivery.progress}%</b></div>
        <div className="delivery-progress"><i style={{ width: `${delivery.progress}%` }} /></div>
        <dl><div><dt>Customer</dt><dd>{delivery.customer}</dd></div><div><dt>Driver</dt><dd>{delivery.driver}</dd></div><div><dt>Estimated Time</dt><dd>{delivery.estimatedTime}</dd></div><div><dt>Delivered Time</dt><dd>{delivery.deliveredTime}</dd></div></dl>
        <section><UserRound aria-hidden="true" /><div><small>Customer Details</small><strong>{delivery.customer}</strong><p>{delivery.customerPhone} - {delivery.customerEmail}</p></div></section>
        <section><MapPin aria-hidden="true" /><div><small>Delivery Address</small><strong>{delivery.address}</strong></div></section>
        <section><Clock3 aria-hidden="true" /><div><small>Notes</small><strong>{delivery.notes}</strong></div></section>
      </div> : null}

      {kind === 'assign' ? <form className="delivery-dialog-form" onSubmit={(event) => { event.preventDefault(); draft.driver !== 'Unassigned' && save(); }}><label><span>Delivery Partner</span><select autoFocus value={draft.driver} onChange={(event) => update('driver', event.target.value)}><option>Unassigned</option><option>David Miller</option><option>Elena Rodriguez</option><option>Marcus Thorne</option><option>Priya Shah</option></select></label><label><span>Driver Phone</span><input value={draft.driverPhone} onChange={(event) => update('driverPhone', event.target.value)} /></label><p>Assigning a partner will notify the courier and add the delivery to their active route.</p></form> : null}

      {kind === 'status' ? <form className="delivery-dialog-form" onSubmit={(event) => { event.preventDefault(); save(); }}><label><span>Current Status</span><select autoFocus value={draft.status} onChange={(event) => update('status', event.target.value as DeliveryStatus)}><option>Pending</option><option>Picked Up</option><option>Out for Delivery</option><option>Delivered</option><option>Delayed</option><option>Failed</option></select></label><label><span>Progress</span><input min="0" max="100" type="number" value={draft.progress} onChange={(event) => update('progress', Number(event.target.value))} /></label><label className="wide"><span>Status Note</span><textarea rows={4} value={draft.notes} onChange={(event) => update('notes', event.target.value)} /></label></form> : null}

      {kind === 'timeline' ? <div className="delivery-timeline">{timelineSteps.map((step, index) => { const complete = index * 25 <= delivery.progress; return <article className={complete ? 'complete' : ''} key={step}><span>{complete ? <CheckCircle2 aria-hidden="true" /> : <Clock3 aria-hidden="true" />}</span><div><strong>{step}</strong><small>{complete ? `Completed - ${index + 1}:20 PM` : 'Waiting for update'}</small></div></article>; })}</div> : null}

      {kind === 'driver' ? <div className="delivery-driver-info"><span><UserRound aria-hidden="true" /></span><h3>{delivery.driver}</h3><p>{delivery.driver === 'Unassigned' ? 'No driver has been assigned.' : 'Verified FreshMart delivery partner'}</p><section><Phone aria-hidden="true" /><div><small>Phone</small><strong>{delivery.driverPhone || 'Not available'}</strong></div></section><section><Mail aria-hidden="true" /><div><small>Performance</small><strong>{delivery.rating ? `${delivery.rating} rating - 96% on time` : 'Not available'}</strong></div></section></div> : null}

      {kind === 'cancel' ? <div className="delivery-cancel-content"><span><AlertTriangle aria-hidden="true" /></span><h3>Cancel this delivery?</h3><p>This removes {delivery.id} from the active dispatch queue. The associated order is not modified.</p></div> : null}

      <footer><button type="button" onClick={onClose}>{kind === 'details' || kind === 'timeline' || kind === 'driver' ? 'Close' : 'Cancel'}</button>{kind === 'assign' ? <button className="primary" disabled={draft.driver === 'Unassigned'} type="button" onClick={save}>Assign Driver</button> : null}{kind === 'status' ? <button className="primary" type="button" onClick={save}>Update Status</button> : null}{kind === 'cancel' ? <button className="danger" type="button" onClick={() => onSave({ ...delivery, progress: 0, status: 'Cancelled' })}>Cancel Delivery</button> : null}</footer>
    </section>
  </div>;
};
