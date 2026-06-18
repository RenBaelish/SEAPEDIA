import { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import { formatCurrency } from "../../../lib/format";
import { api } from "../../../lib/api";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { useAlert } from "../../../contexts/AlertContext";
import { Package, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "../../../components/ui/Button";

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
      await api.post(`/orders/${id}/complete`);
      await showAlert({ title: "Berhasil", message: "Pesanan berhasil diselesaikan!" });
      window.location.reload();
    } catch (e: any) {
      showAlert({ title: "Gagal", message: "Gagal menyelesaikan pesanan: " + (e.response?.data?.message || "Kesalahan server") });
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat rincian pesanan...</div>;
  if (!order) return <div className="p-8 text-center text-gray-500">Pesanan tidak ditemukan.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Link to="/orders" className="text-brand-600 hover:text-brand-700 flex items-center gap-1 text-sm font-medium mb-4">
        <ArrowLeft size={16} /> Kembali ke Daftar Pesanan
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Package size={20} className="text-brand-600" /> Rincian Pesanan
          </h1>
          <p className="text-xs text-gray-500 mt-1">ID Pesanan: {order.id}</p>
        </div>
        <div className="flex flex-col items-start md:items-end">
          <span className="px-3 py-1 bg-brand-50 text-brand-700 font-bold text-sm rounded-full">
            STATUS: {order.status}
          </span>
          <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString('id-ID')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Produk yang Dibeli ({order.store?.name})</h2>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{item.productName}</p>
                    <p className="text-xs text-gray-500">{item.quantity} x {formatCurrency(Number(item.price))}</p>
                  </div>
                  <p className="font-bold text-gray-800">{formatCurrency(Number(item.subtotal))}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal Produk</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Ongkos Kirim</span>
                <span>{formatCurrency(Number(order.shippingFee))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm text-brand-600">
                  <span>Diskon / Voucher</span>
                  <span>-{formatCurrency(Number(order.discount))}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-100">
                <span>Total Belanja</span>
                <span>{formatCurrency(Number(order.total))}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
              <MapPin size={18} /> Alamat Pengiriman
            </h2>
            <p className="font-bold text-sm text-gray-800">{order.address?.recipientName}</p>
            <p className="text-sm text-gray-600">{order.address?.phone}</p>
            <p className="text-sm text-gray-500 mt-1">{order.address?.street}, {order.address?.city}, {order.address?.province} {order.address?.postalCode}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Riwayat Status</h2>
            <div className="space-y-4">
              {order.statusHistory?.map((hist: any, i: number) => (
                <div key={hist.id} className="relative pl-4 border-l-2 border-brand-200">
                  <div className="absolute w-2 h-2 bg-brand-500 rounded-full -left-[5px] top-1"></div>
                  <p className="text-xs font-bold text-gray-800">{hist.status}</p>
                  <p className="text-[10px] text-gray-400 mb-1">{new Date(hist.createdAt).toLocaleString('id-ID')}</p>
                  <p className="text-xs text-gray-600">{hist.note}</p>
                </div>
              ))}
            </div>
          </div>

          {order.status === "DELIVERED" && (
            <div className="bg-brand-50 p-4 rounded-xl border border-brand-200 text-center">
              <p className="text-sm font-medium text-brand-800 mb-3">Pesanan Anda telah tiba!</p>
              <Button onClick={handleComplete} className="w-full justify-center">Selesaikan Pesanan</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
