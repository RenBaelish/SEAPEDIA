import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    stores: 0,
    activeOrders: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState('');

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return route('/login');

      const res = await fetch('http://localhost:8787/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.data);
      } else {
        // Not an admin or unauthorized
        route('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const runTimeMachine = async () => {
    if (!confirm('Anda yakin ingin menjalankan simulasi waktu maju 3 Hari? Pesanan yang belum diproses penjual (Sedang Dikemas) akan otomatis dibatalkan (Auto-Refund).')) return;
    
    setSimulating(true);
    setSimulationResult('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8787/admin/trigger-overdue', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ daysOffset: 3 })
      });
      
      const data = await res.json();
      if (res.ok) {
        setSimulationResult(data.message);
        fetchStats(); // Refresh stats after simulation
      } else {
        alert(data.message || 'Gagal menjalankan simulasi');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) return <div class="text-center py-20 text-gray-500">Memuat dashboard admin...</div>;

  return (
    <div class="page-container py-12">
      <h1 class="text-3xl font-extrabold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* --- STATISTIK --- */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
          <p class="text-gray-500 text-sm font-medium mb-2">Total Pengguna</p>
          <p class="text-4xl font-black text-primary">{stats.users}</p>
        </div>
        <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
          <p class="text-gray-500 text-sm font-medium mb-2">Total Toko</p>
          <p class="text-4xl font-black text-secondary">{stats.stores}</p>
        </div>
        <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
          <p class="text-gray-500 text-sm font-medium mb-2">Pesanan Aktif</p>
          <p class="text-4xl font-black text-warning">{stats.activeOrders}</p>
        </div>
        <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
          <p class="text-gray-500 text-sm font-medium mb-2">Pesanan Selesai</p>
          <p class="text-4xl font-black text-success">{stats.completedOrders}</p>
        </div>
      </div>

      {/* --- TIME MACHINE SIMULATOR --- */}
      <div class="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
        <div class="flex items-start justify-between flex-col md:flex-row gap-6">
          <div class="flex-1">
            <h2 class="text-2xl font-bold mb-3 flex items-center gap-2">
              <span class="text-3xl">⏳</span> Time Machine Simulator
            </h2>
            <p class="text-purple-100 leading-relaxed max-w-2xl text-sm">
              Gunakan fitur ini untuk mensimulasikan bahwa waktu telah berlalu (misal maju 3 Hari). 
              Sistem akan menjalankan pengecekan otomatis: Jika ada pesanan yang masih berstatus 
              <strong> Sedang Dikemas</strong> melebihi batas waktu 3 hari, sistem akan membatalkan 
              pesanan tersebut secara otomatis dan me-refund saldo ke dompet pembeli.
            </p>
          </div>
          
          <div class="shrink-0 w-full md:w-auto">
            <button 
              onClick={runTimeMachine}
              disabled={simulating}
              class="w-full md:w-auto bg-white text-indigo-700 font-bold py-4 px-8 rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {simulating ? 'Menjalankan Simulasi...' : 'Jalankan Simulasi (Maju 3 Hari)'}
            </button>
          </div>
        </div>

        {simulationResult && (
          <div class="mt-6 bg-white/10 border border-white/20 rounded-xl p-4 text-sm font-medium animate-[fadeIn_0.3s_ease]">
            <p>✅ {simulationResult}</p>
          </div>
        )}
      </div>

    </div>
  );
}
