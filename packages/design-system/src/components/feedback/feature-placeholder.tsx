import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';
import { Card } from '../ui/card.js';

export const FeaturePlaceholder = ({
  eyebrow,
  title,
  description,
  children
}: PropsWithChildren<{ eyebrow: string; title: string; description: string }>) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.28, ease: 'easeOut' }}
    className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center px-6 py-10"
  >
    <Card className="w-full overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_35%),var(--surface-elevated)]">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--color-fresh-600)]">{eyebrow}</p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">{title}</h1>
          <p className="max-w-2xl text-sm leading-6 text-[color:var(--foreground-muted)]">{description}</p>
        </div>
        {children}
      </div>
    </Card>
  </motion.div>
);
