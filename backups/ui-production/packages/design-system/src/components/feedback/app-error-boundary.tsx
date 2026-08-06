import type { PropsWithChildren } from 'react';
import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button.js';
import { Card } from '../ui/card.js';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-[color:var(--background)] px-6">
        <Card className="max-w-lg space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--surface-subtle)]">
            <AlertTriangle className="h-6 w-6 text-[color:var(--color-fresh-600)]" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">Application shell failed</h1>
            <p className="text-sm text-[color:var(--foreground-muted)]">
              FreshMart recovered safely. Reload to continue.
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>Reload application</Button>
        </Card>
      </main>
    );
  }
}
