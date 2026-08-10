import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ImagePreviewProps {
  urls: string[];
  onRemove?: (index: number) => void;
  className?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ urls, onRemove, className }) => {
  if (!urls || urls.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-3 py-2', className)}>
      {urls.map((url, idx) => (
        <div
          key={idx}
          className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group"
        >
          <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="absolute top-1 right-1 p-1 rounded-full bg-slate-950/80 text-slate-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
