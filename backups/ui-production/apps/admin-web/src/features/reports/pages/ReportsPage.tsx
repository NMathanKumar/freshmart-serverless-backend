import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Plus,
  Search,
  FileText,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useReports, useExportReport, useDownloadReport } from '../hooks/useReports';
import { Skeleton, CardSkeleton, TableSkeleton } from '../../../components/ui/skeleton';
import { isAdmin } from '@freshmart/shared';

export const ReportsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Reports');
  const [page, setPage] = useState(1);

  // Debounce search by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: reports, isLoading, isError, error, refetch } = useReports({
    search: debouncedSearch,
    category: activeCategory,
    page,
    limit: 10,
  });

  const exportMutation = useExportReport();
  const downloadMutation = useDownloadReport();

  const userIsAdmin = isAdmin();

  const handleGenerateReport = () => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required to generate reports.');
      return;
    }
    exportMutation.mutate({
      reportType: activeCategory === 'All Reports' ? 'Sales' : activeCategory,
      format: 'pdf',
    }, {
      onSuccess: (res) => {
        alert(`Report queued and generated successfully: ${res.fileName}`);
      },
    });
  };

  const handleDownload = (reportId: string) => {
    if (!userIsAdmin) {
      alert('403 Access Denied: Admin authorization required.');
      return;
    }
    downloadMutation.mutate(reportId, {
      onSuccess: (res) => {
        alert(`Downloading report file: ${res.fileName}`);
      },
    });
  };

  if (!userIsAdmin) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#0f172a]">403 Access Denied</h3>
        <p className="text-xs text-slate-500">
          You do not have administrative permissions to view or generate store financial reports.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
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
        <TableSkeleton rows={5} columns={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#0f172a]">Failed to load report registry</h3>
        <p className="text-xs text-slate-500">{error?.message || 'Server connection error'}</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#04883b] text-white font-bold text-xs hover:bg-[#037030] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const displayReports =
    reports && reports.length > 0
      ? reports
      : [
          {
            id: 'RPT-2024-001',
            title: 'Monthly Financial Sales & Tax Audit',
            category: 'Sales' as const,
            generatedAt: 'Oct 01, 2024',
            fileSize: '2.4 MB',
            format: 'PDF' as const,
            status: 'COMPLETED' as const,
          },
          {
            id: 'RPT-2024-002',
            title: 'Q3 Order Fulfillment & Shipping Breakdown',
            category: 'Orders' as const,
            generatedAt: 'Oct 05, 2024',
            fileSize: '4.1 MB',
            format: 'XLSX' as const,
            status: 'COMPLETED' as const,
          },
          {
            id: 'RPT-2024-003',
            title: 'Customer Cohort Retention & Lifetime Value',
            category: 'Customers' as const,
            generatedAt: 'Oct 12, 2024',
            fileSize: '1.8 MB',
            format: 'CSV' as const,
            status: 'COMPLETED' as const,
          },
          {
            id: 'RPT-2024-004',
            title: 'Warehouse Stock Valuation & Waste Audit',
            category: 'Inventory' as const,
            generatedAt: 'Oct 15, 2024',
            fileSize: '3.2 MB',
            format: 'PDF' as const,
            status: 'COMPLETED' as const,
          },
        ];

  return (
    <div className="space-y-6">
      {/* Title & Header Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-[#04883b]" />
            <h1 className="text-2xl font-extrabold text-[#0f172a]">Report Registry</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Generate, schedule, and export comprehensive store performance and audit reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#04883b] text-xs font-bold text-white shadow-md shadow-[#04883b]/20 hover:bg-[#037030] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Report</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            TOTAL REPORTS
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">148</span>
            <span className="text-[11px] font-bold text-[#04883b] bg-[#e6f7ec] px-2 py-0.5 rounded-full">
              Archived
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            SALES AUDITS
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">52</span>
            <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
              Verified
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            MONTHLY EXPORTS
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">28</span>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              This Month
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e9f2e7] shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            SCHEDULED RUNS
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-amber-600">6</span>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Active Cron
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center bg-white p-1 rounded-xl border border-[#e9f2e7]">
          {['All Reports', 'Sales', 'Orders', 'Customers', 'Inventory', 'Products'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setPage(1);
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#04883b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#04883b]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search report title, ID..."
              className="w-full bg-white border border-[#e9f2e7] rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#04883b]"
            />
          </div>

          <button className="p-2 bg-white border border-[#e9f2e7] rounded-xl text-slate-600 hover:border-[#04883b] shrink-0">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reports Data Table */}
      <div className="bg-white rounded-2xl border border-[#e9f2e7] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f0f7ee] text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-4">REPORT TITLE</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">CATEGORY</th>
                <th className="px-6 py-4">GENERATED AT</th>
                <th className="px-6 py-4">FILE SIZE</th>
                <th className="px-6 py-4 text-center">FORMAT</th>
                <th className="px-6 py-4 text-center">STATUS</th>
                <th className="px-6 py-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {displayReports.map((rpt) => (
                <tr key={rpt.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#e6f7ec] text-[#04883b] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-[#0f172a]">{rpt.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-600">{rpt.id}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#f0f7ee] text-slate-700">
                      {rpt.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{rpt.generatedAt}</td>
                  <td className="px-6 py-4 text-slate-600">{rpt.fileSize}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 uppercase">
                      {rpt.format}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#e6f7ec] text-[#04883b]">
                      Completed
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDownload(rpt.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e8f3e5] text-xs font-bold text-[#04883b] hover:bg-[#dcefd8] transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-[#f4fcf0]/50">
          <span>
            {(reports || []).length === 0
              ? 'Showing 0 reports'
              : `Showing ${ (page - 1) * 10 + 1 } to ${Math.min(page * 10, (reports || []).length)} of ${(reports || []).length} reports`}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(1)}
              className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer ${
                page === 1 ? 'bg-[#04883b] text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              1
            </button>
            <button
              onClick={() => setPage(2)}
              className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer ${
                page === 2 ? 'bg-[#04883b] text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              2
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
