# vite-plugin-a11y-devtools

Dev-only Vite plugin that injects an axe-core-driven accessibility auditor
into your app's HTML. Violations show up live in a floating overlay while you
develop, checked against the actual rendered DOM — no build step, no CI
round-trip, no extension to install.

Ships with a default SAS rule set (`disabled` vs `aria-disabled`, clickable
divs without keyboard support, icon-only buttons, placeholder-as-label,
positive `tabindex`) on top of standard axe-core rules.

Only audits the component/page you're working on, not the whole app: wrap the
region you want scanned in an element with a `data-a11y-audit-root` attribute
(see `A11yScope` in the demo app). Everything outside it — shared nav, layout
chrome — is ignored, which keeps the auditor fast and its output relevant even
in a large app.

Automatically excluded from production builds (`apply: 'serve'`).

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import a11yDevtools from 'vite-plugin-a11y-devtools';

export default defineConfig({
  plugins: [
    // ...your other plugins
    a11yDevtools(),
  ],
});
```

That's it — every app on this shared config gets the auditor for free with
no source changes.

## Options

```ts
a11yDevtools({
  // Debounce between a DOM mutation and the next scan. Default: 1000
  debounceMs: 1000,

  // Optional: path to a module (resolved by your app, e.g. "/src/a11yRules.ts")
  // exporting `{ customChecks, customRules }` to merge on top of the
  // built-in SAS rules, for teams that need extra project-specific checks.
  rulesModule: '/src/a11yRules.ts',

  // CSS selector marking the component/page to audit. Only the first match
  // is scanned; falls back to document.body if nothing matches.
  // Default: '[data-a11y-audit-root]'
  scopeSelector: '[data-a11y-audit-root]',
});
```
