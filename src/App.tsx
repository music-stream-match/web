import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { HomePage, PlaylistsPage, ImportPage, CallbackPage, AboutPage, PrivacyPage } from '@/pages';
import { trackPageView } from '@/lib/analytics';
import { DocumentHead } from '@/components/DocumentHead';

// Base path for GitHub Pages deployment
const basename = import.meta.env.BASE_URL || '/';

// Handle SPA redirect from 404.html on GitHub Pages
function RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirect_path');
    if (redirectPath && location.pathname === '/') {
      sessionStorage.removeItem('redirect_path');
      console.log('[App] Handling SPA redirect to:', redirectPath);
      navigate(redirectPath.replace(basename, "/"), { replace: true });
    }
  }, [navigate, location]);

  return null;
}

// Track page views for Google Analytics
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}

console.log('[App] Using basename:', basename);
console.dir( {meta: import.meta.env})

function App() {
  return (
    <BrowserRouter basename={basename}>
      <DocumentHead />
      <RedirectHandler />
      <PageTracker />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/playlists" element={<PlaylistsPage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/invitation" element={<Navigate to="/" replace />} />
        <Route path="/auth/:provider" element={<CallbackPage />} />
        <Route path="/callback/:provider" element={<CallbackPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
