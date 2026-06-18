import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  storeName: string;
}

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8787/products')
      .then(res => res.json())
      .then(data => setProducts(data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div class="text-center py-10 text-gray-500">Memuat katalog produk...</div>;
  }

  return (
    <div class="mt-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-8">Katalog Produk</h2>
      
      {products.length === 0 ? (
        <div class="bg-white p-8 text-center rounded-xl border border-gray-100 text-gray-500 shadow-sm">
          Belum ada produk yang dijual saat ini.
        </div>
      ) : (
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map(product => (
            <div 
              key={product.id} 
              onClick={() => route(`/product/${product.id}`)}
              class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
            >
              <div class="bg-gray-100 h-40 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                Gambar Produk
              </div>
              <h3 class="font-bold text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
              <p class="text-primary font-bold text-lg mb-2">Rp {product.price.toLocaleString('id-ID')}</p>
              <div class="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
                <span>{product.storeName}</span>
                <span>Stok: {product.stock}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
