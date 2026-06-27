import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Star, ChevronRight, ArrowRight } from "lucide-react";
import { api } from "../../../lib/api";
import { ProductSummary } from '@/types';
import { ProductCard } from "../../../components/shared/ProductCard";
import { ProductCardSkeleton } from "../../../components/ui/Skeleton";
import { AppReviewForm } from "../components/AppReviewForm";
import { Avatar } from "../../../components/ui/Avatar";
import { PromoSlider } from "../components/PromoSlider";

interface AppReview {
  id: string;
  guestName: string;
  profilePictureUrl?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const CATEGORY_ICON_MAP: Record<string, string> = {
  "handphone":   "/icon/handphone-icon.png",
  "komputer":    "/icon/komputer-icon.png",
  "elektronik":  "/icon/elektronik-icon.png",
  "rumah":       "/icon/rumah-tangga-kategori-icon.png",
  "topup":       "/icon/topup-icon.png",
  "tagihan":     "/icon/topup-icon.png",
  "buku":        "/icon/buku-kategori-icon.png",
  "hewan":       "/icon/perawatan-hewan-icon.png",
  "keuangan":    "/icon/keuangan-icon.png",
};

function getCategoryIcon(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICON_MAP)) {
    if (lower.includes(key)) return icon;
  }
  return null;
}

const TOPUP_ITEMS = [
  { label: "Pulsa",      icon: "/icon/topup-icon.png" },
  { label: "Paket Data", icon: "/icon/topup-icon.png" },
  { label: "Keuangan",   icon: "/icon/keuangan-icon.png" },
  { label: "Lainnya",    icon: "/icon/kategori-icon.png" },
];

export default function HomePage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    api.get("/products?limit=12")
      .then((res) => setProducts(res.data.data))
      .catch((err) => console.error("Failed to load products", err))
      .finally(() => setLoadingProducts(false));

    api.get("/categories")
      .then((res) => setCategories(res.data.data))
      .catch((err) => console.error("Failed to load categories", err));

    api.get("/stores")
      .then((res) => setStores(res.data.data.slice(0, 4)))
      .catch((err) => console.error("Failed to load stores", err));

    fetchReviews();
  }, []);

  const fetchReviews = () => {
    setLoadingReviews(true);
    api.get("/reviews/app")
      .then((res) => setReviews(res.data.data))
      .catch((err) => console.error("Failed to load reviews", err))
      .finally(() => setLoadingReviews(false));
  };

  return (
    <div className="bg-[#F7F5F0] pb-16">

      {}
      <div className="bg-nb-yellow border-b-4 border-nb-black">
        <div className="page-container py-4">
          <PromoSlider />
        </div>
      </div>

      {}
      <div className="page-container mt-4">
        <div className="bg-white border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-5 md:p-6"
          style={{ borderWidth: '3px' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-extrabold text-nb-black nb-section-title">Kategori Populer</h2>
            <Link
              to="/search"
              className="flex items-center gap-1 text-xs font-bold text-nb-black border-2 border-nb-black px-3 py-1.5 hover:bg-nb-yellow transition-colors"
            >
              Lihat Semua <ChevronRight size={12} strokeWidth={3} />
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {categories.slice(0, 8).map((cat, i) => {
              const icon = getCategoryIcon(cat.name);
              return (
                <Link
                  key={cat.id || i}
                  to={`/search?category=${cat.slug}`}
                  className="flex flex-col items-center gap-2 p-3 border-2 border-gray-200 bg-white hover:border-nb-black hover:bg-nb-yellow transition-all group text-center"
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    {icon ? (
                      <img src={icon} alt={cat.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <img src="/icon/kategori-icon.png" alt={cat.name} className="w-8 h-8 object-contain opacity-50" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-gray-700 group-hover:text-nb-black leading-tight text-center">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {}
      <div className="page-container mt-4">
        <div className="bg-nb-black border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-5"
          style={{ borderWidth: '3px' }}>
          <div className="flex items-center gap-3 mb-4">
            <img src="/icon/topup-icon.png" alt="topup" className="w-6 h-6 object-contain" />
            <h2 className="text-xl font-extrabold text-nb-yellow">Top Up & Tagihan</h2>
            <Link to="/search?q=tagihan" className="ml-auto text-xs font-bold text-gray-400 hover:text-nb-yellow transition-colors">
              Lihat Semua
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TOPUP_ITEMS.map((item, i) => (
              <button
                key={i}
                className="flex items-center gap-3 p-3 border-2 border-gray-700 bg-gray-800 hover:border-nb-yellow hover:bg-gray-700 transition-all text-left"
              >
                <img src={item.icon} alt={item.label} className="w-7 h-7 object-contain" />
                <span className="text-sm font-bold text-white">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {}
      <div className="page-container mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { bg: "bg-nb-green", label: "GRATIS ONGKIR", sub: "Setiap hari tanpa syarat" },
          { bg: "bg-nb-blue",  label: "FLASH SALE",    sub: "Diskon s.d 90% hari ini" },
          { bg: "bg-nb-red",   label: "PROMO SPESIAL", sub: "Penawaran waktu terbatas" },
        ].map((b, i) => (
          <div
            key={i}
            className={`${b.bg} border-3 border-nb-black shadow-[3px_3px_0px_#0A0A0A] p-4 flex items-center gap-3 cursor-pointer hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_#0A0A0A] transition-all`}
            style={{ borderWidth: '3px' }}
          >
            <div className="flex-1">
              <p className="font-extrabold text-white text-xl tracking-wide">{b.label}</p>
              <p className="text-xs text-white/80 font-medium mt-0.5">{b.sub}</p>
            </div>
            <ArrowRight size={20} className="text-white" strokeWidth={3} />
          </div>
        ))}
      </div>

      {}
      <div className="page-container mt-4">
        <div className="bg-white border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-5 md:p-6"
          style={{ borderWidth: '3px' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-nb-black nb-section-title">Produk Untukmu</h2>
            <Link
              to="/search"
              className="flex items-center gap-1 text-xs font-bold text-nb-black border-2 border-nb-black px-3 py-1.5 hover:bg-nb-yellow transition-colors"
            >
              Lihat Semua <ChevronRight size={12} strokeWidth={3} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {loadingProducts
              ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
          {!loadingProducts && products.length > 0 && (
            <div className="text-center mt-6">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-8 py-3 border-3 border-nb-black bg-nb-black text-white font-bold shadow-[3px_3px_0px_#FFE600] hover:shadow-[5px_5px_0px_#FFE600] hover:-translate-x-px hover:-translate-y-px transition-all text-sm"
                style={{ borderWidth: '3px' }}
              >
                Lihat Lebih Banyak <ArrowRight size={16} strokeWidth={3} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {}
      <div className="page-container mt-4">
        <div className="bg-white border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-5 md:p-6"
          style={{ borderWidth: '3px' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-extrabold text-nb-black nb-section-title">Toko Pilihan</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(stores.length > 0 ? stores : [
              { id: "1", name: "Demo Store", slug: "demo-store", logoUrl: null, status: "ACTIVE" },
              { id: "2", name: "Gadget Shop", slug: "gadget-shop", logoUrl: null, status: "ACTIVE" },
              { id: "3", name: "Fashion Hub", slug: "fashion-hub", logoUrl: null, status: "ACTIVE" },
              { id: "4", name: "Beauty Store", slug: "beauty-store", logoUrl: null, status: "ACTIVE" },
            ]).map((store: any, i: number) => (
              <Link
                key={store.id || i}
                to={`/store/${store.slug}`}
                className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 bg-white hover:border-nb-black hover:shadow-[3px_3px_0px_#0A0A0A] hover:-translate-x-px hover:-translate-y-px transition-all text-center"
              >
                <div className="w-14 h-14 border-2 border-nb-black flex items-center justify-center overflow-hidden bg-nb-yellow">
                  {store.logoUrl ? (
                    <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-extrabold text-nb-black">{store.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-nb-black line-clamp-2">{store.name}</p>
                  {store.status === 'ACTIVE' && (
                    <div className="mt-1 flex items-center justify-center gap-1">
                      <img src="/icon/verify-icon.png" alt="verified" className="w-3 h-3 object-contain" />
                      <span className="text-xs text-green-600 font-bold">Verified</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {}
      <div id="reviews" className="page-container mt-4">
        <div className="bg-white border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-5 md:p-8"
          style={{ borderWidth: '3px' }}>
          {}
          <div className="mb-6 pb-4 border-b-3 border-nb-black" style={{ borderBottomWidth: '3px' }}>
            <h2 className="text-xl font-extrabold text-nb-black nb-section-title">Apa Kata Mereka?</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium ml-4">Ulasan nyata dari pengguna SEAPEDIA</p>
          </div>

          <div className="grid md:grid-cols-[1fr_360px] gap-6">
            {}
            <div className="flex flex-col gap-3">
              {loadingReviews ? (
                <p className="text-sm text-gray-400 font-medium">Memuat ulasan...</p>
              ) : reviews.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-gray-300">
                  <p className="text-sm text-gray-400 font-semibold">Belum ada ulasan.</p>
                  <p className="text-xs text-gray-400">Jadilah yang pertama memberikan ulasan!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex gap-4 p-4 border-2 border-gray-200 bg-gray-50 hover:border-nb-black transition-colors"
                  >
                    <Avatar name={review.guestName} src={review.profilePictureUrl} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-extrabold text-nb-black">{review.guestName}</span>
                        <span className="text-xs text-gray-400 shrink-0">
                          {new Date(review.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={11} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {}
            <div className="h-fit">
              <div className="border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] bg-nb-yellow p-5"
                style={{ borderWidth: '3px' }}>
                <h3 className="text-base font-extrabold text-nb-black mb-1">Tulis Ulasan</h3>
                <p className="text-xs text-gray-700 font-medium mb-4">Bagikan pengalaman belanjamu di SEAPEDIA.</p>
                <AppReviewForm onSuccess={fetchReviews} />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
