import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center px-4 sm:px-8 h-16 bg-white/90 backdrop-blur border-b border-stone-200">
      <Link to="/" className="font-bold text-teal-800 tracking-wide flex items-center gap-2">
        <span className="material-symbols-outlined">shield</span>
        Vyom
      </Link>

      <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-stone-600">
        <Link to="/" className={location.pathname === '/' ? 'text-teal-800' : 'hover:text-stone-900'}>
          Home
        </Link>
        {user && (
          <Link
            to="/dashboard"
            className={location.pathname.startsWith('/dashboard') ? 'text-teal-800' : 'hover:text-stone-900'}
          >
            Dashboard
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {user ? (
          <>
            <span className="hidden sm:inline text-sm text-stone-600">{user.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-stone-600 hover:text-stone-900 px-3 py-2 min-h-[44px]"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm font-medium text-stone-700 px-3 py-2 min-h-[44px] flex items-center"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 px-4 py-2 rounded-lg min-h-[44px] flex items-center"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
