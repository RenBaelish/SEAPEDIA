import { useState, useEffect } from 'preact/hooks';

export function ProductDetail({ id }: { id?: string }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    fetch(`http://localhost:8787/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div class="min-h-[80vh] flex items-center justify-center">Memuat detail produk...</div>;
  if (!product) return <div class="min-h-[80vh] flex items-center justify-center text-red-500 font-bold">Produk tidak ditemukan</div>;

  return (
    <div class="max-w-5xl mx-auto p-8 py-12">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
        <div class="md:w-1/2 bg-gray-100 min-h-[300px] flex items-center justify-center text-gray-400 text-lg font-bold">
          Gambar Produk
        </div>
        <div class="md:w-1/2 p-8 lg:p-12 flex flex-col">
          <div class="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">{product.storeName}</div>
          <h1 class="text-3xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
          <div class="text-4xl font-black text-gray-900 mb-6">Rp {product.price.toLocaleString('id-ID')}</div>
          
          <div class="prose text-gray-600 mb-8 flex-grow">
            <h3 class="text-lg font-bold text-gray-900 mb-2">Deskripsi Produk</h3>
            <p class="whitespace-pre-line leading-relaxed">{product.description}</p>
          </div>
          
          <div class="border-t border-gray-100 pt-6 mt-auto">
            <div class="flex items-center justify-between mb-4">
              <span class="text-gray-500">Stok Tersedia</span>
              <span class="font-bold text-gray-900">{product.stock} pcs</span>
            </div>
            
            <button 
              disabled={product.stock === 0}
              class="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 text-lg shadow-sm"
            >
              {product.stock === 0 ? 'Stok Habis' : 'Masukkan ke Keranjang'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
