import { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import { formatCurrency } from "../../../lib/format";
import { api } from "../../../lib/api";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { useAlert } from "../../../contexts/AlertContext";
import { Package, MapPin, ArrowLeft } from "lucide-react";

const ORDER_STATUS_LABELS: Record<string, string> = {
  SEDANG_DIKEMAS: "Sedang Dikemas",
  MENUNGGU_PENGIRIM: "Menunggu Kurir",
  SEDANG_DIKIRIM: "Sedang Dikirim",
  PESANAN_SELESAI: "Pesanan Selesai",
  DIKEMBALIKAN: "Dikembalikan",
  PENDING: "Menunggu Pembayaran",
  PAID: "Sudah Dibayar",
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const { showConfirm } = useConfirm();
  const { showAlert } = useAlert();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  const handleComplete = async () => {
    if (!await showConfirm({ title: "Selesaikan Pesanan", message: "Apakah Anda yakin telah menerima pesanan dengan baik dan ingin menyelesaikannya?" })) return;
    try {
      await api.put(`/orders/${id}/status`, { status: "PESANAN_SELESAI" });
      await showAlert({ title: "Berhasil", message: "Pesanan berhasil diselesaikan!" });
      window.location.reload();
    } catch (e: any) {
      showAlert({ title: "Gagal", message: "Gagal menyelesaikan pesanan: " + (e.response?.data?.message || "Kesalahan server") });
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-gray-500">Memuat rincian pesanan...</div>;
  if (!order) return <div className="p-8 text-center font-bold text-gray-500">Pesanan tidak ditemukan.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Link to="/orders" className="text-nb-black hover:text-nb-blue flex items-center gap-1 text-sm font-extrabold mb-4 transition-colors">
        <ArrowLeft size={16} strokeWidth={3} /> Kembali ke Daftar Pesanan
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border-4 border-nb-black shadow-[6px_6px_0px_#0A0A0A]">
        <div>
          <h1 className="text-xl font-extrabold text-nb-black flex items-center gap-2">
            <Package size={20} className="text-nb-black" strokeWidth={2.5} /> Rincian Pesanan
          </h1>
          <p className="text-sm font-bold text-gray-600 mt-1">ID Pesanan: <span className="text-nb-black">{order.id}</span></p>
        </div>
        <div className="flex flex-col items-start md:items-end">
          <span className="px-3 py-1 bg-nb-yellow border-2 border-nb-black text-nb-black font-extrabold text-sm uppercase tracking-wide">
            STATUS: {ORDER_STATUS_LABELS[order.status] || order.status}
          </span>
          <p className="text-xs font-bold text-gray-600 mt-2">{new Date(order.createdAt).toLocaleString('id-ID')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A]" style={{ borderWidth: '3px' }}>
            <h2 className="font-extrabold text-base text-nb-black mb-4 pb-3 border-b-2 border-gray-100">
              Produk yang Dibeli (<span className="text-nb-blue">{order.store?.name}</span>)
            </h2>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center pb-4 border-b-2 border-gray-50 last:border-0 last:pb-0">
                  <div>
                    <p className="font-extrabold text-nb-black">{item.productName}</p>
                    <p className="text-sm font-bold text-gray-600">{item.quantity} x {formatCurrency(Number(item.price))}</p>
                  </div>
                  <p className="font-extrabold text-nb-black">{formatCurrency(Number(item.subtotal))}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t-3 border-nb-black space-y-3" style={{ borderTopWidth: '3px' }}>
              <div className="flex justify-between text-sm font-bold text-gray-700">
                <span>Subtotal Produk</span>
                <span className="text-nb-black">{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-700">
                <span>Ongkos Kirim</span>
                <span className="text-nb-black">{formatCurrency(Number(order.shippingFee))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm font-extrabold text-nb-red">
                  <span>Diskon / Voucher</span>
                  <span>-{formatCurrency(Number(order.discount))}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black text-nb-black pt-3 border-t-2 border-gray-100">
                <span>Total Belanja</span>
                <span className="text-nb-blue">{formatCurrency(Number(order.total))}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A]" style={{ borderWidth: '3px' }}>
            <h2 className="font-extrabold text-base text-nb-black mb-4 pb-3 border-b-2 border-gray-100 flex items-center gap-2">
              <div className="w-8 h-8 bg-nb-yellow border-2 border-nb-black flex items-center justify-center">
                <MapPin size={16} strokeWidth={2.5} />
              </div>
              Alamat Pengiriman
            </h2>
            <p className="font-extrabold text-sm text-nb-black">{order.address?.recipientName}</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">{order.address?.phone}</p>
            <p className="text-sm font-medium text-gray-600 mt-1 leading-relaxed">
              {order.address?.street}, {order.address?.city}, {order.address?.province} {order.address?.postalCode}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A]" style={{ borderWidth: '3px' }}>
            <h2 className="font-extrabold text-base text-nb-black mb-4 pb-3 border-b-2 border-gray-100">Riwayat Status</h2>
            <div className="space-y-4">
              {order.statusHistory?.map((hist: any, i: number) => (
                <div key={hist.id} className="relative pl-5 border-l-3 border-nb-black ml-1" style={{ borderLeftWidth: '3px' }}>
                  <div className="absolute w-3.5 h-3.5 bg-nb-blue border-2 border-nb-black rounded-none -left-[8.5px] top-1"></div>
                  <p className="text-sm font-extrabold text-nb-black leading-none">{ORDER_STATUS_LABELS[hist.status] || hist.status}</p>
                  <p className="text-xs font-bold text-gray-500 mb-1 mt-1">{new Date(hist.createdAt).toLocaleString('id-ID')}</p>
                  <p className="text-xs font-medium text-gray-700">{hist.note}</p>
                </div>
              ))}
            </div>
          </div>

          {order.status === "SEDANG_DIKIRIM" && (
            <div className="bg-nb-yellow p-5 border-3 border-nb-black text-center shadow-[4px_4px_0px_#0A0A0A]" style={{ borderWidth: '3px' }}>
              <p className="text-sm font-extrabold text-nb-black mb-3">Pesanan Anda telah tiba!</p>
              <button onClick={handleComplete} className="btn-primary w-full justify-center">
                Selesaikan Pesanan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
