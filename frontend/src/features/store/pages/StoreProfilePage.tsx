import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from "react-router-dom";
import { Store, Star, Package, CheckCircle, MapPin, Search, Share2, Info, MessageCircle, MoreHorizontal } from "lucide-react";
import { api } from "../../../lib/api";
import { ProductCard } from "../../../components/shared/ProductCard";
import { ProductSummary } from '@/types';
import { useConfirm } from "../../../contexts/ConfirmContext";

interface StoreDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: string;
  rating: number;
  totalSales: number;
  createdAt: string;
}

export default function StoreProfilePage() {
  const { slug } = useParams();
  const { showConfirm } = useConfirm();
  const [store, setStore] = useState<StoreDetail | null>(null);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("beranda");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"terbaru" | "terlaris" | "harga-asc" | "harga-desc">("terbaru");

  const filteredProducts = useMemo(() => {
    let result = products;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }
    
    result = [...result].sort((a, b) => {
      if (sortBy === "terlaris") return b.sold - a.sold;
      if (sortBy === "harga-asc") return a.price - b.price;
      if (sortBy === "harga-desc") return b.price - a.price;
      return 0; // terbaru
    });

    return result;
  }, [products, searchQuery, sortBy]);

  const handleNotAvailable = () => {
    showConfirm({
      title: 'Fitur Belum Tersedia',
      message: 'Fitur ini belum tersedia pada versi ini.',
      confirmText: 'Tutup'
    });
  };

  useEffect(() => {
    if (!slug) return;
    
    Promise.all([
      api.get(`/stores/${slug}`),
      api.get(`/stores/${slug}/products`)
    ])
      .then(([storeRes, productsRes]) => {
        setStore(storeRes.data.data);
        setProducts(productsRes.data.data);
      })
      .catch((err) => {
        console.error("Failed to load store profile", err);
        setStore(null);
      })
      .finally(() => setLoading(false));

  }, [slug]);

  if (loading) {
    return (
      <div className="bg-[#F7F5F0] min-h-screen">
        <div className="h-[200px] border-b-4 border-nb-black bg-gray-200" />
        <div className="page-container -mt-8 relative z-10">
          <div className="bg-white border-4 border-nb-black h-32 mb-4" />
          <div className="bg-white border-4 border-nb-black h-96" />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="bg-[#F7F5F0] min-h-screen pt-16 pb-16">
        <div className="page-container max-w-4xl text-center">
          <div className="bg-white border-4 border-nb-black shadow-[6px_6px_0px_#0A0A0A] p-10">
            <h1 className="text-2xl font-extrabold text-nb-black mb-2">Toko Tidak Ditemukan</h1>
            <p className="text-sm font-semibold text-gray-600 mb-6">Toko yang Anda cari mungkin sudah ditutup atau link salah.</p>
            <Link to="/" className="btn-primary inline-flex">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F5F0] min-h-screen pb-16">
      
      {/* ─── Cover / Banner ── */}
      <div className="h-[120px] md:h-[240px] bg-nb-black w-full relative border-b-4 border-nb-black">
        {store.bannerUrl ? (
          <img src={store.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-90" />
        ) : (
          <div className="absolute inset-0 bg-[url('https://placehold.co/1200x240/1A1A1A/FFFFFF?text=Seapedia+Store')] bg-cover opacity-50" />
        )}
      </div>

      <div className="page-container max-w-[1200px] -mt-10 md:-mt-14 relative z-10">
        
        {/* ─── Header Toko ── */}
        <div className="bg-white border-4 border-nb-black shadow-[6px_6px_0px_#0A0A0A] mb-5 p-5 flex flex-col md:flex-row gap-5 items-start md:items-center">
          
          {/* Logo & Info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] flex-shrink-0 flex items-center justify-center relative overflow-hidden" style={{ borderWidth: '3px' }}>
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-nb-yellow flex items-center justify-center text-3xl font-black text-nb-black">
                  {store.name.charAt(0)}
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-lg md:text-2xl font-extrabold text-nb-black flex items-center gap-1.5 mb-1">
                {store.name}
                <img src="/icon/verify-icon.png" alt="verified" className="w-5 h-5 object-contain" />
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-700 font-bold flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-nb-black" strokeWidth={3} />
                  Jakarta
                </span>
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-nb-yellow fill-nb-yellow" strokeWidth={2} />
                  <b className="text-nb-black">{(store.rating ?? 0).toFixed(1)}</b>
                </span>
                <span className="flex items-center gap-1">
                  <b className="text-nb-black">{store.totalSales}</b> pesanan
                </span>
              </div>
              <p className="text-xs text-gray-600 font-medium mt-1.5 max-w-[500px] line-clamp-1">{store.description || "Official Store di SEAPEDIA."}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button onClick={handleNotAvailable} className="flex-1 md:flex-none btn-primary h-10 px-6 text-sm">
              Follow
            </button>
            <button onClick={handleNotAvailable} className="flex items-center justify-center gap-2 px-4 py-2 border-3 border-nb-black bg-white text-nb-black hover:bg-nb-yellow font-extrabold text-sm transition-colors" style={{ borderWidth: '3px' }}>
              <MessageCircle size={18} strokeWidth={2.5} /> Chat
            </button>
            <button onClick={handleNotAvailable} className="w-10 h-10 flex items-center justify-center border-3 border-nb-black bg-white text-nb-black hover:bg-nb-yellow transition-colors" style={{ borderWidth: '3px' }}>
              <Share2 size={18} strokeWidth={2.5} />
            </button>
            <button onClick={handleNotAvailable} className="w-10 h-10 flex items-center justify-center border-3 border-nb-black bg-white text-nb-black hover:bg-nb-yellow transition-colors" style={{ borderWidth: '3px' }}>
              <Info size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ─── Navigation Tabs ── */}
        <div className="bg-white border-4 border-nb-black shadow-[6px_6px_0px_#0A0A0A] mb-5 sticky top-16 z-20">
          <div className="flex overflow-x-auto hide-scrollbar border-b-3 border-nb-black px-2" style={{ borderBottomWidth: '3px' }}>
            {[
              { id: "beranda", label: "Beranda" },
              { id: "produk", label: "Produk" },
              { id: "ulasan", label: "Ulasan" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-extrabold whitespace-nowrap transition-colors relative ${
                  activeTab === tab.id ? "text-nb-black" : "text-gray-500 hover:text-nb-black"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-1.5 bg-nb-blue" />
                )}
              </button>
            ))}
          </div>

          {/* Filter Bar (Only in Produk tab) */}
          {activeTab === "produk" && (
            <div className="p-4 flex flex-col md:flex-row items-start md:items-center gap-3 border-b-2 border-nb-black">
              <div className="relative w-full md:flex-1 md:max-w-[300px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nb-black" strokeWidth={2.5} />
                <input 
                  type="text" 
                  placeholder="Cari di toko ini..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 h-10 border-2 border-nb-black bg-white text-sm font-semibold outline-none focus:bg-nb-yellow transition-colors"
                />
              </div>
              <div className="hidden md:block h-6 w-[3px] bg-nb-black mx-2" />
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto hide-scrollbar pb-2 md:pb-0">
                <button 
                  onClick={() => setSortBy("terbaru")}
                  className={`text-sm font-extrabold px-3 py-1.5 border-2 transition-colors whitespace-nowrap ${sortBy === "terbaru" ? "border-nb-black bg-nb-yellow text-nb-black" : "border-transparent text-gray-600 hover:text-nb-black hover:border-gray-200"}`}
                >Terbaru</button>
                <button 
                  onClick={() => setSortBy("terlaris")}
                  className={`text-sm font-extrabold px-3 py-1.5 border-2 transition-colors whitespace-nowrap ${sortBy === "terlaris" ? "border-nb-black bg-nb-yellow text-nb-black" : "border-transparent text-gray-600 hover:text-nb-black hover:border-gray-200"}`}
                >Terlaris</button>
                <button 
                  onClick={() => setSortBy(sortBy === "harga-desc" ? "harga-asc" : "harga-desc")}
                  className={`flex items-center gap-1 text-sm font-extrabold px-3 py-1.5 border-2 transition-colors whitespace-nowrap ${sortBy.startsWith("harga") ? "border-nb-black bg-nb-yellow text-nb-black" : "border-transparent text-gray-600 hover:text-nb-black hover:border-gray-200"}`}
                >
                  Harga {sortBy === "harga-desc" ? "↓" : sortBy === "harga-asc" ? "↑" : <MoreHorizontal size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Content Area ── */}
        
        {activeTab === "beranda" && (
          <div className="space-y-5">
            {/* Promo Banner / Voucher */}
            <div className="bg-nb-yellow border-4 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-nb-black mb-1">Promo Cashback 10%</h3>
                <p className="text-xs font-bold text-gray-800">Min. Pembelian Rp100.000. S&K Berlaku.</p>
              </div>
              <button className="bg-white border-2 border-nb-black px-5 py-2 text-sm font-extrabold hover:bg-nb-black hover:text-white transition-colors">
                Klaim
              </button>
            </div>

            {/* Etalase Unggulan */}
            <div className="bg-white border-4 border-nb-black shadow-[6px_6px_0px_#0A0A0A] p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-extrabold text-nb-black nb-section-title">Produk Unggulan</h2>
                <button onClick={() => setActiveTab("produk")} className="text-sm font-bold text-nb-black border-2 border-nb-black px-3 py-1 hover:bg-nb-yellow transition-colors">Lihat Semua</button>
              </div>
              {products.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-gray-500 font-semibold text-sm">Belum ada produk di etalase ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {products.slice(0, 6).map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "produk" && (
          <div className="bg-white border-4 border-nb-black shadow-[6px_6px_0px_#0A0A0A] p-6">
            <h2 className="text-base font-extrabold text-nb-black mb-5">Semua Produk ({filteredProducts.length})</h2>
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 border-3 border-nb-black bg-nb-yellow mb-4 rotate-3" style={{ borderWidth: '3px' }}>
                  <Package size={32} className="text-nb-black" strokeWidth={2.5} />
                </div>
                <p className="text-nb-black font-extrabold">{searchQuery ? "Tidak ada produk yang cocok dengan pencarian." : "Toko ini belum memiliki produk."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            )}
          </div>
        )}

        {activeTab === "ulasan" && (
          <div className="bg-white border-4 border-nb-black shadow-[6px_6px_0px_#0A0A0A] p-6 text-center py-20">
             <div className="inline-flex items-center justify-center w-20 h-20 border-3 border-nb-black bg-[#EBF5FF] mb-4 -rotate-3" style={{ borderWidth: '3px' }}>
               <Star size={32} className="text-nb-blue fill-nb-blue" strokeWidth={2} />
             </div>
             <h3 className="text-base font-extrabold text-nb-black mb-2">Ulasan Pembeli</h3>
             <p className="text-gray-600 font-semibold text-sm">Menampilkan ulasan dari pembeli yang telah berbelanja di toko ini.</p>
          </div>
        )}

      </div>
    </div>
  );
}
