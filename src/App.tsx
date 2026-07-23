import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { DisabledVsAriaDisabledPage } from './pages/DisabledVsAriaDisabledPage';
import { ClickableDivPage } from './pages/ClickableDivPage';
import { IconOnlyButtonPage } from './pages/IconOnlyButtonPage';
import { PositiveTabindexPage } from './pages/PositiveTabindexPage';
import { PlaceholderAsLabelPage } from './pages/PlaceholderAsLabelPage';

// One route per accessibility rule being demonstrated. <Layout> renders the
// shared header/nav plus whichever page is active via <Outlet />; each page
// wraps its own demo markup in <A11yScope> so the plugin only audits that
// page's content, not the header/nav around it.
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/disabled-vs-aria" replace />} />
        <Route path="disabled-vs-aria" element={<DisabledVsAriaDisabledPage />} />
        <Route path="clickable-div" element={<ClickableDivPage />} />
        <Route path="icon-only-button" element={<IconOnlyButtonPage />} />
        <Route path="positive-tabindex" element={<PositiveTabindexPage />} />
        <Route path="placeholder-as-label" element={<PlaceholderAsLabelPage />} />
      </Route>
    </Routes>
  );
}
