import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  AlertCircle,
  RefreshCw,
  Package,
  CheckCircle2,
  IndianRupee,
  Layers,
  Image as ImageIcon,
  Tag,
  ArrowLeft,
  FileText,
  Sparkles,
  Eye,
  X,
  UploadCloud,
  CloudUpload,
} from 'lucide-react';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../hooks/useProducts';
import { productService, type ProductModel } from '../services/product.service';
import { Skeleton, CardSkeleton, TableSkeleton, ErrorState, EmptyState } from '@/shared/components/ui';
import { DeleteConfirmationModal } from '@/shared/components/ui/delete-modal';
import { Select } from '@/shared/components/ui/select';
import { useToast } from '@/shared/components/ui/toast';
import { Logger } from '@/shared/utils/logger';
import { isAdmin } from '@freshmart/shared';
import { AdminShell } from '../../admin/components/admin-shell';

export const ProductsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [page, setPage] = useState(1);
  const { showToast } = useToast();

  // Table Multi-Select State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [removedProductIds, setRemovedProductIds] = useState<string[]>([]);

  // In-Page Product Form View State (Replaces Popup Modal)
  const [showInPageForm, setShowInPageForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductModel | null>(null);
  const [isUploadingToS3, setIsUploadingToS3] = useState(false);

  // Custom Delete Confirmation Modal State
  const [deleteTargetProduct, setDeleteTargetProduct] = useState<ProductModel | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Form Fields State with Multiple Images Support
  const [formData, setFormData] = useState<{
    productName: string;
    category: string;
    price: string;
    stock: string;
    sku: string;
    description: string;
    images: string[];
    available: boolean;
  }>({
    productName: '',
    category: 'Fresh Produce',
    price: '',
    stock: '',
    sku: '',
    description: '',
    images: [],
    available: true,
  });

  // Active Preview Image Index in Card Preview
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  // Dynamic Category Dropdown Options loaded from Real-time API
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([
    { value: 'All Categories', label: 'All Categories' },
    { value: 'Fresh Produce', label: 'Fresh Produce' },
    { value: 'Dairy & Eggs', label: 'Dairy & Eggs' },
    { value: 'Bakery', label: 'Bakery' },
    { value: 'Beverages', label: 'Beverages' },
    { value: 'Snacks & Bakery', label: 'Snacks & Bakery' },
    { value: 'Frozen Foods', label: 'Frozen Foods' },
    { value: 'Meat & Seafood', label: 'Meat & Seafood' },
  ]);

  useEffect(() => {
    const fetchApiCategories = async () => {
      try {
        const { freshmartSdk } = await import('../../../lib/sdk');
        const res = await freshmartSdk.category.listCategories();
        const raw = (res as any)?.data || (res as any)?.categories || (res as any)?.items || (Array.isArray(res) ? res : []);
        if (Array.isArray(raw) && raw.length > 0) {
          const apiCats = raw.map((c: any) => ({
            value: c.name || c.title || c.categoryName || 'Category',
            label: c.name || c.title || c.categoryName || 'Category',
          }));
          setCategoryOptions([{ value: 'All Categories', label: 'All Categories' }, ...apiCats]);
        }
      } catch (err) {
        Logger.warn('Failed to load categories from API for ProductsPage', { error: err });
      }
    };
    fetchApiCategories();
  }, []);

  // Status Dropdown Options
  const statusOptions = [
    { value: 'All Status', label: 'All Status' },
    { value: 'Active', label: 'Active Status' },
    { value: 'Inactive', label: 'Inactive Status' },
  ];

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: products, isLoading, isError, error, refetch } = useProducts({
    search: debouncedSearch,
    category: selectedCategory,
    status: selectedStatus,
    limit: 10,
  });

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const userIsAdmin = isAdmin();

  // Pure Database Items minus Optimistically Removed Items — Zero Mock Data Fallbacks
  const displayProducts = (products || []).filter((p) => !removedProductIds.includes(p.id));

  const handleExportCSV = () => {
    if (!displayProducts || displayProducts.length === 0) {
      showToast('No products available to export.', 'error');
      return;
    }

    const headers = ['Product ID', 'SKU', 'Product Name', 'Category', 'Price ($)', 'Stock Level', 'Status'];
    const rows = displayProducts.map((p) => [
      `"${(p.id || '').replace(/"/g, '""')}"`,
      `"${(p.sku || '').replace(/"/g, '""')}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.category || '').replace(/"/g, '""')}"`,
      `"${p.price ?? 0}"`,
      `"${p.stock ?? 0}"`,
      `"${(p.status || 'Active').replace(/"/g, '""')}"`
    ]);

    const csvString = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `freshmart_products_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Product catalog exported successfully!', 'success');
  };

  // Toggle Select All
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(displayProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Toggle Single Row Selection
  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Create Form in Same Page
  const handleOpenCreateForm = () => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required to add products.');
      return;
    }
    setEditingProduct(null);
    setFormData({
      productName: '',
      category: 'Fresh Produce',
      price: '249.00',
      stock: '50',
      sku: `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      description: 'Fresh organic product delivered straight from local farms.',
      images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80'],
      available: true,
    });
    setActivePreviewIndex(0);
    setShowInPageForm(true);
  };

  // Open Edit Form in Same Page
  const handleOpenEditForm = (product: ProductModel) => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required to edit products.');
      return;
    }
    setEditingProduct(product);
    setFormData({
      productName: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      sku: product.sku,
      description: product.description || '',
      images: product.images && product.images.length > 0 ? product.images : [product.image],
      available: product.available,
    });
    setActivePreviewIndex(0);
    setShowInPageForm(true);
  };

  // Close Form and Return to List
  const handleCloseForm = () => {
    setShowInPageForm(false);
    setEditingProduct(null);
  };

  // Multiple File Selection & Direct AWS S3 Bucket Upload Handler
  const handleMultipleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingToS3(true);
    try {
      const uploadedUrls = await Promise.all(
        files.map((file) => productService.uploadImageToS3(file))
      );
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (err) {
      Logger.warn('Error uploading image to AWS S3', { error: err, module: 'ProductsPage' });
    } finally {
      setIsUploadingToS3(false);
    }
  };

  // Remove Single Image from Uploaded List
  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove),
    }));
    if (activePreviewIndex >= formData.images.length - 1) {
      setActivePreviewIndex(Math.max(0, formData.images.length - 2));
    }
  };

  // Trigger Custom Delete Confirmation Modal for Single Row
  const handlePromptDelete = (product: ProductModel) => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required.');
      return;
    }
    setDeleteTargetProduct(product);
  };

  // Execute Single Row Delete — Instantly Update UI & Delete in Backend
  const handleConfirmSingleDelete = () => {
    if (deleteTargetProduct) {
      const targetId = deleteTargetProduct.id;

      // 1. Immediately remove from local UI list
      setRemovedProductIds((prev) => [...prev, targetId]);
      setSelectedIds((prev) => prev.filter((id) => id !== targetId));
      setDeleteTargetProduct(null);

      // 2. Dispatch DELETE API call to backend database
      deleteProductMutation.mutate(targetId, {
        onSuccess: () => showToast('Product deleted successfully', 'success'),
        onError: (err) => showToast(err.message || 'Failed to delete product', 'error')
      });
    }
  };

  // Trigger Custom Bulk Delete Modal
  const handlePromptBulkDelete = () => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required.');
      return;
    }
    setIsBulkDeleteModalOpen(true);
  };

  // Execute Bulk Delete — Instantly Update UI & Delete in Backend
  const handleConfirmBulkDelete = () => {
    // 1. Immediately remove selected items from local UI list
    setRemovedProductIds((prev) => [...prev, ...selectedIds]);
    const idsToDelete = [...selectedIds];
    setSelectedIds([]);
    setIsBulkDeleteModalOpen(false);

    // 2. Dispatch DELETE API calls to backend database for all selected IDs
    Promise.all(idsToDelete.map((id) => deleteProductMutation.mutateAsync(id)))
      .then(() => showToast('Products deleted successfully', 'success'))
      .catch((err) => showToast(err.message || 'Error deleting some products', 'error'));
  };

  // Form Submit Handler
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName.trim()) {
      return;
    }

    const numericPrice = parseFloat(formData.price) || 0;
    const numericStock = parseInt(formData.stock, 10) || 0;
    const finalImages =
      formData.images.length > 0
        ? formData.images
        : ['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80'];

    try {
      if (editingProduct) {
        // Update Existing Product directly in DB
        await updateProductMutation.mutateAsync({
          id: editingProduct.id,
          input: {
            productName: formData.productName,
            category: formData.category,
            price: numericPrice,
            stock: numericStock,
            sku: formData.sku,
            description: formData.description,
            available: formData.available,
            images: finalImages,
          },
        });
        showToast('Product updated successfully', 'success');
      } else {
        // Create New Product directly in DB
        await createProductMutation.mutateAsync({
          productName: formData.productName,
          category: formData.category,
          price: numericPrice,
          stock: numericStock,
          sku: formData.sku,
          description: formData.description,
          available: formData.available,
          images: finalImages,
        });
        showToast('Product created successfully', 'success');
      }
      setShowInPageForm(false);
      setEditingProduct(null);
    } catch (err: any) {
      showToast(err.message || 'Error saving product', 'error');
    }
  };

  if (isLoading) {
    return (
      <AdminShell searchPlaceholder="Search products..." user="alex" variant="operations" onSearch={setSearchTerm}>
      <div className="space-y-6 px-5 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56 rounded-xl" />
            <Skeleton className="h-4 w-96 rounded-md" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton rows={6} columns={8} />
      </div>
      </AdminShell>
    );
  }

  if (isError) {
    return (
      <AdminShell searchPlaceholder="Search products..." user="alex" variant="operations" onSearch={setSearchTerm}>
      <div className="my-12 max-w-lg mx-auto px-5 lg:px-8">
        <ErrorState
          title="Failed to load product catalog"
          description={error?.message || 'Server connection error.'}
          onRetry={() => refetch()}
          errorCode={error?.code}
          correlationId={error?.correlationId}
        />
      </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell searchPlaceholder="Search products..." user="alex" variant="operations" onSearch={setSearchTerm}>
    <div className="space-y-6 min-h-[calc(100vh-120px)] pb-12 px-5 lg:px-8">
      {/* TOP PRODUCT NAVIGATION MENU TABS */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#e9f2e7] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleCloseForm()}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              !showInPageForm
                ? 'bg-[#04883b] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-[#e6f7ec] hover:text-[#04883b]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Show All Products</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreateForm()}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              showInPageForm && !editingProduct
                ? 'bg-[#04883b] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-[#e6f7ec] hover:text-[#04883b]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>

          {editingProduct && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 text-white shadow-sm">
              <Edit3 className="w-4 h-4" />
              <span>Editing: {editingProduct.name}</span>
            </div>
          )}
        </div>

        <div className="text-xs font-bold text-slate-500 hidden sm:block pr-2">
          Total Catalog Items: <span className="text-[#04883b] font-black">{displayProducts.length}</span>
        </div>
      </div>

      {/* SECTION 1: IN-PAGE PRODUCT FORM WITH AWS S3 UPLOAD & LIVE STORE CARD PREVIEW */}
      {showInPageForm ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Form Header with Back Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#e9f2e7] shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCloseForm}
                className="p-2.5 rounded-2xl bg-slate-100 text-slate-600 hover:bg-[#e6f7ec] hover:text-[#04883b] transition-colors"
                title="Back to Product List"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f7ec] text-[#04883b]">
                    {editingProduct ? 'EDIT MODE' : 'CREATE MODE'}
                  </span>
                  <h1 className="text-xl font-extrabold text-[#0f172a]">
                    {editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Product Item'}
                  </h1>
                </div>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Upload image files directly to AWS S3 Bucket (freshmart-dev-assets-769044546162).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitForm}
                disabled={createProductMutation.isPending || updateProductMutation.isPending || isUploadingToS3}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#04883b] text-xs font-bold text-white shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors disabled:opacity-50"
              >
                {createProductMutation.isPending || updateProductMutation.isPending || isUploadingToS3 ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{editingProduct ? 'Update Product' : 'Save Product'}</span>
              </button>
            </div>
          </div>

          {/* Form Content: 2-Column Responsive Layout */}
          <form onSubmit={handleSubmitForm} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Product Attributes & AWS S3 Multiple Image Upload */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-[#e9f2e7] shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-[#0f172a] border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#04883b]" />
                  General Information
                </h3>

                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Hass Avocado"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#04883b]/20 focus:border-[#04883b]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Custom Category Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#04883b]" />
                      Category *
                    </label>
                    <Select
                      options={categoryOptions.filter((c) => c.value !== 'All Categories')}
                      value={formData.category}
                      onChange={(val) => setFormData({ ...formData, category: val })}
                    />
                  </div>

                  {/* Price in INR ₹ */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-[#04883b]" />
                      Price (₹ INR) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="249.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#04883b]/20 focus:border-[#04883b]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Stock Quantity */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      placeholder="100"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#04883b]/20 focus:border-[#04883b]"
                    />
                  </div>

                  {/* SKU Code */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">SKU Code</label>
                    <input
                      type="text"
                      placeholder="AVO-9910"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#04883b]/20 focus:border-[#04883b]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#04883b]" />
                    Product Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter detailed product description, ingredients, nutrition summary..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#04883b]/20 focus:border-[#04883b]"
                  />
                </div>

                {/* Catalog Visibility Status */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f8fcf7] border border-[#dcefd8]">
                  <div>
                    <p className="text-xs font-extrabold text-[#0f172a]">Storefront Availability</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Make product active and available for customers to order immediately.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-[#04883b] focus:ring-[#04883b]"
                  />
                </div>
              </div>

              {/* AWS S3 Multiple Image Upload Section */}
              <div className="bg-white p-6 rounded-3xl border border-[#e9f2e7] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-extrabold text-[#0f172a] flex items-center gap-2">
                    <CloudUpload className="w-4 h-4 text-[#04883b]" />
                    AWS S3 Product Images ({formData.images.length})
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#04883b] border border-emerald-200">
                    S3 Bucket: freshmart-dev-assets-769044546162
                  </span>
                </div>

                {/* Drag-and-Drop AWS S3 Upload Dropzone */}
                <div className="relative group border-2 border-dashed border-[#dcefd8] hover:border-[#04883b] bg-[#f8fcf7] rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMultipleFilesChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-12 h-12 rounded-full bg-[#e6f7ec] text-[#04883b] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    {isUploadingToS3 ? (
                      <RefreshCw className="w-6 h-6 animate-spin text-[#04883b]" />
                    ) : (
                      <UploadCloud className="w-6 h-6" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-[#04883b]">
                    {isUploadingToS3
                      ? 'Uploading Image Binary to AWS S3 Bucket...'
                      : 'Click or Drag & Drop Multiple Files to Upload to AWS S3'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Uploads directly to AWS S3 Bucket: freshmart-dev-assets-769044546162
                  </p>
                </div>

                {/* Gallery Grid of Uploaded Images */}
                {formData.images.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-bold text-slate-600">AWS S3 Image Gallery</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {formData.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className={`relative group rounded-2xl overflow-hidden border-2 transition-all h-24 bg-slate-50 cursor-pointer ${
                            activePreviewIndex === idx
                              ? 'border-[#04883b] ring-2 ring-[#04883b]/20 shadow-md'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                          onClick={() => setActivePreviewIndex(idx)}
                        >
                          <img
                            src={imgUrl}
                            alt={`S3 Upload ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors"
                            title="Remove Image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          {activePreviewIndex === idx && (
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-[#04883b] text-white text-[9px] font-bold">
                              PRIMARY
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: LIVE STORE PRODUCT CARD PREVIEW */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-[#e9f2e7] shadow-sm space-y-4 sticky top-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-extrabold text-[#0f172a] flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#04883b]" />
                    Live Store Card Preview
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f7ec] text-[#04883b] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    LIVE
                  </span>
                </div>

                {/* Live Card Component Rendering */}
                <div className="bg-white border border-[#e9f2e7] rounded-3xl p-4 shadow-md space-y-3 transition-all hover:shadow-lg">
                  {/* Primary Preview Image */}
                  <div className="relative h-48 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100">
                    {formData.images.length > 0 ? (
                      <img
                        src={formData.images[activePreviewIndex] || formData.images[0]}
                        alt={formData.productName || 'Preview'}
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <ImageIcon className="w-10 h-10 mb-1" />
                        <span className="text-xs font-semibold text-slate-400">No S3 Image Uploaded</span>
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm">
                        {formData.category}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          formData.available
                            ? 'bg-[#e6f7ec] text-[#04883b]'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {formData.available ? 'IN STOCK' : 'UNAVAILABLE'}
                      </span>
                    </div>
                  </div>

                  {/* Multiple Thumbnail Selector in Card Preview */}
                  {formData.images.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {formData.images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActivePreviewIndex(idx)}
                          className={`w-10 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                            activePreviewIndex === idx ? 'border-[#04883b]' : 'border-slate-200'
                          }`}
                        >
                          <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Product Metadata */}
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-slate-400">{formData.sku || 'SKU-0000'}</p>
                    <h4 className="text-base font-extrabold text-[#0f172a] truncate">
                      {formData.productName || 'Product Title Preview'}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {formData.description || 'No description entered yet...'}
                    </p>
                  </div>

                  {/* Stock Bar & Price */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">PRICE</span>
                      <span className="text-lg font-extrabold text-[#04883b]">
                        ₹{parseFloat(formData.price || '0').toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">STOCK</span>
                      <span className="text-xs font-bold text-[#0f172a]">
                        {formData.stock || '0'} units
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* SECTION 2: PRODUCT LIST TABLE VIEW */
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">Product Management</h1>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Manage your store catalog, update inventory levels, and track product statuses.
              </p>
            </div>
            <button
              onClick={handleOpenCreateForm}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#04883b] text-xs font-bold text-white shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>

          {/* 4 Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                TOTAL PRODUCTS
              </span>
              <p className="text-2xl font-extrabold text-[#0f172a] mt-2">{displayProducts.length.toLocaleString('en-US')}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                ACTIVE STOCK
              </span>
              <p className="text-2xl font-extrabold text-[#0f172a] mt-2">{displayProducts.filter((p) => p.status === 'ACTIVE').reduce((acc, p) => acc + p.stock, 0).toLocaleString('en-US')}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                LOW STOCK ALERT
              </span>
              <p className="text-2xl font-extrabold text-amber-600 mt-2">{displayProducts.filter((p) => p.stock > 0 && p.stock < 10).length.toLocaleString('en-US')}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                DRAFT / INACTIVE
              </span>
              <p className="text-2xl font-extrabold text-slate-600 mt-2">{displayProducts.filter((p) => p.status !== 'ACTIVE').length.toLocaleString('en-US')}</p>
            </div>
          </div>

          {/* Search & Custom Dropdown Filter Row */}
          <div className="bg-white p-4 rounded-2xl border border-[#e9f2e7] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by product, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#04883b]/20 focus:border-[#04883b]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              {/* Custom Reusable Select Component for Category */}
              <div className="w-44">
                <Select
                  options={categoryOptions}
                  value={selectedCategory}
                  onChange={(val) => {
                    setSelectedCategory(val);
                    setPage(1);
                  }}
                />
              </div>

              {/* Custom Reusable Select Component for Status */}
              <div className="w-40">
                <Select
                  options={statusOptions}
                  value={selectedStatus}
                  onChange={(val) => {
                    setSelectedStatus(val);
                    setPage(1);
                  }}
                />
              </div>

              {/* Bulk Action Bar if selection active */}
              {selectedIds.length > 0 && (
                <button
                  onClick={handlePromptBulkDelete}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete ({selectedIds.length})</span>
                </button>
              )}

              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Main Products Table */}
          <div className="bg-white rounded-2xl border border-[#e9f2e7] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-[#e9f2e7] text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={displayProducts.length > 0 && selectedIds.length === displayProducts.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-[#04883b] focus:ring-[#04883b]"
                      />
                    </th>
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">SKU</th>
                    <th className="py-3.5 px-4">Price (₹ INR)</th>
                    <th className="py-3.5 px-4">Stock Level</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {displayProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-0">
                        <EmptyState title="No products found in database" description="Click 'Add Product' above to create a new product item." icon={<Package className="w-8 h-8 text-slate-300 mx-auto" />} />
                      </td>
                    </tr>
                  ) : (
                    displayProducts.map((p) => {
                      const isSelected = selectedIds.includes(p.id);
                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-[#f8fcf7]/60 transition-colors ${
                            isSelected ? 'bg-[#f4fcf0]' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectRow(p.id)}
                              className="w-4 h-4 rounded border-slate-300 text-[#04883b] focus:ring-[#04883b]"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="min-w-0">
                              <p className="font-bold text-[#0f172a] truncate max-w-xs">{p.name}</p>
                              <p className="text-[10px] font-mono text-slate-400 truncate">{p.id}</p>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-600">
                            <span className="inline-block px-2 py-1 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-500">{p.sku}</td>
                          <td className="py-3.5 px-4 font-bold text-[#0f172a]">{p.formattedPrice}</td>
                          <td className="py-3.5 px-4 font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    p.stock > 20
                                      ? 'bg-[#04883b]'
                                      : p.stock > 0
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${Math.min(100, (p.stock / 150) * 100)}%` }}
                                />
                              </div>
                              <span className="text-slate-700 font-bold">{p.stock} units</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                p.status === 'ACTIVE'
                                  ? 'bg-[#e6f7ec] text-[#04883b]'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  p.status === 'ACTIVE' ? 'bg-[#04883b]' : 'bg-slate-400'
                                }`}
                              />
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditForm(p)}
                                title="Edit Product"
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handlePromptDelete(p)}
                                title="Delete Product"
                                className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Dynamic Pagination Footer */}
            <div className="p-4 border-t border-[#e9f2e7] bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <p>
                Showing {displayProducts.length > 0 ? (page - 1) * 10 + 1 : 0} to{' '}
                {Math.min(page * 10, displayProducts.length)} of {displayProducts.length} products
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 bg-[#04883b] text-white font-bold rounded-lg">{page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={displayProducts.length < page * 10}
                  className="p-1.5 rounded-lg border border-[#e9f2e7] bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal (Single Item) */}
      <DeleteConfirmationModal
        isOpen={!!deleteTargetProduct}
        onClose={() => setDeleteTargetProduct(null)}
        onConfirm={handleConfirmSingleDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone and will permanently delete the item from your database."
        itemTitle={deleteTargetProduct?.name}
        itemSubtitle={`SKU: ${deleteTargetProduct?.sku} | ${deleteTargetProduct?.formattedPrice}`}
        itemImage={deleteTargetProduct?.image}
        isDeleting={deleteProductMutation.isPending}
      />

      {/* Custom Delete Confirmation Modal (Bulk Items) */}
      <DeleteConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        title={`Delete ${selectedIds.length} Selected Products`}
        description={`Are you sure you want to delete ${selectedIds.length} selected products? This action will remove all selected items permanently from your database.`}
        itemTitle={`${selectedIds.length} Products Selected`}
        itemSubtitle="Selected items will be permanently removed"
        isDeleting={deleteProductMutation.isPending}
      />
    </div>
    </AdminShell>
  );
};
