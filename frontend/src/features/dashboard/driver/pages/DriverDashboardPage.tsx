import { useState, useEffect } from 'react';
import { Truck, Map, DollarSign, Wallet } from "lucide-react";
import { api } from "../../../../lib/api";
import { useAuthStore } from "../../../../store/auth.store";
import { Card } from "../../../../components/ui/Card";
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
      <div className="flex justify-center items-center h-40">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Halo, <span className="text-brand-600">{user?.fullName}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Ringkasan aktivitas dan pendapatan pengiriman Anda hari ini.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <Truck size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pengiriman Aktif</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.activeDeliveries}</h3>
            </div>
          </div>
          <Link to="/driver/my-deliveries" className="text-brand-600 text-sm font-medium mt-auto hover:underline">
            Lihat Pengiriman &rarr;
          </Link>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <Map size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pekerjaan Tersedia</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.availableJobs}</h3>
            </div>
          </div>
          <Link to="/driver/jobs" className="text-brand-600 text-sm font-medium mt-auto hover:underline">
            Cari Pekerjaan &rarr;
          </Link>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Penghasilan</p>
              <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalEarnings)}</h3>
            </div>
          </div>
          <Link to="/driver/earnings" className="text-brand-600 text-sm font-medium mt-auto hover:underline">
            Lihat Laporan &rarr;
          </Link>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Saldo Dompet</p>
              <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(stats.walletBalance)}</h3>
            </div>
          </div>
          <Link to="/driver/wallet" className="text-brand-600 text-sm font-medium mt-auto hover:underline">
            Tarik Saldo &rarr;
          </Link>
        </Card>
      </div>
      
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 mt-8">
        <h3 className="text-lg font-bold text-brand-800 mb-2">Tips Pengiriman Cepat</h3>
        <ul className="list-disc list-inside text-brand-700 space-y-1 text-sm">
          <li>Pastikan aplikasi tetap terbuka saat melakukan pengiriman.</li>
          <li>Ambil pekerjaan yang lokasinya berdekatan untuk efisiensi rute.</li>
          <li>Hubungi pembeli atau toko jika ada kendala alamat.</li>
        </ul>
      </div>
    </div>
  );
}
