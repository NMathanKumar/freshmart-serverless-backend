import React from 'react';
import { Hammer } from 'lucide-react';

export interface FeaturePlaceholderProps {
  title?: string;
  description?: string;
}

export const FeaturePlaceholder: React.FC<FeaturePlaceholderProps> = ({
  title = 'Under Construction',
  description = 'This feature is not yet available as the backend integration is pending.',
}) => (
  <div 
    className="w-full py-16 px-6 glass-card rounded-2xl flex flex-col items-center justify-center text-center"
    role="status"
    aria-live="polite"
  >
    <div className="p-4 rounded-full bg-slate-800/80 mb-4 border border-slate-700/60">
      <Hammer className="w-12 h-12 text-indigo-400" />
    </div>
    <h4 className="text-base font-bold text-slate-200">{title}</h4>
    <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6 leading-relaxed">{description}</p>
  </div>
);
