import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';

/**
 * Slim persistent banner showing live backend connection status.
 * Collapsed by default; expands to show connection details and the base URL.
 */
export default function BackendBanner() {
  const { backendOnline, user, isLoggedIn, isAdmin, logout, recheckHealth } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const baseUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';

  return (
    <div
      className={`transition-all duration-300 border-b ${
        backendOnline ? 'bg-emerald/8 border-emerald/20' : 'bg-burgundy/8 border-burgundy/20'
      }`}
    >
      {/* Collapsed row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-2 text-left"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              backendOnline ? 'bg-emerald animate-pulse' : 'bg-burgundy'
            }`}
          />
          <span className={`text-xs font-medium ${backendOnline ? 'text-emerald' : 'text-burgundy'}`}>
            {backendOnline ? 'Backend connected' : 'Backend offline'}
          </span>
          {backendOnline && isLoggedIn && (
            <span className="text-xs text-warm-gray">
              ·{' '}
              <span className="text-charcoal font-medium">
                {user?.name ?? user?.email}
              </span>
              {isAdmin && (
                <span className="ml-1 text-[10px] bg-gold/20 text-gold-dark px-1.5 py-0.5 rounded font-semibold">
                  ADMIN
                </span>
              )}
            </span>
          )}
          {backendOnline && !isLoggedIn && (
            <span className="text-xs text-warm-gray">· not logged in</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-warm-gray font-mono">{baseUrl}</span>
          <svg
            className={`w-3.5 h-3.5 text-warm-gray transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-6 pb-4 pt-1 flex flex-wrap gap-4 items-start">
          {/* Endpoint list */}
          <div className="text-[10px] text-warm-gray space-y-0.5 font-mono flex-1 min-w-48">
            {[
              'POST /auth/register',
              'POST /auth/login',
              'GET  /products',
              'POST /products  (admin)',
              'POST /orders    (auth)',
              'GET  /orders    (auth)',
              'GET  /admin/dashboard (admin)',
              'GET  /admin/orders    (admin)',
              'POST /email/send-order-link (admin)',
              'GET  /email/validate',
              'GET  /_health',
            ].map((e) => (
              <div key={e} className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${backendOnline ? 'bg-emerald' : 'bg-warm-gray-light'}`} />
                {e}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={recheckHealth}
              className="text-xs border border-gold/25 text-charcoal px-4 py-2 rounded hover:bg-gold/10 transition-colors"
            >
              ↻ Recheck connection
            </button>
            {isLoggedIn && (
              <button
                onClick={logout}
                className="text-xs border border-burgundy/25 text-burgundy px-4 py-2 rounded hover:bg-burgundy/10 transition-colors"
              >
                Logout from backend
              </button>
            )}
            {!backendOnline && (
              <p className="text-[10px] text-warm-gray leading-relaxed max-w-xs">
                Start the backend: <span className="font-mono">ts-node backend-demo.ts</span>
                {' '}(port 4000). CORS is open so any origin works.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
