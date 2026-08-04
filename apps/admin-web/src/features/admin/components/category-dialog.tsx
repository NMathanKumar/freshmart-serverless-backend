import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ImagePlus, X } from 'lucide-react';
import { useDialogAccessibility } from '../hooks/use-dialog-accessibility.js';

export type CategoryRecord = {
  id: string;
  image: string;
  name: string;
  description: string;
  products: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CategoryDialogKind = 'add' | 'edit' | 'delete' | 'details';

type CategoryDialogProps = {
  category?: CategoryRecord;
  kind: CategoryDialogKind;
  onClose: () => void;
  onDelete: (category: CategoryRecord) => void;
  onSave: (category: CategoryRecord) => void;
  open: boolean;
};

const emptyCategory: CategoryRecord = {
  id: '',
  image: '',
  name: '',
  description: '',
  products: '0',
  active: true,
  createdAt: '',
  updatedAt: ''
};

export const CategoryDialog = ({ category, kind, onClose, onDelete, onSave, open }: CategoryDialogProps) => {
  const [draft, setDraft] = useState<CategoryRecord>(emptyCategory);
  const firstInputRef = useRef<HTMLInputElement>(null);
  useDialogAccessibility(open, onClose, firstInputRef);

  useEffect(() => {
    if (!open) return;

    setDraft(category ?? emptyCategory);
  }, [category, open]);

  if (!open) return null;

  const title = kind === 'add'
    ? 'Add Category'
    : kind === 'edit'
      ? 'Edit Category'
      : kind === 'delete'
        ? 'Delete Category'
        : 'Category Details';

  const submit = () => {
    const now = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date());
    onSave({
      ...draft,
      id: draft.id || `CAT-${String(Date.now()).slice(-3)}`,
      image: draft.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=140&q=80',
      createdAt: draft.createdAt || now,
      updatedAt: now
    });
  };

  return (
    <div className="category-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="category-dialog" role="dialog" aria-modal="true" aria-labelledby="category-dialog-title">
        <header>
          <h2 id="category-dialog-title">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog"><X aria-hidden="true" /></button>
        </header>

        {kind === 'delete' && category ? (
          <div className="category-delete-content">
            <span><AlertTriangle aria-hidden="true" /></span>
            <p>Delete <strong>{category.name}</strong>? This action cannot be undone.</p>
          </div>
        ) : null}

        {kind === 'details' && category ? (
          <div className="category-details-content">
            <img alt="" src={category.image} />
            <div><span>Category</span><strong>{category.name}</strong></div>
            <div><span>Description</span><strong>{category.description}</strong></div>
            <div><span>Products</span><strong>{category.products}</strong></div>
            <div><span>Status</span><strong>{category.active ? 'Active' : 'Inactive'}</strong></div>
            <div><span>Created</span><strong>{category.createdAt}</strong></div>
            <div><span>Updated</span><strong>{category.updatedAt}</strong></div>
          </div>
        ) : null}

        {(kind === 'add' || kind === 'edit') ? (
          <form onSubmit={(event) => { event.preventDefault(); submit(); }}>
            <label>
              <span>Category Name</span>
              <input
                ref={firstInputRef}
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="Enter category name"
                required
              />
            </label>
            <label>
              <span>Description</span>
              <textarea
                value={draft.description}
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                placeholder="Describe this category"
                required
              />
            </label>
            <label>
              <span>Image URL</span>
              <div className="category-image-input"><ImagePlus aria-hidden="true" /><input value={draft.image} onChange={(event) => setDraft((current) => ({ ...current, image: event.target.value }))} placeholder="https://" /></div>
            </label>
            <label className="category-dialog-status">
              <input type="checkbox" checked={draft.active} onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))} />
              <span>Active category</span>
            </label>
          </form>
        ) : null}

        <footer>
          <button type="button" onClick={onClose}>{kind === 'details' ? 'Close' : 'Cancel'}</button>
          {kind === 'delete' && category ? <button className="danger" type="button" onClick={() => onDelete(category)}>Delete Category</button> : null}
          {(kind === 'add' || kind === 'edit') ? <button className="primary" type="button" disabled={!draft.name.trim() || !draft.description.trim()} onClick={submit}>{kind === 'add' ? 'Add Category' : 'Save Changes'}</button> : null}
        </footer>
      </section>
    </div>
  );
};
