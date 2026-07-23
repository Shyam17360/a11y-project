import type { Violation } from './runtime';

// Floating "issues found" badge + list, built with plain DOM calls instead
// of a UI framework. This has to render inside whatever app it's injected
// into, which might not be React (or might be a different React version) —
// vanilla DOM is the one thing guaranteed to work everywhere.

export interface Overlay {
  badge: HTMLDivElement;
  list: HTMLDivElement;
}

export function mountOverlay(): Overlay {
  const badge = document.createElement('div');
  badge.style.cssText = `
    background: #1f2430;
    color: white;
    padding: 10px 16px;
    border-radius: 20px;
    font-family: sans-serif;
    font-size: 13px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.35);
    margin-bottom: 8px;
  `;

  const list = document.createElement('div');
  list.style.cssText = `
    max-height: 60vh;
    overflow-y: auto;
    width: 340px;
  `;

  const container = document.createElement('div');
  container.style.cssText = 'position: fixed; bottom: 16px; right: 16px; z-index: 9999;';
  container.appendChild(badge);
  container.appendChild(list);
  // Mounted on <html>, not <body> — the auditor's MutationObserver watches
  // document.body, so updating the overlay must not itself live inside body
  // or every update would re-trigger a scan (infinite loop).
  document.documentElement.appendChild(container);

  return { badge, list };
}

export function updateOverlay(overlay: Overlay, violations: Violation[], isScanning: boolean) {
  overlay.badge.textContent = `A11y: ${violations.length} issue(s) ${isScanning ? '(scanning...)' : ''}`;
  overlay.badge.style.background = violations.length > 0 ? '#7a2020' : '#1f2430';

  overlay.list.innerHTML = '';
  for (const v of violations) {
    const item = document.createElement('div');
    item.style.cssText = `
      background: #1f2430;
      color: #e7e9ee;
      padding: 10px;
      margin-top: 8px;
      border-radius: 8px;
      font-family: sans-serif;
      font-size: 12px;
      max-width: 320px;
    `;

    const title = document.createElement('strong');
    title.textContent = v.ruleId;
    item.appendChild(title);

    if (v.source === 'sas-custom') {
      const tag = document.createElement('span');
      tag.textContent = 'SAS';
      tag.style.cssText = `
        margin-left: 6px;
        font-size: 10px;
        font-weight: 700;
        background: #2e5a9c;
        color: #dbe8ff;
        border-radius: 4px;
        padding: 1px 5px;
      `;
      item.appendChild(tag);
    }

    const help = document.createElement('p');
    help.textContent = v.help;
    item.appendChild(help);

    const target = document.createElement('code');
    target.textContent = v.target;
    item.appendChild(target);

    overlay.list.appendChild(item);
  }
}
