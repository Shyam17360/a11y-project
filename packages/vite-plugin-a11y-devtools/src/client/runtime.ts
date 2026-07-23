import axe from 'axe-core';
import { customChecks, customRules } from './customRules';
import { mountOverlay, updateOverlay } from './overlay';

// This is the actual auditor. Unlike index.ts (which runs in Node, once,
// when the dev server starts), everything in this file runs *inside the
// developer's browser tab*, on every page they visit, for as long as the
// dev server is running. It's plain framework-agnostic TS/DOM code — no
// React — because the app it gets injected into might not even be React.
//
// Flow: init() configures axe-core with our rules, mounts the floating
// overlay, then watches the page for changes and re-scans on a debounce.

export interface Violation {
  ruleId: string;
  impact: string;
  help: string;
  helpUrl: string;
  target: string;
  html: string;
  source: 'sas-custom' | 'axe-core';
}

interface A11yDevtoolsRuntimeOptions {
  debounceMs?: number;
  rulesModule?: string | null;
  scopeSelector?: string;
}

declare global {
  interface Window {
    __A11Y_DEVTOOLS_OPTS__?: A11yDevtoolsRuntimeOptions;
  }
}

// Always start from the built-in SAS rules; optionally merge in a team's
// own extra rules loaded from wherever they keep them in *their* app.
async function loadRules(rulesModule?: string | null) {
  if (!rulesModule) {
    return { checks: customChecks, rules: customRules };
  }
  try {
    // `rulesModule` is a runtime string (from plugin options), not a literal
    // import path Vite can see at build time, so it can't pre-bundle this —
    // /* @vite-ignore */ tells it that's expected, not a mistake.
    const mod = await import(/* @vite-ignore */ rulesModule);
    return {
      checks: [...customChecks, ...(mod.customChecks ?? [])],
      rules: [...customRules, ...(mod.customRules ?? [])],
    };
  } catch (err) {
    console.error(
      `[a11y-devtools] failed to load rulesModule "${rulesModule}", falling back to built-in SAS rules`,
      err
    );
    return { checks: customChecks, rules: customRules };
  }
}

// axe-core groups results by rule, each with multiple affected DOM nodes.
// The overlay wants one row per (rule, element) pair instead, so this
// flattens that nested shape into a simple list.
function flattenViolations(results: { violations: any[] }): Violation[] {
  const flattened: Violation[] = [];
  for (const violation of results.violations) {
    for (const node of violation.nodes) {
      flattened.push({
        ruleId: violation.id,
        impact: violation.impact,
        help: violation.help,
        helpUrl: violation.helpUrl,
        target: node.target.join(' '),
        html: node.html,
        source: violation.tags.includes('sas-custom') ? 'sas-custom' : 'axe-core',
      });
    }
  }
  return flattened;
}

// Finds the element the current page wants audited (e.g. the <div> that
// <A11yScope> renders around a demo page's content). If nothing on the page
// opts in, we fall back to auditing the whole <body> — so this still works
// on apps that haven't adopted scoping yet.
function resolveScanRoot(scopeSelector: string): Element {
  return document.querySelector(scopeSelector) ?? document.body;
}

async function init() {
  // Set by index.ts's injected inline script, before this module loads.
  const opts = window.__A11Y_DEVTOOLS_OPTS__ ?? {};
  const debounceMs = opts.debounceMs ?? 1000;
  const scopeSelector = opts.scopeSelector ?? '[data-a11y-audit-root]';

  const { checks, rules } = await loadRules(opts.rulesModule);
  axe.configure({ checks, rules });

  const overlay = mountOverlay();
  let debounceTimer: ReturnType<typeof setTimeout>;
  let isScanning = false;

  async function scan() {
    isScanning = true;
    updateOverlay(overlay, flattenViolations({ violations: [] }), isScanning);
    try {
      // Audit only the marked component/page region, not the whole document
      // — shared layout/nav outside it is deliberately excluded.
      const root = resolveScanRoot(scopeSelector);
      const results = await axe.run(root);
      isScanning = false;
      updateOverlay(overlay, flattenViolations(results), isScanning);
    } catch (err) {
      isScanning = false;
      console.error('[a11y-devtools] scan failed', err);
    }
  }

  // Observed broadly (whole body) so navigating between pages/components is
  // still detected, even though each scan only audits the current scoped root.
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(scan, debounceMs);
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
  });

  scan();
}

init();
