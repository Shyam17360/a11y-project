import { A11yScope } from '../components/A11yScope';

// Demonstrates the "sas-icon-only-button-name" rule: a button whose only
// content is an <svg>/<img> has no text for a screen reader to announce
// unless it also has an aria-label.
export function IconOnlyButtonPage() {
  return (
    <A11yScope>
      <h2>3. Icon-only button without a name</h2>
      <p>❌ Should FAIL:</p>
      <button>
        <svg width="16" height="16" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" />
        </svg>
      </button>
      <p>✅ Should PASS:</p>
      <button aria-label="Delete item">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" />
        </svg>
      </button>
    </A11yScope>
  );
}
