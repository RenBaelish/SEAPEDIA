import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';

export function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          route('/login');
          return;
        }

        const res = await fetch('http://localhost:8787/orders/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setOrders(data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SEDANG_DIKEMAS': return <span class="bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-0.5 rounded border border-yellow-200">Sedang Dikemas</span>;
      case 'MENUNGGU_PENGIRIM': return <span class="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded border border-blue-200">Menunggu Kurir</span>;
      case 'SEDANG_DIKIRIM': return <span class="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded border border-purple-200">Sedang Dikirim</span>;
      case 'PESANAN_SELESAI': return <span class="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded border border-green-200">Selesai</span>;
      default: return <span class="bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-0.5 rounded border border-gray-200">{status}</span>;
    }
  };

  if (loading) return <div class="min-h-[80vh] flex items-center justify-center">Memuat pesanan...</div>;

  return (
    <div class="max-w-4xl mx-auto p-8 py-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Daftar Transaksi</h1>

      {orders.length === 0 ? (
        <div class="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
          <p class="text-gray-500 mb-6 text-lg">Anda belum memiliki transaksi apapun.</p>
          <button onClick={() => route('/')} class="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-green-600">Mulai Belanja</button>
        </div>
      ) : (
        <div class="space-y-6">
          {orders.map(order => (
            <div key={order.id} class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div class="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center text-sm">
                <div class="text-gray-500 font-medium">
                  {new Date(order.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                {getStatusBadge(order.status)}
              </div>
              <div class="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div class="flex items-center gap-4 w-full md:w-auto">
                  <div class="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs font-medium">
                    Order
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-900">Pesanan dari Toko</h3>
                    <p class="text-sm text-gray-500">Total Belanja</p>
                    <p class="font-bold text-primary">Rp {order.totalAmount.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div class="w-full md:w-auto text-right">
                  <button 
                    // onClick={() => route(`/order/${order.id}`)}
                    class="w-full md:w-auto bg-white border border-primary text-primary px-6 py-2 rounded-lg font-bold hover:bg-green-50 transition-colors"
                  >
                    Detail Transaksi
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
