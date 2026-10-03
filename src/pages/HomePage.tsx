import { useState, useEffect } from 'react';
import { manufacturers, formatPrice } from '../data';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import type { Page } from '../types';

interface HomePageProps {
  onNavigate: (page: Page, extra?: Record<string, string>) => void;
}

const priceCollections = [
  {
    range: '₹25,000 – ₹35,000',
    title: 'Premium Paithani',
    desc: 'Elegant handwoven Paithani sarees for customers seeking authentic craftsmanship.',
    image: 'https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?w=500&h=650&fit=crop&auto=format',
    gradient: 'from-peacock/90 to-peacock/60',
  },
  {
    range: '₹35,000 – ₹50,000',
    title: 'Designer Paithani',
    desc: 'Exclusive designs with premium motifs and rich craftsmanship.',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&h=650&fit=crop&auto=format',
    gradient: 'from-purple/90 to-purple/60',
  },
  {
    range: '₹50,000 – ₹75,000',
    title: 'Royal Paithani',
    desc: 'Luxury handwoven sarees with detailed traditional designs.',
    image: 'https://images.unsplash.com/photo-1664636124899-4a121f1ce449?w=500&h=650&fit=crop&auto=format',
    gradient: 'from-burgundy/90 to-burgundy/60',
  },
  {
    range: '₹75,000 – ₹1,00,000',
    title: 'Heritage Collection',
    desc: 'Rare craftsmanship and premium traditional Paithani designs.',
    image: 'https://images.unsplash.com/photo-1664636126154-7a6ce64edd21?w=500&h=650&fit=crop&auto=format',
    gradient: 'from-emerald/90 to-emerald/60',
  },
  {
    range: '₹1,00,000+',
    title: 'Royal Heirloom',
    desc: 'Extremely exclusive Paithani sarees designed as family heirlooms.',
    image: 'https://images.unsplash.com/photo-1705164454907-a04fe248f675?w=500&h=650&fit=crop&auto=format',
    gradient: 'from-charcoal/90 to-charcoal/60',
    cta: 'Discover Heirlooms',
  },
];

const collections = ['New Arrivals', 'Best Sellers', 'Royal Collection', 'Wedding Collection', 'Bridal Paithani', 'Heritage Collection'];

const trustPoints = [
  { icon: '✓', text: 'Verified Manufacturers', sub: 'Every maker is verified and GI-certified' },
  { icon: '✓', text: 'Authentic Products', sub: 'Real Paithani, never imitation' },
  { icon: '✓', text: 'Direct Maker Connection', sub: 'Chat directly with the artisan' },
  { icon: '✓', text: 'Transparent Pricing', sub: 'No hidden costs, direct-from-maker' },
  { icon: '✓', text: 'Secure Payments', sub: 'PCI-DSS encrypted checkout' },
  { icon: '✓', text: 'Buyer Protection', sub: '30-day guaranteed returns' },
  { icon: '✓', text: 'Verified Reviews', sub: 'Only real purchase reviews' },
  { icon: '✓', text: 'Secure Communication', sub: 'End-to-end encrypted messaging' },
];

const processSteps = [
  { step: 'Silk', icon: '🧵', desc: 'Pure mulberry silk sourced from Raichur' },
  { step: 'Dyeing', icon: '🎨', desc: 'Natural & vegetable dyes, 48-hour process' },
  { step: 'Weaving', icon: '🪡', desc: 'Hand-thrown shuttle on traditional pit loom' },
  { step: 'Motif', icon: '🦚', desc: 'Zari inlay with 22K gold thread' },
  { step: 'Finishing', icon: '✨', desc: 'Soft washing, drying, and pressing' },
  { step: 'Your Saree', icon: '👸', desc: 'Authenticated and shipped to you' },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  const [activeCollection, setActiveCollection] = useState('New Arrivals');
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSarees() {
      const { data } = await supabase.from('product').select('*').limit(8);
      if (data) {
        const formattedProducts = data.map((item: any) => ({
          id: item.id.toString(),
          name: item.title,
          price: Number(item.price),
          image: item.image_url,
          brand: 'Heritage Weaves',
          manufacturer: 'Shri Ramchandra Deshmukh',
          rating: 4.9,
          reviews: 87,
          motif: 'Peacock',
          location: 'Nashik',
          badge: 'Featured'
        }));
        setDbProducts(formattedProducts);
      }
    }
    fetchSarees();
  }, []);

  const filteredProducts = dbProducts.slice(0, 4);

  return (
    <div>
      {/* ─── HERO ─────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1705164454907-a04fe248f675?w=1800&h=1200&fit=crop&auto=format"
            alt="Luxurious Paithani saree"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-charcoal/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
        </div>

        {/* Animated peacock motif pattern */}
        <div className="absolute inset-0 paithani-pattern opacity-30" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-12 items-center">
          <div className="fade-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-gold" />
              <p className="text-gold text-xs tracking-widest uppercase">Paithani Royale</p>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl text-ivory leading-tight mb-6"
              style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
            >
              A Legacy Woven in Every Thread.
            </h1>

            <p className="text-ivory/75 text-lg leading-relaxed mb-10 max-w-lg">
              Discover authentic Paithani sarees directly from verified manufacturers and heritage brands across Maharashtra.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <button
                onClick={() => onNavigate('explore')}
                className="bg-gold text-charcoal font-semibold px-8 py-4 rounded hover:bg-gold-light transition-all duration-300 tracking-wide shadow-lg hover:shadow-gold/30 hover:shadow-xl"
              >
                Explore Collection
              </button>
              <button
                onClick={() => onNavigate('manufacturers')}
                className="border border-ivory/50 text-ivory px-8 py-4 rounded hover:bg-ivory/10 hover:border-ivory transition-all duration-300 tracking-wide backdrop-blur-sm"
              >
                Meet the Makers
              </button>
            </div>

            {/* Trust bar */}
            <div className="flex items-center gap-6 text-xs text-ivory/60 flex-wrap">
              {['100% Authentic', 'Verified Manufacturers', 'Secure Shopping'].map((t, i) => (
                <span key={t} className="flex items-center gap-2">
                  {i > 0 && <span className="text-gold/40">·</span>}
                  <span className="text-gold">✦</span>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Hero side card */}
          <div className="hidden lg:block">
            <div className="bg-ivory/10 backdrop-blur-sm border border-gold/20 rounded-2xl p-6 max-w-xs ml-auto">
              <p className="text-xs text-gold uppercase tracking-widest mb-4">Featured This Season</p>
              <div className="rounded-xl overflow-hidden mb-4 aspect-[3/4]">
                <img
                  src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=540&fit=crop&auto=format"
                  alt="Royal Peacock Paithani"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-ivory text-lg mb-1" style={{ fontFamily: 'var(--font-display)' }}>Royal Peacock Paithani</h3>
              <p className="text-warm-gray-light text-sm mb-3">Heritage Weaves, Nashik</p>
              <div className="flex items-center justify-between">
                <span className="text-gold text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>₹48,500</span>
                <button
                  onClick={() => onNavigate('product', { id: 'p1' })}
                  className="text-xs bg-gold/20 text-gold border border-gold/30 px-3 py-1.5 rounded-full hover:bg-gold/30 transition-colors"
                >
                  View →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ivory/50">
          <p className="text-xs tracking-widest">SCROLL</p>
          <div className="w-px h-12 bg-gradient-to-b from-ivory/50 to-transparent" />
        </div>
      </section>

      {/* ─── STATS BAR ─────────────────────────────── */}
      <section className="bg-purple">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { num: '500+', label: 'Authentic Sarees' },
            { num: '40+', label: 'Verified Manufacturers' },
            { num: '12,000+', label: 'Happy Customers' },
            { num: '72 yrs', label: 'Oldest Brand Partner' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-gold" style={{ fontFamily: 'var(--font-display)' }}>{s.num}</p>
              <p className="text-ivory/60 text-xs mt-1 tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRICE COLLECTIONS ─────────────────────── */}
      <section className="py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs text-gold uppercase tracking-widest mb-3">Shop by Budget</p>
            <h2 className="text-4xl text-charcoal" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              Find Your Perfect Paithani
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {priceCollections.map((col, i) => (
              <div
                key={i}
                className="group relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                onClick={() => onNavigate('explore')}
              >
                <div className="aspect-[3/4] relative">
                  <img
                    src={col.image}
                    alt={col.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${col.gradient} opacity-80 group-hover:opacity-90 transition-opacity`} />
                  <div className="absolute inset-0 p-5 flex flex-col justify-end">
                    <p className="text-gold text-[10px] font-medium tracking-widest uppercase mb-1">{col.range}</p>
                    <h3 className="text-ivory text-lg leading-snug mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                      {col.title}
                    </h3>
                    <p className="text-ivory/70 text-xs leading-relaxed mb-4 hidden group-hover:block transition-all">
                      {col.desc}
                    </p>
                    <button className="self-start text-xs border border-gold/60 text-gold px-4 py-2 rounded-full hover:bg-gold/20 transition-colors tracking-wide">
                      {col.cta || 'Explore Collection'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED COLLECTIONS ──────────────────── */}
      <section className="py-24 bg-ivory-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs text-gold uppercase tracking-widest mb-3">Curated for You</p>
            <h2 className="text-4xl text-charcoal" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              Featured Collections
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mt-4" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-10 justify-start md:justify-center">
            {collections.map((col) => (
              <button
                key={col}
                onClick={() => setActiveCollection(col)}
                className={`px-5 py-2.5 rounded-full text-sm whitespace-nowrap transition-all duration-200 ${
                  activeCollection === col
                    ? 'bg-purple text-ivory shadow-md'
                    : 'text-charcoal hover:bg-ivory border border-gold/20 hover:border-gold/40'
                }`}
              >
                {col}
              </button>
            ))}
          </div>

          {/* Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetail={(id) => onNavigate('product', { id })}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate('explore')}
              className="border border-purple text-purple px-10 py-3.5 rounded hover:bg-purple hover:text-ivory transition-all duration-300 tracking-wide text-sm"
            >
              View All Collections
            </button>
          </div>
        </div>
      </section>

      {/* ─── WHY TRUST ─────────────────────────────── */}
      <section className="py-24 bg-charcoal paithani-pattern">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs text-gold uppercase tracking-widest mb-3">Our Promise</p>
            <h2 className="text-4xl text-ivory" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              Why Trust Paithani Royale?
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trustPoints.map((pt, i) => (
              <div
                key={i}
                className="bg-ivory/5 border border-gold/15 rounded-xl p-6 hover:bg-ivory/10 hover:border-gold/35 transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-sm font-bold mb-4 group-hover:bg-gold/20 transition-colors">
                  {pt.icon}
                </div>
                <h4 className="text-ivory text-sm font-semibold mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                  {pt.text}
                </h4>
                <p className="text-warm-gray text-xs leading-relaxed">{pt.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MEET THE MAKERS (preview) ─────────────── */}
      <section className="py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="text-xs text-gold uppercase tracking-widest mb-3">Direct From the Source</p>
              <h2 className="text-4xl text-charcoal" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                Meet the Makers
              </h2>
              <div className="w-16 h-px bg-gold mt-4" />
            </div>
            <button
              onClick={() => onNavigate('manufacturers')}
              className="text-sm text-purple border border-purple/30 px-6 py-2.5 rounded hover:bg-purple hover:text-ivory transition-all duration-300"
            >
              View All Manufacturers →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {manufacturers.slice(0, 3).map((m) => (
              <div
                key={m.id}
                className="group bg-white rounded-2xl overflow-hidden border border-gold/15 hover:border-gold/40 hover:shadow-xl transition-all duration-400 cursor-pointer"
                onClick={() => onNavigate('manufacturer-profile', { id: m.id })}
              >
                <div className="relative h-36 overflow-hidden">
                  <img src={m.cover} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald" />
                      <span className="text-xs text-ivory/80">Online</span>
                    </div>
                  </div>
                  {m.verified && (
                    <div className="absolute top-3 right-3 bg-emerald/90 text-ivory text-[10px] px-2 py-0.5 rounded-full tracking-wide backdrop-blur-sm">
                      ✓ Verified
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>{m.name}</h3>
                      <p className="text-xs text-warm-gray mt-0.5">{m.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold font-semibold text-sm">{m.rating}</p>
                      <div className="flex justify-end">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg key={i} className={`w-2.5 h-2.5 ${i < Math.floor(m.rating) ? 'text-gold' : 'text-warm-gray-light'}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 text-xs text-warm-gray mb-4 border-t border-gold/10 pt-3">
                    <div>
                      <span className="text-charcoal font-semibold">{m.years}</span> yrs
                    </div>
                    <div>
                      <span className="text-charcoal font-semibold">{m.products}</span> sarees
                    </div>
                    <div>
                      <span className="text-charcoal font-semibold">{(m.followers / 1000).toFixed(1)}K</span> followers
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="flex-1 text-xs bg-purple text-ivory py-2 rounded hover:bg-purple-mid transition-colors"
                      onClick={(e) => { e.stopPropagation(); onNavigate('manufacturer-profile', { id: m.id }); }}
                    >
                      Visit Brand
                    </button>
                    <button
                      className="flex-1 text-xs border border-gold/30 text-charcoal py-2 rounded hover:bg-gold/10 transition-colors"
                      onClick={(e) => { e.stopPropagation(); onNavigate('chat', { manufacturerId: m.id }); }}
                    >
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE MAKING OF A PAITHANI ──────────────── */}
      <section className="py-24 bg-purple text-ivory">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs text-gold uppercase tracking-widest mb-3">The Art</p>
            <h2 className="text-4xl" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
              The Making of a Paithani
            </h2>
            <p className="text-ivory/60 mt-3 max-w-lg mx-auto text-sm">
              From raw silk to a treasured heirloom — a journey that takes months of masterful craftsmanship.
            </p>
            <div className="w-16 h-px bg-gold mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {processSteps.map((step, i) => (
              <div key={i} className="text-center group">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full bg-ivory/10 border border-gold/20 flex items-center justify-center text-2xl mx-auto group-hover:bg-gold/20 group-hover:border-gold/60 transition-all duration-300">
                    {step.icon}
                  </div>
                  {i < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-32px)] h-px bg-gold/20" />
                  )}
                </div>
                <p className="text-gold text-xs uppercase tracking-widest mb-1">{step.step}</p>
                <p className="text-ivory/60 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ARTISAN STORY ─────────────────────────── */}
      <section className="py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1707978932202-751b08324daf?w=800&h=1000&fit=crop&auto=format"
                  alt="Paithani weaving loom"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-gold/10 border border-gold/30 rounded-xl p-5 backdrop-blur-sm max-w-xs">
                <p className="text-xs text-gold uppercase tracking-widest mb-2">Did You Know?</p>
                <p className="text-charcoal text-sm leading-relaxed">
                  A single Paithani saree can take <span className="font-semibold text-purple">3 to 18 months</span> to weave, depending on its complexity.
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gold uppercase tracking-widest mb-4">Heritage & Craft</p>
              <h2 className="text-4xl md:text-5xl text-charcoal leading-tight mb-6" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                The Art of Paithani
              </h2>
              <div className="w-16 h-px bg-gold mb-6" />
              <p className="text-warm-gray leading-relaxed mb-5 text-sm">
                Paithani is one of India's most ancient textile traditions, named after the town of Paithan on the banks of the Godavari. The weave dates back to 200 BCE, when the Satavahana dynasty patronised the craft.
              </p>
              <p className="text-warm-gray leading-relaxed mb-5 text-sm">
                Each saree is woven on a traditional pit loom, with silk warp threads interlaced with pure silk and zari (real gold and silver) weft threads. The iconic motifs — peacock, parrot, vine, and lotus — are woven directly into the fabric using the tapestry technique.
              </p>
              <p className="text-warm-gray leading-relaxed mb-8 text-sm">
                A Paithani's value lies in its weight of zari, the fineness of silk, and the intricacy of its border and pallu designs. Paithani Royale connects you directly with the weavers who carry this tradition forward.
              </p>
              <button
                onClick={() => onNavigate('manufacturers')}
                className="text-sm border border-charcoal text-charcoal px-8 py-3.5 rounded hover:bg-charcoal hover:text-ivory transition-all duration-300 tracking-wide"
              >
                Meet Our Artisans
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRIVILEGE MEMBERSHIP ─────────────────── */}
      <section className="py-24 bg-ivory-dark">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-purple via-purple-mid to-peacock rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 paithani-pattern opacity-20" />
            <div className="relative">
              <p className="text-gold text-xs uppercase tracking-widest mb-4">Exclusive Access</p>
              <h2 className="text-4xl text-ivory mb-4" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                Paithani Royale Privilege
              </h2>
              <p className="text-ivory/70 max-w-xl mx-auto text-sm leading-relaxed mb-8">
                Join our exclusive membership for early access to rare collections, private manufacturer interactions, and personalised recommendations from master weavers.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-10 text-sm text-ivory/80">
                {['Early Collection Access', 'Private Artisan Events', 'Priority Support', 'Limited Heirlooms'].map((b) => (
                  <div key={b} className="flex items-center gap-2">
                    <span className="text-gold">✦</span> {b}
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate('account')}
                className="bg-gold text-charcoal font-semibold px-10 py-4 rounded hover:bg-gold-light transition-all duration-300 tracking-wide shadow-lg"
              >
                Join the Royal Circle
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}