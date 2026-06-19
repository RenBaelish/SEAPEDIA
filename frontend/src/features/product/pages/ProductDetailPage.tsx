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
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMsg, setCartMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductSummary[]>([]);
  const [wishlist, setWishlist] = useState(false);

  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    setCartMsg(null);
    api.get(`/products/${slug}`)
      .then((res) => {
        setProduct(res.data.data);
        setSelectedImg(0);
        // Fetch related products from same category
        api.get(`/products?limit=6`)
          .then(r => setRelatedProducts(r.data.data.filter((p: ProductSummary) => p.slug !== slug).slice(0, 6)))
          .catch(() => {});
      })
      .catch((err) => setError(err.response?.data?.message || "Produk tidak ditemukan."))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async (directBuy = false) => {
    if (!isAuthenticated) return navigate("/auth/login");
    if (user?.activeRole !== "BUYER") {
      setCartMsg({ type: "error", text: "Ubah peran Anda ke Pembeli terlebih dahulu." });
      return;
    }
    setAddingToCart(true);
    setCartMsg(null);
    try {
      await api.post("/cart/items", { productId: product!.id, quantity: qty });
      if (directBuy) {
        navigate("/cart");
      } else {
        setCartMsg({ type: "success", text: "Berhasil ditambahkan ke keranjang!" });
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
          else setCartMsg({ type: "success", text: "Berhasil ditambahkan ke keranjang!" });
        }
      } else {
        setCartMsg({ type: "error", text: err.response?.data?.message || "Gagal menambahkan ke keranjang." });
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
            {/* Skeleton */}
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
    <div className="bg-gray-50 min-h-screen pb-16">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-2">
          <div className="flex items-center gap-2 text-[12px] text-gray-500">
            <Link to="/" className="hover:text-green-600 transition-colors">Beranda</Link>
            <ChevronRight size={12} />
            <Link to={`/search?q=${product.categoryName}`} className="hover:text-green-600 transition-colors">{product.categoryName}</Link>
            <ChevronRight size={12} />
            <span className="text-gray-800 line-clamp-1">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="page-container py-4">

        {/* ─── Main Product Panel ──────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-[380px_1fr_300px] gap-0">

            {/* 1. Image Gallery */}
            <div className="p-5 border-r border-gray-100">
              {/* Main Image */}
              <div className="relative group aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 border border-gray-100">
                <img
                  src={allImages[selectedImg]}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                {discountPercent > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded">
                    {discountPercent}%
                  </div>
                )}
                <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                  <ZoomIn size={16} className="text-gray-600" />
                </button>
                {/* Nav arrows for multiple images */}
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
              {/* Thumbnail row */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(i)}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${selectedImg === i ? "border-green-500" : "border-gray-200 hover:border-gray-400"}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {/* Share / Wishlist */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setWishlist(w => !w)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold border-2 transition-colors flex-1 justify-center ${wishlist ? "border-red-300 text-red-500 bg-red-50" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                >
                  <Heart size={14} className={wishlist ? "fill-red-500" : ""} />
                  Wishlist
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold border-2 border-gray-200 text-gray-500 hover:border-gray-300 flex-1 justify-center">
                  <Share2 size={14} /> Bagikan
                </button>
              </div>
            </div>

            {/* 2. Product Info */}
            <div className="p-6 border-r border-gray-100">
              <h1 className="text-[17px] font-semibold text-gray-800 leading-snug mb-3">
                {product.name}
              </h1>

              {/* Rating row */}
              <div className="flex items-center flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={14} className={i <= Math.round(product.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
                    ))}
                  </div>
                  <span className="text-[13px] font-bold text-gray-800">{(product.rating ?? 0).toFixed(1)}</span>
                  <span className="text-[12px] text-gray-400">Penilaian</span>
                </div>
                <div className="w-px h-4 bg-gray-200" />
                <span className="text-[13px] text-gray-600"><b>{formatSold(product.sold)}</b> terjual</span>
                <div className="w-px h-4 bg-gray-200" />
                <span className="text-[12px] text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded">{product.categoryName}</span>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-[28px] font-semibold text-gray-900 leading-none">
                    {formatCurrency(product.price)}
                  </span>
                  {discountPercent > 0 && (
                    <>
                      <span className="text-[14px] text-gray-400 line-through">{formatCurrency(product.comparePrice!)}</span>
                      <span className="text-[13px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">{discountPercent}% OFF</span>
                    </>
                  )}
                </div>
                {discountPercent > 0 && (
                  <p className="text-[11px] text-gray-400 mt-1">Hemat {formatCurrency(product.comparePrice! - product.price)}</p>
                )}
              </div>

              {/* Shipping info */}
              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-3">
                  <Truck size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-semibold text-gray-700">Pengiriman</p>
                    <p className="text-[12px] text-gray-500">Instant · Same Day · Next Day · Regular</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-semibold text-gray-700">Pengembalian Barang</p>
                    <p className="text-[12px] text-gray-500">Proses pengembalian mudah dalam 7 hari</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-semibold text-gray-700">Garansi Seapedia</p>
                    <p className="text-[12px] text-gray-500">Uang kembali jika produk tidak sesuai</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 my-4" />

              {/* Store card */}
              <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-green-200 transition-colors">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden border border-gray-200">
                  {product.storeLogoUrl ? (
                    <img src={product.storeLogoUrl} alt={product.storeName} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="text-green-500" size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <ShieldCheck size={14} className="text-green-500 flex-shrink-0" />
                    <Link to={`/store/${product.storeSlug}`} className="text-[14px] font-bold text-gray-800 hover:text-green-600 transition-colors truncate">
                      {product.storeName}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <MapPin size={11} />
                    <span>Jakarta, Indonesia</span>
                  </div>
                </div>
                <Link to={`/store/${product.storeSlug}`} className="flex-shrink-0 px-4 py-2 rounded-full border-2 border-green-500 text-green-600 text-[12px] font-semibold hover:bg-green-50 transition-colors">
                  Kunjungi
                </Link>
              </div>

              <div className="border-t border-gray-100 my-4" />

              {/* Description */}
              <div>
                <h3 className="text-[15px] font-bold text-gray-800 mb-3">Deskripsi Produk</h3>
                <div className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </div>
              </div>

              {/* Product details table */}
              <div className="mt-5">
                <h3 className="text-[15px] font-bold text-gray-800 mb-3">Detail Produk</h3>
                <div className="grid grid-cols-2 gap-y-2 text-[13px]">
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

            {/* 3. CTA Panel */}
            <div className="p-5">
              <div className="sticky top-20 space-y-4">
                {/* Cart message banner */}
                {cartMsg && (
                  <div className={`flex items-center gap-2 p-3 rounded-xl text-[12px] font-semibold ${cartMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {cartMsg.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    {cartMsg.text}
                  </div>
                )}

                {/* Quantity selector */}
                <div>
                  <p className="text-[13px] font-semibold text-gray-700 mb-2">Atur jumlah</p>
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
                        className="w-12 h-9 text-center text-[14px] font-bold outline-none border-x border-gray-200"
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
                    <span className="text-[12px] text-gray-400">Stok: <b className="text-gray-700">{product.stock}</b></span>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                  <span className="text-[12px] text-gray-500">Subtotal</span>
                  <span className="text-[16px] font-semibold text-gray-900">{formatCurrency(product.price * qty)}</span>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleAddToCart(false)}
                    disabled={addingToCart || product.stock === 0}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-green-500 text-green-600 font-bold text-[14px] hover:bg-green-50 transition-colors disabled:opacity-50"
                  >
                    <ShoppingCart size={18} />
                    {product.stock === 0 ? "Stok Habis" : "+ Keranjang"}
                  </button>
                  <button
                    onClick={() => handleAddToCart(true)}
                    disabled={addingToCart || product.stock === 0}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-[14px] transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <Zap size={18} />
                    Beli Langsung
                  </button>
                </div>

                {/* Chat seller */}
                <button className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-[13px] hover:bg-gray-50 transition-colors">
                  <MessageCircle size={16} />
                  Chat Penjual
                </button>

                {/* Trust badges */}
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  {[
                    { icon: "", text: "Transaksi 100% aman" },
                    { icon: "", text: "Produk original & bergaransi" },
                    { icon: "", text: "Pengiriman ke seluruh Indonesia" },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span>{b.icon}</span>
                      <span>{b.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Produk Terkait ──────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm mt-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-gray-900">Pilihan Lainnya Untukmu</h2>
              <Link to="/search" className="text-[13px] text-green-600 font-semibold flex items-center gap-1 hover:underline">
                Lihat Semua <ChevronRight size={14} />
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
