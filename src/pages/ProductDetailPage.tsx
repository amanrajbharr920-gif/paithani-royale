import { useState } from 'react';
import { products, manufacturers, formatPrice } from '../data';
import ProductCard from '../components/ProductCard';
import type { Page } from '../types';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: Page, extra?: Record<string, string>) => void;
  onAddToCart: () => void;
}

export default function ProductDetailPage({ productId, onNavigate, onAddToCart }: ProductDetailPageProps) {
  const product = products.find((p) => p.id === productId) ?? products[0];
  const manufacturer = manufacturers.find((m) => m.id === product.manufacturerId) ?? manufacturers[0];
  const [activeImage, setActiveImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('Details');
  const [certVisible, setCertVisible] = useState(false);

  const images = [product.image, manufacturer.cover, manufacturer.avatar, product.image];
  const tabs = ['Details', 'Authenticity', 'Reviews', 'Shipping'];

  const reviews = [
    { name: 'Priya Mehta', location: 'Mumbai', rating: 5, date: 'Nov 2024', text: 'Absolutely stunning saree. The peacock motif is exquisitely detailed and the silk quality is unmatched. Worth every rupee.', verified: true },
    { name: 'Deepa Kulkarni', location: 'Pune', rating: 5, date: 'Oct 2024', text: 'I wore this to my daughter\'s wedding and received compliments all evening. The manufacturer was very responsive and even helped with blouse matching.', verified: true },
    { name: 'Ananya Sharma', location: 'Bengaluru', rating: 4, date: 'Sep 2024', text: 'Beautiful saree, great craftsmanship. Took slightly longer to deliver than expected but the quality made the wait worth it.', verified: true },
  ];

  return (
    <div className="min-h-screen bg-ivory">
      {/* Breadcrumb */}
      <div className="border-b border-gold/15 bg-ivory">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-xs text-warm-gray">
          <button onClick={() => onNavigate('home')} className="hover:text-purple transition-colors">Home</button>
          <span className="text-gold/40">/</span>
          <button onClick={() => onNavigate('explore')} className="hover:text-purple transition-colors">Explore</button>
          <span className="text-gold/40">/</span>
          <span className="text-charcoal">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* ── Image Gallery ── */}
          <div>
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-ivory-dark mb-4">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500"
              />
              {product.badge && (
                <div className="absolute top-4 left-4 bg-charcoal/80 text-gold text-xs font-medium tracking-widest uppercase px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {product.badge}
                </div>
              )}
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all duration-300 ${
                  wishlisted ? 'bg-burgundy border-burgundy text-ivory' : 'bg-ivory/80 border-gold/30 text-warm-gray hover:text-burgundy'
                }`}
              >
                <svg className="w-5 h-5" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            {/* Thumbnails */}
            <div className="flex gap-3">
              {images.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === i ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ── Product Info ── */}
          <div>
            {/* Brand + verification */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-gold uppercase tracking-widest font-medium">{product.brand}</span>
              <div className="flex items-center gap-1.5 bg-emerald/10 text-emerald text-[10px] px-2.5 py-1 rounded-full tracking-wide font-medium">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" />
                </svg>
                Authentic · Verified
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl text-charcoal mb-2" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              {product.name}
            </h1>

            <p className="text-warm-gray text-sm mb-4">By <button onClick={() => onNavigate('manufacturer-profile', { id: product.manufacturerId })} className="text-purple hover:underline">{product.manufacturer}</button> · {product.location}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-gold' : 'text-warm-gray-light'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-charcoal">{product.rating}</span>
              <span className="text-warm-gray text-sm">({product.reviews} verified reviews)</span>
            </div>

            {/* Price */}
            <div className="border-t border-b border-gold/15 py-6 mb-6">
              <p className="text-4xl font-bold text-purple mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                {formatPrice(product.price)}
              </p>
              <p className="text-xs text-warm-gray">Inclusive of all taxes · Direct from maker price</p>
              {product.price > 50000 && (
                <p className="text-xs text-peacock mt-1">
                  EMI from ₹{Math.round(product.price / 12).toLocaleString('en-IN')}/month (0% interest, 12 months)
                </p>
              )}
            </div>

            {/* Quick details */}
            <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
              {[
                { label: 'Material', value: product.material },
                { label: 'Motif', value: product.motif },
                { label: 'Colour', value: product.color },
                { label: 'Origin', value: product.location },
              ].map((d) => (
                <div key={d.label} className="bg-ivory-dark rounded-lg px-4 py-3">
                  <p className="text-[10px] text-warm-gray uppercase tracking-widest mb-0.5">{d.label}</p>
                  <p className="text-charcoal text-xs font-medium">{d.value}</p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="space-y-3 mb-8">
              <button
                onClick={() => { onAddToCart(); onNavigate('checkout'); }}
                className="w-full bg-purple text-ivory py-4 rounded-lg font-semibold tracking-wide hover:bg-purple-mid transition-all duration-300 shadow-lg hover:shadow-purple/30 hover:shadow-xl"
              >
                Buy Now
              </button>
              <button
                onClick={onAddToCart}
                className="w-full border-2 border-purple text-purple py-4 rounded-lg font-semibold tracking-wide hover:bg-purple/5 transition-all duration-300"
              >
                Add to Cart
              </button>
              <button
                onClick={() => onNavigate('chat', { manufacturerId: product.manufacturerId })}
                className="w-full border border-gold/30 text-charcoal py-3.5 rounded-lg text-sm hover:bg-gold/10 hover:border-gold/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Chat with Manufacturer
              </button>
            </div>

            {/* Trust signals */}
            <div className="bg-ivory-dark rounded-xl p-4 grid grid-cols-3 gap-3 text-center text-xs text-warm-gray">
              {[
                { icon: '🔒', text: 'Secure Payment' },
                { icon: '📦', text: '7-Day Returns' },
                { icon: '✦', text: 'Authenticity Cert.' },
              ].map((t) => (
                <div key={t.text} className="flex flex-col items-center gap-1">
                  <span className="text-lg">{t.icon}</span>
                  <span>{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-16">
          <div className="flex gap-1 border-b border-gold/15 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm transition-all duration-200 relative ${
                  activeTab === tab ? 'text-purple font-medium' : 'text-warm-gray hover:text-charcoal'
                }`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />}
              </button>
            ))}
          </div>

          {activeTab === 'Details' && (
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl text-charcoal mb-4" style={{ fontFamily: 'var(--font-display)' }}>Saree Specifications</h3>
                <div className="space-y-3">
                  {[
                    ['Material', product.material],
                    ['Motif Pattern', product.motif],
                    ['Colour Family', product.color],
                    ['Weaving Technique', 'Traditional pit loom (handwoven)'],
                    ['Saree Length', '5.5 metres + 0.8m blouse piece'],
                    ['Width', '48 inches (122 cm)'],
                    ['Weight', '650–800 grams'],
                    ['Manufacturing', product.location + ', Maharashtra'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-4 py-2.5 border-b border-gold/10 text-sm">
                      <span className="text-warm-gray w-40 flex-shrink-0">{k}</span>
                      <span className="text-charcoal font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl text-charcoal mb-4" style={{ fontFamily: 'var(--font-display)' }}>Care Instructions</h3>
                <div className="space-y-3 text-sm text-warm-gray">
                  {[
                    'Dry clean only — do not machine wash.',
                    'Store in a cool, dry place away from direct sunlight.',
                    'Fold with the right side inward; store with muslin cloth.',
                    'Air every 6 months to maintain the zari lustre.',
                    'Use padded hangers; never use clips on the silk.',
                  ].map((c, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-gold flex-shrink-0">✦</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Authenticity' && (
            <div className="max-w-2xl">
              <div className="border border-gold/30 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 paithani-pattern opacity-30" />
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>Authenticity Certificate</h3>
                    <p className="text-xs text-emerald">Certificate ID: PR-2024-{product.id.toUpperCase()}-AUTH</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm mb-6">
                  {[
                    ['Certificate ID', `PR-2024-${product.id.toUpperCase()}-AUTH`],
                    ['Manufacturer', product.manufacturer],
                    ['Location', product.location + ', Maharashtra'],
                    ['Material Verified', product.material],
                    ['Motif Verified', product.motif],
                    ['Verification Status', 'Authenticated by Paithani Royale'],
                    ['GI Compliance', 'Compliant (GI Tag: Paithani)'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-4 py-2 border-b border-gold/10">
                      <span className="text-warm-gray w-44 flex-shrink-0 text-xs">{k}</span>
                      <span className="text-charcoal text-xs font-medium">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald bg-emerald/10 rounded-lg px-4 py-3">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  This certificate will be included in your shipment and is verifiable on our platform.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Reviews' && (
            <div>
              <div className="flex items-center gap-8 mb-10">
                <div className="text-center">
                  <p className="text-6xl font-bold text-purple" style={{ fontFamily: 'var(--font-display)' }}>{product.rating}</p>
                  <div className="flex justify-center my-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-warm-gray text-sm">{product.reviews} reviews</p>
                </div>
              </div>
              <div className="space-y-6">
                {reviews.map((r, i) => (
                  <div key={i} className="border-b border-gold/10 pb-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-charcoal text-sm">{r.name}</p>
                          {r.verified && (
                            <span className="text-[10px] text-emerald bg-emerald/10 px-2 py-0.5 rounded-full">Verified Purchase</span>
                          )}
                        </div>
                        <p className="text-xs text-warm-gray">{r.location} · {r.date}</p>
                      </div>
                      <div className="flex">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <svg key={i} className="w-3.5 h-3.5 text-gold" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-warm-gray text-sm leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Shipping' && (
            <div className="max-w-xl space-y-6 text-sm">
              {[
                { title: 'Estimated Delivery', desc: '7–12 business days (pan India) after quality check by manufacturer.' },
                { title: 'Packaging', desc: 'Luxury gift box with authenticity certificate, care card, and tissue wrapping.' },
                { title: 'Insured Shipping', desc: 'All orders are fully insured during transit.' },
                { title: 'Returns Policy', desc: '7-day return window for unworn sarees in original packaging.' },
                { title: 'International Shipping', desc: 'Available to US, UK, UAE, Australia, and Singapore. Duties may apply.' },
              ].map((s) => (
                <div key={s.title} className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-charcoal mb-1">{s.title}</p>
                    <p className="text-warm-gray">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related products */}
        <div className="mt-16">
          <h3 className="text-2xl text-charcoal mb-8" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            You May Also Like
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {products.filter((p) => p.id !== productId).slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} onViewDetail={(id) => onNavigate('product', { id })} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
