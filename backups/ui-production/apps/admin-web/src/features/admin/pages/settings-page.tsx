import { Settings2 } from 'lucide-react';
import { fetchAdminConfig } from '../api/admin-api.js';
import { AdminShell } from '../components/admin-shell.js';
import { AdminPageHeader } from '../components/admin-components.js';
import { AdminResourceState } from '../components/admin-resource-state.js';
import { useApiResource } from '../hooks/use-api-resource.js';
import { settingsPlaceholders } from '../model/mock-data.js';

const emptyConfig = (items: Awaited<ReturnType<typeof fetchAdminConfig>>) => items.length === 0;

const SettingsPage = () => {
  const { data: configs = [], retry, state } = useApiResource(fetchAdminConfig, emptyConfig);

  return (
    <AdminShell searchPlaceholder="Search settings..." user="main">
      <AdminPageHeader
        title="Settings"
        description="Administrative configuration currently deployed for FreshMart operations."
        actions={[{ disabled: true, label: 'Save Preferences', icon: Settings2, title: 'Coming Soon - Backend not yet available', tone: 'primary' }]}
      />
      <section className="grid gap-6 px-2 pb-4 lg:grid-cols-3 lg:px-4" aria-busy={state === 'loading'}>
        {state === 'loading' ? <article className="admin-panel col-span-full"><AdminResourceState loadingLabel="Loading settings" rows={3} state="loading" /></article> : null}
        {state === 'ready' ? configs.map((config, index) => {
          const Icon = settingsPlaceholders[index % settingsPlaceholders.length]?.icon ?? Settings2;
          const details = Object.entries(config.data).map(([key, value]) => `${key}: ${String(value)}`).join(' · ');
          return (
            <article key={config.adminItemId} className="admin-panel p-8">
              <div className="mb-6 inline-flex h-18 w-18 items-center justify-center rounded-[24px] bg-[#eef4e8] text-[#4e5b4d]"><Icon className="h-8 w-8" aria-hidden="true" /></div>
              <h2 className="text-[28px] font-semibold tracking-[-0.02em]">{config.adminItemId}</h2>
              <p className="mt-4 text-[18px] leading-8 text-[#556253]">{details || 'No values configured.'}</p>
            </article>
          );
        }) : null}
        {state === 'empty' ? <article className="admin-panel col-span-full"><AdminResourceState emptyDescription="No administrative settings have been created." emptyTitle="No configuration records" state="empty" /></article> : null}
        {state === 'error' ? <article className="admin-panel col-span-full"><AdminResourceState errorTitle="Settings could not be loaded" onRetry={retry} state="error" /></article> : null}
      </section>
    </AdminShell>
  );
};

export default SettingsPage;
