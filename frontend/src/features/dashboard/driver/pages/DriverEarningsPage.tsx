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
        const res = await api.get("/deliveries/earnings");
        setReport(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-10 h-10 border-4 border-nb-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-nb-black">Penghasilan Driver</h1>
          <p className="text-sm font-semibold text-gray-600 mt-1">Laporan total penghasilan bersih dari jasa pengiriman pesanan.</p>
        </div>
      </div>

      <div className="bg-nb-blue border-4 border-nb-black p-8 text-white shadow-[6px_6px_0px_#0A0A0A] flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 translate-y-4">
          <Wallet size={160} strokeWidth={2} />
        </div>
        <div className="relative z-10">
          <p className="text-white/90 text-sm font-bold uppercase tracking-wide mb-2">Total Pendapatan Bersih</p>
          <p className="text-4xl font-black">{formatCurrency(report?.totalEarnings || 0)}</p>
          <p className="text-xs font-bold text-white mt-4 flex items-center gap-1.5 border-t-3 border-black/20 pt-4" style={{ borderTopWidth: '3px' }}>
            <TrendingUp size={16} strokeWidth={3} /> Berasal dari biaya ongkos kirim pesanan
          </p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t-4 border-nb-black">
        <h2 className="text-base font-extrabold text-nb-black mb-5 flex items-center gap-2 uppercase tracking-wide">
          <div className="w-8 h-8 bg-[#EBF5FF] border-2 border-nb-black flex items-center justify-center">
            <ArrowDownLeft size={16} className="text-nb-black" strokeWidth={2.5} />
          </div>
          Riwayat Transaksi Pendapatan
        </h2>
        
        {!report?.history || report.history.length === 0 ? (
          <div className="bg-[#F7F5F0] border-2 border-nb-black p-8 text-center text-sm font-bold text-nb-black shadow-[4px_4px_0px_#0A0A0A]">
            Belum ada pendapatan yang tercatat.
          </div>
        ) : (
          <div className="space-y-4">
            {report.history.map((tx: any) => (
              <div key={tx.id} className="bg-white p-4 border-3 border-nb-black flex justify-between items-center shadow-[4px_4px_0px_#0A0A0A]" style={{ borderWidth: '3px' }}>
                <div>
                  <p className="font-extrabold text-nb-black text-sm mb-1">{tx.description}</p>
                  <p className="text-xs font-bold text-gray-500">{new Date(tx.createdAt).toLocaleDateString('id-ID')} {new Date(tx.createdAt).toLocaleTimeString('id-ID')}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-nb-green text-base mb-1">+{formatCurrency(Number(tx.amount))}</p>
                  <p className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 border border-gray-300">Saldo: {formatCurrency(Number(tx.balanceAfter))}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
