import { useState, useEffect } from 'react';
import type { Page } from '../types';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page, extra?: Record<string, string>) => void;
  cartCount: number;
  wishlistCount: number;
}

const PeacockLogo = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
    <ellipse cx="19" cy="25" rx="5.5" ry="8" fill="#C9A84C" opacity="0.9" />
    <circle cx="19" cy="25" r="2" fill="#3D1A5C" />
    <path d="M19 18 Q21 11 19 7" stroke="#0F5C7A" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="19" cy="6" r="3" fill="#0F5C7A" />
    <path d="M17 3.5 L15.5 1 M19 3 L19 0.5 M21 3.5 L22.5 1" stroke="#C9A84C" strokeWidth="1.3" strokeLinecap="round" />
    {/* Fan feathers */}
    <path d="M19 25 L6 14" stroke="#3D1A5C" strokeWidth="1" strokeOpacity="0.5" />
    <path d="M19 25 L9 11" stroke="#3D1A5C" strokeWidth="1" strokeOpacity="0.5" />
    <path d="M19 25 L14 9" stroke="#3D1A5C" strokeWidth="1" strokeOpacity="0.5" />
    <path d="M19 25 L24 9" stroke="#3D1A5C" strokeWidth="1" strokeOpacity="0.5" />
    <path d="M19 25 L29 11" stroke="#3D1A5C" strokeWidth="1" strokeOpacity="0.5" />
    <path d="M19 25 L32 14" stroke="#3D1A5C" strokeWidth="1" strokeOpacity="0.5" />
    {/* Feather eye spots */}
    <circle cx="6" cy="14" r="1.8" stroke="#C9A84C" strokeWidth="1" fill="none" />
    <circle cx="32" cy="14" r="1.8" stroke="#C9A84C" strokeWidth="1" fill="none" />
    <circle cx="9" cy="11" r="1.5" stroke="#C9A84C" strokeWidth="0.8" fill="none" />
    <circle cx="29" cy="11" r="1.5" stroke="#C9A84C" strokeWidth="0.8" fill="none" />
  </svg>
);

const navLinks: { label: string; page: Page }[] = [
  { label: 'Home', page: 'home' },
  { label: 'Explore Sarees', page: 'explore' },
  { label: 'Manufacturers', page: 'manufacturers' },
  { label: 'Collections', page: 'explore' },
];

export default function Header({ currentPage, onNavigate, cartCount, wishlistCount }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-purple text-ivory text-center py-2 px-4 text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-body)' }}>
        <span className="text-gold mr-2">✦</span>
        Free Authenticity Certificate with Every Purchase · Verified Manufacturers Only
        <span className="text-gold ml-2">✦</span>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-ivory/97 backdrop-blur-md shadow-sm border-b border-gold/20'
            : 'bg-ivory/95 border-b border-gold/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 group"
            >
              <PeacockLogo />
              <div className="leading-tight">
                <div
                  className="text-xl font-bold tracking-wider text-charcoal group-hover:text-purple transition-colors duration-300"
                  style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}
                >
                  PAITHANI
                </div>
                <div
                  className="text-xs tracking-widest text-gold uppercase"
                  style={{ letterSpacing: '0.22em', marginTop: '-2px' }}
                >
                  ROYALE
                </div>
              </div>
            </button>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => onNavigate(link.page)}
                  className={`text-sm tracking-wide transition-colors duration-200 relative group ${
                    currentPage === link.page
                      ? 'text-purple font-medium'
                      : 'text-charcoal hover:text-purple'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${
                      currentPage === link.page ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </button>
              ))}
              <button
                onClick={() => onNavigate('manufacturers')}
                className="text-sm tracking-wide text-charcoal hover:text-purple transition-colors duration-200 relative group"
              >
                Brands
                <span className="absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 w-0 group-hover:w-full" />
              </button>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-warm-gray hover:text-purple transition-colors duration-200 rounded-full hover:bg-purple/5"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                </svg>
              </button>

              {/* Wishlist */}
              <button
                className="p-2 text-warm-gray hover:text-burgundy transition-colors duration-200 rounded-full hover:bg-burgundy/5 relative"
                aria-label="Wishlist"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-burgundy text-ivory text-xs rounded-full flex items-center justify-center font-medium">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => onNavigate('cart')}
                className="p-2 text-warm-gray hover:text-purple transition-colors duration-200 rounded-full hover:bg-purple/5 relative"
                aria-label="Cart"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-purple text-ivory text-xs rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>

              <div className="hidden md:flex items-center gap-2 ml-2">
                <button
                  onClick={() => onNavigate('account')}
                  className="text-sm text-charcoal hover:text-purple transition-colors px-3 py-1.5"
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate('account')}
                  className="text-sm bg-purple text-ivory px-4 py-2 rounded hover:bg-purple-mid transition-all duration-200 tracking-wide border border-purple hover:shadow-md"
                >
                  Create Account
                </button>
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-charcoal"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  {mobileOpen ? (
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <>
                      <line x1="3" y1="7" x2="21" y2="7" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="17" x2="21" y2="17" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden bg-ivory border-t border-gold/20 px-6 py-5 space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => { onNavigate(link.page); setMobileOpen(false); }}
                className="block w-full text-left text-charcoal hover:text-purple py-2 border-b border-gold/10"
              >
                {link.label}
              </button>
            ))}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { onNavigate('account'); setMobileOpen(false); }}
                className="flex-1 text-center py-2.5 border border-purple text-purple rounded text-sm"
              >
                Login
              </button>
              <button
                onClick={() => { onNavigate('account'); setMobileOpen(false); }}
                className="flex-1 text-center py-2.5 bg-purple text-ivory rounded text-sm"
              >
                Create Account
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-charcoal/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <div className="w-full max-w-2xl bg-ivory rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-4 px-6 py-4 border-b border-gold/20">
              <svg className="w-5 h-5 text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sarees, brands, motifs…"
                className="flex-1 bg-transparent text-charcoal placeholder-warm-gray text-lg outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { onNavigate('explore'); setSearchOpen(false); }
                  if (e.key === 'Escape') setSearchOpen(false);
                }}
              />
              <button onClick={() => setSearchOpen(false)} className="text-warm-gray hover:text-charcoal">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              <p className="text-xs text-warm-gray uppercase tracking-widest mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {['Peacock Motif', 'Bridal Paithani', 'Pure Silk', 'Asawali', 'Heritage Weaves', 'Wedding'].map((t) => (
                  <button
                    key={t}
                    onClick={() => { onNavigate('explore'); setSearchOpen(false); }}
                    className="px-3 py-1.5 text-sm border border-gold/30 text-charcoal rounded-full hover:bg-gold/10 hover:border-gold transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
