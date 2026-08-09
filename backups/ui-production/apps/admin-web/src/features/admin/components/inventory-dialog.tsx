import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Clock3, X } from 'lucide-react';
import { useDialogAccessibility } from '../hooks/use-dialog-accessibility.js';

export type InventoryRecord = {
  available: number;
  category: string;
  current: number;
  image: string;
  lastUpdated: string;
  name: string;
  reorderLevel: number;
  reserved: number;
  sku: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  subtitle: string;
  unit?: string;
  warehouse: string;
};

export type InventoryDialogKind = 'details' | 'update' | 'adjust' | 'history' | 'delete';

type InventoryDialogProps = {
  item?: InventoryRecord;
  kind: InventoryDialogKind;
  onClose: () => void;
  onDelete: (item: InventoryRecord) => void;
  onSave: (item: InventoryRecord) => void;
  open: boolean;
};

export const InventoryDialog = ({ item, kind, onClose, onDelete, onSave, open }: InventoryDialogProps) => {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Stock count correction');
  const firstInput = useRef<HTMLInputElement>(null);
  useDialogAccessibility(open, onClose, firstInput);

  useEffect(() => {
    if (!open || !item) return;
    setQuantity(kind === 'adjust' ? '0' : String(item.current));
  }, [item, kind, open]);

  if (!open || !item) return null;

  const titles: Record<InventoryDialogKind, string> = {
    details: 'Stock Details',
    update: 'Update Stock',
    adjust: 'Adjust Inventory',
    history: 'Stock History',
    delete: 'Delete Inventory Item'
  };

  const save = () => {
    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) return;
    const current = kind === 'adjust' ? Math.max(0, item.current + parsedQuantity) : parsedQuantity;
    const available = Math.max(0, current - item.reserved);
    onSave({
      ...item,
      available,
      current,
      lastUpdated: 'Just now',
      status: current === 0 ? 'Out of Stock' : current <= item.reorderLevel ? 'Low Stock' : 'In Stock'
    });
  };

  return (
    <div className="category-dialog-backdrop inventory-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="category-dialog inventory-dialog" role="dialog" aria-modal="true" aria-labelledby="inventory-dialog-title">
        <header>
          <h2 id="inventory-dialog-title">{titles[kind]}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog"><X aria-hidden="true" /></button>
        </header>

        {kind === 'details' ? (
          <div className="inventory-details-content">
            <div className="inventory-dialog-product"><img alt="" src={item.image} /><span><strong>{item.name}</strong><small>{item.sku}</small></span></div>
            <dl>
              <div><dt>Current Stock</dt><dd>{item.current}</dd></div>
              <div><dt>Reserved</dt><dd>{item.reserved}</dd></div>
              <div><dt>Available</dt><dd>{item.available}</dd></div>
              <div><dt>Reorder Level</dt><dd>{item.reorderLevel}</dd></div>
              <div><dt>Warehouse</dt><dd>{item.warehouse}</dd></div>
              <div><dt>Last Updated</dt><dd>{item.lastUpdated}</dd></div>
            </dl>
          </div>
        ) : null}

        {kind === 'history' ? (
          <div className="inventory-history-content">
            {[
              ['Stock count verified', item.lastUpdated, `Balance: ${item.current}`],
              ['Customer order reserved', 'Yesterday, 4:18 PM', `-${Math.min(item.reserved, 8)} units`],
              ['Warehouse delivery received', 'Mar 12, 9:30 AM', '+120 units']
            ].map(([title, date, value]) => (
              <article key={`${title}-${date}`}><span><Clock3 aria-hidden="true" /></span><div><strong>{title}</strong><small>{date}</small></div><b>{value}</b></article>
            ))}
          </div>
        ) : null}

        {(kind === 'update' || kind === 'adjust') ? (
          <form onSubmit={(event) => { event.preventDefault(); save(); }}>
            <div className="inventory-dialog-product"><img alt="" src={item.image} /><span><strong>{item.name}</strong><small>{item.sku} - {item.warehouse}</small></span></div>
            <label>
              <span>{kind === 'adjust' ? 'Adjustment Quantity' : 'New Stock Quantity'}</span>
              <input ref={firstInput} min={kind === 'adjust' ? undefined : 0} step="1" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
            </label>
            <label>
              <span>Reason</span>
              <select value={reason} onChange={(event) => setReason(event.target.value)}>
                <option>Stock count correction</option>
                <option>Warehouse delivery</option>
                <option>Damaged inventory</option>
                <option>Customer return</option>
              </select>
            </label>
          </form>
        ) : null}

        {kind === 'delete' ? (
          <div className="inventory-delete-content"><span><AlertTriangle aria-hidden="true" /></span><p>Delete <strong>{item.name}</strong> from inventory? This action cannot be undone.</p></div>
        ) : null}

        <footer>
          <button type="button" onClick={onClose}>{kind === 'details' || kind === 'history' ? 'Close' : 'Cancel'}</button>
          {(kind === 'update' || kind === 'adjust') ? <button className="primary" type="button" disabled={quantity === '' || Number(quantity) < (kind === 'adjust' ? -item.current : 0)} onClick={save}>{kind === 'update' ? 'Update Stock' : 'Apply Adjustment'}</button> : null}
          {kind === 'delete' ? <button className="danger" type="button" onClick={() => onDelete(item)}>Delete Item</button> : null}
        </footer>
      </section>
    </div>
  );
};
