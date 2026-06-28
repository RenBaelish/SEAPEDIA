import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { ProductSummary } from '@/types';
import { formatCurrency } from "../../lib/format";

interface ProductCardProps {
  product: ProductSummary;
}

function formatSold(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}jt+`;
  if (n >= 1000) return `${Math.floor(n / 1000)}rb+`;
  if (n >= 100) return `${Math.floor(n / 100) * 100}+`;
  return `${n}`;
}

export function ProductCard({ product }: ProductCardProps) {
  const discountPercent = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product.slug}`} className="block outline-none group">
      <div className="bg-white h-full flex flex-col border-3 border-nb-black shadow-[3px_3px_0px_#0A0A0A] hover:shadow-[5px_5px_0px_#0A0A0A] hover:-translate-x-px hover:-translate-y-px transition-all duration-150"
        style={{ borderWidth: '3px' }}>
        {}
        <div className="relative aspect-square bg-gray-100 overflow-hidden border-b-3 border-nb-black"
          style={{ borderBottomWidth: '3px' }}>
          <img
            src={product.images?.[0] || "https://placehold.co/400x400/F7F5F0/0A0A0A?text=No+Image"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/400x400/F7F5F0/0A0A0A?text=No+Image";
              e.currentTarget.onerror = null;
            }}
          />
          {}
          {discountPercent > 0 && (
            <div className="absolute top-0 left-0 bg-nb-red text-white text-xs font-extrabold px-2 py-1 border-r-2 border-b-2 border-nb-black">
              -{discountPercent}%
            </div>
          )}
          {}
          {product.stock <= 3 && product.stock > 0 && (
            <div className="absolute bottom-0 right-0 bg-nb-yellow text-nb-black text-xs font-extrabold px-2 py-1 border-l-2 border-t-2 border-nb-black">
              Sisa {product.stock}
            </div>
          )}
        </div>

        {}
        <div className="p-3 flex flex-col flex-1">
          <p className="text-xs font-semibold text-gray-800 line-clamp-2 mb-2 leading-snug group-hover:text-nb-black transition-colors">
            {product.name}
          </p>

          <div className="mt-auto space-y-1.5">
            {}
            <div className="font-extrabold text-sm text-nb-black leading-tight">
              {formatCurrency(product.price)}
            </div>

            {}
            {discountPercent > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400 line-through">{formatCurrency(product.comparePrice!)}</span>
              </div>
            )}

            {}
            <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
              <Star size={10} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-medium text-gray-600">{(product.rating ?? 0).toFixed(1)}</span>
              <span className="text-gray-300 text-xs">·</span>
              <span className="text-xs text-gray-500">{formatSold(product.sold)} terjual</span>
            </div>

            {}
            <div className="flex items-center gap-1 pt-0.5">
              <img src="/icon/verify-icon.png" alt="verified" className="w-3 h-3 object-contain" />
              <span className="text-xs text-gray-500 truncate font-medium">{product.storeName}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
