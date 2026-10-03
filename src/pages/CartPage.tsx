import { useState } from 'react';
import { products, formatPrice } from '../data';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import type { Page } from '../types';

interface CartPageProps {
  onNavigate: (page: Page, extra?: Record<string, string>) => void;
}

const cartItems = [
  { product: products[0], qty: 1 },
  { product: products[2], qty: 1 },
];

const steps = ['Cart', 'Address', 'Delivery', 'Payment', 'Confirmation'];

export default function CartPage({ onNavigate }: CartPageProps) {
  const { token, isLoggedIn, backendOnline } = useAuth();

  const [step, setStep] = useState(0);
  const [items, setItems] = useState(cartItems);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal - discount;

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.product.id !== id));

  /** Place order — real backend if logged in + online, otherwise simulate. */
  const placeOrder = async () => {
    setPlacing(true);
    setPlaceError(null);

    if (backendOnline && isLoggedIn && token) {
      // First we need backend product IDs. The backend starts empty, so we seed
      // each cart item as a backend product (skipping errors if it already exists).
      // In production, products would already be in the DB.
      const backendItemInputs: { productId: string; quantity: number }[] = [];

      for (const item of items) {
        const { data } = await api.products.create(token, {
          title: item.product.name,
          description: `${item.product.motif} · ${item.product.material}`,
          priceCents: item.product.price * 100, // backend uses paise
          sku: item.product.id,
          imageUrl: item.product.image,
        });

        if (!data) {
          // If create failed (e.g., not admin), fall through to simulated checkout
          // by breaking early and using the simulated path.
          break;
        }
        backendItemInputs.push({ productId: data.id, quantity: item.qty });
      }

      if (backendItemInputs.length === items.length) {
        const { data, error } = await api.orders.create(token, backendItemInputs, 'INR');
        setPlacing(false);
        if (error) {
          setPlaceError(error);
          return;
        }
        setOrderId(data!.orderId);
        setClientSecret(data!.clientSecret);
        setOrderPlaced(true);
        return;
      }
    }

    // Simulated path (offline, not logged in, or non-admin)
    await new Promise((r) => setTimeout(r, 800));
    setOrderId('PR-2024-SIM-' + Math.floor(Math.random() * 9000 + 1000));
    setPlacing(false);
    setOrderPlaced(true);
  };

  // ─── Order confirmed screen ───────────────────────────────────────────────

  if (orderPlaced) {
    const isReal = orderId?.startsWith('o_'); // backend IDs start with "o_"
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 rounded-full bg-emerald/10 border-2 border-emerald flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl text-charcoal mb-3" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            Order Confirmed!
          </h2>
          <p className="text-warm-gray text-sm mb-2">
            Order ID: <strong className="text-charcoal font-mono">{orderId}</strong>
          </p>

          {isReal ? (
            <div className="bg-emerald/8 border border-emerald/20 rounded-xl px-5 py-3 text-xs text-emerald mb-6 text-left space-y-1">
              <p className="font-semibold">✓ Real order created on backend</p>
              <p>Status: <span className="font-medium">PENDING</span></p>
              {clientSecret && <p>Payment secret: <span className="font-mono text-charcoal">{clientSecret.slice(0, 30)}…</span></p>}
            </div>
          ) : (
            <div className="bg-gold/8 border border-gold/20 rounded-xl px-5 py-3 text-xs text-warm-gray mb-6">
              Simulated order (backend offline or not logged in). Log in and start the backend to place real orders.
            </div>
          )}

          <p className="text-warm-gray text-sm mb-8 leading-relaxed">
            Your saree is now with the manufacturer. Track your order from the dashboard.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => onNavigate('dashboard')} className="bg-purple text-ivory px-8 py-3 rounded-lg hover:bg-purple-mid transition-colors font-medium">
              Track Order
            </button>
            <button onClick={() => onNavigate('home')} className="border border-gold/30 text-charcoal px-8 py-3 rounded-lg hover:bg-gold/10 transition-colors">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Cart / checkout flow ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <div className="border-b border-gold/15 bg-ivory">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl text-charcoal" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            {step === 0 ? 'My Royal Cart' : steps[step]}
          </h1>

          {/* Auth / backend hint */}
          {step === 3 && (
            <div className={`mt-3 flex items-center gap-2 text-xs ${backendOnline && isLoggedIn ? 'text-emerald' : 'text-warm-gray'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${backendOnline && isLoggedIn ? 'bg-emerald' : 'bg-warm-gray-light'}`} />
              {backendOnline && isLoggedIn
                ? 'Connected — your order will be created on the real backend.'
                : !isLoggedIn
                  ? 'Log in to create a real order on the backend.'
                  : 'Backend offline — order will be simulated.'}
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center gap-0 mt-4 max-w-xl">
            {steps.map((s, i) => (
              <div key={s} className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition-all ${
                  i < step ? 'bg-emerald text-ivory' : i === step ? 'bg-purple text-ivory' : 'bg-ivory-dark border border-gold/25 text-warm-gray'
                }`}>
                  {i < step ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </div>
                <p className={`text-xs ml-2 hidden sm:block ${i === step ? 'text-purple font-medium' : 'text-warm-gray'}`}>{s}</p>
                {i < steps.length - 1 && <div className="flex-1 h-px bg-gold/20 mx-3" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2">
            {step === 0 && (
              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-20 text-warm-gray">
                    <p className="text-4xl mb-4">🛒</p>
                    <p className="font-medium text-charcoal mb-2">Your cart is empty</p>
                    <button onClick={() => onNavigate('explore')} className="text-sm text-purple hover:underline">Explore our collection →</button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.product.id} className="bg-white rounded-2xl border border-gold/15 p-5 flex gap-5">
                      <img src={item.product.image} alt={item.product.name} className="w-24 h-32 object-cover rounded-xl flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-gold uppercase tracking-widest font-medium">{item.product.brand}</p>
                            <h3 className="font-semibold text-charcoal mt-0.5" style={{ fontFamily: 'var(--font-display)' }}>{item.product.name}</h3>
                            <p className="text-xs text-warm-gray mt-0.5">{item.product.motif} · {item.product.material}</p>
                          </div>
                          <button onClick={() => removeItem(item.product.id)} className="text-warm-gray hover:text-burgundy transition-colors flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-1 text-xs text-emerald bg-emerald/10 px-2.5 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Verified Authentic
                          </div>
                          <p className="font-bold text-purple text-lg" style={{ fontFamily: 'var(--font-display)' }}>{formatPrice(item.product.price)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Coupon */}
                <div className="bg-white rounded-2xl border border-gold/15 p-5">
                  <p className="text-sm font-medium text-charcoal mb-3">Apply Coupon Code</p>
                  <div className="flex gap-2">
                    <input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Try ROYAL5"
                      className="flex-1 border border-gold/25 px-4 py-2.5 rounded-lg text-sm outline-none focus:border-gold/50 transition-colors"
                    />
                    <button
                      onClick={() => { if (coupon.toUpperCase() === 'ROYAL5') setCouponApplied(true); }}
                      className="bg-purple text-ivory px-5 py-2.5 rounded-lg text-sm hover:bg-purple-mid transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && <p className="text-xs text-emerald mt-2">✓ 5% discount applied!</p>}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="bg-white rounded-2xl border border-gold/15 p-8">
                <h3 className="font-semibold text-charcoal mb-6" style={{ fontFamily: 'var(--font-display)' }}>Delivery Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {([['Full Name', 'text', 'Priya Mehta'], ['Mobile', 'tel', '+91 98765 43210'], ['Address', 'text', '42 Sunshine Apts'], ['City', 'text', 'Mumbai'], ['State', 'text', 'Maharashtra'], ['Pincode', 'text', '400050']] as [string, string, string][]).map(([l, t, p]) => (
                    <div key={l}>
                      <label className="text-xs text-warm-gray uppercase tracking-widest block mb-1.5">{l}</label>
                      <input type={t} defaultValue={p} className="w-full border border-gold/25 px-4 py-3 rounded-lg text-sm outline-none focus:border-gold/50 bg-ivory" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl border border-gold/15 p-8 space-y-3">
                <h3 className="font-semibold text-charcoal mb-4" style={{ fontFamily: 'var(--font-display)' }}>Delivery Options</h3>
                {[{ n: 'Standard Delivery', d: '7–12 days', p: 'Free' }, { n: 'Express Delivery', d: '3–5 days', p: '₹499' }].map((opt, i) => (
                  <label key={i} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${i === 0 ? 'border-purple bg-purple/5' : 'border-gold/20 hover:border-gold/40'}`}>
                    <input type="radio" name="delivery" defaultChecked={i === 0} />
                    <div className="flex-1">
                      <p className="font-medium text-charcoal text-sm">{opt.n}</p>
                      <p className="text-xs text-warm-gray">{opt.d}</p>
                    </div>
                    <p className="font-semibold text-charcoal">{opt.p}</p>
                  </label>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-2xl border border-gold/15 p-8 space-y-3">
                <h3 className="font-semibold text-charcoal mb-4" style={{ fontFamily: 'var(--font-display)' }}>Payment</h3>
                {[{ m: 'Credit / Debit Card', i: '💳' }, { m: 'UPI', i: '📱' }, { m: 'Net Banking', i: '🏦' }, { m: 'EMI (0% · 12 months)', i: '🔄' }].map((p, i) => (
                  <label key={i} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${i === 0 ? 'border-purple bg-purple/5' : 'border-gold/20 hover:border-gold/40'}`}>
                    <input type="radio" name="payment" defaultChecked={i === 0} />
                    <span className="text-xl">{p.i}</span>
                    <span className="font-medium text-charcoal text-sm">{p.m}</span>
                  </label>
                ))}
                <div className="flex items-center gap-2 text-xs text-emerald pt-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
                  </svg>
                  PCI-DSS encrypted · Secured by Paithani Royale
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gold/15 p-6 sticky top-24">
              <h3 className="font-semibold text-charcoal mb-5" style={{ fontFamily: 'var(--font-display)' }}>Order Summary</h3>
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-warm-gray">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="text-charcoal">{formatPrice(subtotal)}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-emerald">
                    <span>ROYAL5 discount</span>
                    <span>−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-warm-gray">
                  <span>Shipping</span>
                  <span className="text-emerald">Free</span>
                </div>
                <div className="border-t border-gold/15 pt-3 flex justify-between font-bold">
                  <span className="text-charcoal">Total</span>
                  <span className="text-purple text-lg" style={{ fontFamily: 'var(--font-display)' }}>{formatPrice(total)}</span>
                </div>
              </div>

              {placeError && (
                <div className="mb-4 bg-burgundy/10 border border-burgundy/25 rounded-lg px-4 py-2 text-xs text-burgundy">
                  {placeError}
                </div>
              )}

              <button
                onClick={() => {
                  if (step < 3) { setStep(step + 1); }
                  else { placeOrder(); }
                }}
                disabled={placing || items.length === 0}
                className="w-full bg-purple text-ivory py-4 rounded-xl font-semibold hover:bg-purple-mid transition-all duration-300 shadow-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {placing && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {step === 3 ? 'Place Order Securely' : 'Continue'}
              </button>

              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="w-full text-center text-sm text-warm-gray hover:text-charcoal mt-3 transition-colors">
                  ← Back
                </button>
              )}

              <div className="mt-5 space-y-1.5 text-xs text-warm-gray">
                {['Buyer Protection Policy', '100% Authentic Guarantee', 'Secure SSL Payment', '7-day Returns'].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <span className="text-emerald">✓</span> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
