import { useState, useEffect } from 'react';
import { formatPrice } from '../data';
import { useAuth } from '../lib/AuthContext';
import { api, type BackendOrder } from '../lib/api';
import type { Page } from '../types';

interface CustomerDashboardProps {
  onNavigate: (page: Page, extra?: Record<string, string>) => void;
}

const priorityBrands = [
  { id: 'm2', priority: 1, name: 'Royal Paithani House', rating: 5.0, location: 'Paithan' },
  { id: 'm1', priority: 2, name: 'Heritage Weaves', rating: 4.9, location: 'Nashik' },
  { id: 'm5', priority: 3, name: 'Devgiri Textiles', rating: 4.9, location: 'Aurangabad' },
  { id: 'm3', priority: 4, name: 'Maharashtra Looms', rating: 4.8, location: 'Yeola' },
];

const mockOrders = [
  { id: 'PR-2024-001', name: 'Royal Peacock Paithani', brand: 'Heritage Weaves', price: 48500, status: 'Delivered', date: 'Nov 12, 2024', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=100&h=130&fit=crop&auto=format' },
  { id: 'PR-2024-002', name: 'Munia Paithani', brand: 'Maharashtra Looms', price: 34500, status: 'In Transit', date: 'Dec 3, 2024', image: 'https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?w=100&h=130&fit=crop&auto=format' },
];

const statusColor: Record<string, string> = {
  Delivered: 'text-emerald bg-emerald/10',
  'In Transit': 'text-peacock bg-peacock/10',
  Processing: 'text-gold bg-gold/10',
  PENDING: 'text-gold bg-gold/10',
  PAID: 'text-emerald bg-emerald/10',
  FULFILLED: 'text-emerald bg-emerald/10',
  CANCELED: 'text-burgundy bg-burgundy/10',
};

const sections = ['Overview', 'My Orders', 'Wishlist', 'Brand Priority', 'Followed Brands', 'Messages', 'Profile', 'Security'];

export default function CustomerDashboard({ onNavigate }: CustomerDashboardProps) {
  const { user, token, isLoggedIn, backendOnline, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('Overview');
  const [priorityList, setPriorityList] = useState(priorityBrands);
  const [backendOrders, setBackendOrders] = useState<BackendOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !token || !backendOnline) return;
    setOrdersLoading(true);
    api.orders.list(token).then(({ data }) => {
      if (data) setBackendOrders(data);
      setOrdersLoading(false);
    });
  }, [isLoggedIn, token, backendOnline]);

  const moveUp = (id: string) => {
    setPriorityList((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next.map((b, i) => ({ ...b, priority: i + 1 }));
    });
  };
  const moveDown = (id: string) => {
    setPriorityList((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next.map((b, i) => ({ ...b, priority: i + 1 }));
    });
  };

  const displayName = user?.name ?? user?.email ?? 'Guest';
  const totalOrders = backendOrders.length + mockOrders.length;

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <div className="bg-charcoal text-ivory py-12 px-6 paithani-pattern">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-gold uppercase tracking-widest mb-2">My Dashboard</p>
            <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              Welcome back, {displayName}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-ivory/50">
              {isLoggedIn && backendOnline && (
                <span className="flex items-center gap-1.5 text-emerald/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald" /> Live backend session
                </span>
              )}
              {isLoggedIn && !backendOnline && (
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-warm-gray" /> Backend offline — showing demo data
                </span>
              )}
              {!isLoggedIn && (
                <span>Not logged in · <button onClick={() => onNavigate('account')} className="text-gold hover:underline">Login</button></span>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {backendOnline && isLoggedIn && (
              <div className="bg-emerald/10 border border-emerald/20 rounded-xl px-4 py-2 text-center">
                <p className="text-emerald text-xs font-medium">{backendOrders.length} real orders</p>
                <p className="text-ivory/40 text-[10px]">from backend</p>
              </div>
            )}
            <button onClick={logout} className="text-xs border border-ivory/20 text-ivory/60 px-4 py-2 rounded-lg hover:bg-ivory/10 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map((s) => (
              <button key={s} onClick={() => setActiveSection(s)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                  activeSection === s ? 'bg-purple text-ivory font-medium' : 'text-warm-gray hover:text-charcoal hover:bg-ivory-dark'
                }`}
              >
                {s}
              </button>
            ))}
            <div className="pt-4 border-t border-gold/15 mt-4">
              <button onClick={logout} className="w-full text-left px-4 py-3 rounded-lg text-sm text-burgundy hover:bg-burgundy/5 transition-colors">
                Logout
              </button>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeSection === 'Overview' && (
            <div className="space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Orders', value: String(totalOrders), icon: '📦', color: 'bg-purple' },
                  { label: 'Wishlist', value: '7', icon: '♥', color: 'bg-burgundy' },
                  { label: 'Following', value: '4', icon: '★', color: 'bg-gold' },
                  { label: 'Priority Brands', value: String(priorityList.length), icon: '👑', color: 'bg-peacock' },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-gold/15 p-5">
                    <div className={`w-10 h-10 rounded-xl ${s.color} text-ivory flex items-center justify-center text-lg mb-3`}>{s.icon}</div>
                    <p className="text-2xl font-bold text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</p>
                    <p className="text-xs text-warm-gray mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div className="bg-white rounded-2xl border border-gold/15 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>
                    Recent Orders
                    {backendOrders.length > 0 && (
                      <span className="ml-2 text-xs text-emerald font-normal">({backendOrders.length} from backend)</span>
                    )}
                  </h3>
                  <button onClick={() => setActiveSection('My Orders')} className="text-xs text-purple hover:underline">View all →</button>
                </div>

                {ordersLoading ? (
                  <div className="py-6 text-center text-warm-gray text-sm">Loading orders…</div>
                ) : (
                  <div className="space-y-3">
                    {/* Backend orders */}
                    {backendOrders.slice(0, 2).map((o) => (
                      <div key={o.id} className="flex items-center gap-4 p-4 bg-emerald/5 rounded-xl border border-emerald/15">
                        <div className="w-10 h-10 bg-emerald/10 rounded-lg flex items-center justify-center text-emerald text-lg flex-shrink-0">📦</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs text-warm-gray">{o.id}</p>
                          <p className="text-xs text-charcoal font-medium">
                            {o.items.length} item{o.items.length !== 1 ? 's' : ''} · {new Date(o.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-purple text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                            {formatPrice(Math.round(o.totalCents / 100))}
                          </p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[o.status] ?? 'text-warm-gray bg-ivory-dark'}`}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {/* Mock orders */}
                    {mockOrders.map((o) => (
                      <div key={o.id} className="flex items-center gap-4 p-4 bg-ivory rounded-xl border border-gold/10">
                        <img src={o.image} alt={o.name} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-warm-gray">{o.id}</p>
                          <p className="font-medium text-charcoal text-sm truncate">{o.name}</p>
                          <p className="text-xs text-warm-gray">{o.brand} · {o.date}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-purple text-sm" style={{ fontFamily: 'var(--font-display)' }}>{formatPrice(o.price)}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[o.status]}`}>{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Brand priority preview */}
              <div className="bg-white rounded-2xl border border-gold/15 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>My Brand Priority</h3>
                  <button onClick={() => setActiveSection('Brand Priority')} className="text-xs text-purple hover:underline">Manage →</button>
                </div>
                {priorityList.slice(0, 3).map((b) => (
                  <div key={b.id} className="flex items-center gap-4 py-3 border-b border-gold/8">
                    <span className="text-2xl font-bold text-gold/40 w-8 text-center" style={{ fontFamily: 'var(--font-display)' }}>
                      {String(b.priority).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal">{b.name}</p>
                      <p className="text-xs text-warm-gray">{b.location}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className={`w-3 h-3 ${i < Math.floor(b.rating) ? 'text-gold' : 'text-warm-gray-light'}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'My Orders' && (
            <div>
              <h2 className="text-3xl text-charcoal mb-8" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>My Orders</h2>

              {/* Backend orders */}
              {backendOrders.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-emerald uppercase tracking-widest font-medium mb-3 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald" /> Backend Orders (live)
                  </p>
                  <div className="space-y-3">
                    {backendOrders.map((o) => (
                      <div key={o.id} className="bg-white rounded-2xl border border-emerald/20 p-6">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <p className="font-mono text-xs text-warm-gray mb-1">{o.id}</p>
                            <p className="font-semibold text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>
                              {o.items.length} item{o.items.length !== 1 ? 's' : ''} ordered
                            </p>
                            <p className="text-sm text-warm-gray">{new Date(o.createdAt).toLocaleString('en-IN')}</p>
                            <p className="text-xs text-warm-gray mt-1">Currency: {o.currency}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-purple" style={{ fontFamily: 'var(--font-display)' }}>
                              {formatPrice(Math.round(o.totalCents / 100))}
                            </p>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[o.status] ?? 'text-warm-gray bg-ivory-dark'}`}>
                              {o.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mock orders */}
              <div>
                <p className="text-xs text-warm-gray uppercase tracking-widest font-medium mb-3">Demo Orders</p>
                <div className="space-y-4">
                  {mockOrders.map((o) => (
                    <div key={o.id} className="bg-white rounded-2xl border border-gold/15 p-6">
                      <div className="flex items-start gap-5">
                        <img src={o.image} alt={o.name} className="w-16 h-20 object-cover rounded-xl flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <p className="text-xs text-warm-gray mb-0.5">Order {o.id}</p>
                              <p className="font-semibold text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>{o.name}</p>
                              <p className="text-sm text-warm-gray">{o.brand} · {o.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-purple" style={{ fontFamily: 'var(--font-display)' }}>{formatPrice(o.price)}</p>
                              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[o.status]}`}>{o.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {ordersLoading && (
                <div className="py-8 text-center text-warm-gray text-sm">Fetching orders from backend…</div>
              )}
            </div>
          )}

          {activeSection === 'Brand Priority' && (
            <div>
              <div className="mb-6">
                <p className="text-xs text-gold uppercase tracking-widest mb-1">Personalised Shopping</p>
                <h2 className="text-3xl text-charcoal" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>My Brand Priority</h2>
                <p className="text-warm-gray text-sm mt-2">Higher-priority brands appear first in your feed.</p>
              </div>
              <div className="space-y-3">
                {priorityList.map((b) => (
                  <div key={b.id} className="bg-white rounded-2xl border border-gold/15 p-5 flex items-center gap-5 hover:border-gold/35 transition-colors">
                    <span className="text-3xl font-bold text-gold/30 w-10 text-center" style={{ fontFamily: 'var(--font-display)' }}>
                      {String(b.priority).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>{b.name}</p>
                      <p className="text-xs text-warm-gray">{b.location}</p>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {[['up', moveUp], ['down', moveDown]].map(([dir, fn]) => (
                        <button key={dir as string}
                          onClick={() => (fn as (id: string) => void)(b.id)}
                          className="w-8 h-8 rounded border border-gold/20 flex items-center justify-center text-warm-gray hover:text-purple hover:border-purple/30 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" d={dir === 'up' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                          </svg>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setPriorityList((p) => p.filter((x) => x.id !== b.id).map((x, i) => ({ ...x, priority: i + 1 })))}
                      className="text-xs text-burgundy hover:underline flex-shrink-0">Remove</button>
                  </div>
                ))}
              </div>
              <button onClick={() => onNavigate('manufacturers')} className="mt-6 w-full border border-dashed border-gold/30 rounded-2xl py-4 text-sm text-warm-gray hover:border-gold/60 hover:text-charcoal transition-colors">
                + Add More Brands
              </button>
            </div>
          )}

          {!['Overview', 'Brand Priority', 'My Orders'].includes(activeSection) && (
            <div className="flex items-center justify-center h-64 text-warm-gray">
              <div className="text-center">
                <p className="text-4xl mb-4">🪡</p>
                <p className="font-medium text-charcoal mb-1">{activeSection}</p>
                <p className="text-sm">Coming soon.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
