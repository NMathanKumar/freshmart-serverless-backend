import React, { useEffect, useState } from 'react';
import { freshmartSdk } from '../lib/sdk';
import { Logger } from '@/shared/utils/logger';
import { usePermissions } from '../context/PermissionsContext';
import { ErrorState, EmptyState, TableSkeleton } from '@/shared/components/ui';
import { ShieldCheck } from 'lucide-react';

export const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { hasPermission } = usePermissions();

  const loadRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await freshmartSdk.iam.listRoles();
      setRoles(data);
    } catch (e) {
      Logger.error('Failed to load roles', e, { module: 'Roles' });
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  if (!hasPermission('role.manage')) {
    return (
      <div className="p-8 max-w-lg mx-auto my-12">
        <ErrorState 
          title="Access Denied" 
          description="You do not have permission to manage roles."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Role Management</h1>
        <TableSkeleton rows={5} columns={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Role Management</h1>
        <ErrorState
          title="Failed to load roles"
          description={error?.message || 'Server connection error.'}
          onRetry={loadRoles}
          errorCode={error?.code}
          correlationId={error?.correlationId}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Role Management</h1>
      <div className="bg-white shadow rounded-lg p-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {roles.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-0">
                  <EmptyState 
                    title="No roles found" 
                    description="No roles are currently configured in the system."
                    icon={<ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />} 
                  />
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.roleId}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{role.name}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {role.permissions?.join(', ') || 'None'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
