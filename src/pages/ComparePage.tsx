import { useState } from 'react';
import { products, formatPrice } from '../data';
import type { Page } from '../types';

interface ComparePageProps {
  onNavigate: (page: Page, extra?: Record<string, string>) => void;
}

export default function ComparePage({ onNavigate }: ComparePageProps) {
  const [selected, setSelected] = useState<string[]>(['p1', 'p2', 'p4']);

  const compared = products.filter((p) => selected.includes(p.id)).slice(0, 3);

  const attrs: { label: string; key: keyof typeof compared[0] | string; format?: (v: unknown) => string }[] = [
    { label: 'Price', key: 'price', format: (v) => formatPrice(v as number) },
    { label: 'Brand', key: 'brand' },
    { label: 'Manufacturer', key: 'manufacturer' },
    { label: 'Material', key: 'material' },
    { label: 'Motif', key: 'motif' },
    { label: 'Colour', key: 'color' },
    { label: 'Origin', key: 'location' },
    { label: 'Rating', key: 'rating', format: (v) => `★ ${v}` },
    { label: 'Reviews', key: 'reviews', format: (v) => `${v} verified` },
    { label: 'Collection', key: 'collection' },
  ];

  const swapProduct = (slotId: string, newId: string) => {
    setSelected((prev) => {
      const idx = prev.indexOf(slotId);
      const next = [...prev];
      next[idx] = newId;
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <div className="bg-charcoal text-ivory py-14 px-6 paithani-pattern">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-gold uppercase tracking-widest mb-3">Side-by-Side</p>
          <h1 className="text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            Compare Sarees
          </h1>
          <p className="text-ivory/60 mt-3 text-sm">Choose up to 3 sarees to compare side-by-side.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Selector row */}
        <div className="grid grid-cols-3 gap-6 mb-2">
          {[0, 1, 2].map((slot) => {
            const p = compared[slot];
            return (
              <div key={slot} className="text-center">
                {p ? (
                  <div className="relative">
                    <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-ivory-dark border border-gold/20">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
                      <div className="absolute bottom-4 left-0 right-0 px-4">
                        <p className="text-[10px] text-gold uppercase tracking-widest">{p.brand}</p>
                        <p className="text-ivory font-semibold text-sm mt-0.5" style={{ fontFamily: 'var(--font-display)' }}>{p.name}</p>
                        <p className="text-gold font-bold mt-1" style={{ fontFamily: 'var(--font-display)' }}>{formatPrice(p.price)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected((prev) => prev.filter((x) => x !== p.id))}
                      className="absolute top-3 right-3 w-7 h-7 bg-burgundy text-ivory rounded-full flex items-center justify-center text-xs hover:bg-burgundy/80 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="aspect-[3/4] border-2 border-dashed border-gold/25 rounded-2xl flex flex-col items-center justify-center text-warm-gray hover:border-gold/50 transition-colors">
                    <svg className="w-8 h-8 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                    </svg>
                    <p className="text-sm font-medium text-charcoal">Add Saree</p>
                    <p className="text-xs">Select to compare</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison table */}
        {compared.length > 0 && (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full border border-gold/15 rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-charcoal text-ivory">
                  <th className="text-left px-6 py-4 w-40 text-xs uppercase tracking-widest text-warm-gray-light font-normal">Attribute</th>
                  {compared.map((p) => (
                    <th key={p.id} className="px-6 py-4 text-center">
                      <p className="text-xs text-gold uppercase tracking-widest font-normal">{p.brand}</p>
                      <p className="text-sm font-semibold mt-0.5" style={{ fontFamily: 'var(--font-display)' }}>{p.name}</p>
                    </th>
                  ))}
                  {compared.length < 3 && (
                    <th className="px-6 py-4 text-center">
                      <p className="text-warm-gray text-xs">+ Add another</p>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {attrs.map((attr, i) => (
                  <tr key={attr.label} className={`border-b border-gold/10 ${i % 2 === 0 ? 'bg-white' : 'bg-ivory'}`}>
                    <td className="px-6 py-4 text-xs text-warm-gray uppercase tracking-widest font-medium">{attr.label}</td>
                    {compared.map((p) => {
                      const val = p[attr.key as keyof typeof p];
                      const display = attr.format ? attr.format(val) : String(val ?? '—');
                      const isHighest = attr.key === 'rating' && Number(val) === Math.max(...compared.map((c) => Number(c[attr.key as keyof typeof c])));
                      const isLowest = attr.key === 'price' && Number(val) === Math.min(...compared.map((c) => Number(c[attr.key as keyof typeof c])));
                      return (
                        <td key={p.id} className="px-6 py-4 text-center">
                          <span className={`text-sm ${isHighest ? 'text-emerald font-semibold' : isLowest ? 'text-gold font-semibold' : 'text-charcoal'}`}>
                            {display}
                            {isHighest && <span className="ml-1 text-[9px] text-emerald">BEST</span>}
                            {isLowest && attr.key === 'price' && <span className="ml-1 text-[9px] text-gold">LOWEST</span>}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Authenticity row */}
                <tr className="bg-emerald/5 border-b border-gold/10">
                  <td className="px-6 py-4 text-xs text-warm-gray uppercase tracking-widest font-medium">Authenticity</td>
                  {compared.map((p) => (
                    <td key={p.id} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-emerald">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-xs font-medium">Certified</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* CTA row */}
                <tr className="bg-ivory">
                  <td className="px-6 py-5" />
                  {compared.map((p) => (
                    <td key={p.id} className="px-6 py-5 text-center">
                      <button
                        onClick={() => onNavigate('product', { id: p.id })}
                        className="bg-purple text-ivory text-xs px-6 py-3 rounded-lg hover:bg-purple-mid transition-colors font-medium tracking-wide"
                      >
                        View Details
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Add more from the catalogue */}
        <div className="mt-12">
          <h3 className="text-xl text-charcoal mb-6" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            Add from Catalogue
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.filter((p) => !selected.includes(p.id)).slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  if (selected.length < 3) setSelected((prev) => [...prev, p.id]);
                }}
                disabled={selected.length >= 3}
                className="text-left group border border-gold/15 rounded-xl overflow-hidden hover:border-gold/40 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="aspect-[3/2] overflow-hidden bg-ivory-dark">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-3 bg-white">
                  <p className="text-[10px] text-gold uppercase tracking-widest">{p.brand}</p>
                  <p className="text-xs font-semibold text-charcoal mt-0.5 truncate">{p.name}</p>
                  <p className="text-xs text-purple font-bold mt-1" style={{ fontFamily: 'var(--font-display)' }}>{formatPrice(p.price)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
