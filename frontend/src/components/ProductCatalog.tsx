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
        <p class="text-gray-500 text-center py-8">Belum ada produk yang dijual saat ini.</p>
      ) : (
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((p: any) => (
            <div key={p.id} class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => route(`/product/${p.id}`)}>
              <div class="h-40 bg-gray-100 flex items-center justify-center border-b border-gray-100">
                <span class="text-gray-400 font-medium text-xs">Gambar Produk</span>
              </div>
              <div class="p-3 flex flex-col justify-between h-32">
                <div>
                  <h3 class="font-semibold text-[14px] text-gray-800 line-clamp-2 leading-tight">{p.name}</h3>
                  <p class="font-bold text-primary mt-1 text-[15px]">Rp {p.price.toLocaleString('id-ID')}</p>
                </div>
                <div class="flex justify-between items-center text-[11px] text-gray-500">
                  <div class="flex items-center gap-1">
                    4.8
                  </div>
                  <span>Terjual 100+</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
