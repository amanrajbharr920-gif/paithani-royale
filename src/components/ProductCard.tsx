import { useState } from 'react';
import type { Product } from '../types';
import { formatPrice } from '../data';

interface ProductCardProps {
  product: Product;
  onViewDetail: (id: string) => void;
}

export default function ProductCard({ product, onViewDetail }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reliable fallback image if the database URL fails or is blocked
  const fallbackImage = 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=800&fit=crop&auto=format';

  return (
    <div
      className="group bg-ivory rounded-xl overflow-hidden border border-gold/15 hover:border-gold/45 transition-all duration-400 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      onClick={() => onViewDetail(product.id)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-ivory-dark overflow-hidden">
        <img
          src={product.image || fallbackImage}
          alt={product.name || 'Paithani Saree'}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-108 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            setImageLoaded(true); // Force reveal if blocked
            e.currentTarget.src = fallbackImage; // Swap to backup image
          }}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-ivory-dark animate-pulse" />
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 bg-charcoal/80 text-gold text-[10px] font-medium tracking-widest uppercase px-2.5 py-1 rounded-full backdrop-blur-sm">
            {product.badge}
          </div>
        )}

        {/* Wishlist */}
        <button
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all duration-300 ${
            wishlisted
              ? 'bg-burgundy border-burgundy text-ivory'
              : 'bg-ivory/80 border-gold/30 text-warm-gray hover:text-burgundy hover:bg-ivory hover:border-burgundy/40'
          }`}
          onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          aria-label="Add to wishlist"
        >
          <svg
            className="w-3.5 h-3.5"
            fill={wishlisted ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Quick view button on hover */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            className="bg-gold text-charcoal text-xs font-medium tracking-wider uppercase px-5 py-2 rounded-full shadow-lg hover:bg-gold-light transition-colors"
            onClick={(e) => { e.stopPropagation(); onViewDetail(product.id); }}
          >
            View Details
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div>
            <p className="text-[10px] text-gold uppercase tracking-widest font-medium">{product.brand}</p>
            <h3 className="text-sm font-semibold text-charcoal mt-0.5 line-clamp-1" style={{ fontFamily: 'var(--font-display)' }}>
              {product.name}
            </h3>
          </div>
          {/* Verified badge */}
          <div className="flex-shrink-0 mt-1">
            <svg className="w-4 h-4 text-emerald" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 ${i < Math.floor(product.rating || 5) ? 'text-gold' : 'text-warm-gray-light'}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-warm-gray">{product.rating} ({product.reviews})</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-[10px] text-warm-gray bg-ivory-dark px-2 py-0.5 rounded-full">{product.motif}</span>
          <span className="text-[10px] text-warm-gray bg-ivory-dark px-2 py-0.5 rounded-full">{product.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-purple" style={{ fontFamily: 'var(--font-display)' }}>
              {formatPrice(product.price || 0)}
            </p>
          </div>
          <div className="text-[9px] text-emerald font-medium tracking-wide uppercase bg-emerald/10 px-2 py-1 rounded">
            Authentic • Verified
          </div>
        </div>
      </div>
    </div>
  );
}