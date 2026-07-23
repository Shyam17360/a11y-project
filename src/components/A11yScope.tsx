import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

/**
 * Marks the region the a11y auditor should scan. vite-plugin-a11y-devtools
 * looks for the first [data-a11y-audit-root] element and audits only that
 * subtree — shared layout/nav outside this wrapper is ignored.
 */
export function A11yScope({ children }: Props) {
  return <div data-a11y-audit-root>{children}</div>;
}
