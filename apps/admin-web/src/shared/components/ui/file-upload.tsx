import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  label?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = 'image/*',
  multiple = false,
  maxSizeMB = 5,
  label = 'Upload Image Assets',
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const selected = Array.from(fileList).filter(
      (file) => file.size <= maxSizeMB * 1024 * 1024
    );
    if (selected.length > 0) {
      onFileSelect(selected);
    }
  };

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {label && <label className="block text-xs font-semibold text-slate-300">{label}</label>}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 bg-slate-900/40',
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <div className="p-3 rounded-full bg-slate-800/80 text-emerald-400 mb-3 border border-slate-700/60">
          <UploadCloud className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold text-slate-200">
          Drag & drop images here, or <span className="text-emerald-400 underline">browse</span>
        </p>
        <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, WEBP up to {maxSizeMB}MB</p>
      </div>
    </div>
  );
};
