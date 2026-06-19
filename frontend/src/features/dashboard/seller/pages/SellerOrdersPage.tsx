import { useState, useEffect } from 'react';
import { useAlert } from "../../../../contexts/AlertContext";
import { formatCurrency } from "../../../../lib/format";
import { api } from "../../../../lib/api";
import { Button } from "../../../../components/ui/Button";
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

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat pesanan...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-md text-secondary">Kelola Pesanan</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-500">Belum ada pesanan masuk.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-800">{order.buyer.fullName}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('id-ID')}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                
                <div className="space-y-2 mt-3 border-l-2 border-gray-100 pl-3">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                        {item.productImg && <img src={item.productImg} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.productName}</p>
                        <p className="text-xs text-gray-500">{item.quantity} x {formatCurrency(Number(item.price))}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {order.notes && (
                  <p className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded w-fit">
                    Catatan: {order.notes}
                  </p>
                )}
              </div>

              <div className="w-full md:w-auto md:min-w-[200px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 flex flex-col items-start md:items-end justify-center">
                <p className="text-xs text-gray-500 mb-1">Total Pendapatan</p>
                <p className="font-medium text-lg text-brand-600 mb-4">
                  {formatCurrency(Number(order.subtotal) - Number(order.discount || 0))}
                </p>
                
                {order.status === 'PROCESSING' && (
                  <Button 
                    onClick={() => handleProcessOrder(order.id)}
                    disabled={processingId === order.id}
                    className="w-full"
                  >
                    {processingId === order.id ? "Memproses..." : "Proses Pesanan"}
                  </Button>
                )}
                {order.status === 'READY_FOR_PICKUP' && (
                  <p className="text-xs text-blue-600 flex items-center gap-1 font-medium bg-blue-50 px-2 py-1 rounded">
                    <Truck size={14} /> Menunggu Kurir
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
