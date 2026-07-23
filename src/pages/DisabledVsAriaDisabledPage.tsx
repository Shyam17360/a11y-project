import { A11yScope } from '../components/A11yScope';

// Demonstrates the "sas-disabled-attribute" rule (see customRules.ts in the
// plugin package): native `disabled` hides an element from the a11y tree
// entirely, whereas `aria-disabled="true"` keeps it announced.
export function DisabledVsAriaDisabledPage() {
  return (
    <A11yScope>
      <h2>1. disabled vs aria-disabled</h2>
      <p>❌ Should FAIL:</p>
      <button disabled>Submit (bad)</button>
      <p>✅ Should PASS:</p>
      <button aria-disabled="true">Submit (good)</button>
    </A11yScope>
  );
}
