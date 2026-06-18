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
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={product.images?.[0] || "https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              {discountPercent}%
            </div>
          )}
          {product.stock <= 3 && product.stock > 0 && (
            <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              Sisa {product.stock}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2.5 flex flex-col flex-1">
          <h3 className="text-[12px] text-gray-700 line-clamp-2 mb-1.5 leading-snug group-hover:text-green-600 transition-colors">
            {product.name}
          </h3>

          <div className="mt-auto space-y-1">
            {/* Price */}
            <div className="font-bold text-[14px] text-gray-900 leading-tight">
              {formatCurrency(product.price)}
            </div>

            {discountPercent > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1 py-0.5 rounded">{discountPercent}%</span>
                <span className="text-[10px] text-gray-400 line-through">{formatCurrency(product.comparePrice!)}</span>
              </div>
            )}

            {/* Promo badge */}
            {discountPercent > 0 && (
              <p className="text-[10px] text-orange-500 font-medium">Hemat s.d {discountPercent}% Pakai Bonus</p>
            )}

            {/* Rating & sold */}
            <div className="flex items-center gap-1.5 pt-1">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-[11px] text-gray-500">{(product.rating ?? 0).toFixed(1)}</span>
              <span className="text-gray-300 text-[11px]">•</span>
              <span className="text-[11px] text-gray-500">{formatSold(product.sold)} terjual</span>
            </div>

            {/* Store & location */}
            <div className="flex items-center gap-1 pt-0.5">
              <div className="w-3 h-3 rounded-sm bg-green-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[7px] font-bold">✓</span>
              </div>
              <span className="text-[10px] text-gray-500 truncate">{product.storeName}</span>
            </div>

            <div className="flex items-center gap-1">
              <MapPin size={10} className="text-gray-300 flex-shrink-0" />
              <span className="text-[10px] text-gray-400 truncate">Jakarta, Indonesia</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
