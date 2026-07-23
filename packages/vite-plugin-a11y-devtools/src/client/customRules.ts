// The default rule set this plugin ships with, on top of axe-core's
// standard ~90 rules. `axe.configure({ checks, rules })` in runtime.ts wires
// these in; customRules.test.ts exercises the exact same objects directly
// with axe-core + jsdom, no browser or plugin needed.
//
// A "check" is the actual DOM test (does this one element pass or fail);
// a "rule" says which elements to run a check against (via CSS `selector`)
// plus the metadata shown in the overlay/report.

export interface CustomCheck {
  id: string;
  evaluate: (node: Element) => boolean;
  metadata: {
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    messages: {
      pass: string;
      fail: string;
    };
  };
}

export interface CustomRule {
  id: string;
  selector: string;
  tags: string[];
  enabled: boolean;
  metadata: {
    description: string;
    help: string;
    helpUrl: string;
  };
  all: string[];
  any: string[];
  none: string[];
}

/**
 * customChecks
 *
 * Each check is the actual DOM test: `evaluate` MUST return true when the
 * element PASSES (is fine), and false when it FAILS (has a problem).
 * This matches axe-core's convention — getting this backwards silently
 * inverts pass/fail for the whole rule.
 *
 * HOW TO ADD A NEW RULE:
 *   1. Talk to the accessibility team, get a real recurring issue.
 *   2. Add an entry here (the check) and a matching entry in customRules
 *      below (which selector to run it against + metadata).
 *   3. Add a pass/fail fixture pair in customRules.test.ts.
 */
export const customChecks: CustomCheck[] = [
  {
    id: 'sas-disabled-attribute',
    evaluate: (node: Element) => {
      // PASS (true) when the native `disabled` attribute is ABSENT.
      // FAIL (false) when it IS present, since it removes the element from
      // the accessibility tree entirely (screen reader users don't know it
      // exists), whereas aria-disabled keeps it discoverable and announces
      // "dimmed"/"unavailable" instead.
      return !node.hasAttribute('disabled');
    },
    metadata: {
      impact: 'serious',
      messages: {
        pass: 'Element does not use the native disabled attribute.',
        fail:
          'Element uses the native "disabled" attribute, which hides it ' +
          'from the accessibility tree. Use aria-disabled="true" instead, ' +
          'and prevent the action in your click/submit handler.',
      },
    },
  },
  {
    id: 'sas-clickable-div',
    evaluate: (node: Element) => {
      // Only relevant for elements that look clickable (inline onclick=,
      // or a "clickable" class name convention). If it doesn't look
      // clickable, this rule doesn't apply here, so PASS.
      const looksClickable =
        node.hasAttribute('onclick') || node.classList.contains('clickable');
      if (!looksClickable) return true;
      // If it does look clickable, PASS only when it also has both
      // role and tabindex (keyboard-reachable and announced correctly).
      return node.hasAttribute('role') && node.hasAttribute('tabindex');
    },
    metadata: {
      impact: 'critical',
      messages: {
        pass: 'Clickable non-native element has role and tabindex, or uses a real button.',
        fail:
          'This div/span looks clickable but has no role="button" and no ' +
          'tabindex="0" — keyboard users cannot reach or activate it. ' +
          'Prefer a real <button> element instead.',
      },
    },
  },
  {
    id: 'sas-icon-only-button-name',
    evaluate: (node: Element) => {
      const hasVisibleText = (node.textContent ?? '').trim().length > 0;
      const hasAriaLabel =
        node.hasAttribute('aria-label') || node.hasAttribute('aria-labelledby');
      return hasVisibleText || hasAriaLabel;
    },
    metadata: {
      impact: 'critical',
      messages: {
        pass: 'Button has an accessible name.',
        fail:
          'Icon-only button has no visible text and no aria-label. Screen ' +
          'reader users will hear just "button" with no idea what it does.',
      },
    },
  },
  {
    id: 'sas-placeholder-as-label',
    evaluate: (node: Element) => {
      const hasPlaceholder = node.hasAttribute('placeholder');
      if (!hasPlaceholder) return true; // rule doesn't apply, PASS

      const id = node.getAttribute('id');
      const hasAssociatedLabel = !!(id && document.querySelector(`label[for="${id}"]`));
      const hasAriaLabel =
        node.hasAttribute('aria-label') || node.hasAttribute('aria-labelledby');

      return hasAssociatedLabel || hasAriaLabel;
    },
    metadata: {
      impact: 'serious',
      messages: {
        pass: 'Input has a real label in addition to any placeholder.',
        fail:
          'Input relies on placeholder text as its only label. Placeholder ' +
          'disappears on input and is not a reliable substitute for a real ' +
          '<label> or aria-label.',
      },
    },
  },
  {
    id: 'sas-positive-tabindex',
    evaluate: (node: Element) => {
      const tabindex = node.getAttribute('tabindex');
      if (tabindex === null) return true; // no tabindex at all, PASS
      const value = parseInt(tabindex, 10);
      return value <= 0; // 0 and negative are fine; positive FAILs
    },
    metadata: {
      impact: 'serious',
      messages: {
        pass: 'tabindex is 0, negative, or not set.',
        fail:
          'Positive tabindex forces a custom tab order that overrides ' +
          'natural DOM order, and becomes unmanageable as the page grows. ' +
          'Use tabindex="0" and reorder elements in the DOM instead.',
      },
    },
  },
];

/**
 * customRules
 *
 * Each rule wires a check (by id, referenced in `any`) to a CSS selector
 * (which elements to run it against), WCAG tags, and metadata shown in the
 * report popup.
 */
export const customRules: CustomRule[] = [
  {
    id: 'sas-disabled-attribute',
    selector: 'button, input, select, textarea, [role="button"]',
    tags: ['sas-custom', 'best-practice'],
    enabled: true,
    metadata: {
      description: 'Native disabled attribute used instead of aria-disabled',
      help: 'Use aria-disabled instead of the native disabled attribute',
      helpUrl: 'https://example.com/internal-docs/disabled-vs-aria-disabled',
    },
    all: [],
    any: ['sas-disabled-attribute'],
    none: [],
  },
  {
    id: 'sas-clickable-div',
    selector: 'div, span',
    tags: ['sas-custom', 'wcag2a', 'wcag211'],
    enabled: true,
    metadata: {
      description: 'Non-native clickable element missing keyboard support',
      help: 'Clickable divs/spans need role and tabindex, or should be real buttons',
      helpUrl: 'https://example.com/internal-docs/clickable-divs',
    },
    all: [],
    any: ['sas-clickable-div'],
    none: [],
  },
  {
    id: 'sas-icon-only-button-name',
    // axe-core's own internal selector matcher (used for custom rule
    // `selector`s) only supports :not() and :is() — :has() silently fails
    // to match anything. Match all buttons instead; `evaluate` below already
    // checks for a missing accessible name regardless of icon presence.
    selector: 'button',
    tags: ['sas-custom', 'wcag2a', 'wcag412'],
    enabled: true,
    metadata: {
      description: 'Icon-only button missing accessible name',
      help: 'Icon-only buttons need aria-label or visually-hidden text',
      helpUrl: 'https://example.com/internal-docs/icon-only-buttons',
    },
    all: [],
    any: ['sas-icon-only-button-name'],
    none: [],
  },
  {
    id: 'sas-placeholder-as-label',
    selector: 'input, textarea',
    tags: ['sas-custom', 'wcag2a', 'wcag131'],
    enabled: true,
    metadata: {
      description: 'Placeholder used as the only label for an input',
      help: 'Inputs need a real <label> or aria-label, not just placeholder text',
      helpUrl: 'https://example.com/internal-docs/placeholder-as-label',
    },
    all: [],
    any: ['sas-placeholder-as-label'],
    none: [],
  },
  {
    id: 'sas-positive-tabindex',
    selector: '[tabindex]',
    tags: ['sas-custom', 'wcag2a', 'wcag243'],
    enabled: true,
    metadata: {
      description: 'Positive tabindex value overrides natural tab order',
      help: 'Avoid positive tabindex values',
      helpUrl: 'https://example.com/internal-docs/positive-tabindex',
    },
    all: [],
    any: ['sas-positive-tabindex'],
    none: [],
  },
];