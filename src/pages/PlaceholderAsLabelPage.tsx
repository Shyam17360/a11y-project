import { A11yScope } from '../components/A11yScope';

// Demonstrates the "sas-placeholder-as-label" rule: placeholder text
// disappears the moment a user types, so it can't substitute for a real
// <label> (or aria-label) as the input's accessible name.
export function PlaceholderAsLabelPage() {
  return (
    <A11yScope>
      <h2>5. Placeholder used as the only label</h2>
      <p>❌ Should FAIL:</p>
      <input type="email" placeholder="Email address (bad)" />
      <p>✅ Should PASS:</p>
      <label htmlFor="email-good">Email address</label>
      <input id="email-good" type="email" placeholder="e.g. jane@example.com" />
    </A11yScope>
  );
}
