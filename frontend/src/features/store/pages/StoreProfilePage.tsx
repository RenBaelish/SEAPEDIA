import { useEffect, useState } from 'react';
import { useParams, Link } from "react-router-dom";
import { Store, Star, Package, CheckCircle, MapPin, Search, Share2, Info, MessageCircle, MoreHorizontal } from "lucide-react";
import { api } from "../../../lib/api";
import { ProductCard } from "../../../components/shared/ProductCard";
import { ProductSummary } from '@/types';

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
  const [store, setStore] = useState<StoreDetail | null>(null);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("beranda");

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
      <div className="bg-gray-50 min-h-screen">
        <div className="h-[200px] bg-gray-200 " />
        <div className="page-container -mt-8 relative z-10">
          <div className="bg-white rounded-xl h-32  mb-4" />
          <div className="bg-white rounded-xl h-96 " />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="page-container py-16 text-center">
        <div className="text-6xl mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Toko Tidak Ditemukan</h1>
        <p className="text-gray-500 mb-6">Toko yang Anda cari mungkin sudah ditutup atau link salah.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      
      {/* ─── Cover / Banner ─────────────────────────────────── */}
      <div className="h-[120px] md:h-[240px] bg-gradient-to-r from-green-500 to-emerald-700 w-full relative">
        {store.bannerUrl ? (
          <img src={store.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-90" />
        ) : (
          <div className="absolute inset-0 pattern-dots text-white/10" />
        )}
      </div>

      <div className="page-container max-w-[1200px] -mt-10 md:-mt-14 relative z-10">
        
        {/* ─── Header Toko ────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 p-5 flex flex-col md:flex-row gap-5 items-start md:items-center">
          
          {/* Logo & Info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white border-4 border-white shadow-md overflow-hidden flex-shrink-0 flex items-center justify-center relative">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center text-3xl">
                  
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-[18px] md:text-[22px] font-bold text-gray-900 flex items-center gap-1.5 mb-1">
                {store.name}
                <CheckCircle size={18} className="text-blue-500 fill-blue-50" />
              </h1>
              <div className="flex items-center gap-3 text-[13px] text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400" />
                  Jakarta
                </span>
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <b className="text-gray-700">{(store.rating ?? 0).toFixed(1)}</b>
                </span>
                <span className="flex items-center gap-1">
                  <b className="text-gray-700">{store.totalSales}</b> pesanan
                </span>
              </div>
              <p className="text-[12px] text-gray-500 mt-1.5 max-w-[500px] line-clamp-1">{store.description || "Official Store di SEAPEDIA."}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold text-[14px] transition-colors">
              Follow
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-[14px] transition-colors">
              <MessageCircle size={18} /> Chat
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
              <Share2 size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
              <Info size={18} />
            </button>
          </div>
        </div>

        {/* ─── Navigation Tabs ────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 sticky top-16 z-20">
          <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-100 px-2">
            {[
              { id: "beranda", label: "Beranda" },
              { id: "produk", label: "Produk" },
              { id: "ulasan", label: "Ulasan" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-[14px] font-bold whitespace-nowrap transition-colors relative ${
                  activeTab === tab.id ? "text-green-600" : "text-gray-500 hover:text-green-600"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Filter Bar (Only in Produk tab) */}
          {activeTab === "produk" && (
            <div className="p-4 flex items-center gap-3">
              <div className="relative flex-1 max-w-[300px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari di toko ini..." 
                  className="w-full pl-9 pr-4 h-9 bg-gray-50 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-green-500 focus:bg-white transition-colors"
                />
              </div>
              <div className="h-6 w-px bg-gray-200 mx-2" />
              <button className="text-[13px] text-gray-600 font-semibold hover:text-green-600">Terbaru</button>
              <button className="text-[13px] text-gray-600 font-semibold hover:text-green-600 ml-4">Terlaris</button>
              <button className="text-[13px] text-gray-600 font-semibold hover:text-green-600 ml-4 flex items-center gap-1">Harga <MoreHorizontal size={14} /></button>
            </div>
          )}
        </div>

        {/* ─── Content Area ───────────────────────────────────── */}
        
        {activeTab === "beranda" && (
          <div className="space-y-4">
            {/* Promo Banner / Voucher */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 rounded-xl p-5 flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-orange-800 mb-1">Promo Cashback 10%</h3>
                <p className="text-[12px] text-orange-600">Min. Pembelian Rp100.000. S&K Berlaku.</p>
              </div>
              <button className="bg-orange-500 text-white px-5 py-2 rounded-full text-[13px] font-bold hover:bg-orange-600">
                Klaim
              </button>
            </div>

            {/* Etalase Unggulan */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[16px] font-bold text-gray-900">Produk Unggulan</h2>
                <button onClick={() => setActiveTab("produk")} className="text-[13px] text-green-600 font-semibold hover:underline">Lihat Semua</button>
              </div>
              {products.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-gray-500 text-[13px]">Belum ada produk di etalase ini.</p>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-[16px] font-bold text-gray-900 mb-5">Semua Produk ({products.length})</h2>
            {products.length === 0 ? (
              <div className="py-20 text-center">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Toko ini belum memiliki produk.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            )}
          </div>
        )}

        {activeTab === "ulasan" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center py-20">
             <Star size={48} className="mx-auto text-gray-300 mb-4" />
             <h3 className="text-[16px] font-bold text-gray-800 mb-2">Ulasan Pembeli</h3>
             <p className="text-gray-500 text-[13px]">Menampilkan ulasan dari pembeli yang telah berbelanja di toko ini.</p>
          </div>
        )}

      </div>
    </div>
  );
}
