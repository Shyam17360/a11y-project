import { useA11yAudit } from './useA11yAudit';
import { A11yReportPanel } from './components/A11yReportPanel';

export function App() {
  const audit = useA11yAudit();

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h1>a11y-dev-tools demo</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>1. disabled vs aria-disabled</h2>
        <p>❌ Should FAIL:</p>
        <button disabled>Submit (bad)</button>
        <p>✅ Should PASS:</p>
        <button aria-disabled="true">Submit (good)</button>
      </section>

      <section style={{ marginBottom: 24 }}>
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
      </section>

      <section style={{ marginBottom: 24 }}>
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
      </section>


      <section style={{ marginBottom: 24 }}>
        <h2>4. Positive tabindex</h2>
        <p>❌ Should FAIL:</p>
        <button tabIndex={2}>Second (bad)</button>
        <p>✅ Should PASS:</p>
        <button tabIndex={0}>Custom order ok (good)</button>
      </section>


      {/* <section style={{ marginBottom: 24 }}>
        <h2>5. Placeholder used as the only label</h2>
        <p>❌ Should FAIL:</p>
        <input type="email" placeholder="Email address (bad)" />
        <p>✅ Should PASS:</p>
        <label htmlFor="email-good">Email address</label>
        <input id="email-good" type="email" placeholder="e.g. jane@example.com" />
      </section> */}

      <A11yReportPanel
        violations={audit.violations}
        isScanning={audit.isScanning}
        enabled={audit.enabled}
      />
    </div>
  );
}