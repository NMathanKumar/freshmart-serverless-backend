import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Download, Search, Filter } from 'lucide-react';
import { usePermissions } from '../context/PermissionsContext';
import { freshmartSdk } from '../lib/sdk';
import { queryKeys } from '../lib/queryKeys';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { Drawer } from '../components/ui/drawer';
import { Pagination } from '../components/ui/pagination';
import { LoadingState } from '../components/ui/loading-state';
import { ErrorState } from '../components/ui/error-state';
import { EmptyState } from '../components/ui/empty-state';
import type { ActivityLog } from '@freshmart/api-sdk';

export const AuditLogs: React.FC = () => {
  const { hasPermission } = usePermissions();
  const canRead = hasPermission('activity.read');
  const canExport = hasPermission('activity.export');

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedResource, setSelectedResource] = useState<string>('ALL');
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filters = {
    page,
    limit: 20,
    search: searchTerm,
    role: selectedRole !== 'ALL' ? selectedRole : undefined,
    resource: selectedResource !== 'ALL' ? selectedResource : undefined,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.activity.list(filters),
    queryFn: () => freshmartSdk.activity.listActivities(filters),
    enabled: canRead,
  });

  if (!canRead) {
    return (
      <EmptyState
        icon={<ShieldCheck className="h-8 w-8 text-rose-500" />}
        title="Access Denied"
        description="You do not have permission to view activity logs."
      />
    );
  }

  const logs = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 20 };

  const handleExport = () => {
    // In a real implementation, this would call an export API endpoint
    // and trigger a file download.
    alert('Exporting CSV...');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            Audit & Security Logs
          </h1>
          <p className="text-sm text-slate-400">Complete audit trail of administrative actions across the platform</p>
        </div>
        {canExport && (
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search user, action, or ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <Select
            value={selectedRole}
            onChange={(value) => {
              setSelectedRole(value);
              setPage(1);
            }}
            className="w-full md:w-48"
            options={[
              { value: 'ALL', label: 'All Roles' },
              { value: 'SUPER_ADMIN', label: 'Super Admin' },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'ORDER_MANAGER', label: 'Order Manager' },
            ]}
          />
          <Select
            value={selectedResource}
            onChange={(value) => {
              setSelectedResource(value);
              setPage(1);
            }}
            className="w-full md:w-48"
            options={[
              { value: 'ALL', label: 'All Resources' },
              { value: 'PRODUCT', label: 'Product' },
              { value: 'ORDER', label: 'Order' },
              { value: 'INVENTORY', label: 'Inventory' },
              { value: 'IAM', label: 'IAM' },
              { value: 'DELIVERY', label: 'Delivery' },
            ]}
          />
        </div>

        {isLoading ? (
          <LoadingState label="Loading activity logs..." />
        ) : isError ? (
          <ErrorState description="Failed to load activity logs" onRetry={() => refetch()} />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={<Filter className="h-8 w-8 text-slate-500" />}
            title="No logs found"
            description="Try adjusting your filters or search terms."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f0f7ee] text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Resource</th>
                    <th className="px-6 py-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  {logs.map((log) => (
                    <tr
                      key={log.activityId}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        setSelectedActivity(log);
                        setIsDrawerOpen(true);
                      }}
                    >
                      <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#0f172a]">{log.userId}</div>
                        <div className="text-[10px] text-slate-500">{log.userEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="slate" size="sm">
                          {log.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-[#04883b] text-xs">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold">{log.resource}</td>
                      <td className="px-6 py-4 font-mono text-slate-500 text-xs">{log.ipAddress || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4">
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(meta.total / meta.limit) || 1}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Activity Details"
        size="md"
      >
        {selectedActivity && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">Activity ID</p>
                <p className="font-mono text-sm text-slate-200">{selectedActivity.activityId}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Timestamp</p>
                <p className="font-mono text-sm text-slate-200">{new Date(selectedActivity.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">User</p>
                <p className="text-sm text-slate-200">{selectedActivity.userId} ({selectedActivity.userEmail})</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Role</p>
                <Badge variant="slate">{selectedActivity.role}</Badge>
              </div>
              <div>
                <p className="text-xs text-slate-400">Resource</p>
                <p className="text-sm text-slate-200">{selectedActivity.resource}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Resource ID</p>
                <p className="font-mono text-sm text-slate-200">{selectedActivity.resourceId}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Action</p>
                <p className="font-mono text-sm text-emerald-400">{selectedActivity.action}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">IP Address</p>
                <p className="font-mono text-sm text-slate-200">{selectedActivity.ipAddress || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400">Request ID (Correlation)</p>
                <p className="font-mono text-sm text-slate-200">{selectedActivity.requestId || 'N/A'}</p>
              </div>
            </div>

            {selectedActivity.beforeState && Object.keys(selectedActivity.beforeState).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-2 border-b border-slate-800 pb-1">Before State</h3>
                <pre className="bg-slate-900 p-3 rounded-md overflow-x-auto text-xs font-mono text-slate-300 border border-slate-800">
                  {JSON.stringify(selectedActivity.beforeState, null, 2)}
                </pre>
              </div>
            )}

            {selectedActivity.afterState && Object.keys(selectedActivity.afterState).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-2 border-b border-slate-800 pb-1">After State</h3>
                <pre className="bg-slate-900 p-3 rounded-md overflow-x-auto text-xs font-mono text-emerald-400 border border-slate-800">
                  {JSON.stringify(selectedActivity.afterState, null, 2)}
                </pre>
              </div>
            )}
            
            {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-2 border-b border-slate-800 pb-1">Metadata</h3>
                <pre className="bg-slate-900 p-3 rounded-md overflow-x-auto text-xs font-mono text-slate-400 border border-slate-800">
                  {JSON.stringify(selectedActivity.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
