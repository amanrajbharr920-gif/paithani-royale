import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useState } from 'react';
import type { Page } from './types';
import Header from './components/Header';
import BackendBanner from './components/BackendBanner';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ManufacturersPage from './pages/ManufacturersPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ManufacturerProfilePage from './pages/ManufacturerProfilePage';
import ChatPage from './pages/ChatPage';
import CustomerDashboard from './pages/CustomerDashboard';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CartPage from './pages/CartPage';
import AccountPage from './pages/AccountPage';
import ComparePage from './pages/ComparePage';

interface NavState {
  page: Page;
  params: Record<string, string>;
}

const noFooterPages: Page[] = ['chat'];
const noMobileNavPages: Page[] = ['chat', 'account'];

export default function App() {
  const [nav, setNav] = useState<NavState>({ page: 'home', params: {} });
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount] = useState(2);
useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('product')
        .select('*');
      
      if (error) {
        console.error('Database Error:', error);
      } else {
        console.log('My Supabase Data:', data);
      }
    }
    
    fetchProducts();
  }, []);
  const onNavigate = (page: Page, extra: Record<string, string> = {}) => {
    setNav({ page, params: extra });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onAddToCart = () => setCartCount((c) => c + 1);

  const showFooter = !noFooterPages.includes(nav.page);
  const showMobileNav = !noMobileNavPages.includes(nav.page);

  const renderPage = () => {
    switch (nav.page) {
      case 'home':
        return <HomePage onNavigate={onNavigate} />;
      case 'explore':
        return <ExplorePage onNavigate={onNavigate} />;
      case 'manufacturers':
        return <ManufacturersPage onNavigate={onNavigate} />;
      case 'product':
        return (
          <ProductDetailPage
            productId={nav.params.id ?? 'p1'}
            onNavigate={onNavigate}
            onAddToCart={onAddToCart}
          />
        );
      case 'manufacturer-profile':
        return (
          <ManufacturerProfilePage
            manufacturerId={nav.params.id ?? 'm1'}
            onNavigate={onNavigate}
          />
        );
      case 'chat':
        return (
          <ChatPage
            manufacturerId={nav.params.manufacturerId ?? 'm1'}
            onNavigate={onNavigate}
          />
        );
      case 'dashboard':
        return <CustomerDashboard onNavigate={onNavigate} />;
      case 'cart':
      case 'checkout':
        return <CartPage onNavigate={onNavigate} />;
      case 'account':
        return <AccountPage onNavigate={onNavigate} />;
      case 'admin':
        return <AdminDashboard onNavigate={onNavigate} />;
      default:
        return <HomePage onNavigate={onNavigate} />;
    }
  };

  /* Demo: hidden nav links for pages not in the header
     Access via URL hash or the demo strip below */
  const demoPages: { label: string; page: Page; params?: Record<string, string> }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Explore', page: 'explore' },
    { label: 'Manufacturers', page: 'manufacturers' },
    { label: 'Product Detail', page: 'product', params: { id: 'p1' } },
    { label: 'Brand Profile', page: 'manufacturer-profile', params: { id: 'm1' } },
    { label: 'Chat', page: 'chat', params: { manufacturerId: 'm1' } },
    { label: 'Customer Dashboard', page: 'dashboard' },
    { label: 'Manufacturer Dashboard', page: 'admin' },
    { label: 'Cart & Checkout', page: 'cart' },
    { label: 'Create Account', page: 'account' },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Demo nav strip */}
      <div className="bg-gold/10 border-b border-gold/20 overflow-x-auto">
        <div className="flex items-center gap-1 px-3 py-1.5 min-w-max">
          <span className="text-[9px] text-warm-gray uppercase tracking-widest mr-2 flex-shrink-0">Demo:</span>
          {demoPages.map((d) => (
            <button
              key={d.label}
              onClick={() => onNavigate(d.page, d.params)}
              className={`text-[10px] px-2.5 py-1 rounded whitespace-nowrap transition-colors ${
                nav.page === d.page
                  ? 'bg-purple text-ivory'
                  : 'text-charcoal hover:bg-ivory-dark'
              }`}
            >
              {d.label}
            </button>
          ))}

          {/* Extra demo buttons */}
          <button
            onClick={() => setNav({ page: 'maker-dash' as Page, params: {} })}
            className="text-[10px] px-2.5 py-1 rounded text-charcoal hover:bg-ivory-dark whitespace-nowrap"
          >
            Mfr. Dashboard ↗
          </button>
          <button
            onClick={() => setNav({ page: 'admin', params: {} })}
            className={`text-[10px] px-2.5 py-1 rounded whitespace-nowrap transition-colors ${nav.page === 'admin' ? 'bg-charcoal text-ivory' : 'text-charcoal hover:bg-ivory-dark'}`}
          >
            Admin Panel
          </button>
          <button
            onClick={() => setNav({ page: 'compare' as Page, params: {} })}
            className={`text-[10px] px-2.5 py-1 rounded whitespace-nowrap transition-colors ${nav.page === 'compare' ? 'bg-purple text-ivory' : 'text-charcoal hover:bg-ivory-dark'}`}
          >
            Compare Sarees
          </button>
        </div>
      </div>

      <BackendBanner />

      <Header
        currentPage={nav.page}
        onNavigate={onNavigate}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
      />

      <main className={`flex-1 ${showMobileNav ? 'pb-16 md:pb-0' : ''}`}>
        {nav.page === ('compare' as Page) ? (
          <ComparePage onNavigate={onNavigate} />
        ) : nav.page === ('maker-dash' as Page) ? (
          <ManufacturerDashboard onNavigate={onNavigate} />
        ) : (
          renderPage()
        )}
      </main>

      {showFooter && <Footer onNavigate={onNavigate} />}

      {showMobileNav && (
        <MobileNav currentPage={nav.page} onNavigate={onNavigate} cartCount={cartCount} />
      )}
    </div>
  );
}
