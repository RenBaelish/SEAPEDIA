import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { formatCurrency } from "../../../lib/format";
import { api } from "../../../lib/api";
import { CartDto, ProductSummary } from '@/types';
import { useConfirm } from "../../../contexts/ConfirmContext";
import { Trash2, Minus, Plus, ShoppingBag, Heart, ShieldCheck, MapPin, Ticket, ChevronRight } from "lucide-react";
import { ProductCard } from "../../../components/shared/ProductCard";

export default function CartPage() {
  const navigate = useNavigate();
  const { showConfirm } = useConfirm();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [recommendations, setRecommendations] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data.data);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await api.get("/products?limit=12");
      setRecommendations(res.data.data);
    } catch (error) {
      console.error("Failed to fetch recommendations", error);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchRecommendations();
  }, []);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await api.patch(`/cart/items/${itemId}`, { quantity: newQuantity });
      await fetchCart();
    } catch (error) {
      console.error("Failed to update quantity", error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      await fetchCart();
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  };

  const handleClearCart = async () => {
    if (!await showConfirm({ title: "Hapus Keranjang", message: "Yakin ingin menghapus semua item dari keranjang?", danger: true })) return;
    try {
      await api.delete("/cart");
      await fetchCart();
    } catch (error) {
      console.error("Failed to clear cart", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen pt-6">
        <div className="page-container max-w-[1200px]">
          <h1 className="text-xl font-bold text-gray-800 mb-4">Keranjang</h1>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-white rounded-xl h-[400px] " />
            <div className="w-full md:w-[320px] bg-white rounded-xl h-[250px] " />
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen pt-6 pb-16">
        <div className="page-container max-w-[1200px]">
          <div className="bg-white rounded-xl p-10 text-center shadow-sm border border-gray-100 mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-50 rounded-full text-gray-300 mb-5">
              <ShoppingBag size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Keranjang belanjamu kosong</h2>
            <p className="text-sm text-gray-500 mb-8">Daripada dianggurin, mending isi dengan barang-barang impianmu. Yuk, cek sekarang!</p>
            <Link to="/" className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-10 h-11 rounded-xl transition-colors">
              Mulai Belanja
            </Link>
          </div>

          {/* Rekomendasi */}
          <h2 className="text-lg font-bold text-gray-800 mb-4">Rekomendasi untukmu</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);

  return (
    <div className="bg-gray-50 min-h-screen pt-6 pb-16">
      <div className="page-container max-w-[1200px]">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Keranjang</h1>
        
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* ─── Kiri: Daftar Produk ──────────────────────────────── */}
          <div className="flex-1 w-full space-y-4">
            
            {/* Header Keranjang */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-green-500 focus:ring-green-500 cursor-pointer" checked readOnly />
                <span className="text-sm font-semibold text-gray-700">Pilih Semua</span>
              </label>
              <button onClick={handleClearCart} className="text-sm font-bold text-green-600 hover:text-green-700">
                Hapus
              </button>
            </div>

            {/* List Toko & Produk */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              
              {/* Header Toko */}
              {cart.store && (
                <div className="flex items-center gap-3 mb-4">
                  <input type="checkbox" className="w-4 h-4 rounded text-green-500 focus:ring-green-500 cursor-pointer" checked readOnly />
                  <ShieldCheck size={18} className="text-green-500" />
                  <Link to={`/store/${(cart.store as any).slug}`} className="text-sm font-bold text-gray-800 hover:text-green-600 transition-colors">
                    {cart.store.name}
                  </Link>
                  <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                    <MapPin size={12} /> Jakarta
                  </span>
                </div>
              )}

              <div className="space-y-6">
                {cart.items.map((item, index) => {
                  const p = item.product;
                  const discountPercent = p.comparePrice
                    ? Math.round(((Number(p.comparePrice) - Number(p.price)) / Number(p.comparePrice)) * 100)
                    : 0;

                  return (
                    <div key={item.id}>
                      {index > 0 && <div className="border-t border-gray-100 mb-4" />}
                      <div className="flex gap-4">
                        <input type="checkbox" className="w-4 h-4 rounded text-green-500 focus:ring-green-500 mt-2 cursor-pointer" checked readOnly />
                        
                        <div className="w-[80px] h-[80px] rounded-lg overflow-hidden border border-gray-100 shrink-0">
                          <img src={p.images?.[0]?.url || "https://placehold.co/80"} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${p.slug}`} className="text-sm text-gray-800 hover:text-green-600 line-clamp-2 leading-snug mb-1">
                            {p.name}
                          </Link>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-base font-bold text-gray-900">{formatCurrency(Number(p.price))}</span>
                            {discountPercent > 0 && (
                              <span className="text-xs text-gray-400 line-through">{formatCurrency(Number(p.comparePrice))}</span>
                            )}
                            {discountPercent > 0 && (
                              <span className="text-xs font-bold text-red-500 bg-red-50 px-1 py-0.5 rounded">{discountPercent}%</span>
                            )}
                          </div>
                          
                          <button className="text-xs text-green-600 font-semibold hover:underline">Tulis catatan</button>
                        </div>
                      </div>

                      {/* Action Bar (Heart, Trash, Qty) */}
                      <div className="flex items-center justify-end gap-5 mt-2">
                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                          <Heart size={18} />
                        </button>
                        <button onClick={() => handleRemoveItem(item.id)} className="text-gray-400 hover:text-gray-600 transition-colors">
                          <Trash2 size={18} />
                        </button>
                        <div className="w-px h-5 bg-gray-200" />
                        <div className="flex items-center border border-gray-200 rounded-lg w-[100px] h-8">
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                          >
                            <Minus size={14} />
                          </button>
                          <input 
                            type="text" 
                            className="w-full h-full text-center text-sm font-bold outline-none border-none text-gray-800" 
                            value={item.quantity} 
                            readOnly
                          />
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-full flex items-center justify-center text-green-600 hover:bg-green-50"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── Kanan: Ringkasan Belanja ─────────────────────────── */}
          <div className="w-full md:w-[320px] shrink-0 sticky top-24 space-y-4">
            
            {/* Promo Box */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:border-green-300 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Ticket size={20} className="text-green-500" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-green-600">Makin hemat pakai promo</span>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-green-600" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Ringkasan belanja</h3>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Total Harga ({cart.items.length} barang)</span>
                <span className="text-sm text-gray-600">{formatCurrency(subtotal)}</span>
              </div>

              <div className="border-t border-gray-100 mb-4" />

              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold text-gray-800">Total Belanja</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>

              <button 
                onClick={() => navigate("/checkout")}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-sm h-11 rounded-xl transition-colors shadow-sm"
              >
                Beli ({cart.items.reduce((sum, item) => sum + item.quantity, 0)})
              </button>
            </div>
          </div>
        </div>

        {/* ─── Rekomendasi untukmu ─────────────────────────────── */}
        <div className="mt-12">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Rekomendasi untukmu</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
