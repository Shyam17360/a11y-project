import { A11yScope } from '../components/A11yScope';

// Demonstrates the "sas-positive-tabindex" rule: a positive tabIndex forces
// a custom tab order that overrides natural DOM order and becomes
// unmanageable as a page grows — 0 or unset is preferred.
export function PositiveTabindexPage() {
  return (
    <A11yScope>
      <h2>4. Positive tabindex</h2>
      <p>❌ Should FAIL:</p>
      <button tabIndex={2}>Second (bad)</button>
      <p>✅ Should PASS:</p>
      <button tabIndex={0}>Custom order ok (good)</button>
    </A11yScope>
  );
}
