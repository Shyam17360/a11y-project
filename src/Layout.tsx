import { NavLink, Outlet } from 'react-router-dom';

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  marginRight: 16,
  color: isActive ? '#fff' : '#9aa4b2',
  textDecoration: 'none',
});

// Persistent chrome shared by every page (header, nav). <Outlet /> is where
// react-router renders whichever page's component matched the current URL
// (see App.tsx's <Route> tree) — everything else in this component stays
// mounted across navigations.
export function Layout() {
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h1>a11y-dev-tools demo</h1>

      {/*
        Intentionally outside any <A11yScope>: this icon-only button has no
        accessible name and WOULD be flagged if the whole page were audited.
        It exists to prove the plugin only scans the [data-a11y-audit-root]
        region below, not this shared layout chrome.
      */}
      <button style={{ float: 'right' }}>
        <svg width="16" height="16" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" />
        </svg>
      </button>

      <nav style={{ marginBottom: 24 }}>
        <NavLink to="/disabled-vs-aria" style={linkStyle}>
          1. disabled vs aria-disabled
        </NavLink>
        <NavLink to="/clickable-div" style={linkStyle}>
          2. Clickable div
        </NavLink>
        <NavLink to="/icon-only-button" style={linkStyle}>
          3. Icon-only button
        </NavLink>
        <NavLink to="/positive-tabindex" style={linkStyle}>
          4. Positive tabindex
        </NavLink>
        <NavLink to="/placeholder-as-label" style={linkStyle}>
          5. Placeholder as label
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
}
