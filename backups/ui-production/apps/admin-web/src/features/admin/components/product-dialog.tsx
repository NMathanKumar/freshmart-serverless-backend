import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { ProductSummary } from '@freshmart/api-sdk';
import type { ProductInput } from '../api/admin-api.js';
import { useDialogAccessibility } from '../hooks/use-dialog-accessibility.js';

type ProductDialogProps = {
  onClose: () => void;
  onSave: (payload: ProductInput) => Promise<void>;
  open: boolean;
  product?: ProductSummary | null;
};

const emptyProduct: ProductInput = {
  available: true,
  brand: '',
  category: '',
  description: '',
  images: [],
  price: 0,
  productName: '',
  stock: 0,
  unit: '',
  weight: null
};

export const ProductDialog = ({ onClose, onSave, open, product }: ProductDialogProps) => {
  const [draft, setDraft] = useState<ProductInput>(emptyProduct);
  const [image, setImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useDialogAccessibility(open, onClose);

  useEffect(() => {
    if (!open) return;
    setDraft(product ? {
      available: product.available,
      brand: product.brand,
      category: product.category,
      description: product.description,
      images: product.images,
      price: product.price,
      productName: product.productName,
      stock: product.stock,
      unit: product.unit,
      weight: product.weight
    } : emptyProduct);
    setImage(product?.images[0] ?? '');
    setError('');
  }, [open, product]);

  if (!open) return null;

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await onSave({ ...draft, images: image ? [image] : [] });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Product could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="category-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="category-dialog" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title">
        <header><h2 id="product-dialog-title">{product ? 'Edit Product' : 'Add Product'}</h2><button type="button" onClick={onClose} aria-label="Close dialog"><X aria-hidden="true" /></button></header>
        <form className="category-dialog-form" onSubmit={(event: FormEvent) => { event.preventDefault(); void save(); }}>
          <label><span>Product Name</span><input required minLength={2} value={draft.productName} onChange={(event) => setDraft((current) => ({ ...current, productName: event.target.value }))} /></label>
          <label><span>Category</span><input required minLength={2} value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} /></label>
          <label><span>Brand</span><input value={draft.brand ?? ''} onChange={(event) => setDraft((current) => ({ ...current, brand: event.target.value }))} /></label>
          <label><span>Price</span><input required min="0.01" step="0.01" type="number" value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: Number(event.target.value) }))} /></label>
          <label><span>Stock</span><input required min="0" step="1" type="number" value={draft.stock} onChange={(event) => setDraft((current) => ({ ...current, stock: Number(event.target.value) }))} /></label>
          <label><span>Unit</span><input value={draft.unit ?? ''} onChange={(event) => setDraft((current) => ({ ...current, unit: event.target.value }))} /></label>
          <label className="wide"><span>Image URL</span><input type="url" value={image} onChange={(event) => setImage(event.target.value)} /></label>
          <label className="wide"><span>Description</span><textarea rows={4} value={draft.description ?? ''} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} /></label>
          <label><span>Status</span><select value={draft.available ? 'active' : 'inactive'} onChange={(event) => setDraft((current) => ({ ...current, available: event.target.value === 'active' }))}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
        </form>
        {error ? <p className="px-6 text-[var(--admin-danger)]" role="alert">{error}</p> : null}
        <footer><button type="button" onClick={onClose}>Cancel</button><button className="primary" type="button" disabled={saving || !draft.productName.trim() || !draft.category.trim() || draft.price <= 0} onClick={() => void save()}>{saving ? 'Saving...' : product ? 'Save Changes' : 'Add Product'}</button></footer>
      </section>
    </div>
  );
};
