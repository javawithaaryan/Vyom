import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinkClass = (path) =>
    location.pathname === path
      ? "text-cyan-300"
      : "text-white/70 hover:text-white transition-colors";

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#081028]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* LEFT */}
        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
            <span className="material-symbols-outlined text-cyan-300">
              shield
            </span>
          </div>

          <span className="text-xl font-semibold tracking-wide text-white">
            VYOM AI
          </span>
        </Link>

        {/* CENTER */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className={navLinkClass("/")}
          >
            Platform
          </Link>

          <Link
            to="/solutions"
            className={navLinkClass("/solutions")}
          >
            Solutions
          </Link>

          <Link
            to="/security"
            className={navLinkClass("/security")}
          >
            Security
          </Link>

          <Link
            to="/pricing"
            className={navLinkClass("/pricing")}
          >
            Pricing
          </Link>

          {user && (
            <Link
              to="/dashboard"
              className={navLinkClass("/dashboard")}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-white/60 sm:block">
                {user.name}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}