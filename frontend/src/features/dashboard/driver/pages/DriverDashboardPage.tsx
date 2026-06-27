import { useState, useEffect } from 'react';
import { Truck, Map, DollarSign, Wallet, ArrowRight } from "lucide-react";
import { api } from "../../../../lib/api";
import { useAuthStore } from "../../../../store/auth.store";
import { formatCurrency } from "../../../../lib/format";
import { Link } from "react-router-dom";

export default function DriverDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    activeDeliveries: 0,
    availableJobs: 0,
    totalEarnings: 0,
    walletBalance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/deliveries/my-jobs").catch(() => ({ data: { data: [] } })),
      api.get("/deliveries/available").catch(() => ({ data: { data: [] } })),
      api.get("/deliveries/earnings").catch(() => ({ data: { data: { totalEarnings: 0 } } })),
      api.get("/wallet").catch(() => ({ data: { data: { balance: 0 } } }))
    ]).then(([myJobsRes, availableJobsRes, earningsRes, walletRes]) => {
      const active = myJobsRes.data.data.filter((j: any) => j.status === 'DIKIRIM').length;
      const available = availableJobsRes.data.data.length;

      setStats({
        activeDeliveries: active,
        availableJobs: available,
        totalEarnings: earningsRes.data.data.totalEarnings || 0,
        walletBalance: walletRes.data.data.balance || 0
      });
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 skeleton border-2 border-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Pengiriman Aktif",
      value: stats.activeDeliveries,
      icon: Truck,
      accent: "bg-nb-blue",
      link: "/driver/my-deliveries",
      linkLabel: "Lihat Pengiriman",
    },
    {
      label: "Job Tersedia",
      value: stats.availableJobs,
      icon: Map,
      accent: "bg-nb-yellow",
      link: "/driver/jobs",
      linkLabel: "Ambil Job",
    },
    {
      label: "Total Penghasilan",
      value: formatCurrency(stats.totalEarnings),
      icon: DollarSign,
      accent: "bg-nb-green",
      link: "/driver/earnings",
      linkLabel: "Lihat Riwayat",
    },
    {
      label: "Saldo Dompet",
      value: formatCurrency(stats.walletBalance),
      icon: Wallet,
      accent: "bg-gray-800",
      link: "/driver/wallet",
      linkLabel: "Kelola Dompet",
    },
  ];

  return (
    <div className="space-y-5">

      {}
      <div>
        <h1 className="text-xl font-extrabold text-nb-black">
          Halo, <span className="text-nb-blue">{user?.fullName}</span>!
        </h1>
        <p className="text-sm text-gray-500 mt-0.5 font-medium">
          Ringkasan aktivitas dan pendapatan pengiriman Anda hari ini.
        </p>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {}
      <div className="bg-white border-2 border-gray-200 p-4">
        <h3 className="text-sm font-extrabold text-nb-black mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-nb-blue inline-block" />
          Informasi Driver
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600 font-medium">
          <div className="bg-gray-50 border border-gray-200 p-3">
            <span className="font-bold text-nb-black">Cara Ambil Job:</span>{" "}
            Buka menu Job Board, pilih pesanan yang tersedia, dan konfirmasi pengambilan.
          </div>
          <div className="bg-gray-50 border border-gray-200 p-3">
            <span className="font-bold text-nb-black">Pencairan Saldo:</span>{" "}
            Penghasilan akan otomatis masuk ke dompet setelah pengiriman dikonfirmasi selesai.
          </div>
        </div>
      </div>

    </div>
  );
}
