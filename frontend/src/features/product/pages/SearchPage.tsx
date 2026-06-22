import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { api } from "../../../lib/api";
import { ProductSummary } from '@/types';
import { ProductCard } from "../../../components/shared/ProductCard";
import { ProductCardSkeleton } from "../../../components/ui/Skeleton";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const categorySlug = searchParams.get('category') || '';

  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let endpoint = `/products?limit=50`;
    if (q) endpoint += `&q=${encodeURIComponent(q)}`;
    if (categorySlug) endpoint += `&category=${encodeURIComponent(categorySlug)}`;

    api.get(endpoint)
      .then((res) => setProducts(res.data.data))
      .catch((err) => console.error("Failed to fetch search results", err))
      .finally(() => setLoading(false));
  }, [q, categorySlug]);

  return (
    <div className="bg-[#F7F5F0] min-h-screen pb-16">

      {/* ── Sticky Search Header ── */}
      <div className="bg-white border-b-4 border-nb-black sticky top-[68px] z-[40]">
        <div className="page-container py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-nb-black tracking-tight">
              {q
                ? <>Hasil untuk "<span className="text-nb-blue">{q}</span>"</>
                : categorySlug
                  ? `Kategori: ${categorySlug}`
                  : 'Semua Produk'
              }
            </h1>
            <p className="text-xs font-semibold text-gray-500 mt-1">
              {loading ? 'Mencari...' : `${products.length} produk ditemukan`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border-3 border-nb-black bg-white font-bold text-sm hover:bg-nb-yellow transition-colors"
              style={{ borderWidth: '3px' }}>
              <SlidersHorizontal size={14} strokeWidth={2.5} /> Filter
            </button>
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-8 py-2 border-3 border-nb-black bg-white font-bold text-sm outline-none cursor-pointer hover:bg-nb-yellow transition-colors"
                style={{ borderWidth: '3px' }}
              >
                <option>Paling Sesuai</option>
                <option>Terbaru</option>
                <option>Harga: Tertinggi</option>
                <option>Harga: Terendah</option>
                <option>Terlaris</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-5">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 18 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white border-4 border-nb-black shadow-[6px_6px_0px_#0A0A0A] p-12 text-center flex flex-col items-center gap-4">
            <Search size={48} className="text-gray-300" strokeWidth={1.5} />
            <div>
              <h2 className="text-xl font-extrabold text-nb-black mb-2">Produk Tidak Ditemukan</h2>
              <p className="text-sm text-gray-500 font-medium max-w-md">
                Coba kata kunci lain atau periksa kembali ejaan pencarian Anda.
              </p>
            </div>
            <a
              href="/search"
              className="mt-2 px-6 py-3 border-3 border-nb-black bg-nb-yellow font-bold text-sm shadow-[3px_3px_0px_#0A0A0A] hover:shadow-[4px_4px_0px_#0A0A0A] hover:-translate-x-px hover:-translate-y-px transition-all"
              style={{ borderWidth: '3px' }}
            >
              Lihat Semua Produk
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
