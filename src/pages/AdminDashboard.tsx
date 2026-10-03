import { useState, useEffect } from 'react';
import { manufacturers, formatPrice } from '../data';
import type { Page } from '../types';
import { useAuth } from '../lib/AuthContext';
import { api, type AdminDashboardData, type BackendOrder } from '../lib/api';

interface AdminDashboardProps {
  onNavigate: (page: Page, extra?: Record<string, string>) => void;
}

const sections = [
  'Overview', 'Manufacturers', 'Products', 'Orders', 'Customers',
  'Reviews', 'Disputes', 'Analytics', 'Categories', 'Settings',
];

const pendingManufacturers = [
  { name: 'Vidarbha Weavers', owner: 'Prakash Chavan', location: 'Nagpur', submitted: 'Dec 12, 2024', docs: true },
  { name: 'Aurangabad Silk House', owner: 'Sangita More', location: 'Aurangabad', submitted: 'Dec 11, 2024', docs: false },
  { name: 'Nashik Heritage Looms', owner: 'Vijay Patil', location: 'Nashik', submitted: 'Dec 10, 2024', docs: true },
];

const statsData = [
  { label: 'Total Revenue', value: '₹4.8 Cr', change: '+22%', color: 'bg-emerald', icon: '₹' },
  { label: 'Active Manufacturers', value: '40', change: '+5 this month', color: 'bg-purple', icon: '🏭' },
  { label: 'Total Products', value: '534', change: '+48 new', color: 'bg-peacock', icon: '🪡' },
  { label: 'Total Customers', value: '12,840', change: '+1,240 new', color: 'bg-gold', icon: '👥' },
  { label: 'Pending Verifications', value: '3', change: 'Action needed', color: 'bg-burgundy', icon: '⚠️' },
  { label: 'Open Disputes', value: '2', change: 'In review', color: 'bg-charcoal', icon: '⚖️' },
];

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { user, token, isAdmin, backendOnline } = useAuth();
  const [activeSection, setActiveSection] = useState('Overview');
  const [pendingList, setPendingList] = useState(pendingManufacturers);
  const [liveStats, setLiveStats] = useState<AdminDashboardData | null>(null);
  const [liveOrders, setLiveOrders] = useState<BackendOrder[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [emailSending, setEmailSending] = useState<string | null>(null);

  useEffect(() => {
    if (!backendOnline || !isAdmin || !token) return;
    setStatsLoading(true);
    Promise.all([api.admin.dashboard(token), api.admin.orders(token)]).then(([stats, orders]) => {
      if (stats.data) setLiveStats(stats.data);
      if (orders.data) setLiveOrders(orders.data);
      setStatsLoading(false);
    });
  }, [backendOnline, isAdmin, token]);

  const sendEmailLink = async (orderId: string) => {
    if (!token) return;
    setEmailSending(orderId);
    const email = user?.email ?? 'admin@paithani.test';
    await api.email.sendOrderLink(token, orderId, email);
    setEmailSending(null);
  };

  const approve = (name: string) => setPendingList((p) => p.filter((x) => x.name !== name));
  const reject = (name: string) => setPendingList((p) => p.filter((x) => x.name !== name));

  const displayName = user?.name ?? user?.email ?? 'Admin';

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <div className="bg-charcoal text-ivory py-10 px-6 paithani-pattern border-b border-gold/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-burgundy/80 text-ivory px-2 py-0.5 rounded tracking-wider uppercase font-medium">Admin</span>
            </div>
            <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              Admin Control Panel
            </h1>
            <p className="text-ivory/50 text-sm mt-1">Paithani Royale Platform Management</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs text-ivory/50">
              <p>Admin: {displayName}</p>
              {backendOnline && isAdmin ? (
                <p className="text-emerald/70">● Live backend session</p>
              ) : backendOnline && !isAdmin ? (
                <p className="text-gold/70">⚠ Not admin — demo mode</p>
              ) : (
                <p className="text-burgundy/70">● Backend offline — demo</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 flex items-center justify-between ${
                  activeSection === s
                    ? 'bg-charcoal text-ivory font-medium'
                    : 'text-warm-gray hover:text-charcoal hover:bg-ivory-dark'
                }`}
              >
                <span>{s}</span>
                {s === 'Manufacturers' && pendingList.length > 0 && (
                  <span className="w-5 h-5 bg-burgundy text-ivory text-[10px] rounded-full flex items-center justify-center font-bold">
                    {pendingList.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {activeSection === 'Overview' && (
            <div className="space-y-8">
              {/* Stats */}
              {liveStats && (
                <div className="flex items-center gap-2 text-xs text-emerald mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald" />
                  Live backend data — {liveStats.totalOrders} orders · {liveStats.totalUsers} users ·{' '}
                  {formatPrice(Math.round(liveStats.revenueCents / 100))} revenue
                </div>
              )}
              {statsLoading && (
                <div className="text-xs text-warm-gray mb-1">Fetching live stats…</div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {statsData.map((s) => {
                  let value = s.value;
                  let change = s.change;
                  if (liveStats) {
                    if (s.label === 'Total Revenue') {
                      value = formatPrice(Math.round(liveStats.revenueCents / 100));
                      change = `${liveStats.totalOrders} orders`;
                    } else if (s.label === 'Total Customers') {
                      value = String(liveStats.totalUsers);
                      change = 'backend count';
                    } else if (s.label === 'Total Products') {
                      value = s.value;
                      change = `${liveStats.totalOrders} orders total`;
                    }
                  }
                  return (
                  <div key={s.label} className="bg-white rounded-2xl border border-gold/15 p-5">
                    <div className={`w-10 h-10 rounded-xl ${s.color} text-ivory flex items-center justify-center text-sm mb-3`}>
                      {s.icon}
                    </div>
                    <p className="text-2xl font-bold text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
                    <p className="text-xs text-warm-gray mt-0.5">{s.label}</p>
                    <p className="text-xs text-emerald mt-1">{change}</p>
                  </div>
                  );
                })}
              </div>

              {/* Pending verifications alert */}
              {pendingList.length > 0 && (
                <div className="bg-gold/8 border border-gold/25 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-sm">⚠️</div>
                    <div>
                      <h3 className="font-semibold text-charcoal text-sm">{pendingList.length} Manufacturer Verifications Pending</h3>
                      <p className="text-xs text-warm-gray">Review and approve or reject new manufacturer applications.</p>
                    </div>
                    <button onClick={() => setActiveSection('Manufacturers')} className="ml-auto text-xs text-purple hover:underline">
                      Review →
                    </button>
                  </div>
                </div>
              )}

              {/* Platform health */}
              <div className="bg-white rounded-2xl border border-gold/15 p-6">
                <h3 className="font-semibold text-charcoal mb-5" style={{ fontFamily: 'var(--font-display)' }}>Platform Health</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Server Uptime', value: '99.98%', color: 'bg-emerald' },
                    { label: 'Payment Success', value: '97.4%', color: 'bg-emerald' },
                    { label: 'Avg Response Time', value: '142ms', color: 'bg-peacock' },
                    { label: 'Security Score', value: 'A+', color: 'bg-purple' },
                  ].map((m) => (
                    <div key={m.label} className="text-center">
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <div className={`w-full h-full rounded-full ${m.color} opacity-10`} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-bold text-charcoal text-sm">{m.value}</span>
                        </div>
                      </div>
                      <p className="text-xs text-warm-gray">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div className="bg-white rounded-2xl border border-gold/15 p-6">
                <h3 className="font-semibold text-charcoal mb-5" style={{ fontFamily: 'var(--font-display)' }}>Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { action: 'New manufacturer application', detail: 'Vidarbha Weavers — Nagpur', time: '2h ago', type: 'info' },
                    { action: 'Order dispute raised', detail: 'Order PR-2024-009 · Customer vs. Heritage Weaves', time: '4h ago', type: 'warn' },
                    { action: 'New review flagged', detail: 'Possible fake review on Royal Paithani House', time: '6h ago', type: 'warn' },
                    { action: 'Manufacturer verified', detail: 'Peacock Weavers — Aurangabad', time: '1d ago', type: 'success' },
                    { action: 'New product listing', detail: 'Heritage Weaves added 3 new sarees', time: '1d ago', type: 'info' },
                  ].map((a, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-gold/8 last:border-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.type === 'success' ? 'bg-emerald' : a.type === 'warn' ? 'bg-gold' : 'bg-peacock'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-charcoal">{a.action}</p>
                        <p className="text-xs text-warm-gray truncate">{a.detail}</p>
                      </div>
                      <p className="text-xs text-warm-gray flex-shrink-0">{a.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'Manufacturers' && (
            <div className="space-y-8">
              <h2 className="text-3xl text-charcoal" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                Manufacturer Management
              </h2>

              {/* Pending approvals */}
              {pendingList.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-charcoal mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 bg-burgundy text-ivory text-[10px] rounded-full flex items-center justify-center">{pendingList.length}</span>
                    Pending Verification
                  </p>
                  <div className="space-y-4">
                    {pendingList.map((m) => (
                      <div key={m.name} className="bg-white rounded-2xl border-2 border-gold/25 p-6">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <h4 className="font-semibold text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>{m.name}</h4>
                            <p className="text-sm text-warm-gray mt-0.5">{m.owner} · {m.location}</p>
                            <p className="text-xs text-warm-gray mt-1">Submitted: {m.submitted}</p>
                            <div className="flex gap-2 mt-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${m.docs ? 'text-emerald bg-emerald/10' : 'text-burgundy bg-burgundy/10'}`}>
                                Documents: {m.docs ? 'Complete' : 'Incomplete'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button className="text-xs border border-gold/25 text-warm-gray px-4 py-2 rounded-lg hover:border-gold/50 transition-colors">
                              View Docs
                            </button>
                            <button
                              onClick={() => reject(m.name)}
                              className="text-xs border border-burgundy/30 text-burgundy px-4 py-2 rounded-lg hover:bg-burgundy/10 transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => approve(m.name)}
                              className="text-xs bg-emerald text-ivory px-4 py-2 rounded-lg hover:bg-emerald/80 transition-colors font-medium"
                            >
                              Approve ✓
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All manufacturers */}
              <div>
                <p className="text-sm font-semibold text-charcoal mb-4">Verified Manufacturers ({manufacturers.length})</p>
                <div className="bg-white rounded-2xl border border-gold/15 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] text-warm-gray uppercase tracking-widest border-b border-gold/10 bg-ivory">
                        <th className="text-left px-6 py-3 font-medium">Manufacturer</th>
                        <th className="text-left px-6 py-3 font-medium">Location</th>
                        <th className="text-left px-6 py-3 font-medium">Products</th>
                        <th className="text-left px-6 py-3 font-medium">Rating</th>
                        <th className="text-left px-6 py-3 font-medium">Status</th>
                        <th className="text-left px-6 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manufacturers.map((m) => (
                        <tr key={m.id} className="border-b border-gold/8 hover:bg-ivory/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                              <div>
                                <p className="font-medium text-charcoal">{m.name}</p>
                                <p className="text-xs text-warm-gray">{m.ownerName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-warm-gray">{m.location}</td>
                          <td className="px-6 py-4 text-charcoal">{m.products}</td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gold">{m.rating}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] text-emerald bg-emerald/10 px-2.5 py-1 rounded-full font-medium">
                              ✓ Verified
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => onNavigate('manufacturer-profile', { id: m.id })}
                                className="text-[10px] text-purple hover:underline"
                              >
                                View
                              </button>
                              <button className="text-[10px] text-burgundy hover:underline">Suspend</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'Orders' && (
            <div>
              <h2 className="text-3xl text-charcoal mb-2" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                Order Management
              </h2>
              {liveOrders.length > 0 ? (
                <>
                  <p className="text-xs text-emerald mb-6 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald" />
                    {liveOrders.length} live order{liveOrders.length !== 1 ? 's' : ''} from backend
                  </p>
                  <div className="space-y-4">
                    {liveOrders.map((o) => (
                      <div key={o.id} className="bg-white rounded-2xl border border-gold/15 p-6">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <p className="font-mono text-xs text-warm-gray mb-1">{o.id}</p>
                            <p className="font-semibold text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>
                              {o.items.length} item{o.items.length !== 1 ? 's' : ''} · {o.currency}
                            </p>
                            <p className="text-xs text-warm-gray">{new Date(o.createdAt).toLocaleString('en-IN')}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-purple text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                              {formatPrice(Math.round(o.totalCents / 100))}
                            </p>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              o.status === 'PAID' || o.status === 'FULFILLED' ? 'text-emerald bg-emerald/10' :
                              o.status === 'CANCELED' ? 'text-burgundy bg-burgundy/10' : 'text-gold bg-gold/10'
                            }`}>
                              {o.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          <button
                            onClick={() => sendEmailLink(o.id)}
                            disabled={emailSending === o.id}
                            className="text-xs border border-peacock/25 text-peacock px-4 py-2 rounded-lg hover:bg-peacock/10 transition-colors disabled:opacity-50"
                          >
                            {emailSending === o.id ? 'Sending…' : '✉ Send order email link'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-8 py-16 text-center text-warm-gray bg-white rounded-2xl border border-gold/15">
                  {statsLoading ? 'Loading orders from backend…' : !backendOnline ? 'Backend offline — no live orders' : !isAdmin ? 'Admin role required to view orders' : 'No orders yet.'}
                </div>
              )}
            </div>
          )}

          {activeSection === 'Disputes' && (
            <div>
              <h2 className="text-3xl text-charcoal mb-8" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                Disputes & Reports
              </h2>
              <div className="space-y-4">
                {[
                  { id: 'DISP-001', type: 'Order Dispute', customer: 'Ananya Singh', manufacturer: 'Heritage Weaves', issue: 'Saree quality does not match listing photos.', status: 'Under Review', date: 'Dec 10, 2024', amount: 95000 },
                  { id: 'DISP-002', type: 'Refund Request', customer: 'Kavita Sharma', manufacturer: 'Peacock Weavers', issue: 'Delivery delayed beyond 30 days without update.', status: 'Resolved', date: 'Dec 5, 2024', amount: 42000 },
                ].map((d) => (
                  <div key={d.id} className="bg-white rounded-2xl border border-gold/15 p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-xs text-warm-gray">{d.id}</span>
                          <span className="text-xs bg-ivory-dark text-charcoal px-2 py-0.5 rounded-full">{d.type}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.status === 'Resolved' ? 'text-emerald bg-emerald/10' : 'text-gold bg-gold/10'}`}>
                            {d.status}
                          </span>
                        </div>
                        <p className="text-sm text-charcoal font-medium mb-1">{d.issue}</p>
                        <div className="flex gap-4 text-xs text-warm-gray">
                          <span>Customer: <strong className="text-charcoal">{d.customer}</strong></span>
                          <span>Manufacturer: <strong className="text-charcoal">{d.manufacturer}</strong></span>
                          <span>Amount: <strong className="text-purple">{formatPrice(d.amount)}</strong></span>
                        </div>
                        <p className="text-xs text-warm-gray mt-1">Filed: {d.date}</p>
                      </div>
                      {d.status === 'Under Review' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button className="text-xs border border-gold/25 text-warm-gray px-4 py-2 rounded-lg hover:border-gold/50 transition-colors">
                            View Chat
                          </button>
                          <button className="text-xs bg-emerald text-ivory px-4 py-2 rounded-lg hover:bg-emerald/80 transition-colors">
                            Resolve
                          </button>
                          <button className="text-xs bg-burgundy text-ivory px-4 py-2 rounded-lg hover:bg-burgundy/80 transition-colors">
                            Escalate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!['Overview', 'Manufacturers', 'Orders', 'Disputes'].includes(activeSection) && (
            <div className="flex items-center justify-center h-64 text-warm-gray">
              <div className="text-center">
                <p className="text-4xl mb-4">⚙️</p>
                <p className="font-medium text-charcoal mb-1">{activeSection}</p>
                <p className="text-sm">Admin {activeSection.toLowerCase()} panel coming soon.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
