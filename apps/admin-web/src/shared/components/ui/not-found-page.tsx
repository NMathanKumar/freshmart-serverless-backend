import React from 'react';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#04883b] flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
          <FileQuestion className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">404</h1>
          <h2 className="text-base font-bold text-slate-700">Page Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The page or admin resource you are looking for doesn't exist, has been moved, or is part of a de-scoped feature.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#04883b] text-white text-xs font-bold shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </main>
  );
};
