import { useState, useEffect } from 'react';
import { formatCurrency } from "../../../../lib/format";
import { api } from "../../../../lib/api";
import { Wallet, TrendingUp, ArrowDownLeft } from "lucide-react";

export default function DriverEarningsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await api.get("/delivery/earnings");
        setReport(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat laporan...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Wallet size={24} className="text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-800">Pendapatan Driver</h1>
      </div>

      <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl p-8 text-white shadow-lg flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Wallet size={120} />
        </div>
        <div className="relative z-10">
          <p className="text-brand-100 font-medium mb-2">Total Pendapatan Bersih</p>
          <p className="text-4xl font-extrabold">{formatCurrency(report?.totalEarnings || 0)}</p>
          <p className="text-xs text-brand-200 mt-2 flex items-center gap-1">
            <TrendingUp size={14} /> Berasal dari 80% biaya ongkos kirim pesanan
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ArrowDownLeft size={20} className="text-green-500" /> Riwayat Transaksi Pendapatan
        </h2>
        
        {!report?.history || report.history.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-500">Belum ada pendapatan yang tercatat.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {report.history.map((tx: any) => (
              <div key={tx.id} className="bg-white rounded-lg p-4 border border-gray-100 flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-bold text-gray-800">{tx.description}</p>
                  <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString('id-ID')} {new Date(tx.createdAt).toLocaleTimeString('id-ID')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+{formatCurrency(Number(tx.amount))}</p>
                  <p className="text-xs text-gray-400">Saldo: {formatCurrency(Number(tx.balanceAfter))}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
