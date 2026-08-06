import React, { useEffect, useState } from 'react';
import { freshmartSdk } from '../lib/sdk';
import { usePermissions } from '../context/PermissionsContext';

export const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    freshmartSdk.iam.listRoles().then((data) => setRoles(data)).catch(console.error);
  }, []);

  if (!hasPermission('role.manage')) {
    return <div className="p-4 text-red-500">Access Denied: You do not have permission to manage roles.</div>;
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
            {roles.map((role) => (
              <tr key={role.roleId}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{role.name}</td>
                <td className="px-6 py-4 text-gray-500">
                  {role.permissions?.join(', ') || 'None'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
