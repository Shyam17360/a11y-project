import { useEffect, useRef, useState, useCallback } from 'react';
import { customChecks, customRules } from './rules/customRules';

export interface Violation {
  ruleId: string;
  impact: string;
  help: string;
  helpUrl: string;
  target: string;
  html: string;
  source: 'sas-custom' | 'axe-core';
}

export function useA11yAudit(enabledOverride?: boolean) {
  const enabled =
    enabledOverride !== undefined ? enabledOverride : import.meta.env.DEV;

  const [violations, setViolations] = useState<Violation[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const axeRef = useRef<any>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  const scan = useCallback(async () => {
    if (!enabled || !axeRef.current) return;
    setIsScanning(true);
    try {
      const results = await axeRef.current.run(document.body);

      // DEBUG: remove these two lines once everything works as expected
      console.log('[a11y debug] all violations:', results.violations.map((v: any) => v.id));
      console.log('[a11y debug] full results:', results);

      const fresh: Violation[] = [];
      for (const v of results.violations) {
        for (const node of v.nodes) {
          fresh.push({
            ruleId: v.id,
            impact: v.impact,
            help: v.help,
            helpUrl: v.helpUrl,
            target: node.target.join(' '),
            html: node.html,
            source: v.tags.includes('sas-custom') ? 'sas-custom' : 'axe-core',
          });
        }
      }
      setViolations(fresh); // always replace with the current scan's fresh results
    } finally {
      setIsScanning(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    let observer: MutationObserver;
    let cancelled = false;

    import('axe-core').then((axeModule) => {
      if (cancelled) return;
      const axe = (axeModule as any).default || axeModule;
      axe.configure({ checks: customChecks, rules: customRules });

      // DEBUG: remove this line once everything works as expected
      console.log(
        '[a11y debug] registered rules:',
        axe.getRules().map((r: any) => r.ruleId)
      );

      axeRef.current = axe;

      observer = new MutationObserver(() => {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(scan, 5000);
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      scan();
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      clearTimeout(debounceTimer.current);
    };
  }, [enabled, scan]);

  return { violations, isScanning, rescan: scan, enabled };
}