import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';

export function Cart() {
  const [cartData, setCartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        route('/login');
        return;
      }

      const res = await fetch('http://localhost:8787/carts/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setCartData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (itemId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8787/carts/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8787/orders/checkout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal checkout');
      }

      setSuccess('Checkout berhasil! Pesanan Anda sedang diproses.');
      fetchCart(); // Refresh cart (should be empty now)
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) return <div class="min-h-[80vh] flex items-center justify-center">Memuat keranjang...</div>;

  const items = cartData?.items || [];
  const store = cartData?.store;
  
  const subtotal = items.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);
  const deliveryFee = 15000;
  const total = subtotal + deliveryFee;

  return (
    <div class="max-w-5xl mx-auto p-8 py-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Keranjang Belanja</h1>

      {success && (
        <div class="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-8 flex justify-between items-center">
          <div>
            <h3 class="font-bold mb-1">Hore!</h3>
            <p>{success}</p>
          </div>
          <button onClick={() => route('/orders')} class="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700">Lihat Pesanan</button>
        </div>
      )}

      {error && <div class="bg-red-50 text-red-600 p-4 rounded-xl mb-8 font-medium">{error}</div>}

      {items.length === 0 ? (
        <div class="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
          <p class="text-gray-500 mb-6 text-lg">Keranjang Anda masih kosong.</p>
          <button onClick={() => route('/')} class="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-green-600">Mulai Belanja</button>
        </div>
      ) : (
        <div class="flex flex-col lg:flex-row gap-8">
          <div class="lg:w-2/3">
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
              <div class="bg-gray-50 p-4 border-b border-gray-100 font-bold text-gray-700 flex items-center gap-2">
                <span>Toko:</span>
                <span class="text-primary">{store?.name}</span>
              </div>
              <div class="p-6 space-y-6">
                {items.map((item: any) => (
                  <div key={item.id} class="flex gap-6 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                    <div class="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">Gambar</div>
                    <div class="flex-grow">
                      <h3 class="font-bold text-gray-900 text-lg mb-1">{item.product.name}</h3>
                      <p class="text-primary font-bold mb-3">Rp {item.product.price.toLocaleString('id-ID')}</p>
                      <div class="flex justify-between items-center mt-auto">
                        <span class="text-sm text-gray-500">Jumlah: {item.quantity}</span>
                        <button onClick={() => handleRemove(item.id)} class="text-red-500 font-semibold text-sm hover:text-red-700">Hapus</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div class="bg-blue-50 p-4 rounded-xl text-blue-700 text-sm border border-blue-100">
              <strong>Info:</strong> SEAPEDIA hanya mendukung checkout dari 1 toko yang sama dalam satu transaksi.
            </div>
          </div>

          <div class="lg:w-1/3">
            <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-8">
              <h3 class="font-bold text-lg text-gray-900 mb-4">Ringkasan Belanja</h3>
              
              <div class="space-y-3 mb-6 pb-6 border-b border-gray-100 text-gray-600">
                <div class="flex justify-between">
                  <span>Total Harga ({items.length} Barang)</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div class="flex justify-between">
                  <span>Ongkos Kirim</span>
                  <span>Rp {deliveryFee.toLocaleString('id-ID')}</span>
                </div>
              </div>
              
              <div class="flex justify-between items-center mb-8">
                <span class="font-bold text-gray-900 text-lg">Total Tagihan</span>
                <span class="font-black text-2xl text-primary">Rp {total.toLocaleString('id-ID')}</span>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={checkingOut}
                class="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-green-600 disabled:opacity-50 text-lg shadow-sm"
              >
                {checkingOut ? 'Memproses...' : 'Beli Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
