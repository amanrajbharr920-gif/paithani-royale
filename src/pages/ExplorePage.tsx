import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import type { Page, Product } from '../types';

interface ExplorePageProps {
  onNavigate: (page: Page, extra?: Record<string, string>) => void;
}

const priceFilters = ['₹25K – ₹35K', '₹35K – ₹50K', '₹50K – ₹75K', '₹75K – ₹1L', '₹1L+'];
const colorFilters = ['Purple', 'Green', 'Blue', 'Red', 'Gold', 'Black', 'Ivory'];
const motifFilters = ['Peacock', 'Munia', 'Asawali', 'Bangadi-Mor', 'Triveni', 'Kalicharan'];
const sortOptions = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Rating', 'Newest'];

export default function ExplorePage({ onNavigate }: ExplorePageProps) {
  // 1. New state to hold your live Supabase data instead of the dummy file
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMotifs, setSelectedMotifs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('Featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 2. Fetch data from Supabase when the page loads
  useEffect(() => {
    async function fetchSarees() {
      const { data, error } = await supabase.from('product').select('*');
      if (data) {
        // 3. Map your database fields to Figma's expected fields
       const formattedProducts = data.map((item: any) => ({
          id: item.id.toString(),
          name: item.title,
          price: Number(item.price),
          image: item.image_url,
          // Fulfilling all required fields for the ProductCard component
          brand: 'Heritage Weaves',
          manufacturer: 'Shri Ramchandra Deshmukh',
          manufacturerId: 'm1',
          rating: 4.9,
          reviews: 87,
          material: 'Pure Mulberry Silk',
          motif: 'Peacock',
          color: 'Purple',
          location: 'Nashik',
          badge: 'New Arrival',
          collection: 'Royal Collection'
        }));
        setProducts(formattedProducts as Product[]);
      }
    }
    fetchSarees();
  }, []);

  const toggleFilter = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const filtered = products.filter((p) => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.brand.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedMotifs.length > 0 && !selectedMotifs.some((m) => p.motif.toLowerCase().includes(m.toLowerCase()))) return false;
    if (selectedColors.length > 0 && !selectedColors.some((c) => p.color.toLowerCase().includes(c.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-ivory">
      {/* Page header */}
      <div className="bg-charcoal text-ivory py-16 px-6 paithani-pattern">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-gold uppercase tracking-widest mb-3">Discover</p>
          <h1 className="text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            Explore Sarees
          </h1>
          <p className="text-ivory/60 mt-3 text-sm">{products.length} authentic Paithani sarees from verified makers</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 text-sm text-charcoal border border-gold/25 px-4 py-2.5 rounded hover:border-gold/50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="12" x2="9" y2="12" />
                <line x1="21" y1="18" x2="15" y2="18" />
              </svg>
              Filters
            </button>

            {/* Search */}
            <div className="flex items-center gap-2 border border-gold/25 px-4 py-2.5 rounded hover:border-gold/50 transition-colors">
              <svg className="w-4 h-4 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sarees, brands…"
                className="bg-transparent text-sm text-charcoal placeholder-warm-gray outline-none w-48"
              />
            </div>

            <p className="text-warm-gray text-sm">{filtered.length} results</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-warm-gray">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gold/25 px-3 py-2.5 rounded bg-ivory text-charcoal outline-none hover:border-gold/50 transition-colors cursor-pointer"
            >
              {sortOptions.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          {sidebarOpen && (
            <aside className="hidden md:block w-56 flex-shrink-0">
              {/* Price */}
              <div className="mb-8">
                <h4 className="text-xs uppercase tracking-widest text-charcoal font-semibold mb-4">Price Range</h4>
                <div className="space-y-2">
                  {priceFilters.map((p) => (
                    <label key={p} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={`w-4 h-4 rounded border transition-colors ${
                          selectedPrices.includes(p) ? 'bg-purple border-purple' : 'border-gold/30 group-hover:border-gold/60'
                        } flex items-center justify-center`}
                        onClick={() => toggleFilter(selectedPrices, setSelectedPrices, p)}
                      >
                        {selectedPrices.includes(p) && (
                          <svg className="w-2.5 h-2.5 text-ivory" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-warm-gray group-hover:text-charcoal transition-colors">{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Motif */}
              <div className="mb-8">
                <h4 className="text-xs uppercase tracking-widest text-charcoal font-semibold mb-4">Motif</h4>
                <div className="space-y-2">
                  {motifFilters.map((m) => (
                    <label key={m} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={`w-4 h-4 rounded border transition-colors ${
                          selectedMotifs.includes(m) ? 'bg-purple border-purple' : 'border-gold/30 group-hover:border-gold/60'
                        } flex items-center justify-center`}
                        onClick={() => toggleFilter(selectedMotifs, setSelectedMotifs, m)}
                      >
                        {selectedMotifs.includes(m) && (
                          <svg className="w-2.5 h-2.5 text-ivory" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-warm-gray group-hover:text-charcoal transition-colors">{m}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="mb-8">
                <h4 className="text-xs uppercase tracking-widest text-charcoal font-semibold mb-4">Color</h4>
                <div className="flex flex-wrap gap-2">
                  {colorFilters.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleFilter(selectedColors, setSelectedColors, c)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                        selectedColors.includes(c)
                          ? 'bg-purple text-ivory border-purple'
                          : 'border-gold/25 text-warm-gray hover:border-gold/50 hover:text-charcoal'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear */}
              {(selectedPrices.length + selectedColors.length + selectedMotifs.length) > 0 && (
                <button
                  onClick={() => { setSelectedPrices([]); setSelectedColors([]); setSelectedMotifs([]); }}
                  className="text-xs text-burgundy hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </aside>
          )}

          {/* Product grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-24 text-warm-gray">
                <p className="text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>No sarees found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${sidebarOpen ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetail={(id) => onNavigate('product', { id })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
