import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-stone-300">404</h1>
      <p className="text-lg font-semibold text-stone-800 mt-4">This page wandered off</p>
      <p className="text-sm text-stone-500 mt-2 max-w-sm">
        The link may be outdated. Head back to your dashboard or the home page.
      </p>
      <div className="flex gap-3 mt-6">
        <Link to="/dashboard" className="form-btn px-6 no-underline">
          Open dashboard
        </Link>
        <Link
          to="/"
          className="px-6 py-3 text-sm font-semibold text-stone-700 border border-stone-200 rounded-lg hover:bg-stone-50 min-h-[44px] flex items-center"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
