import { useState, useEffect } from 'preact/hooks';

export function PromoManager({ storeId }: { storeId: string }) {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [code, setCode] = useState('');
  const [type, setType] = useState('DISCOUNT');
  const [amount, setAmount] = useState(0);
  const [quota, setQuota] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchPromos = async () => {
    try {
      const res = await fetch(`http://localhost:8787/promos/store/${storeId}`);
      const data = await res.json();
      setPromos(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, [storeId]);

  const handleAdd = async (e: Event) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8787/promos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code, type, discountAmount: amount, quota })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal membuat promo');
      }

      setAdding(false);
      setCode('');
      setAmount(0);
      setQuota(1);
      fetchPromos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div>Memuat promo...</div>;

  return (
    <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Voucher & Promo</h2>
        <button onClick={() => setAdding(!adding)} class="bg-primary text-white px-4 py-2 rounded-lg font-bold">
          {adding ? 'Batal' : '+ Buat Promo'}
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} class="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 space-y-4">
          {error && <div class="text-red-500 text-sm">{error}</div>}
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Kode Promo</label>
              <input type="text" required value={code} onInput={e => setCode(e.currentTarget.value)} class="w-full border p-2 rounded" placeholder="MISAL: DISKON10" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Tipe</label>
              <select value={type} onChange={e => setType(e.currentTarget.value)} class="w-full border p-2 rounded">
                <option value="DISCOUNT">Potongan Harga</option>
                <option value="SHIPPING">Gratis/Potongan Ongkir</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Nominal (Rp)</label>
              <input type="number" required min="1000" value={amount} onInput={e => setAmount(Number(e.currentTarget.value))} class="w-full border p-2 rounded" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Kuota Promo</label>
              <input type="number" required min="1" value={quota} onInput={e => setQuota(Number(e.currentTarget.value))} class="w-full border p-2 rounded" />
            </div>
          </div>
          <button type="submit" class="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold">Simpan Promo</button>
        </form>
      )}

      {promos.length === 0 ? (
        <p class="text-gray-500">Belum ada promo yang dibuat.</p>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promos.map(promo => (
            <div key={promo.id} class="border border-green-200 bg-green-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <p class="font-bold text-lg text-green-800">{promo.code}</p>
                <p class="text-sm text-green-700">{promo.type === 'SHIPPING' ? 'Potongan Ongkir' : 'Potongan Harga'} Rp {promo.discountAmount.toLocaleString()}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-green-600 font-bold uppercase mb-1">Sisa Kuota</p>
                <p class="font-black text-xl text-green-700">{promo.quota}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
