import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';

interface Job {
  id: string;
  orderId: string;
  status: string;
  totalAmount: number;
  deliveryFee: number;
  createdAt: string;
}

export function DriverDashboard() {
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return route('/login');

      // Fetch Available
      const resAvail = await fetch('http://localhost:8787/deliveries/available', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resAvail.ok) {
        const data = await resAvail.json();
        setAvailableJobs(data.data || []);
      }

      // Fetch My Jobs
      const resMy = await fetch('http://localhost:8787/deliveries/my-jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resMy.ok) {
        const data = await resMy.json();
        setMyJobs(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const takeJob = async (jobId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8787/deliveries/${jobId}/take`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Berhasil mengambil pesanan!');
        fetchJobs();
      } else {
        const data = await res.json();
        alert(data.message || 'Gagal mengambil pesanan');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const completeJob = async (jobId: string) => {
    if (!confirm('Tandai pesanan ini telah selesai dikirim?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8787/deliveries/${jobId}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Pesanan berhasil diselesaikan. Pendapatan telah masuk ke saldo Wallet!');
        fetchJobs();
      } else {
        const data = await res.json();
        alert(data.message || 'Gagal menyelesaikan pesanan');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div class="text-center py-20 text-gray-500">Memuat dashboard driver...</div>;

  return (
    <div class="page-container py-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Driver Dashboard</h1>

      <div class="mb-12">
        <h2 class="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Pesanan yang Sedang Saya Kirim</h2>
        {myJobs.filter(j => j.status === 'DIKIRIM').length === 0 ? (
          <div class="bg-white rounded-xl p-8 border border-gray-100 text-center text-gray-500">
            Tidak ada pesanan yang sedang Anda kirim.
          </div>
        ) : (
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myJobs.filter(j => j.status === 'DIKIRIM').map(job => (
              <div key={job.id} class="bg-blue-50 rounded-xl p-6 border border-blue-100 shadow-sm">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <span class="text-[11px] font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full uppercase tracking-wider">Sedang Dikirim</span>
                    <p class="text-[12px] text-gray-500 mt-2">ID Pesanan: {job.orderId}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-[12px] text-gray-500 mb-1">Fee Pengiriman</p>
                    <p class="font-bold text-primary text-lg">Rp {job.deliveryFee.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => completeJob(job.id)}
                  class="w-full btn-primary h-10"
                >
                  Tandai Selesai Dikirim
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div class="mb-12">
        <h2 class="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Papan Pekerjaan (Siap Diambil)</h2>
        {availableJobs.length === 0 ? (
          <div class="bg-white rounded-xl p-8 border border-gray-100 text-center text-gray-500">
            Belum ada pesanan baru yang siap dikirim.
          </div>
        ) : (
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableJobs.map(job => (
              <div key={job.id} class="card flex flex-col justify-between h-full">
                <div>
                  <div class="flex justify-between mb-2">
                    <span class="text-xs text-gray-500">{new Date(job.createdAt).toLocaleDateString('id-ID')}</span>
                    <span class="badge badge-warning">Menunggu Driver</span>
                  </div>
                  <p class="text-[12px] text-gray-500 mb-4">ID Pesanan: {job.orderId}</p>
                  
                  <div class="bg-gray-50 p-3 rounded-lg mb-4">
                    <p class="text-[11px] text-gray-500 mb-1">Fee Pengiriman</p>
                    <p class="font-bold text-primary">Rp {job.deliveryFee.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => takeJob(job.id)}
                  class="w-full btn-secondary h-10 border-primary text-primary hover:bg-primary-light"
                >
                  Ambil Pekerjaan
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 class="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Riwayat Pengiriman (Selesai)</h2>
        {myJobs.filter(j => j.status === 'SELESAI').length === 0 ? (
          <p class="text-gray-500 text-sm">Belum ada riwayat pengiriman.</p>
        ) : (
          <div class="space-y-3">
            {myJobs.filter(j => j.status === 'SELESAI').map(job => (
              <div key={job.id} class="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                <div>
                  <p class="font-bold text-gray-800 text-sm">Pesanan {job.orderId}</p>
                  <p class="text-[12px] text-gray-500">Pendapatan: Rp {job.deliveryFee.toLocaleString('id-ID')}</p>
                </div>
                <span class="badge badge-success">Selesai</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
