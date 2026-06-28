import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star, ShieldCheck, MapPin, ChevronRight, Truck, RotateCcw,
  Shield, Heart, Share2, MessageCircle, ShoppingCart, Zap,
  ChevronLeft, ZoomIn, CheckCircle, AlertTriangle
} from "lucide-react";
import { api } from "../../../lib/api";
import { formatCurrency } from "../../../lib/format";
import { ProductDetail, ProductSummary } from '@/types';
import { Button } from "../../../components/ui/Button";
import { useAuthStore } from "../../../store/auth.store";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { useAlert } from "../../../contexts/AlertContext";
import { ProductCard } from "../../../components/shared/ProductCard";

function formatSold(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}jt+`;
  if (n >= 1000) return `${Math.floor(n / 1000)}rb+`;
  if (n >= 100) return `${Math.floor(n / 100) * 100}+`;
  return `${n}`;
}

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { showConfirm } = useConfirm();
  const { showAlert } = useAlert();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<ProductSummary[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState(false);

  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`)
      .then((res) => {
        setProduct(res.data.data);
        setSelectedImg(0);
        api.get(`/products?limit=6`)
          .then(r => setRelatedProducts(r.data.data.filter((p: ProductSummary) => p.slug !== slug).slice(0, 6)))
          .catch(() => {});
        api.get(`/reviews/product/${res.data.data.id}`)
          .then(r => setReviews(r.data.data))
          .catch(() => {});
      })
      .catch((err) => setError(err.response?.data?.message || "Produk tidak ditemukan."))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async (directBuy = false) => {
    if (!isAuthenticated) return navigate("/auth/login");
    if (user?.activeRole !== "BUYER") {
      showAlert({ title: "Akses Ditolak", message: "Ubah peran Anda ke Pembeli terlebih dahulu." });
      return;
    }
    setAddingToCart(true);
    try {
      await api.post("/cart/items", { productId: product!.id, quantity: qty });
      if (directBuy) {
        navigate("/cart");
      } else {
        showAlert({ title: "Berhasil", message: "Berhasil ditambahkan ke keranjang!" });
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        const ok = await showConfirm({
          title: "Ganti Keranjang?",
          message: err.response.data.message + "\n\nApakah Anda ingin mengosongkan keranjang dan menambahkan produk ini?",
          confirmText: "Ya, Ganti"
        });
        if (ok) {
          await api.delete("/cart");
          await api.post("/cart/items", { productId: product!.id, quantity: qty });
          if (directBuy) navigate("/cart");
          else showAlert({ title: "Berhasil", message: "Berhasil ditambahkan ke keranjang!" });
        }
      } else {
        showAlert({ title: "Gagal", message: err.response?.data?.message || "Gagal menambahkan ke keranjang." });
      }
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="page-container py-8">
          <div className="grid md:grid-cols-[420px_1fr_300px] gap-6">
            {}
            <div className="bg-white rounded-xl h-[420px] " />
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded  w-3/4" />
              <div className="h-4 bg-gray-200 rounded  w-1/3" />
              <div className="h-10 bg-gray-200 rounded  w-1/2" />
            </div>
            <div className="bg-white rounded-xl h-[300px] " />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-container py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Produk Tidak Ditemukan</h1>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const discountPercent = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const allImages = product.images && product.images.length > 0
    ? product.images
    : ["https://placehold.co/800x800/f3f4f6/9ca3af?text=No+Image"];

  return (
    <div className="bg-[#F7F5F0] min-h-screen pb-16">

      {}
      <div className="bg-white border-b-4 border-nb-black">
        <div className="page-container py-2.5">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <Link to="/" className="hover:text-nb-black transition-colors font-bold">Beranda</Link>
            <ChevronRight size={12} strokeWidth={3} />
            <Link to={`/search?q=${product.categoryName}`} className="hover:text-nb-black transition-colors">{product.categoryName}</Link>
            <ChevronRight size={12} strokeWidth={3} />
            <span className="text-nb-black font-bold line-clamp-1">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="page-container py-4">

        {}
        <div className="bg-white border-4 border-nb-black shadow-[6px_6px_0px_#0A0A0A] overflow-hidden">
          <div className="flex flex-col lg:grid lg:grid-cols-[340px_1fr_280px] xl:grid-cols-[380px_1fr_300px] gap-0">

            {}
            <div className="p-5 border-b-2 lg:border-b-0 lg:border-r-2 border-nb-black">
              {}
              <div className="relative group aspect-square bg-gray-50 overflow-hidden mb-3 border-2 border-nb-black">
                <img
                  src={allImages[selectedImg]}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/800x800/f3f4f6/9ca3af?text=No+Image";
                    e.currentTarget.onerror = null;
                  }}
                />
                {discountPercent > 0 && (
                  <div className="absolute top-0 left-0 bg-nb-red text-white text-xs font-extrabold px-2 py-1 border-r-2 border-b-2 border-nb-black">
                    -{discountPercent}%
                  </div>
                )}
                <button className="absolute top-3 right-3 w-8 h-8 bg-white border-2 border-nb-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn size={16} className="text-nb-black" />
                </button>
                {}
                {allImages.length > 1 && (
                  <>
                    <button onClick={() => setSelectedImg(i => Math.max(0, i - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setSelectedImg(i => Math.min(allImages.length - 1, i + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>
              {}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(i)}
                      className={`flex-shrink-0 w-14 h-14 overflow-hidden border-2 transition-all ${
                        selectedImg === i ? "border-nb-black shadow-[2px_2px_0px_#0A0A0A]" : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img 
                        src={img} 
                        alt="" 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/800x800/f3f4f6/9ca3af?text=No+Image";
                          e.currentTarget.onerror = null;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
              {}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setWishlist(w => !w)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-2 transition-colors flex-1 justify-center ${
                    wishlist ? "border-nb-red text-nb-red bg-red-50" : "border-gray-300 text-gray-600 hover:border-nb-black"
                  }`}
                >
                  <Heart size={14} className={wishlist ? "fill-nb-red" : ""} />
                  Wishlist
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold border-2 border-gray-300 text-gray-600 hover:border-nb-black transition-colors flex-1 justify-center">
                  <Share2 size={14} /> Bagikan
                </button>
              </div>
            </div>

            {}
            <div className="p-5 lg:p-6 border-b-2 lg:border-b-0 lg:border-r-2 border-nb-black overflow-hidden">
              <h1 className="text-lg font-extrabold text-nb-black leading-snug mb-3 break-words">
                {product.name}
              </h1>

              {}
              <div className="flex items-center flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={14} className={i <= Math.round(product.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
                    ))}
                  </div>
                  <span className="text-sm font-extrabold text-nb-black">{(product.rating ?? 0).toFixed(1)}</span>
                  <span className="text-xs text-gray-400">Penilaian</span>
                </div>
                <div className="w-px h-4 bg-gray-200" />
                <span className="text-sm text-gray-600"><b>{formatSold(product.sold)}</b> terjual</span>
                <div className="w-px h-4 bg-gray-200" />
                <span className="text-xs font-bold text-nb-black bg-nb-yellow px-2 py-0.5 border border-nb-black">{product.categoryName}</span>
              </div>

              {}
              <div className="bg-white border-2 border-nb-black p-4 mb-5 shadow-[4px_4px_0px_#0A0A0A]">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-extrabold text-nb-black leading-none">
                    {formatCurrency(product.price)}
                  </span>
                  {discountPercent > 0 && (
                    <>
                      <span className="text-sm text-gray-500 line-through">{formatCurrency(product.comparePrice!)}</span>
                      <span className="text-sm font-extrabold text-nb-red bg-white px-2 py-0.5 border border-nb-red">{discountPercent}% OFF</span>
                    </>
                  )}
                </div>
                {discountPercent > 0 && (
                  <p className="text-xs text-gray-700 mt-1 font-bold">Hemat {formatCurrency(product.comparePrice! - product.price)}</p>
                )}
              </div>

              {}
              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-3">
                  <Truck size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Pengiriman</p>
                    <p className="text-xs text-gray-500">Instant · Same Day · Next Day · Regular</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Pengembalian Barang</p>
                    <p className="text-xs text-gray-500">Proses pengembalian mudah dalam 7 hari</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Garansi Seapedia</p>
                    <p className="text-xs text-gray-500">Uang kembali jika produk tidak sesuai</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 my-4" />

              {}
              <div className="flex items-center gap-3 p-4 border-2 border-gray-200 hover:border-nb-black transition-colors">
                <div className="w-12 h-12 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden border-2 border-nb-black bg-nb-yellow">
                  {product.storeLogoUrl ? (
                    <img src={product.storeLogoUrl} alt={product.storeName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-extrabold text-nb-black">{product.storeName?.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <img src="/icon/verify-icon.png" alt="verified" className="w-3.5 h-3.5 object-contain" />
                    <Link to={`/store/${product.storeSlug}`} className="text-sm font-extrabold text-nb-black hover:text-nb-blue transition-colors truncate">
                      {product.storeName}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star size={11} className="fill-nb-yellow text-nb-yellow" />
                      <span className="font-bold text-nb-black">{(product.storeRating || 0).toFixed(1)}</span>
                    </div>
                    <span>•</span>
                    <span className="font-bold text-nb-black">{formatSold(product.storeTotalSales || 0)} Terjual</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin size={11} />
                      <span>Jakarta</span>
                    </div>
                  </div>
                </div>
                <Link to={`/store/${product.storeSlug}`} className="flex-shrink-0 px-4 py-2 border-2 border-nb-black bg-white text-xs font-bold hover:bg-nb-yellow transition-colors">
                  Kunjungi
                </Link>
              </div>

              <div className="border-t border-gray-100 my-4" />

              {}
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-3">Deskripsi Produk</h3>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </div>
              </div>

              {}
              <div className="mt-5 overflow-hidden">
                <h3 className="text-base font-bold text-gray-800 mb-3">Detail Produk</h3>
                <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-sm break-words">
                  {[
                    { label: "Kondisi", value: "Baru" },
                    { label: "Berat Satuan", value: `${product.weight}g` },
                    { label: "Kategori", value: product.categoryName },
                    { label: "Stok", value: product.stock > 0 ? `${product.stock} tersedia` : "Habis" },
                  ].map(row => (
                    <div key={row.label} className="contents">
                      <span className="text-gray-400">{row.label}</span>
                      <span className="text-gray-700 font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {}
            <div className="p-5">
              <div className="sticky top-20 space-y-4">
                {}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Atur jumlah</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                      <button
                        className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 text-lg font-bold transition-colors"
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        disabled={qty <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="w-12 h-9 text-center text-sm font-bold outline-none border-x border-gray-200"
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Math.min(product.stock, parseInt((e.target as any).value) || 1)))}
                      />
                      <button
                        className="w-9 h-9 flex items-center justify-center text-green-600 hover:bg-green-50 disabled:opacity-30 text-lg font-bold transition-colors"
                        onClick={() => setQty(Math.min(product.stock, qty + 1))}
                        disabled={qty >= product.stock}
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-gray-400">Stok: <b className="text-gray-700">{product.stock}</b></span>
                  </div>
                </div>

                {}
                <div className="flex items-center justify-between bg-white border-2 border-nb-black p-3 mb-4 shadow-[2px_2px_0px_#0A0A0A]">
                  <span className="text-xs font-bold text-nb-black uppercase">Subtotal</span>
                  <span className="text-base font-black text-nb-black truncate max-w-[140px] text-right">{formatCurrency(product.price * qty)}</span>
                </div>

                {}
                <div className="space-y-2">
                  <button
                    onClick={() => handleAddToCart(false)}
                    disabled={addingToCart || product.stock === 0}
                    className="w-full flex items-center justify-center gap-2 h-11 border-3 border-nb-black bg-white text-nb-black font-extrabold text-sm hover:bg-nb-yellow transition-colors disabled:opacity-50"
                    style={{ borderWidth: '3px' }}
                  >
                    <ShoppingCart size={18} strokeWidth={2.5} />
                    {product.stock === 0 ? "Stok Habis" : "+ Keranjang"}
                  </button>
                  <button
                    onClick={() => handleAddToCart(true)}
                    disabled={addingToCart || product.stock === 0}
                    className="w-full flex items-center justify-center gap-2 h-11 border-3 border-nb-black bg-nb-black text-white font-extrabold text-sm shadow-[4px_4px_0px_#FFE600] hover:shadow-[5px_5px_0px_#FFE600] hover:-translate-x-px hover:-translate-y-px transition-all disabled:opacity-50 disabled:shadow-none disabled:transform-none"
                    style={{ borderWidth: '3px' }}
                  >
                    <Zap size={18} strokeWidth={2.5} />
                    Beli Langsung
                  </button>
                </div>

                {}
                <button 
                  onClick={() => showConfirm({ title: 'Fitur Belum Tersedia', message: 'Fitur Chat Penjual belum tersedia pada versi ini.', confirmText: 'Tutup', hideCancel: true })}
                  className="w-full mt-3 flex items-center justify-center gap-2 h-11 border-3 border-nb-black bg-white text-nb-black font-extrabold text-sm hover:bg-nb-yellow transition-colors"
                  style={{ borderWidth: '3px' }}
                >
                  <MessageCircle size={18} strokeWidth={2.5} />
                  Chat Penjual
                </button>

                {}
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  {[
                    { icon: "", text: "Transaksi 100% aman" },
                    { icon: "", text: "Produk original & bergaransi" },
                    { icon: "", text: "Pengiriman ke seluruh Indonesia" },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{b.icon}</span>
                      <span>{b.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ulasan Pembeli */}
        <div className="bg-white border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] mt-4 p-6" style={{ borderWidth: '3px' }}>
          <h2 className="text-base font-extrabold text-nb-black nb-section-title mb-5">Ulasan Pembeli ({reviews.length})</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="pb-4 border-b-2 border-gray-100 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={r.user?.profilePictureUrl || "https://i.pinimg.com/736x/22/87/85/2287856db3ec37b4d0d3fd0ffd99930a.jpg"} alt={r.user?.fullName} className="w-8 h-8 rounded-full border border-gray-200" />
                    <div>
                      <p className="text-sm font-bold text-nb-black leading-tight">{r.user?.fullName}</p>
                      <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} className={star <= r.rating ? "fill-nb-yellow text-nb-yellow" : "text-gray-200"} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700">{r.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 font-medium">Belum ada ulasan untuk produk ini.</p>
          )}
        </div>

        {relatedProducts.length > 0 && (
          <div className="bg-white border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] mt-4 p-6" style={{ borderWidth: '3px' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-extrabold text-nb-black nb-section-title">Produk Lainnya</h2>
              <Link to="/search" className="flex items-center gap-1 text-xs font-bold text-nb-black border-2 border-nb-black px-3 py-1.5 hover:bg-nb-yellow transition-colors">
                Lihat Semua <ChevronRight size={12} strokeWidth={3} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
