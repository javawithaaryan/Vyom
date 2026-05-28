import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { id: 'dashboard', path: '/dashboard', label: 'Overview', icon: 'dashboard' },
  { id: 'fraud-detection', path: '/fraud-detection', label: 'Transaction check', icon: 'account_balance' },
  { id: 'scam-analyzer', path: '/scam-analyzer', label: 'Message check', icon: 'mail' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const location = useLocation();
  const currentTab = location.pathname.replace(/^\//, '') || 'dashboard';
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose?.();
  };

  const nav = (
    <>
      <div className="px-5 mb-8">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-teal-300">shield</span>
          Vyom
        </h1>
        <p className="text-[11px] text-stone-400 mt-1">Fraud intelligence for everyday protection</p>
      </div>

      <nav className="flex-grow space-y-1 px-2">
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                isActive
                  ? 'bg-teal-600 text-white'
                  : 'text-stone-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-stone-400 hover:text-white hover:bg-white/10 min-h-[44px]"
        >
          <span className="material-symbols-outlined text-xl">home</span>
          Back to home
        </Link>
      </nav>

      <div className="px-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full bg-teal-800 flex items-center justify-center text-teal-100 text-sm font-bold">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-stone-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-left text-xs text-stone-400 hover:text-white px-2 py-2 min-h-[44px]"
        >
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          aria-label="Close menu"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-full w-[280px] z-50 flex flex-col py-6 bg-stone-900 text-white shadow-xl transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {nav}
      </aside>
    </>
  );
}
