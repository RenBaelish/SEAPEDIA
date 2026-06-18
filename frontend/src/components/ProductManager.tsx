import { useState, useEffect } from 'preact/hooks';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export function ProductManager({ storeId }: { storeId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await fetch(`http://localhost:8787/products/store/${storeId}`);
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [storeId]);

  const handleAddProduct = async (e: Event) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8787/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, price, stock })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to add product');
      }

      setIsAdding(false);
      setName('');
      setDescription('');
      setPrice(0);
      setStock(0);
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8787/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Daftar Produk</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          class="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600"
        >
          {isAdding ? 'Batal' : '+ Tambah Produk'}
        </button>
      </div>

      {isAdding && (
        <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
          <h3 class="font-bold mb-4">Tambah Produk Baru</h3>
          {error && <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
          <form onSubmit={handleAddProduct} class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                <input type="text" required value={name} onInput={(e) => setName(e.currentTarget.value)} class="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                <input type="number" required min="0" value={price} onInput={(e) => setPrice(Number(e.currentTarget.value))} class="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea rows={3} value={description} onInput={(e) => setDescription(e.currentTarget.value)} class="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                <input type="number" required min="0" value={stock} onInput={(e) => setStock(Number(e.currentTarget.value))} class="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
            </div>
            <div class="flex justify-end">
              <button type="submit" class="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800">
                Simpan Produk
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div class="text-center text-gray-500 py-8">Memuat produk...</div>
      ) : products.length === 0 ? (
        <div class="text-center bg-white p-8 rounded-xl border border-gray-100 text-gray-500">
          Belum ada produk di toko Anda.
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
              <h3 class="font-bold text-lg text-gray-900 mb-1">{product.name}</h3>
              <p class="text-primary font-bold mb-3">Rp {product.price.toLocaleString('id-ID')}</p>
              <p class="text-sm text-gray-500 mb-4 flex-grow line-clamp-2">{product.description}</p>
              <div class="flex justify-between items-center pt-4 border-t border-gray-100">
                <span class="text-sm text-gray-500">Stok: {product.stock}</span>
                <button 
                  onClick={() => handleDelete(product.id)}
                  class="text-red-500 hover:text-red-700 text-sm font-semibold"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
