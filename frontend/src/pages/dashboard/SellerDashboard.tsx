import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { StoreForm } from '../../components/StoreForm';
import { ProductManager } from '../../components/ProductManager';

export function SellerDashboard() {
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStore = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        route('/login');
        return;
      }

      const res = await fetch('http://localhost:8787/stores/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 404) {
        setStore(null);
      } else if (res.ok) {
        const data = await res.json();
        setStore(data.data);
      } else {
        console.error('Failed to fetch store');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  if (loading) {
    return <div class="min-h-[80vh] flex items-center justify-center">Memuat...</div>;
  }

  return (
    <div class="p-8 max-w-7xl mx-auto">
      {!store ? (
        <StoreForm onStoreCreated={fetchStore} />
      ) : (
        <div>
          <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{store.name}</h1>
            <p class="text-gray-500">{store.description}</p>
          </div>
          
          <ProductManager storeId={store.id} />
        </div>
      )}
    </div>
  );
}
