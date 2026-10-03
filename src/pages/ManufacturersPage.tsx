import { useState } from 'react';
import { manufacturers } from '../data';
import type { Page } from '../types';

interface ManufacturersPageProps {
  onNavigate: (page: Page, extra?: Record<string, string>) => void;
}

export default function ManufacturersPage({ onNavigate }: ManufacturersPageProps) {
  const [followed, setFollowed] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('Rating');

  const sorted = [...manufacturers].sort((a, b) => {
    if (sortBy === 'Rating') return b.rating - a.rating;
    if (sortBy === 'Experience') return b.years - a.years;
    if (sortBy === 'Products') return b.products - a.products;
    return b.followers - a.followers;
  });

  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero */}
      <div className="relative bg-charcoal overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1569909115134-a0426936c879?w=1400&h=400&fit=crop&auto=format"
          alt="Paithani textiles"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 paithani-pattern opacity-15" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <p className="text-xs text-gold uppercase tracking-widest mb-3">Discover. Connect. Buy Directly.</p>
          <h1 className="text-5xl text-ivory mb-4" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            Meet the Makers
          </h1>
          <p className="text-ivory/60 max-w-xl mx-auto text-sm">
            Every manufacturer on Paithani Royale is individually verified for authenticity, craftsmanship, and GI compliance.
          </p>
          <div className="flex items-center justify-center gap-8 mt-8 text-xs text-ivory/50">
            <span><span className="text-gold font-semibold">40+</span> Verified Makers</span>
            <span className="text-gold/30">|</span>
            <span><span className="text-gold font-semibold">500+</span> Sarees</span>
            <span className="text-gold/30">|</span>
            <span><span className="text-gold font-semibold">6</span> Districts</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Sort bar */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <p className="text-charcoal text-sm font-medium">{manufacturers.length} Verified Manufacturers</p>
          <div className="flex items-center gap-3">
            <label className="text-sm text-warm-gray">Sort by:</label>
            <div className="flex gap-2">
              {['Rating', 'Experience', 'Products', 'Followers'].map((o) => (
                <button
                  key={o}
                  onClick={() => setSortBy(o)}
                  className={`text-xs px-4 py-2 rounded-full border transition-all duration-200 ${
                    sortBy === o ? 'bg-purple text-ivory border-purple' : 'border-gold/25 text-warm-gray hover:border-gold/50'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Manufacturer cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl overflow-hidden border border-gold/15 hover:border-gold/40 hover:shadow-2xl transition-all duration-400 group"
            >
              {/* Cover */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={m.cover}
                  alt={m.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
                {m.verified && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald/90 text-ivory text-[10px] px-2.5 py-1 rounded-full backdrop-blur-sm tracking-wide">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" />
                    </svg>
                    Verified Manufacturer
                  </div>
                )}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
                  <span className="text-xs text-ivory/80">Active</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-charcoal text-lg leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                      {m.name}
                    </h3>
                    <p className="text-xs text-warm-gray mt-0.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                        <path d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                      </svg>
                      {m.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-sm font-semibold text-charcoal">{m.rating}</span>
                    </div>
                    <p className="text-xs text-warm-gray">({m.reviews} reviews)</p>
                  </div>
                </div>

                <p className="text-xs text-warm-gray leading-relaxed mb-4 line-clamp-2">{m.about}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 py-4 border-t border-b border-gold/10 mb-4">
                  {[
                    { val: `${m.years}y`, label: 'Experience' },
                    { val: m.products, label: 'Sarees' },
                    { val: `${(m.followers / 1000).toFixed(1)}K`, label: 'Followers' },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="font-semibold text-charcoal text-sm" style={{ fontFamily: 'var(--font-display)' }}>{s.val}</p>
                      <p className="text-xs text-warm-gray">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-4 text-xs text-warm-gray">
                  <span>Response: <span className="text-emerald font-medium">{m.responseTime}</span></span>
                  <span>{m.priceRange}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onNavigate('manufacturer-profile', { id: m.id })}
                    className="flex-1 bg-purple text-ivory text-xs py-2.5 rounded hover:bg-purple-mid transition-colors tracking-wide"
                  >
                    Visit Brand
                  </button>
                  <button
                    onClick={() => onNavigate('chat', { manufacturerId: m.id })}
                    className="flex-1 border border-gold/25 text-charcoal text-xs py-2.5 rounded hover:bg-gold/10 hover:border-gold/50 transition-colors"
                  >
                    Chat with Maker
                  </button>
                  <button
                    onClick={() => setFollowed((f) => f.includes(m.id) ? f.filter((x) => x !== m.id) : [...f, m.id])}
                    className={`px-3.5 py-2.5 rounded border text-xs transition-all duration-200 ${
                      followed.includes(m.id)
                        ? 'bg-gold/15 border-gold/50 text-gold'
                        : 'border-gold/25 text-warm-gray hover:border-gold/50'
                    }`}
                    title="Follow"
                  >
                    {followed.includes(m.id) ? '★' : '☆'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA for makers */}
        <div className="mt-16 bg-purple rounded-2xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 paithani-pattern opacity-15" />
          <div className="relative">
            <p className="text-xs text-gold uppercase tracking-widest mb-3">Join Paithani Royale</p>
            <h3 className="text-3xl text-ivory mb-3" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              Are You a Paithani Manufacturer?
            </h3>
            <p className="text-ivory/60 max-w-md mx-auto text-sm mb-8">
              Reach thousands of discerning customers across India and the world. List your collection today.
            </p>
            <button
              onClick={() => onNavigate('account')}
              className="bg-gold text-charcoal font-semibold px-10 py-4 rounded hover:bg-gold-light transition-all duration-300"
            >
              Join as a Manufacturer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
