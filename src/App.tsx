import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { HomePage, PlaylistsPage, ImportPage, CallbackPage, InvitationPage } from '@/pages';
import { useAppStore } from '@/store/useAppStore';
import { trackPageView } from '@/lib/analytics';

// Base path for GitHub Pages deployment
const basename = import.meta.env.BASE_URL || '/';

// Guard component to check invitation code
function InvitationGuard({ children }: { children: React.ReactNode }) {
  const { invitationCode } = useAppStore();
  const location = useLocation();

  // Allow callback routes to work without invitation (needed for OAuth)
  const isCallbackRoute = location.pathname.startsWith('/callback/') || location.pathname.startsWith('/auth/');
  const isInvitationRoute = location.pathname === '/invitation';

  if (!invitationCode && !isCallbackRoute && !isInvitationRoute) {
    console.log('[App] No invitation code, redirecting to invitation page');
    return <Navigate to="/invitation" replace />;
  }

  return <>{children}</>;
}

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
      <RedirectHandler />
      <PageTracker />
      <Routes>
        <Route path="/invitation" element={<InvitationPage />} />
        <Route path="/auth/:provider" element={<CallbackPage />} />
        <Route path="/callback/:provider" element={<CallbackPage />} />
        <Route
          path="/*"
          element={
            <InvitationGuard>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/playlists" element={<PlaylistsPage />} />
                <Route path="/import" element={<ImportPage />} />
              </Routes>
            </InvitationGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App
