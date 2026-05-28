import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import AppShell from "./components/AppShell";
import IntelligenceAssistant from "./components/IntelligenceAssistant";

import LandingPage from "./components/LandingPage";
import DashboardView from "./components/DashboardView";
import AnalyzerView from "./components/AnalyzerView";
import InboxView from "./components/InboxView";

import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import Solutions from "./pages/Solutions";
import Security from "./pages/Security";
import Pricing from "./pages/Pricing";

import LoadingState from "./components/ui/LoadingState";

/*
|--------------------------------------------------------------------------
| Protected Layout
|--------------------------------------------------------------------------
*/

function PrivateOutlet() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <LoadingState message="Checking your session..." />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      <Outlet />
      <IntelligenceAssistant />
    </AppShell>
  );
}

/*
|--------------------------------------------------------------------------
| Public Layout
|--------------------------------------------------------------------------
*/

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0a0b1e] text-white overflow-x-hidden">
      <Navbar />
      {children}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| App
|--------------------------------------------------------------------------
*/

function App() {
  return (
    <Routes>
      {/* =========================
          PUBLIC ROUTES
      ========================== */}

      <Route
        path="/"
        element={
          <PublicLayout>
            <LandingPage />
          </PublicLayout>
        }
      />

      <Route
        path="/solutions"
        element={
          <PublicLayout>
            <Solutions />
          </PublicLayout>
        }
      />

      <Route
        path="/security"
        element={
          <PublicLayout>
            <Security />
          </PublicLayout>
        }
      />

      <Route
        path="/pricing"
        element={
          <PublicLayout>
            <Pricing />
          </PublicLayout>
        }
      />

      <Route
        path="/login"
        element={
          <PublicLayout>
            <Login />
          </PublicLayout>
        }
      />

      <Route
        path="/register"
        element={
          <PublicLayout>
            <Register />
          </PublicLayout>
        }
      />

      {/* =========================
          PRIVATE ROUTES
      ========================== */}

      <Route element={<PrivateOutlet />}>
        <Route
          path="/dashboard"
          element={<DashboardView />}
        />

        <Route
          path="/fraud-detection"
          element={<AnalyzerView />}
        />

        <Route
          path="/scam-analyzer"
          element={<InboxView />}
        />
      </Route>

      {/* =========================
          404
      ========================== */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;