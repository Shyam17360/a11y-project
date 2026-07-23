import { A11yScope } from '../components/A11yScope';

// Demonstrates the "sas-clickable-div" rule: a <div> with an onClick handler
// is invisible to keyboard/screen-reader users unless it also has
// role="button" and tabIndex={0} (or is just a real <button>).
export function ClickableDivPage() {
  return (
    <A11yScope>
      <h2>2. Clickable div without keyboard support</h2>
      <p>❌ Should FAIL:</p>
      <div className="clickable" onClick={() => alert('clicked')}>
        Click me (bad)
      </div>
      <p>✅ Should PASS:</p>
      <div
        className="clickable"
        role="button"
        tabIndex={0}
        onClick={() => alert('clicked')}
      >
        Click me (good)
      </div>
    </A11yScope>
  );
}
