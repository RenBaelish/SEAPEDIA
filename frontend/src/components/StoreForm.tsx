import { useState } from 'preact/hooks';

export function StoreForm({ onStoreCreated }: { onStoreCreated: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8787/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create store');
      }

      onStoreCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Buka Toko Baru</h2>
      <p class="text-gray-500 mb-8">Lengkapi informasi di bawah ini untuk mulai berjualan di SEAPEDIA.</p>
      
      {error && <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">{error}</div>}

      <form onSubmit={handleSubmit} class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Toko</label>
          <input type="text" required value={name} onInput={(e) => setName(e.currentTarget.value)} class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary" placeholder="Contoh: Toko Maju Jaya" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi Toko</label>
          <textarea rows={4} value={description} onInput={(e) => setDescription(e.currentTarget.value)} class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary" placeholder="Ceritakan tentang toko Anda..."></textarea>
        </div>
        <button type="submit" disabled={loading} class="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50">
          {loading ? 'Memproses...' : 'Buka Toko Sekarang'}
        </button>
      </form>
    </div>
  );
}
