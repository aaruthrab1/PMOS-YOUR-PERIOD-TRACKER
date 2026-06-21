import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui';
import { CyraLogo } from '@/components/layout/AppLayout';

export function ConfigSetupPage() {
  usePageTitle('Setup required');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-page-x text-center gradient-hero">
      <CyraLogo size="lg" />
      <h1 className="mt-8 font-display text-display-sm text-ink">Cyra is almost ready</h1>
      <p className="mt-3 max-w-md text-body text-ink-secondary leading-relaxed">
        The app needs to be connected before you can sign in. If you&apos;re setting up a demo, ask the team to finish configuration, then reload this page.
      </p>
      <Button className="mt-8" variant="secondary" onClick={() => window.location.reload()}>
        Reload page
      </Button>
    </div>
  );
}
