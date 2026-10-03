import { useState, useEffect } from 'react';
import { products as localProducts, formatPrice } from '../data';
import type { Page } from '../types';
import { useAuth } from '../lib/AuthContext';
import { api, type BackendProduct } from '../lib/api';

interface ManufacturerDashboardProps {
  onNavigate: (page: Page, extra?: Record<string, string>) => void;
}

const sections = [
  'Overview', 'My Products', 'Orders', 'Messages', 'Reviews',
  'Analytics', 'Inventory', 'Discounts', 'Brand Profile', 'Verification',
];

const recentOrders = [
  { id: 'PR-2024-011', customer: 'Priya Mehta', city: 'Mumbai', product: 'Royal Peacock Paithani', price: 48500, status: 'Preparing', date: 'Dec 10, 2024' },
  { id: 'PR-2024-012', customer: 'Ananya Singh', city: 'Delhi', product: 'Asawali Heritage Paithani', price: 95000, status: 'Quality Check', date: 'Dec 8, 2024' },
  { id: 'PR-2024-013', customer: 'Meenakshi Rao', city: 'Chennai', product: 'Royal Peacock Paithani', price: 48500, status: 'Shipped', date: 'Dec 5, 2024' },
];

const orderStatusColors: Record<string, string> = {
  Preparing: 'text-gold bg-gold/10',
  'Quality Check': 'text-peacock bg-peacock/10',
  Shipped: 'text-emerald bg-emerald/10',
  Delivered: 'text-emerald bg-emerald/10',
};

const monthlyRevenue = [38, 52, 44, 68, 73, 58, 82, 90, 78, 96, 88, 112];
const maxRev = Math.max(...monthlyRevenue);

interface AddProductForm {
  title: string;
  description: string;
  price: string;
  sku: string;
  imageUrl: string;
}

export default function ManufacturerDashboard({ onNavigate }: ManufacturerDashboardProps) {
  const { user, token, isLoggedIn, backendOnline } = useAuth();
  const [activeSection, setActiveSection] = useState('Overview');
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [backendProducts, setBackendProducts] = useState<BackendProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [addForm, setAddForm] = useState<AddProductForm>({ title: '', description: '', price: '', sku: '', imageUrl: '' });
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  const loadBackendProducts = () => {
    if (!backendOnline) return;
    setProductsLoading(true);
    api.products.list().then(({ data }) => {
      if (data) setBackendProducts(data);
      setProductsLoading(false);
    });
  };

  useEffect(loadBackendProducts, [backendOnline]);

  const submitAddProduct = async () => {
    if (!token) { setAddError('Login required'); return; }
    if (!addForm.title || !addForm.price) { setAddError('Title and price are required'); return; }
    setAddLoading(true);
    setAddError(null);
    const { error } = await api.products.create(token, {
      title: addForm.title,
      description: addForm.description || addForm.title,
      priceCents: Math.round(parseFloat(addForm.price) * 100),
      sku: addForm.sku || `SKU-${Date.now()}`,
      imageUrl: addForm.imageUrl || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format',
    });
    setAddLoading(false);
    if (error) { setAddError(error); return; }
    setAddForm({ title: '', description: '', price: '', sku: '', imageUrl: '' });
    setAddProductOpen(false);
    loadBackendProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!token) return;
    await api.products.remove(token, id);
    setBackendProducts((p) => p.filter((x) => x.id !== id));
  };

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <div className="bg-charcoal text-ivory py-12 px-6 paithani-pattern">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-gold uppercase tracking-widest mb-2">Manufacturer Portal</p>
            <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              Heritage Weaves
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald" />
              <p className="text-ivory/50 text-sm">✓ Verified Manufacturer · Nashik, Maharashtra</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setAddProductOpen(true)}
              className="bg-gold text-charcoal font-semibold px-6 py-3 rounded-lg text-sm hover:bg-gold-light transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" d="M12 5v14M5 12h14" />
              </svg>
              Add Product
            </button>
            <button
              onClick={() => onNavigate('manufacturer-profile', { id: 'm1' })}
              className="border border-ivory/20 text-ivory px-6 py-3 rounded-lg text-sm hover:bg-ivory/10 transition-colors"
            >
              View Profile
            </button>
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
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                  activeSection === s
                    ? 'bg-purple text-ivory font-medium'
                    : 'text-warm-gray hover:text-charcoal hover:bg-ivory-dark'
                }`}
              >
                {s}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {activeSection === 'Overview' && (
            <div className="space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Products', value: '87', icon: '🪡', color: 'bg-purple' },
                  { label: 'Orders', value: '34', icon: '📦', color: 'bg-peacock' },
                  { label: 'Revenue', value: '₹42L', icon: '₹', color: 'bg-emerald' },
                  { label: 'Customers', value: '312', icon: '👥', color: 'bg-gold' },
                  { label: 'Followers', value: '4.8K', icon: '★', color: 'bg-burgundy' },
                  { label: 'Messages', value: '7', icon: '💬', color: 'bg-charcoal' },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-gold/15 p-4">
                    <div className={`w-9 h-9 rounded-xl ${s.color} text-ivory flex items-center justify-center text-sm mb-3`}>
                      {s.icon}
                    </div>
                    <p className="text-xl font-bold text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</p>
                    <p className="text-xs text-warm-gray mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Revenue chart */}
              <div className="bg-white rounded-2xl border border-gold/15 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>Monthly Revenue</h3>
                    <p className="text-xs text-warm-gray mt-0.5">2024 · in Lakhs (₹)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald" style={{ fontFamily: 'var(--font-display)' }}>₹42.6L</p>
                    <p className="text-xs text-emerald">↑ 18% from last year</p>
                  </div>
                </div>
                <div className="flex items-end gap-2 h-32">
                  {monthlyRevenue.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-sm bg-purple/80 hover:bg-purple transition-colors duration-200 cursor-pointer"
                        style={{ height: `${(val / maxRev) * 100}%`, minHeight: 4 }}
                        title={`₹${val}L`}
                      />
                      <span className="text-[9px] text-warm-gray">
                        {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent orders */}
              <div className="bg-white rounded-2xl border border-gold/15 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>Recent Orders</h3>
                  <button onClick={() => setActiveSection('Orders')} className="text-xs text-purple hover:underline">View all →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] text-warm-gray uppercase tracking-widest border-b border-gold/10">
                        <th className="text-left py-3 font-medium">Order</th>
                        <th className="text-left py-3 font-medium">Customer</th>
                        <th className="text-left py-3 font-medium">Product</th>
                        <th className="text-left py-3 font-medium">Amount</th>
                        <th className="text-left py-3 font-medium">Status</th>
                        <th className="text-left py-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((o) => (
                        <tr key={o.id} className="border-b border-gold/8 hover:bg-ivory transition-colors">
                          <td className="py-3 text-xs text-warm-gray">{o.id}</td>
                          <td className="py-3">
                            <p className="font-medium text-charcoal">{o.customer}</p>
                            <p className="text-xs text-warm-gray">{o.city}</p>
                          </td>
                          <td className="py-3 text-charcoal text-xs">{o.product}</td>
                          <td className="py-3 font-semibold text-purple" style={{ fontFamily: 'var(--font-display)' }}>
                            {formatPrice(o.price)}
                          </td>
                          <td className="py-3">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${orderStatusColors[o.status] ?? 'text-warm-gray bg-ivory-dark'}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 text-xs text-warm-gray">{o.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top products */}
              <div className="bg-white rounded-2xl border border-gold/15 p-6">
                <h3 className="font-semibold text-charcoal mb-5" style={{ fontFamily: 'var(--font-display)' }}>Top Performing Sarees</h3>
                {localProducts.filter((p) => p.manufacturerId === 'm1').concat(localProducts.slice(0, 2)).slice(0, 3).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-4 py-3 border-b border-gold/8 last:border-0">
                    <span className="text-2xl font-bold text-gold/30 w-8" style={{ fontFamily: 'var(--font-display)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <img src={p.image} alt={p.name} className="w-12 h-14 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal text-sm truncate" style={{ fontFamily: 'var(--font-display)' }}>{p.name}</p>
                      <p className="text-xs text-warm-gray">{p.motif} · {p.reviews} reviews</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-purple text-sm">{formatPrice(p.price)}</p>
                      <p className="text-xs text-emerald">↑ 12% views</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'My Products' && (
            <div>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h2 className="text-3xl text-charcoal" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>My Products</h2>
                  {backendOnline && (
                    <p className="text-xs text-emerald mt-1 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald" />
                      {backendProducts.length} product{backendProducts.length !== 1 ? 's' : ''} in backend
                      {isLoggedIn && ' · add/delete synced live'}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setAddProductOpen(true)}
                  className="bg-purple text-ivory px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-mid transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                  </svg>
                  Add New Saree
                </button>
              </div>

              {/* Backend products */}
              {backendProducts.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-warm-gray uppercase tracking-widest font-medium mb-3">Backend Products (live)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {backendProducts.map((p) => (
                      <div key={p.id} className="bg-white rounded-2xl border border-emerald/20 overflow-hidden hover:border-emerald/40 hover:shadow-lg transition-all duration-300">
                        <div className="relative aspect-[3/2] overflow-hidden bg-ivory">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">🪡</div>
                          )}
                          <div className="absolute top-2 left-2">
                            <span className="text-[9px] bg-emerald text-ivory px-1.5 py-0.5 rounded font-medium">BACKEND</span>
                          </div>
                          <div className="absolute top-2 right-2 flex gap-1.5">
                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="w-7 h-7 bg-ivory/90 rounded-full flex items-center justify-center text-charcoal hover:text-burgundy transition-colors"
                              title="Delete from backend"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-charcoal text-sm" style={{ fontFamily: 'var(--font-display)' }}>{p.title}</h4>
                          <p className="text-xs text-warm-gray mt-0.5 font-mono">{p.sku}</p>
                          <div className="flex items-center justify-between mt-3">
                            <p className="font-bold text-purple" style={{ fontFamily: 'var(--font-display)' }}>{formatPrice(Math.round(p.priceCents / 100))}</p>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-emerald bg-emerald/10">
                              In Stock
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Local demo products */}
              <div>
                <p className="text-xs text-warm-gray uppercase tracking-widest font-medium mb-3">Demo Products (local)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {localProducts.map((p) => (
                    <div key={p.id} className="bg-white rounded-2xl border border-gold/15 overflow-hidden hover:border-gold/35 hover:shadow-lg transition-all duration-300">
                      <div className="relative aspect-[3/2] overflow-hidden">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 flex gap-1.5">
                          <button className="w-7 h-7 bg-ivory/90 rounded-full flex items-center justify-center text-charcoal hover:text-purple transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-charcoal text-sm" style={{ fontFamily: 'var(--font-display)' }}>{p.name}</h4>
                        <p className="text-xs text-warm-gray mt-0.5">{p.motif} · {p.location}</p>
                        <div className="flex items-center justify-between mt-3">
                          <p className="font-bold text-purple" style={{ fontFamily: 'var(--font-display)' }}>{formatPrice(p.price)}</p>
                          <div className="flex items-center gap-1 text-xs text-warm-gray">
                            <svg className="w-3 h-3 text-gold" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            {p.rating} · {p.reviews} reviews
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'Analytics' && (
            <div className="space-y-8">
              <h2 className="text-3xl text-charcoal" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Analytics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Page Views', value: '12,840', change: '+24%', up: true },
                  { label: 'Profile Visits', value: '3,210', change: '+18%', up: true },
                  { label: 'Conversion Rate', value: '4.2%', change: '+0.8%', up: true },
                  { label: 'Avg. Order Value', value: '₹62,400', change: '+9%', up: true },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-gold/15 p-5">
                    <p className="text-xs text-warm-gray uppercase tracking-widest mb-2">{s.label}</p>
                    <p className="text-2xl font-bold text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</p>
                    <p className={`text-xs mt-1 ${s.up ? 'text-emerald' : 'text-burgundy'}`}>
                      {s.up ? '↑' : '↓'} {s.change} this month
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gold/15 p-6">
                <h3 className="font-semibold text-charcoal mb-4" style={{ fontFamily: 'var(--font-display)' }}>Traffic Sources</h3>
                <div className="space-y-4">
                  {[
                    { source: 'Direct Search', pct: 42 },
                    { source: 'Instagram', pct: 28 },
                    { source: 'Organic SEO', pct: 18 },
                    { source: 'WhatsApp Referrals', pct: 12 },
                  ].map((s) => (
                    <div key={s.source}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-charcoal">{s.source}</span>
                        <span className="text-warm-gray font-medium">{s.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-ivory-dark rounded-full overflow-hidden">
                        <div className="h-full bg-purple rounded-full transition-all duration-700" style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'Verification' && (
            <div className="max-w-2xl">
              <h2 className="text-3xl text-charcoal mb-8" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Verification Status</h2>
              <div className="bg-emerald/5 border-2 border-emerald rounded-2xl p-8 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-emerald text-ivory flex items-center justify-center text-2xl">✓</div>
                  <div>
                    <h3 className="font-semibold text-charcoal text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                      ✓ Verified Manufacturer
                    </h3>
                    <p className="text-emerald text-sm">Full verification approved · Jan 15, 2024</p>
                  </div>
                </div>
                <p className="text-warm-gray text-sm leading-relaxed">
                  Your brand is fully verified and GI-compliant. Your products display the "Verified Manufacturer" badge, building trust with buyers.
                </p>
              </div>
              {[
                { label: 'GST Registration', status: 'Verified', date: 'Jan 10, 2024' },
                { label: 'Business Registration', status: 'Verified', date: 'Jan 10, 2024' },
                { label: 'GI Compliance Certificate', status: 'Verified', date: 'Jan 12, 2024' },
                { label: 'Bank Account Verification', status: 'Verified', date: 'Jan 14, 2024' },
                { label: 'Identity Verification (KYC)', status: 'Verified', date: 'Jan 15, 2024' },
              ].map((d) => (
                <div key={d.label} className="flex items-center justify-between py-4 border-b border-gold/10">
                  <p className="text-sm text-charcoal">{d.label}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-warm-gray">{d.date}</span>
                    <span className="text-xs text-emerald bg-emerald/10 px-2.5 py-1 rounded-full font-medium">{d.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!['Overview', 'My Products', 'Analytics', 'Verification'].includes(activeSection) && (
            <div className="flex items-center justify-center h-64 text-warm-gray">
              <div className="text-center">
                <p className="text-4xl mb-4">🪡</p>
                <p className="font-medium text-charcoal mb-1">{activeSection}</p>
                <p className="text-sm">Full {activeSection.toLowerCase()} panel coming soon.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {addProductOpen && (
        <div
          className="fixed inset-0 z-50 bg-charcoal/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setAddProductOpen(false); }}
        >
          <div className="bg-ivory rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-8 py-5 border-b border-gold/15">
              <div>
                <h3 className="text-xl text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>Add New Saree</h3>
                {backendOnline && isLoggedIn ? (
                  <p className="text-xs text-emerald mt-0.5">Will be saved to backend</p>
                ) : (
                  <p className="text-xs text-warm-gray mt-0.5">{!backendOnline ? 'Backend offline — demo only' : 'Login required to save to backend'}</p>
                )}
              </div>
              <button onClick={() => setAddProductOpen(false)} className="text-warm-gray hover:text-charcoal">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-8 space-y-5">
              {addError && (
                <div className="bg-burgundy/10 border border-burgundy/25 rounded-lg px-4 py-3 text-xs text-burgundy">{addError}</div>
              )}
              <div>
                <label className="text-xs text-warm-gray uppercase tracking-widest block mb-1.5">Saree Name *</label>
                <input value={addForm.title} onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Royal Peacock Paithani" className="w-full border border-gold/25 px-4 py-3 rounded-xl text-sm outline-none focus:border-gold/50 transition-colors bg-white" />
              </div>
              <div>
                <label className="text-xs text-warm-gray uppercase tracking-widest block mb-1.5">Price (₹) *</label>
                <input type="number" value={addForm.price} onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="48500" className="w-full border border-gold/25 px-4 py-3 rounded-xl text-sm outline-none focus:border-gold/50 transition-colors bg-white" />
              </div>
              <div>
                <label className="text-xs text-warm-gray uppercase tracking-widest block mb-1.5">SKU</label>
                <input value={addForm.sku} onChange={(e) => setAddForm((f) => ({ ...f, sku: e.target.value }))}
                  placeholder="PAI-2024-001" className="w-full border border-gold/25 px-4 py-3 rounded-xl text-sm outline-none focus:border-gold/50 transition-colors bg-white" />
              </div>
              <div>
                <label className="text-xs text-warm-gray uppercase tracking-widest block mb-1.5">Image URL</label>
                <input value={addForm.imageUrl} onChange={(e) => setAddForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/…" className="w-full border border-gold/25 px-4 py-3 rounded-xl text-sm outline-none focus:border-gold/50 transition-colors bg-white" />
              </div>
              <div>
                <label className="text-xs text-warm-gray uppercase tracking-widest block mb-1.5">Description</label>
                <textarea rows={3} value={addForm.description} onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gold/25 px-4 py-3 rounded-xl text-sm outline-none focus:border-gold/50 transition-colors bg-white resize-none" placeholder="Describe this saree…" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setAddProductOpen(false)} className="flex-1 border border-gold/25 text-charcoal py-3.5 rounded-xl text-sm hover:bg-ivory-dark transition-colors">Cancel</button>
                <button
                  onClick={submitAddProduct}
                  disabled={addLoading}
                  className="flex-1 bg-purple text-ivory py-3.5 rounded-xl text-sm font-semibold hover:bg-purple-mid transition-colors disabled:opacity-50"
                >
                  {addLoading ? 'Publishing…' : 'Publish Saree'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
