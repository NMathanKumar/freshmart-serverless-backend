import { Clock3 } from 'lucide-react';

export const ComingSoon = ({ compact = true }: { compact?: boolean }) => compact ? (
  <span className="admin-coming-soon-badge" title="Backend not yet available">
    <Clock3 aria-hidden="true" /><span>Coming Soon</span><small>Backend not yet available</small>
  </span>
) : (
  <aside className="admin-unsupported-notice" role="note">
    <Clock3 aria-hidden="true" />
    <span><strong>Coming Soon</strong>Backend not yet available</span>
  </aside>
);

export const UnsupportedFeatureNotice = () => <ComingSoon compact={false} />;

export const comingSoonAction = {
  disabled: true,
  title: 'Coming Soon - Backend not yet available'
} as const;
