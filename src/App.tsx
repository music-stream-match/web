import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { HomePage, PlaylistsPage, ImportPage, CallbackPage } from '@/pages';

// Handle SPA redirect from 404.html on GitHub Pages
function RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirect_path');
    if (redirectPath && location.pathname === '/') {
      sessionStorage.removeItem('redirect_path');
      console.log('[App] Handling SPA redirect to:', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, location]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <RedirectHandler />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/playlists" element={<PlaylistsPage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/auth/:provider" element={<CallbackPage />} />
        <Route path="/callback/:provider" element={<CallbackPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
