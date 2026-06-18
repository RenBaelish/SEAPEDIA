import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';

export function OrderManager({ storeId }: { storeId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8787/orders/store/incoming', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [storeId]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8787/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Memuat pesanan...</div>;

  return (
    <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Pesanan Masuk</h2>
      
      {orders.length === 0 ? (
        <p class="text-gray-500">Belum ada pesanan masuk.</p>
      ) : (
        <div class="space-y-4">
          {orders.map(order => (
            <div key={order.id} class="border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <p class="text-sm text-gray-500">ID Pesanan: {order.id.slice(0, 8).toUpperCase()}</p>
                <p class="font-bold text-primary text-lg">Rp {order.totalAmount.toLocaleString('id-ID')}</p>
                <p class="text-sm font-semibold mt-1">Status: <span class="text-orange-500">{order.status}</span></p>
              </div>
              <div class="flex gap-2">
                {order.status === 'SEDANG_DIKEMAS' && (
                  <button onClick={() => updateStatus(order.id, 'MENUNGGU_PENGIRIM')} class="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 text-sm">
                    Panggil Kurir
                  </button>
                )}
                {order.status === 'MENUNGGU_PENGIRIM' && (
                  <button onClick={() => updateStatus(order.id, 'SEDANG_DIKIRIM')} class="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 text-sm">
                    Kirim Pesanan
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
