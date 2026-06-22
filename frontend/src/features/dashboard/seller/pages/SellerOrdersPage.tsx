import { useState, useEffect } from 'react';
import { useAlert } from "../../../../contexts/AlertContext";
import { formatCurrency } from "../../../../lib/format";
import { api } from "../../../../lib/api";
import { OrderStatusBadge } from "../../../../components/ui/Badge";
import { Package, Truck } from "lucide-react";

export default function SellerOrdersPage() {
  const { showAlert } = useAlert();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/seller/list");
      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleProcessOrder = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/process`);
      await showAlert({ title: "Berhasil", message: "Pesanan berhasil diproses!" });
      fetchOrders();
    } catch (err: any) {
      showAlert({ title: "Gagal", message: err.response?.data?.message || "Gagal memproses pesanan." });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-10 h-10 border-4 border-nb-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-nb-black">Kelola Pesanan</h1>
          <p className="text-sm font-semibold text-gray-600 mt-1">Pantau dan proses pesanan yang masuk ke toko Anda.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#F7F5F0] border-2 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-10 text-center">
          <Package size={40} className="mx-auto text-nb-black mb-4" strokeWidth={2} />
          <h3 className="text-lg font-extrabold text-nb-black mb-1">Belum ada pesanan</h3>
          <p className="text-sm font-semibold text-gray-600">Pesanan yang masuk akan muncul di sini.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border-2 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-5 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-extrabold text-sm text-nb-black uppercase tracking-wide bg-nb-yellow border-2 border-nb-black px-2 py-0.5">{order.buyer.fullName}</span>
                  <span className="text-nb-black font-black">•</span>
                  <span className="text-xs font-bold text-gray-600">{new Date(order.createdAt).toLocaleDateString('id-ID')}</span>
                  <OrderStatusBadge status={order.status} className="border-2 border-nb-black shadow-[2px_2px_0px_#0A0A0A]" />
                </div>
                
                <div className="space-y-3 mt-4 border-l-2 border-nb-black pl-4 ml-1">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-gray-100 border-2 border-nb-black overflow-hidden shrink-0">
                        {item.productImg && <img src={item.productImg} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-nb-black line-clamp-1">{item.productName}</p>
                        <p className="text-xs font-bold text-gray-600">{item.quantity} x {formatCurrency(Number(item.price))}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {order.notes && (
                  <div className="text-xs font-bold text-nb-red border-2 border-nb-red bg-red-50 px-3 py-2 mt-3 inline-block">
                    <span className="font-black">Catatan:</span> {order.notes}
                  </div>
                )}
              </div>

              <div className="w-full md:w-auto md:min-w-[200px] border-t-2 md:border-t-0 md:border-l-2 border-nb-black pt-4 md:pt-0 md:pl-6 flex flex-col items-start md:items-end justify-center">
                <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-1">Total Pendapatan</p>
                <p className="font-black text-lg text-nb-black mb-4">
                  {formatCurrency(Number(order.subtotal) - Number(order.discount || 0))}
                </p>
                
                {order.status === 'PROCESSING' && (
                  <button 
                    onClick={() => handleProcessOrder(order.id)}
                    disabled={processingId === order.id}
                    className="btn-primary w-full justify-center disabled:opacity-50"
                  >
                    {processingId === order.id ? "Memproses..." : "Proses Pesanan"}
                  </button>
                )}
                {order.status === 'READY_FOR_PICKUP' && (
                  <p className="text-xs text-nb-blue flex items-center gap-1.5 font-extrabold border-2 border-nb-blue bg-[#EBF5FF] px-3 py-1.5 w-full justify-center md:justify-end">
                    <Truck size={14} strokeWidth={2.5} /> Menunggu Kurir
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
