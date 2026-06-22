import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from "../../../../lib/format";
import { api } from "../../../../lib/api";
import { Users, Store, Package, ShoppingBag, Clock, DollarSign, ArrowRight } from "lucide-react";
import { useConfirm } from "../../../../contexts/ConfirmContext";
import { useAlert } from "../../../../contexts/AlertContext";

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
      const res = await api.get("/admin/dashboard");
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

    if (!await showConfirm({
      title: "Konfirmasi Simulasi",
      message: `Anda yakin ingin memajukan waktu sistem sebanyak ${hours} jam? Ini akan membatalkan otomatis pesanan yang melewati SLA.`
    })) return;

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 skeleton border-2 border-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Pengguna",
      value: stats?.users || 0,
      icon: Users,
      accent: "bg-nb-blue",
      link: "/admin/users",
      linkLabel: "Kelola Pengguna",
    },
    {
      label: "Total Toko",
      value: stats?.stores || 0,
      icon: Store,
      accent: "bg-gray-800",
      link: "/admin/stores",
      linkLabel: "Lihat Toko",
    },
    {
      label: "Total Produk",
      value: stats?.products || 0,
      icon: Package,
      accent: "bg-nb-green",
      link: "/admin/analytics",
      linkLabel: "Lihat Produk",
    },
    {
      label: "Total Pesanan",
      value: stats?.orders || 0,
      icon: ShoppingBag,
      accent: "bg-nb-yellow text-nb-black",
      link: "/admin/analytics",
      linkLabel: "Pantau Pesanan",
    },
    {
      label: "Pendapatan (20%)",
      value: formatCurrency(stats?.revenue || 0),
      icon: DollarSign,
      accent: "bg-nb-red",
      link: "/admin/analytics",
      linkLabel: "Lihat Pendapatan",
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-nb-black">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5 font-medium">Ringkasan statistik dan performa platform.</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white border-2 border-gray-200 hover:border-nb-black shadow-[2px_2px_0px_rgba(0,0,0,0.08)] hover:shadow-[3px_3px_0px_#0A0A0A] transition-all p-4 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 flex items-center justify-center ${stat.accent} border-2 border-nb-black`}>
                  <Icon size={18} className="text-white" strokeWidth={2} />
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
              </div>
              <p className="text-2xl font-extrabold text-nb-black mb-3">{stat.value}</p>
              <Link
                to={stat.link}
                className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-nb-black hover:text-nb-blue transition-colors"
              >
                {stat.linkLabel} <ArrowRight size={12} strokeWidth={3} />
              </Link>
            </div>
          );
        })}
      </div>

      {/* ── SLA Simulator ── */}
      <div className="bg-white border-2 border-nb-red shadow-[3px_3px_0px_#E63329] p-5 relative overflow-hidden">
        <div className="absolute top-3 right-4 opacity-5 pointer-events-none">
          <Clock size={120} className="text-nb-red" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-nb-red border-2 border-nb-black flex items-center justify-center">
              <Clock size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-base font-extrabold text-nb-black">Overdue SLA Simulator</h2>
          </div>
          <p className="text-xs text-gray-600 mb-5 leading-relaxed">
            Fitur ini digunakan untuk mendemonstrasikan sistem pembatalan otomatis dan pengembalian dana (Auto-Refund) pesanan yang kadaluwarsa.
            Masukkan jumlah jam untuk mensimulasikan waktu berjalan ke depan. Pesanan di status <strong>PROCESSING</strong> (&gt; 24 jam) atau <strong>IN_DELIVERY</strong> (&gt; 72 jam) akan dibatalkan secara otomatis.
          </p>

          <div className="flex items-end gap-3 bg-gray-50 p-4 border-2 border-gray-200">
            <div className="flex-1">
              <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-2">
                Maju Waktu (Jam)
              </label>
              <input
                type="number"
                value={hoursToAdvance}
                onChange={(e) => setHoursToAdvance((e.target as any).value)}
                min="1"
                className="nb-input w-full"
              />
            </div>
            <button
              onClick={handleSimulate}
              disabled={simulateLoading}
              className="h-11 px-5 border-3 border-nb-red bg-nb-red text-white font-bold text-sm hover:bg-red-700 hover:border-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              style={{ borderWidth: '3px' }}
            >
              {simulateLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Jalankan Auto-Refund"
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
