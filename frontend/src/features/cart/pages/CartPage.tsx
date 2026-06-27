import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { formatCurrency } from "../../../lib/format";
import { api } from "../../../lib/api";
import { CartDto, ProductSummary } from '@/types';
import { useConfirm } from "../../../contexts/ConfirmContext";
import { Trash2, Minus, Plus, ShoppingBag, ShieldCheck, MapPin, Ticket, ChevronRight, ArrowRight, X } from "lucide-react";
import { ProductCard } from "../../../components/shared/ProductCard";

export default function CartPage() {
  const navigate = useNavigate();
  const { showConfirm } = useConfirm();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [recommendations, setRecommendations] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoInput, setPromoInput] = useState("");

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data.data);
      if (res.data.data.items) {
        setSelectedItems(res.data.data.items.map((i: any) => i.id));
      }
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

  const handleSelectAll = (checked: boolean) => {
    if (checked && cart) {
      setSelectedItems(cart.items.map(i => i.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(i => i !== id));
    }
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.toUpperCase() === "SEAPEDIA10") {
      setPromoCode("SEAPEDIA10");
      setDiscountPercent(10);
      setIsPromoModalOpen(false);
    } else {
      showConfirm({ title: "Promo Tidak Valid", message: "Kode promo yang Anda masukkan tidak valid. Coba 'SEAPEDIA10'.", confirmText: "Tutup", hideCancel: true });
    }
  };

  if (loading) {
    return (
      <div className="bg-[#F7F5F0] min-h-screen pt-6">
        <div className="page-container">
          <div className="h-8 w-48 skeleton mb-5" />
          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex-1 skeleton h-[400px] border-3 border-nb-black" style={{ borderWidth: '3px' }} />
            <div className="w-full md:w-[300px] skeleton h-[250px] border-3 border-nb-black" style={{ borderWidth: '3px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-[#F7F5F0] min-h-screen pt-6 pb-16">
        <div className="page-container">
          {}
          <div className="bg-white border-4 border-nb-black shadow-[6px_6px_0px_#0A0A0A] p-10 text-center mb-8">
            <img
              src="/icon/ilustrasi-keranjang-kosong-icon.png"
              alt="Keranjang Kosong"
              className="w-36 h-36 mx-auto object-contain mb-5"
            />
            <h2 className="text-xl font-extrabold text-nb-black mb-2">Keranjang Masih Kosong</h2>
            <p className="text-sm text-gray-500 font-medium mb-6 max-w-xs mx-auto">
              Temukan produk incaanmu dan tambahkan ke keranjang!
            </p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-8 py-3 border-3 border-nb-black bg-nb-yellow font-extrabold text-sm shadow-[4px_4px_0px_#0A0A0A] hover:shadow-[5px_5px_0px_#0A0A0A] hover:-translate-x-px hover:-translate-y-px transition-all"
              style={{ borderWidth: '3px' }}
            >
              Mulai Belanja <ArrowRight size={16} strokeWidth={3} />
            </Link>
          </div>

          {}
          <h2 className="text-base font-extrabold text-nb-black nb-section-title mb-4">Rekomendasi untukmu</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedCartItems = cart.items.filter(item => selectedItems.includes(item.id));
  const subtotal = selectedCartItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
  const discountAmount = Math.floor(subtotal * (discountPercent / 100));
  const total = subtotal - discountAmount;

  return (
    <div className="bg-[#F7F5F0] min-h-screen pt-6 pb-16">
      <div className="page-container">
        <h1 className="text-xl font-extrabold text-nb-black mb-5 nb-section-title">Keranjang Belanja</h1>

        <div className="flex flex-col md:flex-row gap-5 items-start">

          {}
          <div className="flex-1 w-full space-y-3">

            {}
            <div className="bg-white border-3 border-nb-black p-3 flex items-center justify-between"
              style={{ borderWidth: '3px' }}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 cursor-pointer accent-nb-black" 
                  checked={cart.items.length > 0 && selectedItems.length === cart.items.length} 
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span className="text-sm font-bold text-nb-black">Pilih Semua</span>
              </label>
              <button
                onClick={handleClearCart}
                className="text-sm font-bold text-nb-red hover:underline"
              >
                Hapus Semua
              </button>
            </div>

            {}
            <div className="bg-white border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-5"
              style={{ borderWidth: '3px' }}>

              {cart.store && (
                <div className="flex items-center gap-3 pb-4 mb-4 border-b-2 border-gray-100">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 cursor-pointer accent-nb-black" 
                    checked={cart.items.length > 0 && selectedItems.length === cart.items.length} 
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  <img src="/icon/kategori-toko-verify-icon.png" alt="verified" className="w-5 h-5 object-contain" />
                  <Link to={`/store/${(cart.store as any).slug}`} className="text-sm font-extrabold text-nb-black hover:text-nb-blue transition-colors">
                    {cart.store.name}
                  </Link>
                  <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                    <MapPin size={12} /> Jakarta
                  </span>
                </div>
              )}

              <div className="space-y-5">
                {cart.items.map((item, index) => {
                  const p = item.product;
                  const discountPercent = p.comparePrice
                    ? Math.round(((Number(p.comparePrice) - Number(p.price)) / Number(p.comparePrice)) * 100)
                    : 0;

                  return (
                    <div key={item.id}>
                      {index > 0 && <div className="border-t-2 border-gray-100 mb-5" />}
                      <div className="flex gap-4">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 mt-2 cursor-pointer accent-nb-black flex-shrink-0" 
                          checked={selectedItems.includes(item.id)} 
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        />

                        <div className="w-20 h-20 border-2 border-nb-black overflow-hidden shrink-0">
                          <img src={typeof p.images?.[0] === 'string' ? p.images[0] : p.images?.[0]?.url || "https://placehold.co/80"} alt={p.name} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${p.slug}`} className="text-sm font-semibold text-nb-black hover:text-nb-blue line-clamp-2 leading-snug mb-1.5">
                            {p.name}
                          </Link>

                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-base font-extrabold text-nb-black">{formatCurrency(Number(p.price))}</span>
                            {discountPercent > 0 && (
                              <>
                                <span className="text-xs text-gray-400 line-through">{formatCurrency(Number(p.comparePrice))}</span>
                                <span className="text-xs font-bold text-nb-red border border-nb-red px-1">-{discountPercent}%</span>
                              </>
                            )}
                          </div>

                          {}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border-2 border-nb-black overflow-hidden">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center hover:bg-nb-yellow disabled:opacity-30 font-bold transition-colors"
                              >
                                <Minus size={14} strokeWidth={3} />
                              </button>
                              <span className="w-10 h-8 flex items-center justify-center text-sm font-extrabold border-x-2 border-nb-black">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-nb-yellow font-bold transition-colors"
                              >
                                <Plus size={14} strokeWidth={3} />
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-2 border-2 border-gray-200 text-gray-400 hover:border-nb-red hover:text-nb-red hover:bg-red-50 transition-all"
                            >
                              <Trash2 size={16} strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {}
          <div className="w-full md:w-[300px] shrink-0 sticky top-24 space-y-3">

            {}
            <div 
              onClick={() => setIsPromoModalOpen(true)}
              className="bg-white border-3 border-nb-black p-4 flex items-center justify-between cursor-pointer hover:bg-nb-yellow transition-colors"
              style={{ borderWidth: '3px' }}>
              <div className="flex items-center gap-3">
                <Ticket size={18} strokeWidth={2.5} className={promoCode ? "text-nb-green" : "text-nb-black"} />
                <span className={`text-sm font-bold ${promoCode ? "text-nb-green" : "text-nb-black"}`}>
                  {promoCode ? `Promo Terpakai: ${promoCode}` : "Gunakan Promo"}
                </span>
              </div>
              <ChevronRight size={16} strokeWidth={3} className={promoCode ? "text-nb-green" : "text-nb-black"} />
            </div>

            {}
            {isPromoModalOpen && (
              <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
                <div className="bg-white border-4 border-nb-black shadow-[8px_8px_0px_#0A0A0A] w-full max-w-[400px]">
                  <div className="flex items-center justify-between p-4 border-b-4 border-nb-black">
                    <h3 className="font-extrabold text-nb-black uppercase tracking-wide">Punya Kode Promo?</h3>
                    <button onClick={() => setIsPromoModalOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-nb-yellow border-2 border-transparent hover:border-nb-black transition-colors text-nb-black">
                      <X size={20} strokeWidth={3} />
                    </button>
                  </div>
                  <form onSubmit={handleApplyPromo} className="p-6">
                    <div className="mb-6">
                      <input 
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput((e.target as any).value.toUpperCase())}
                        placeholder="Masukkan kode promo (Coba: SEAPEDIA10)"
                        className="w-full h-12 px-4 border-3 border-nb-black bg-white outline-none focus:bg-nb-yellow text-sm font-bold text-nb-black uppercase transition-colors"
                        style={{ borderWidth: '3px' }}
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={!promoInput.trim()}
                      className="btn-primary w-full justify-center disabled:opacity-50"
                    >
                      Terapkan Promo
                    </button>
                  </form>
                </div>
              </div>
            )}

            {}
            <div className="bg-white border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-5"
              style={{ borderWidth: '3px' }}>
              <h3 className="text-sm font-extrabold text-nb-black mb-4 pb-3 border-b-2 border-gray-100">Ringkasan Belanja</h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total ({selectedCartItems.length} barang)</span>
                  <span className="font-semibold text-nb-black">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-nb-green font-bold">Diskon ({discountPercent}%)</span>
                    <span className="font-bold text-nb-green">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-nb-black pt-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-nb-black">Total Belanja</span>
                  <span className="text-lg font-extrabold text-nb-black">{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                disabled={selectedCartItems.length === 0}
                onClick={() => navigate("/checkout", { state: { promoCode } })}
                className="w-full flex items-center justify-center gap-2 py-3 border-3 border-nb-black bg-nb-black text-white font-extrabold text-sm shadow-[4px_4px_0px_#FFE600] hover:shadow-[5px_5px_0px_#FFE600] hover:-translate-x-px hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderWidth: '3px' }}
              >
                Beli ({selectedCartItems.reduce((sum, item) => sum + item.quantity, 0)}) <ArrowRight size={16} strokeWidth={3} />
              </button>
            </div>

            {}
            <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
              <ShieldCheck size={14} className="text-green-500 shrink-0" />
              <span>Belanja aman & terpercaya bersama SEAPEDIA</span>
            </div>
          </div>
        </div>

        {}
        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-base font-extrabold text-nb-black nb-section-title mb-4">Rekomendasi untukmu</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {recommendations.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
