/**
 * App - Main application component with routing
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  AssetsPage,
  TransactionsPage,
  InsightsPage,
  PredictionPage,
  GoogleCallbackPage,
} from './pages';

const ServerConnectionScreen = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-canvas-soft)",
      padding: 24,
      fontFamily: "var(--font-family)",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: 360,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: "var(--color-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <svg
          className="spin"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.25" />
          <path d="M12 3a9 9 0 019 9" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 500,
            color: "var(--color-ink)",
          }}
        >
          Menghubungkan ke server
        </h1>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 14,
            lineHeight: 1.5,
            color: "var(--color-ink-mute)",
          }}
        >
          Server sedang disiapkan. Setelah tersambung, kamu akan diarahkan ke
          halaman login.
        </p>
      </div>
    </div>
  </div>
);

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <ServerConnectionScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const DefaultRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <ServerConnectionScreen />;
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<GoogleCallbackPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <AssetsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <InsightsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/predictions"
            element={
              <ProtectedRoute>
                <PredictionPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<DefaultRoute />} />
          <Route path="*" element={<DefaultRoute />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
