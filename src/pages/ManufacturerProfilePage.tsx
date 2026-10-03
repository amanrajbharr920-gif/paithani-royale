import { useState } from 'react';
import { manufacturers, products } from '../data';
import ProductCard from '../components/ProductCard';
import type { Page } from '../types';

interface ManufacturerProfilePageProps {
  manufacturerId: string;
  onNavigate: (page: Page, extra?: Record<string, string>) => void;
}

export default function ManufacturerProfilePage({ manufacturerId, onNavigate }: ManufacturerProfilePageProps) {
  const m = manufacturers.find((x) => x.id === manufacturerId) ?? manufacturers[0];
  const mProducts = products.filter((p) => p.manufacturerId === m.id);
  const allProducts = mProducts.length > 0 ? mProducts : products.slice(0, 3);
  const [followed, setFollowed] = useState(false);

  return (
    <div className="min-h-screen bg-ivory">
      {/* Cover image */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src={m.cover} alt={m.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent" />

        {m.verified && (
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-emerald/90 text-ivory text-xs px-4 py-2 rounded-full backdrop-blur-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" />
            </svg>
            ✓ Verified Manufacturer
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        {/* Profile header card */}
        <div className="bg-ivory rounded-2xl border border-gold/20 shadow-xl p-6 md:p-8 mb-10">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-gold/30 flex-shrink-0 shadow-lg">
              <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1">
              <div className="flex items-start gap-3 flex-wrap">
                <div>
                  <h1 className="text-3xl text-charcoal" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                    {m.name}
                  </h1>
                  <p className="text-warm-gray text-sm mt-0.5">{m.ownerName} · {m.location}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-5 mt-4 text-sm">
                <div className="flex items-center gap-1.5 text-warm-gray">
                  <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="font-semibold text-charcoal">{m.rating}</span> ({m.reviews} reviews)
                </div>
                <div className="text-warm-gray">{m.years} years of craftsmanship</div>
                <div className="text-warm-gray">{m.products} sarees</div>
                <div className="text-warm-gray">{(m.followers / 1000).toFixed(1)}K followers</div>
                <div className="text-warm-gray">Response: <span className="text-emerald font-medium">{m.responseTime}</span></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={() => onNavigate('chat', { manufacturerId: m.id })}
                className="bg-purple text-ivory px-6 py-3 rounded-lg text-sm font-medium hover:bg-purple-mid transition-colors tracking-wide flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Chat
              </button>
              <button
                onClick={() => setFollowed(!followed)}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  followed ? 'bg-gold/15 border-gold text-gold-dark' : 'border-gold/30 text-charcoal hover:border-gold/60 hover:bg-gold/10'
                }`}
              >
                {followed ? '★ Following' : '☆ Follow Brand'}
              </button>
            </div>
          </div>
        </div>

        {/* About + Stats */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border border-gold/15 p-8">
              <h2 className="text-2xl text-charcoal mb-4" style={{ fontFamily: 'var(--font-display)' }}>About {m.name}</h2>
              <p className="text-warm-gray leading-relaxed mb-4 text-sm">{m.about}</p>
              <p className="text-warm-gray leading-relaxed text-sm">
                Specialising in <strong className="text-charcoal">{m.speciality}</strong>, each saree is individually handwoven using traditional pit looms and real silk imported from Raichur and Bengaluru. All zari work is done with certified gold and silver threads.
              </p>
            </div>

            {/* Our Craft */}
            <div className="bg-white rounded-2xl border border-gold/15 p-8">
              <h2 className="text-2xl text-charcoal mb-6" style={{ fontFamily: 'var(--font-display)' }}>Our Craft</h2>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { icon: '🪡', title: 'Pit Loom Weaving', desc: 'Traditional handloom using wooden pit looms, preserving the original Paithani technique.' },
                  { icon: '🧵', title: 'Real Silk', desc: 'Only pure mulberry silk from certified farms. No synthetic blends.' },
                  { icon: '✨', title: 'Zari Work', desc: 'Real gold & silver zari thread, certified by the Bureau of Indian Standards.' },
                ].map((c) => (
                  <div key={c.title} className="text-center">
                    <div className="text-3xl mb-3">{c.icon}</div>
                    <h4 className="font-semibold text-charcoal text-sm mb-2">{c.title}</h4>
                    <p className="text-warm-gray text-xs leading-relaxed">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gold/15 p-6">
              <h3 className="text-sm font-semibold text-charcoal mb-4 uppercase tracking-widest">Brand Details</h3>
              <div className="space-y-4">
                {[
                  { label: 'Founded', value: `${new Date().getFullYear() - m.years}` },
                  { label: 'Location', value: m.location },
                  { label: 'Price Range', value: m.priceRange },
                  { label: 'Speciality', value: m.speciality },
                  { label: 'Response Time', value: m.responseTime },
                  { label: 'Verification', value: 'GI Certified ✓' },
                ].map((d) => (
                  <div key={d.label} className="flex justify-between text-sm border-b border-gold/8 pb-3">
                    <span className="text-warm-gray">{d.label}</span>
                    <span className="text-charcoal font-medium text-right max-w-[55%]">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-purple rounded-2xl p-6 text-center">
              <p className="text-gold text-xs uppercase tracking-widest mb-2">Direct Contact</p>
              <p className="text-ivory text-sm mb-4 leading-relaxed">
                Ask about customisation, availability, or pricing directly.
              </p>
              <button
                onClick={() => onNavigate('chat', { manufacturerId: m.id })}
                className="w-full bg-gold text-charcoal py-3 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors"
              >
                Start Conversation
              </button>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="mb-16">
          <h2 className="text-3xl text-charcoal mb-8" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            Collection by {m.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allProducts.map((p) => (
              <ProductCard key={p.id} product={p} onViewDetail={(id) => onNavigate('product', { id })} />
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-16 bg-white rounded-2xl border border-gold/15 p-8">
          <h2 className="text-2xl text-charcoal mb-8" style={{ fontFamily: 'var(--font-display)' }}>Customer Reviews</h2>
          <div className="space-y-6">
            {[
              { name: 'Meenakshi Rao', loc: 'Chennai', rating: 5, comment: 'Absolute perfection. I have bought from three different Paithani sellers over the years and this is by far the most authentic quality I\'ve experienced.' },
              { name: 'Sunita Patil', loc: 'Nashik', rating: 5, comment: 'The manufacturer was incredibly helpful in customising the blouse piece colour. The saree arrived beautifully packaged with a real authenticity certificate.' },
              { name: 'Kalyani Desai', loc: 'Hyderabad', rating: 4, comment: 'Excellent quality saree. The zari weight is impressive and the motifs are sharp and clear. Would highly recommend.' },
            ].map((r, i) => (
              <div key={i} className="border-b border-gold/10 pb-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-charcoal text-sm">{r.name}</p>
                    <p className="text-xs text-warm-gray">{r.loc} · Verified Buyer</p>
                  </div>
                  <div className="flex">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 text-gold" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-warm-gray text-sm leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
