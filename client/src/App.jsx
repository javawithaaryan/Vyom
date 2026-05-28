import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AppShell from './components/AppShell';
import LandingPage from './components/LandingPage';
import DashboardView from './components/DashboardView';
import AnalyzerView from './components/AnalyzerView';
import InboxView from './components/InboxView';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import PageLoader from './components/ui/PageLoader';

function PrivateOutlet() {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader message="Checking your session…" />;
  }

  return user ? (
    <AppShell>
      <Outlet />
    </AppShell>
  ) : (
    <Navigate to="/login" replace />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<><Navbar /><Login /></>} />
      <Route path="/register" element={<><Navbar /><Register /></>} />

      <Route element={<PrivateOutlet />}>
        <Route path="/dashboard" element={<DashboardView />} />
        <Route path="/fraud-detection" element={<AnalyzerView />} />
        <Route path="/scam-analyzer" element={<InboxView />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
