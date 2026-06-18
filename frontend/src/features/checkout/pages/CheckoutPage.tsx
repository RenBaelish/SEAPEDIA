import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../../lib/format";
import { api } from "../../../lib/api";
import { CartDto, WalletDto } from '@/types';
import { Button } from "../../../components/ui/Button";
import { MapPin, Truck, Wallet, Tag } from "lucide-react";

const SHIPPING_OPTIONS = [
  { id: "INSTANT", name: "Instant (3 Jam)", price: 50000, desc: "Tiba hari ini" },
  { id: "NEXT_DAY", name: "Next Day", price: 20000, desc: "Tiba besok" },
  { id: "REGULAR", name: "Reguler", price: 10000, desc: "Tiba 2-3 hari" },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [wallet, setWallet] = useState<WalletDto | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedShipping, setSelectedShipping] = useState<string>("REGULAR");
  const [notes, setNotes] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState("");
  const [discount, setDiscount] = useState(0);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherMsg, setVoucherMsg] = useState({ text: "", type: "" });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartRes, addrRes, walletRes] = await Promise.all([
          api.get("/cart"),
          api.get("/addresses"),
          api.get("/wallet"),
        ]);
        
        setCart(cartRes.data.data);
        setAddresses(addrRes.data.data);
        setWallet(walletRes.data.data);
        
        if (addrRes.data.data.length > 0) {
          const defaultAddr = addrRes.data.data.find((a: any) => a.isDefault) || addrRes.data.data[0];
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (error) {
        console.error("Failed to fetch checkout data", error);
        setErrorMsg("Gagal memuat data checkout.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat checkout...</div>;
  if (!cart || cart.items.length === 0) return <div className="p-8 text-center">Keranjang kosong.</div>;

  const subtotal = cart.items.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
  const shippingFee = SHIPPING_OPTIONS.find(s => s.id === selectedShipping)?.price || 0;
  const ppn = subtotal * 0.12;
  const total = Math.max(0, subtotal + shippingFee + ppn - discount);
  const walletBalance = Number(wallet?.balance || 0);
  const isInsufficient = walletBalance < total;

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    setVoucherMsg({ text: "", type: "" });
    try {
      const res = await api.post("/orders/checkout/validate-voucher", { code: voucherCode });
      setDiscount(res.data.data.discount);
      setAppliedVoucher(voucherCode);
      setVoucherMsg({ text: "Voucher berhasil digunakan!", type: "success" });
    } catch (err: any) {
      setDiscount(0);
      setAppliedVoucher("");
      setVoucherMsg({ text: err.response?.data?.message || "Voucher tidak valid", type: "error" });
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) return setErrorMsg("Pilih alamat pengiriman terlebih dahulu.");
    if (isInsufficient) return setErrorMsg("Saldo dompet tidak mencukupi. Silakan top-up terlebih dahulu.");
    
    setSubmitting(true);
    setErrorMsg("");
    
    try {
      await api.post("/orders/checkout", {
        addressId: selectedAddressId,
        shippingType: selectedShipping,
        voucherCode: appliedVoucher || undefined,
        notes,
      });
      navigate("/orders", { replace: true });
    } catch (error: any) {
      console.error("Checkout failed", error);
      setErrorMsg(error.response?.data?.message || "Gagal melakukan pembayaran.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6 p-6">
      <div className="flex-1 space-y-4">
        {/* Address Selection */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={20} className="text-brand-600" />
            <h2 className="font-bold text-lg text-gray-800">Alamat Pengiriman</h2>
          </div>
          {addresses.length === 0 ? (
            <div className="text-sm text-red-500">Anda belum memiliki alamat. Tambahkan alamat di Profil.</div>
          ) : (
            <div className="space-y-3">
              {addresses.map(addr => (
                <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${selectedAddressId === addr.id ? "border-brand-500 bg-brand-50/50" : "border-gray-200 hover:border-brand-300"}`}>
                  <input 
                    type="radio" 
                    name="address" 
                    value={addr.id} 
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{addr.recipientName}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{addr.label}</span>
                      {addr.isDefault && <span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-600 rounded font-medium">Utama</span>}
                    </div>
                    <p className="text-sm text-gray-800 mt-1">{addr.phone}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{addr.street}, {addr.city}, {addr.province}, {addr.postalCode}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Product List */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-lg text-gray-800 mb-4">Pesanan dari {cart.store?.name}</h2>
          <div className="space-y-4">
            {cart.items.map(item => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                  {item.product.images?.[0]?.url && <img src={item.product.images?.[0]?.url} alt={item.product.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-800">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">{item.quantity} barang x {formatCurrency(Number(item.product.price))}</p>
                </div>
                <div className="font-bold text-gray-800">
                  {formatCurrency(Number(item.product.price) * item.quantity)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan untuk toko (Opsional)</label>
            <input 
              type="text" 
              placeholder="Contoh: Warna merah, ukuran L" 
              value={notes}
              onChange={(e) => setNotes((e.target as any).value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Shipping Method */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={20} className="text-brand-600" />
            <h2 className="font-bold text-lg text-gray-800">Pilih Pengiriman</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SHIPPING_OPTIONS.map(opt => (
              <label key={opt.id} className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-colors ${selectedShipping === opt.id ? "border-brand-500 bg-brand-50/50" : "border-gray-200 hover:border-brand-300"}`}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="shipping" 
                      value={opt.id} 
                      checked={selectedShipping === opt.id}
                      onChange={() => setSelectedShipping(opt.id)}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span className="font-bold text-gray-800 text-sm">{opt.name}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 ml-6 mb-2">{opt.desc}</p>
                <p className="font-bold text-gray-800 ml-6">{formatCurrency(opt.price)}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Voucher Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Tag size={20} className="text-brand-600" />
            <h2 className="font-bold text-lg text-gray-800">Gunakan Promo / Voucher</h2>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Masukkan kode voucher" 
              value={voucherCode}
              onChange={(e) => setVoucherCode((e.target as any).value.toUpperCase())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 uppercase"
            />
            <Button onClick={handleApplyVoucher} disabled={voucherLoading || !voucherCode.trim()} variant="secondary">
              Terapkan
            </Button>
          </div>
          {voucherMsg.text && (
            <p className={`text-sm mt-2 font-medium ${voucherMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
              {voucherMsg.text}
            </p>
          )}
        </div>
      </div>

      {/* Summary Box */}
      <div className="w-full md:w-80">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm sticky top-24">
          <h3 className="font-bold text-gray-800 mb-4">Ringkasan Belanja</h3>
          
          <div className="space-y-2 text-sm mb-4 pb-4 border-b border-gray-100">
            <div className="flex justify-between text-gray-600">
              <span>Total Harga ({cart.items.length} barang)</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Total Ongkos Kirim</span>
              <span>{formatCurrency(shippingFee)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>PPN 12%</span>
              <span>{formatCurrency(ppn)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-brand-600 font-bold">
                <span>Diskon Voucher</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-gray-800">Total Tagihan</span>
            <span className="font-bold text-lg text-brand-600">{formatCurrency(total)}</span>
          </div>

          {/* Payment Method - Wallet */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={18} className="text-brand-600" />
              <span className="font-medium text-gray-800 text-sm">SEAPEDIA Pay</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Saldo Anda</span>
              <span className={`font-bold text-sm ${isInsufficient ? "text-red-500" : "text-gray-800"}`}>
                {formatCurrency(walletBalance)}
              </span>
            </div>
            {isInsufficient && (
              <p className="text-xs text-red-500 mt-2 bg-red-50 p-2 rounded">
                Saldo tidak mencukupi untuk transaksi ini.
              </p>
            )}
          </div>

          {errorMsg && (
            <div className="mb-4 text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
              {errorMsg}
            </div>
          )}

          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleCheckout}
            disabled={submitting || isInsufficient || !selectedAddressId}
          >
            {submitting ? "Memproses..." : "Bayar Sekarang"}
          </Button>
        </div>
      </div>
    </div>
  );
}
