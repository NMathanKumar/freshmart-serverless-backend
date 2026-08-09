import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { CategoryModel } from '../services/category.service';
import { useCreateCategory, useUpdateCategory } from '../hooks/useCategories';
import { useToast } from '../../../components/ui/toast';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  slug: z.string().min(2).max(120).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: CategoryModel | null;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, category }) => {
  const isEditing = !!category;
  
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          slug: category.slug,
          description: category.description,
          imageUrl: category.image,
          status: category.status,
        });
      } else {
        reset({
          name: '',
          slug: '',
          description: '',
          imageUrl: '',
          status: 'ACTIVE',
        });
      }
    }
  }, [isOpen, category, reset]);

  if (!isOpen) return null;

  const { showToast } = useToast();

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: category.id, input: data });
        showToast('Category updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(data);
        showToast('Category created successfully', 'success');
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to save category', err);
      showToast(err.message || 'Failed to save category', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0f172a]">
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Category Name *</label>
            <input
              {...register('name')}
              className={`w-full px-4 py-2.5 bg-white border ${
                errors.name ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-[#04883b]'
              } rounded-xl text-sm focus:outline-none focus:ring-1 ${
                errors.name ? 'focus:ring-rose-500' : 'focus:ring-[#04883b]'
              } transition-colors`}
              placeholder="e.g. Fresh Vegetables"
            />
            {errors.name && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.name.message}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">URL Slug</label>
            <input
              {...register('slug')}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#04883b] focus:ring-1 focus:ring-[#04883b] transition-colors"
              placeholder="e.g. fresh-vegetables (optional)"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#04883b] focus:ring-1 focus:ring-[#04883b] transition-colors resize-none"
              placeholder="Describe the category..."
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Image URL</label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register('imageUrl')}
                className={`w-full pl-10 pr-4 py-2.5 bg-white border ${
                  errors.imageUrl ? 'border-rose-300' : 'border-slate-200'
                } rounded-xl text-sm focus:outline-none focus:border-[#04883b] focus:ring-1 focus:ring-[#04883b] transition-colors`}
                placeholder="https://..."
              />
            </div>
            {errors.imageUrl && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.imageUrl.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
            <select
              {...register('status')}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#04883b] focus:ring-1 focus:ring-[#04883b] transition-colors"
            >
              <option value="ACTIVE">Active (Visible to customers)</option>
              <option value="INACTIVE">Inactive (Hidden)</option>
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || updateMutation.isPending || createMutation.isPending}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#04883b] text-white text-sm font-bold shadow-sm shadow-[#04883b]/20 hover:bg-[#037030] transition-all disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]"
          >
            {(isSubmitting || updateMutation.isPending || createMutation.isPending) ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>{isEditing ? 'Save Changes' : 'Create Category'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
