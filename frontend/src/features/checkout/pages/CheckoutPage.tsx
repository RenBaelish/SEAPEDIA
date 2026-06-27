import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { formatCurrency } from "../../../lib/format";
import { api } from "../../../lib/api";
import { CartDto, WalletDto } from '@/types';
import { MapPin, Truck, Wallet, Tag, ArrowRight } from "lucide-react";

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

  const location = useLocation();
  useEffect(() => {
    if (location.state?.promoCode && !appliedVoucher && !loading) {
      setVoucherCode(location.state.promoCode);
    }
  }, [location.state, loading]);

  if (loading) {
    return (
      <div className="bg-[#F7F5F0] min-h-screen pt-6">
        <div className="page-container">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 skeleton h-[500px] border-3 border-nb-black" style={{ borderWidth: '3px' }} />
            <div className="w-full md:w-80 skeleton h-[300px] border-3 border-nb-black" style={{ borderWidth: '3px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-[#F7F5F0] min-h-screen pt-8 pb-16">
        <div className="page-container max-w-4xl text-center">
          <div className="bg-white border-4 border-nb-black shadow-[6px_6px_0px_#0A0A0A] p-10">
            <h2 className="text-xl font-extrabold text-nb-black mb-2">Keranjang Kosong</h2>
            <p className="text-sm text-gray-600 font-medium mb-6">Tidak ada pesanan yang dapat dicheckout.</p>
            <button onClick={() => navigate("/")} className="btn-primary">Kembali Berbelanja</button>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="bg-[#F7F5F0] min-h-screen pt-6 pb-16">
      <div className="page-container max-w-5xl">
        <h1 className="text-xl font-extrabold text-nb-black nb-section-title mb-5">Checkout</h1>

        <div className="flex flex-col md:flex-row gap-5">
          <div className="flex-1 space-y-5">
            {}
            <div className="bg-white border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-5" style={{ borderWidth: '3px' }}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-100">
                <div className="w-8 h-8 bg-nb-yellow border-2 border-nb-black flex items-center justify-center">
                  <MapPin size={16} className="text-nb-black" strokeWidth={2.5} />
                </div>
                <h2 className="font-extrabold text-base text-nb-black">Alamat Pengiriman</h2>
              </div>
              {addresses.length === 0 ? (
                <div className="text-sm font-bold text-nb-red border-2 border-nb-red bg-red-50 p-4">Anda belum memiliki alamat. Tambahkan alamat di Profil.</div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <label key={addr.id} className={`flex items-start gap-3 p-4 border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? "border-nb-black bg-nb-yellow shadow-[2px_2px_0px_#0A0A0A]" : "border-gray-200 hover:border-nb-black"}`}>
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 accent-nb-black"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-nb-black">{addr.recipientName}</span>
                          <span className="text-xs font-bold px-2 py-0.5 border border-nb-black bg-white">{addr.label}</span>
                          {addr.isDefault && <span className="text-xs font-bold px-2 py-0.5 border border-nb-black bg-nb-black text-white">Utama</span>}
                        </div>
                        <p className="text-sm text-nb-black font-semibold mt-1">{addr.phone}</p>
                        <p className="text-sm text-gray-700 font-medium line-clamp-2 mt-0.5">{addr.street}, {addr.city}, {addr.province}, {addr.postalCode}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {}
            <div className="bg-white border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-5" style={{ borderWidth: '3px' }}>
              <h2 className="font-extrabold text-base text-nb-black mb-4 pb-3 border-b-2 border-gray-100 flex items-center gap-2">
                Pesanan dari <span className="text-nb-blue">{cart.store?.name}</span>
              </h2>
              <div className="space-y-4">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b-2 border-gray-100 last:border-0 last:pb-0">
                    <div className="w-16 h-16 border-2 border-nb-black bg-gray-50 overflow-hidden shrink-0">
                      {item.product.images?.[0] && <img src={typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0]?.url} alt={item.product.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-extrabold text-nb-black leading-snug">{item.product.name}</h3>
                      <p className="text-sm text-gray-600 font-semibold mt-0.5">{item.quantity} barang x {formatCurrency(Number(item.product.price))}</p>
                    </div>
                    <div className="font-extrabold text-nb-black">
                      {formatCurrency(Number(item.product.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t-2 border-gray-100">
                <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-2">Catatan untuk toko (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Warna merah, ukuran L"
                  value={notes}
                  onChange={(e) => setNotes((e.target as any).value)}
                  className="nb-input"
                />
              </div>
            </div>

            {}
            <div className="bg-white border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-5" style={{ borderWidth: '3px' }}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-100">
                <div className="w-8 h-8 bg-nb-blue border-2 border-nb-black flex items-center justify-center">
                  <Truck size={16} className="text-white" strokeWidth={2.5} />
                </div>
                <h2 className="font-extrabold text-base text-nb-black">Pilih Pengiriman</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SHIPPING_OPTIONS.map(opt => (
                  <label key={opt.id} className={`flex flex-col p-4 border-2 cursor-pointer transition-all ${selectedShipping === opt.id ? "border-nb-black bg-[#EBF5FF] shadow-[2px_2px_0px_#0A0A0A]" : "border-gray-200 hover:border-nb-black"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        name="shipping"
                        value={opt.id}
                        checked={selectedShipping === opt.id}
                        onChange={() => setSelectedShipping(opt.id)}
                        className="accent-nb-black"
                      />
                      <span className="font-extrabold text-nb-black text-sm">{opt.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium ml-5 mb-2">{opt.desc}</p>
                    <p className="font-extrabold text-nb-blue ml-5">{formatCurrency(opt.price)}</p>
                  </label>
                ))}
              </div>
            </div>

            {}
            <div className="bg-white border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-5" style={{ borderWidth: '3px' }}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-100">
                <div className="w-8 h-8 bg-nb-green border-2 border-nb-black flex items-center justify-center">
                  <Tag size={16} className="text-white" strokeWidth={2.5} />
                </div>
                <h2 className="font-extrabold text-base text-nb-black">Gunakan Promo / Voucher</h2>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Masukkan kode voucher"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode((e.target as any).value.toUpperCase())}
                  className="nb-input uppercase flex-1"
                />
                <button
                  onClick={handleApplyVoucher}
                  disabled={voucherLoading || !voucherCode.trim()}
                  className="btn-secondary h-11 px-5"
                >
                  Terapkan
                </button>
              </div>
              {voucherMsg.text && (
                <div className={`mt-3 p-3 border-2 text-sm font-bold ${voucherMsg.type === 'error' ? 'bg-red-50 border-nb-red text-nb-red' : 'bg-green-50 border-nb-green text-nb-green'}`}>
                  {voucherMsg.text}
                </div>
              )}
            </div>
          </div>

          {}
          <div className="w-full md:w-80 shrink-0">
            <div className="bg-white border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-5 sticky top-24" style={{ borderWidth: '3px' }}>
              <h3 className="font-extrabold text-base text-nb-black mb-4 pb-3 border-b-2 border-gray-100">Ringkasan Belanja</h3>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-gray-700 font-semibold">
                  <span>Total Harga ({cart.items.length} brg)</span>
                  <span className="text-nb-black">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700 font-semibold">
                  <span>Total Ongkos Kirim</span>
                  <span className="text-nb-black">{formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-gray-700 font-semibold">
                  <span>PPN 12%</span>
                  <span className="text-nb-black">{formatCurrency(ppn)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-nb-red font-extrabold">
                    <span>Diskon Voucher</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-nb-black pt-4 mb-5">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-nb-black">Total Tagihan</span>
                  <span className="font-extrabold text-xl text-nb-blue">{formatCurrency(total)}</span>
                </div>
              </div>

              {}
              <div className="bg-nb-yellow border-2 border-nb-black p-4 mb-5 shadow-[2px_2px_0px_#0A0A0A]">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet size={16} className="text-nb-black" strokeWidth={2.5} />
                  <span className="font-extrabold text-nb-black text-sm">SEAPEDIA Pay</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-800">Saldo Anda</span>
                  <span className={`font-extrabold text-sm ${isInsufficient ? "text-nb-red" : "text-nb-black"}`}>
                    {formatCurrency(walletBalance)}
                  </span>
                </div>
                {isInsufficient && (
                  <div className="text-xs font-bold text-nb-red mt-2 bg-white border border-nb-red p-2 text-center">
                    Saldo tidak mencukupi.
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="mb-4 text-sm font-bold text-nb-red border-2 border-nb-red bg-red-50 p-3">
                  {errorMsg}
                </div>
              )}

              <button
                className="w-full flex items-center justify-center gap-2 h-12 border-3 border-nb-black bg-nb-black text-white font-extrabold text-sm shadow-[4px_4px_0px_#FFE600] hover:shadow-[5px_5px_0px_#FFE600] hover:-translate-x-px hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                style={{ borderWidth: '3px' }}
                onClick={handleCheckout}
                disabled={submitting || isInsufficient || !selectedAddressId}
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Bayar Sekarang <ArrowRight size={16} strokeWidth={3} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
