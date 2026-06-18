import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';

export function Wallet() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        route('/login');
        return;
      }

      const res = await fetch('http://localhost:8787/wallets/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setBalance(data.data.balance);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleTopup = async (e: Event) => {
    e.preventDefault();
    if (!topupAmount || topupAmount < 1000) {
      setError('Minimal top-up adalah Rp 1.000');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8787/wallets/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: Number(topupAmount) })
      });

      if (!res.ok) {
        throw new Error('Gagal melakukan top-up');
      }

      setSuccess(`Berhasil top-up sebesar Rp ${Number(topupAmount).toLocaleString('id-ID')}`);
      setTopupAmount('');
      fetchWallet(); // Refresh balance
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div class="min-h-[80vh] flex justify-center items-center">Memuat dompet...</div>;

  return (
    <div class="max-w-3xl mx-auto p-8 py-12">
      <h1 class="text-3xl font-extrabold text-gray-900 mb-8">SEAPEDIA Wallet</h1>
      
      <div class="bg-gradient-to-r from-primary to-green-600 rounded-2xl p-8 text-white shadow-md mb-8">
        <p class="text-green-100 font-medium mb-2">Total Saldo Anda</p>
        <h2 class="text-5xl font-black">Rp {balance.toLocaleString('id-ID')}</h2>
      </div>

      <div class="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Isi Saldo (Top-up)</h3>
        
        {error && <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        {success && <div class="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4">{success}</div>}

        <form onSubmit={handleTopup} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nominal Top-up (Rp)</label>
            <input 
              type="number" 
              min="1000" 
              value={topupAmount} 
              onInput={(e) => setTopupAmount(Number(e.currentTarget.value))} 
              class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary text-lg" 
              placeholder="Minimal Rp 1.000" 
            />
          </div>
          <div class="grid grid-cols-3 gap-3 mb-4">
            {[50000, 100000, 500000].map(amt => (
              <button 
                type="button"
                onClick={() => setTopupAmount(amt)}
                class="border border-gray-200 rounded-lg py-2 text-sm font-medium hover:border-primary hover:text-primary transition-colors"
              >
                Rp {amt.toLocaleString('id-ID')}
              </button>
            ))}
          </div>
          <button 
            type="submit" 
            disabled={submitting} 
            class="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-800 disabled:opacity-50 mt-4"
          >
            {submitting ? 'Memproses...' : 'Top-up Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
}
