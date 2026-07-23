import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

// This file runs in Node, as part of Vite's dev server — it never runs in
// the browser. Its only job is to inject a <script> tag into each page's
// HTML so the *browser-side* code in src/client/runtime.ts gets loaded and
// executed inside the app being developed. Think of it as the "installer";
// runtime.ts is the actual auditor.

export interface A11yDevtoolsOptions {
  /** How long to wait after the last DOM mutation before re-scanning. Default 1000ms. */
  debounceMs?: number;
  /**
   * Path (resolved by the app's own module graph, e.g. "/src/a11yRules.ts")
   * to a module exporting additional `{ customChecks, customRules }` to merge
   * on top of the built-in SAS rule set.
   */
  rulesModule?: string;
  /**
   * CSS selector marking the component/page region to audit. Only the first
   * matching element is scanned — everything outside it (shared nav, layout
   * chrome) is ignored. Falls back to `document.body` if nothing matches.
   * Default: '[data-a11y-audit-root]'.
   */
  scopeSelector?: string;
}

/**
 * Dev-only Vite plugin: injects an axe-core-driven accessibility auditor into
 * the app's HTML so violations surface live in the browser while developing,
 * using the real rendered DOM. Never runs in production builds.
 */
export default function a11yDevtools(options: A11yDevtoolsOptions = {}): Plugin {
  // We point at dist/client/runtime.js (the *compiled* output), not the .ts
  // source. This package lives in another app's node_modules/workspace link,
  // and Vite doesn't attempt to transform TypeScript inside dependencies —
  // only inside the app it's actually building. Shipping pre-built plain JS
  // sidesteps that entirely, the same way any published npm package would.
  const runtimePath = fileURLToPath(new URL('../dist/client/runtime.js', import.meta.url)).replace(
    /\\/g,
    '/'
  );

  return {
    name: 'vite-plugin-a11y-devtools',
    // 'serve' = dev server only. This plugin never touches `vite build`,
    // so there's zero risk of the auditor (or axe-core) ending up in a
    // production bundle.
    apply: 'serve',
    transformIndexHtml() {
      const runtimeOptions = {
        debounceMs: options.debounceMs ?? 1000,
        rulesModule: options.rulesModule ?? null,
        scopeSelector: options.scopeSelector ?? '[data-a11y-audit-root]',
      };

      return [
        {
          // Options are computed here in Node, but runtime.ts runs in the
          // browser — there's no direct way to hand it a JS object across
          // that boundary. So we serialize it onto `window` via an inline
          // script that runs before the module script below.
          tag: 'script',
          injectTo: 'body',
          children: `window.__A11Y_DEVTOOLS_OPTS__ = ${JSON.stringify(runtimeOptions)};`,
        },
        {
          // `/@fs/<absolute-path>` is a Vite dev-server convention: it lets
          // the browser request a file by its real filesystem path, even
          // though that file lives outside the app's own project root
          // (it's over in this plugin's package directory instead).
          tag: 'script',
          injectTo: 'body',
          attrs: {
            type: 'module',
            src: `/@fs/${runtimePath}`,
          },
        },
      ];
    },
  };
}
