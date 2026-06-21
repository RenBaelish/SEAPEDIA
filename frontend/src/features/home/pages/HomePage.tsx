import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Star, ChevronRight, Zap, MapPin } from "lucide-react";
import { api } from "../../../lib/api";
import { ProductSummary } from '@/types';
import { ProductCard } from "../../../components/shared/ProductCard";
import { ProductCardSkeleton } from "../../../components/ui/Skeleton";
import { AppReviewForm } from "../components/AppReviewForm";
import { Card } from "../../../components/ui/Card";
import { Avatar } from "../../../components/ui/Avatar";
import { PromoSlider } from "../components/PromoSlider";

interface AppReview {
  id: string;
  guestName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const CATEGORY_ICONS = [
  { label: "Handphone & Tablet", emoji: "", q: "handphone" },
  { label: "Top-Up & Tagihan", emoji: "", q: "tagihan" },
  { label: "Elektronik", emoji: "️", q: "elektronik" },
  { label: "Fashion Wanita", emoji: "", q: "fashion" },
  { label: "Fashion Pria", emoji: "", q: "pria" },
  { label: "Kecantikan", emoji: "", q: "kecantikan" },
  { label: "Kesehatan", emoji: "", q: "kesehatan" },
  { label: "Makanan & Minuman", emoji: "", q: "makanan" },
  { label: "Olahraga", emoji: "️", q: "olahraga" },
  { label: "Otomotif", emoji: "", q: "otomotif" },
  { label: "Bayi & Anak", emoji: "", q: "bayi" },
  { label: "Rumah & Dapur", emoji: "", q: "rumah" },
];

export default function HomePage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    api.get("/products?limit=48")
      .then((res) => setProducts(res.data.data))
      .catch((err) => console.error("Failed to load products", err))
      .finally(() => setLoadingProducts(false));
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
    <div className="bg-gray-50 pb-16">

      {/* ─── Promo Slider ──────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-4">
          <PromoSlider />
        </div>
      </div>

      {/* ─── Kategori Populer ─────────────────────────────────── */}
      <div className="bg-white mt-3 rounded-xl mx-auto max-w-[1200px] px-4 md:px-6 py-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Kategori Populer</h2>
          <Link to="/search" className="text-sm text-green-600 font-semibold flex items-center gap-1 hover:underline">
            Lihat Semua <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
          {CATEGORY_ICONS.map((cat, i) => (
            <Link
              key={i}
              to={`/search?q=${cat.q}`}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-green-50 transition-all group text-center"
            >
              <div className="w-12 h-12 rounded-full bg-green-50 group-hover:bg-green-100 flex items-center justify-center text-2xl transition-colors">
                {cat.emoji}
              </div>
              <span className="text-xs font-medium text-gray-600 leading-tight">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Top Up & Tagihan Widget ─────────────────────────── */}
      <div className="bg-white mt-3 rounded-xl mx-auto max-w-[1200px] px-4 md:px-6 py-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Zap size={20} className="text-yellow-500" />
          <h2 className="text-base font-bold text-gray-900">Top Up & Tagihan</h2>
          <Link to="/search?q=tagihan" className="ml-auto text-sm text-green-600 font-semibold hover:underline">Lihat Semua</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { emoji: "", label: "Pulsa" },
            { emoji: "", label: "Paket Data" },
            { emoji: "", label: "Listrik PLN" },
            { emoji: "", label: "Roaming" },
          ].map((item, i) => (
            <button
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 hover:border-green-300 hover:bg-green-50 transition-all text-left"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-sm font-semibold text-gray-700">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Promo Banner Strip ─────────────────────────────── */}
      <div className="mx-auto max-w-[1200px] mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 px-4 md:px-6">
        {[
          { gradient: "from-green-500 to-emerald-600", title: "Gratis Ongkir", subtitle: "Setiap Hari!", icon: "" },
          { gradient: "from-purple-500 to-pink-600", title: "Flash Sale", subtitle: "Diskon s.d 90%", icon: "" },
          { gradient: "from-orange-500 to-red-500", title: "Promo Hari Ini", subtitle: "Penawaran Terbatas!", icon: "" },
        ].map((b, i) => (
          <div key={i} className={`bg-gradient-to-r ${b.gradient} rounded-xl p-4 flex items-center gap-4 text-white cursor-pointer hover:opacity-90 transition-opacity shadow-sm`}>
            <span className="text-4xl">{b.icon}</span>
            <div>
              <p className="font-bold text-base">{b.title}</p>
              <p className="text-xs opacity-90">{b.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Produk Incaranmu ─────────────────────────────────── */}
      <div className="bg-white mt-3 rounded-xl mx-auto max-w-[1200px] px-4 md:px-6 py-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Produk Incaranmu</h2>
          <Link to="/search" className="text-sm text-green-600 font-semibold flex items-center gap-1 hover:underline">
            Lihat Semua <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {loadingProducts
            ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
        {!loadingProducts && products.length > 0 && (
          <div className="text-center mt-6">
            <Link to="/search" className="inline-flex items-center gap-2 px-8 py-3 border-2 border-green-500 text-green-600 font-semibold rounded-full hover:bg-green-50 transition-colors text-sm">
              Lihat Lebih Banyak <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* ─── Featured Stores ──────────────────────────────────── */}
      <div className="bg-white mt-3 rounded-xl mx-auto max-w-[1200px] px-4 md:px-6 py-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Toko Pilihan</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: "Super Gadget Store", slug: "super-gadget", emoji: "", location: "Jakarta Pusat", badge: " Official" },
            { name: "Waytoglow Beauty", slug: "waytoglow", emoji: "", location: "Jakarta Selatan", badge: " Top Seller" },
            { name: "Tiebymin Official", slug: "tiebymin-official", emoji: "", location: "Jakarta Selatan", badge: " Terpercaya" },
            { name: "Demo Store", slug: "demo-store", emoji: "️", location: "Jakarta Barat", badge: " Baru" },
          ].map((store, i) => (
            <Link
              key={i}
              to={`/store/${store.slug}`}
              className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-green-300 hover:shadow-md transition-all text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center text-3xl">
                {store.emoji}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800 line-clamp-2">{store.name}</p>
                <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1"><MapPin size={10} />{store.location}</p>
                <span className="text-xs text-green-600 font-semibold mt-1 block">{store.badge}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── App Reviews ────────────────────────────────────────── */}
      <div id="reviews" className="bg-white mt-3 rounded-xl mx-auto max-w-[1200px] px-4 md:px-6 py-8 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-6">Apa Kata Mereka tentang SEAPEDIA?</h2>
        <div className="grid md:grid-cols-[1fr_380px] gap-6">
          <div className="flex flex-col gap-4">
            {loadingReviews ? (
              <p className="text-sm text-gray-400">Memuat ulasan...</p>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada ulasan. Jadilah yang pertama!</p>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="flex gap-4">
                  <Avatar name={review.guestName} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-800">{review.guestName}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">{review.comment}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
          <div className="sticky top-20 h-fit">
            <Card padding="lg">
              <h3 className="text-base font-bold text-gray-800 mb-1">Beri Ulasan</h3>
              <p className="text-xs text-gray-400 mb-5">Bagikan pengalaman belanjamu di SEAPEDIA.</p>
              <AppReviewForm onSuccess={fetchReviews} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
