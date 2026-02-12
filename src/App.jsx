import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Planner from './pages/Planner';
import DraftStudio from './pages/DraftStudio';
import PostEditor from './pages/PostEditor';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useEffect } from 'react';
import { authService, supabase } from './services/storage/supabaseService';
import { useAuthStore } from './stores/authStore';
import './styles/global.css';
import React from 'react';
// ... (omitting ErrorBoundary lines for brevity, but I must match target)
// Wait, I should replace exactly what is in the file.

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red' }}>
          <h1>Algo deu errado.</h1>
          <pre>{this.state.error && this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const setSession = useAuthStore(state => state.setSession);
  const setLoading = useAuthStore(state => state.setLoading);

  useEffect(() => {
    // 1. Check current session
    authService.getSession().then(session => {
      setSession(session);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setLoading]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-light)',
            },
            success: {
              iconTheme: {
                primary: 'var(--color-success)',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--color-danger)',
                secondary: 'white',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AuthPage />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
          <Route path="/drafts" element={<ProtectedRoute><DraftStudio /></ProtectedRoute>} />
          <Route path="/editor" element={<ProtectedRoute><PostEditor /></ProtectedRoute>} />
          <Route path="/publish" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
