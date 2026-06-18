import { useState, useEffect } from 'react';
import { formatCurrency } from "../../../../lib/format";
import { api } from "../../../../lib/api";
import { Users, Store, Package, ShoppingBag, Clock, DollarSign, Activity } from "lucide-react";
import { useConfirm } from "../../../../contexts/ConfirmContext";
import { useAlert } from "../../../../contexts/AlertContext";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";

export default function AdminDashboardPage() {
  const { showConfirm } = useConfirm();
  const { showAlert } = useAlert();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Overdue simulator state
  const [hoursToAdvance, setHoursToAdvance] = useState<string>("24");
  const [simulateLoading, setSimulateLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/dashboard/stats");
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSimulate = async () => {
    const hours = parseInt(hoursToAdvance);
    if (isNaN(hours) || hours <= 0) {
      await showAlert({ title: "Perhatian", message: "Masukkan jumlah jam yang valid" });
      return;
    }
    
    if (!await showConfirm({ title: "Konfirmasi Simulasi", message: `Anda yakin ingin memajukan waktu sistem sebanyak ${hours} jam? Ini akan membatalkan otomatis pesanan yang melewati SLA.` })) return;
    
    setSimulateLoading(true);
    try {
      const res = await api.post("/admin/overdue/simulate", { hoursToAdvance: hours });
      await showAlert({ title: "Berhasil", message: res.data.message });
      fetchStats();
    } catch (err: any) {
      showAlert({ title: "Gagal", message: err.response?.data?.message || "Gagal menjalankan simulasi." });
    } finally {
      setSimulateLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat dashboard...</div>;

  const statCards = [
    { label: "Total Pengguna", value: stats?.users || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Toko", value: stats?.stores || 0, icon: Store, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total Produk", value: stats?.products || 0, icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Total Pesanan", value: stats?.orders || 0, icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Estimasi Pendapatan Platform (20% Ongkir)", value: formatCurrency(stats?.revenue || 0), icon: DollarSign, color: "text-brand-600", bg: "bg-brand-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity size={28} className="text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm ${idx === 4 ? 'md:col-span-2 lg:col-span-4' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon size={24} className={stat.color} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SLA Simulator Section */}
      <div className="bg-white rounded-xl p-6 border border-red-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <Clock size={150} className="text-red-500" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={24} className="text-red-500" />
            <h2 className="text-lg font-bold text-gray-800">Overdue SLA Simulator</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Fitur ini digunakan untuk mendemonstrasikan sistem pembatalan otomatis dan pengembalian dana (Auto-Refund) pesanan yang kadaluwarsa. 
            Masukkan jumlah jam untuk mensimulasikan waktu berjalan ke depan. Pesanan di status <strong>PROCESSING</strong> (&gt; 24 jam) atau <strong>IN_DELIVERY</strong> (&gt; 72 jam) akan dibatalkan, dan dana serta stok akan dikembalikan secara otomatis.
          </p>
          
          <div className="flex items-end gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Maju Waktu (Jam)
              </label>
              <Input 
                type="number" 
                value={hoursToAdvance} 
                onChange={(e) => setHoursToAdvance((e.target as any).value)}
                min="1"
              />
            </div>
            <Button 
              onClick={handleSimulate} 
              disabled={simulateLoading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {simulateLoading ? "Memproses..." : "Jalankan Auto-Refund"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
