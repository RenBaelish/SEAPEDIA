import { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from "../../../lib/format";
import { api } from "../../../lib/api";
import { WalletDto, WalletTransactionDto } from '@/types';
import { Settings, PlusCircle, CreditCard, Coins, Calendar, ChevronDown, CheckCircle, Info, X, Wallet as WalletIcon } from "lucide-react";

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletDto | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionDto[]>([]);
  const [topupAmount, setTopupAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);

  const fetchWallet = async () => {
    try {
      const [walletRes, txRes] = await Promise.all([
        api.get("/wallet"),
        api.get("/wallet/transactions")
      ]);
      setWallet(walletRes.data.data);
      setTransactions(txRes.data.data);
    } catch (error) {
      console.error("Failed to fetch wallet", error);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topupAmount || isNaN(Number(topupAmount)) || Number(topupAmount) < 10000) return;
    
    setLoading(true);
    try {
      await api.post("/wallet/topup", { amount: Number(topupAmount) });
      setTopupAmount("");
      setIsTopupModalOpen(false);
      await fetchWallet();
    } catch (error) {
      console.error("Topup failed", error);
    } finally {
      setLoading(false);
    }
  };

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, WalletTransactionDto[]> = {};
    transactions.forEach(tx => {
      const date = new Date(tx.createdAt);
      const dateStr = date.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(tx);
    });
    return groups;
  }, [transactions]);

  if (!wallet) {
    return (
      <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[600px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[600px] flex flex-col gap-6">
      <h1 className="text-[20px] font-bold text-gray-800">Dompet SEAPAY</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* ─── Kiri: Informasi Dompet & Saldo ──────────────────────────────── */}
        <div className="w-full md:w-[320px] shrink-0">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden mb-6">
            {/* Dekorasi Wave */}
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto text-white fill-current" preserveAspectRatio="none">
                <path d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              </svg>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  <WalletIcon size={20} className="fill-white" />
                  <span className="font-bold tracking-widest text-[14px]">SEAPAY <span className="text-blue-200">PLUS</span></span>
                  <Info size={14} className="ml-1 opacity-70" />
                </div>
                <button className="text-white hover:text-blue-100 transition-colors">
                  <Settings size={20} />
                </button>
              </div>
              
              <div className="flex items-end justify-between mb-6">
                <h1 className="text-3xl font-extrabold tracking-tight">{formatCurrency(Number(wallet.balance))}</h1>
                <button 
                  onClick={() => setIsTopupModalOpen(true)}
                  className="px-4 py-1.5 rounded-full border border-white text-white font-semibold text-[13px] hover:bg-white/10 transition-colors"
                >
                  Top-up
                </button>
              </div>

              {/* Quick Links (Paylater & Coins) */}
              <div className="flex gap-2">
                <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm cursor-pointer">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <CreditCard size={14} className="text-blue-100" />
                    <span className="text-[13px] font-bold text-white">SEAPAY <span className="font-normal opacity-80">later</span></span>
                  </div>
                  <p className="text-[12px] font-semibold text-green-300">Daftar Sekarang</p>
                </div>
                <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm cursor-pointer">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Coins size={14} className="text-blue-100" />
                    <span className="text-[13px] font-bold text-white">SEAPAY <span className="font-normal opacity-80">coins</span></span>
                  </div>
                  <p className="text-[13px] font-bold text-white">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Penting untuk kamu */}
          <div className="mt-8">
            <h3 className="text-[15px] font-bold text-gray-800 mb-3">Penting untuk kamu</h3>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 overflow-hidden relative group cursor-pointer">
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
                <WalletIcon size={80} />
              </div>
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                  <PlusCircle size={14} />
                </div>
                <span className="text-[12px] font-bold text-gray-500">Top-up SEAPAY</span>
              </div>
              <p className="text-[13px] text-gray-700 leading-relaxed mb-3 relative z-10">
                Dapatkan 3x bonus cashback bulanan dengan minimal top-up Rp500.000!
              </p>
              <button className="text-[13px] font-bold text-green-600 hover:text-green-700 relative z-10">
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>
        </div>

        {/* ─── Kanan: Riwayat Transaksi ───────────────────────────────────── */}
        <div className="flex-1 w-full mt-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-gray-800 flex items-center gap-2">
              <WalletIcon size={18} className="text-gray-400" /> Riwayat Transaksi
            </h2>
          </div>  {/* Filter Bar */}
            <div className="flex flex-wrap gap-3 mb-6 border-b border-gray-100 pb-6">
              <button className="flex items-center gap-2 px-3 h-9 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
                Semua Tanggal <Calendar size={14} className="ml-4" />
              </button>
              <button className="flex items-center gap-2 px-3 h-9 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
                Semua Metode <ChevronDown size={14} className="ml-4" />
              </button>
              <button className="flex items-center gap-2 px-3 h-9 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
                Semua Transaksi <ChevronDown size={14} className="ml-4" />
              </button>
            </div>

            {/* List Transaksi */}
            <div className="space-y-6">
              {Object.keys(groupedTransactions).length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-[13px]">
                  Belum ada transaksi bulan ini.
                </div>
              ) : (
                Object.entries(groupedTransactions).map(([dateStr, txs]) => (
                  <div key={dateStr}>
                    <h4 className="text-[14px] font-bold text-gray-800 mb-4">{dateStr}</h4>
                    <div className="space-y-0">
                      {txs.map((tx, index) => {
                        const isIncome = tx.type === "TOPUP" || tx.type === "REFUND" || tx.type === "COMMISSION" || tx.type === "DELIVERY_EARNING";
                        const timeStr = new Date(tx.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                          <div key={tx.id} className={`flex items-start justify-between py-4 ${index !== txs.length - 1 ? "border-b border-gray-50" : ""}`}>
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 border border-gray-200 rounded px-1 text-[8px] font-bold text-gray-500 uppercase">
                                RP
                              </div>
                              <div>
                                <p className="text-[14px] font-bold text-gray-800 mb-1">{tx.description || tx.type}</p>
                                <p className="text-[12px] text-gray-400">{timeStr} WIB</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-[14px] font-bold mb-1 ${isIncome ? "text-gray-800" : "text-red-500"}`}>
                                {isIncome ? "" : "-"}{formatCurrency(Number(tx.amount))}
                              </p>
                              <div className="flex items-center justify-end gap-1.5 text-[11px] text-gray-500">
                                <WalletIcon size={12} className="text-blue-500 fill-blue-100" /> SEAPAY
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}

              {Object.keys(groupedTransactions).length > 0 && (
                <button className="w-full py-4 mt-2 text-[13px] font-bold text-gray-500 hover:text-green-600 transition-colors border-t border-gray-50">
                  Lihat berikutnya
                </button>
              )}
            </div>
        </div>
      </div>

      {/* ─── Topup Modal ────────────────────────────────────────── */}
      {isTopupModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Top-up SEAPAY</h3>
              <button onClick={() => setIsTopupModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleTopup} className="p-6">
              <label className="block text-[13px] font-bold text-gray-700 mb-2">Pilih Nominal Top-up</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[10000, 50000, 100000, 250000, 500000, 1000000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopupAmount(amt.toString())}
                    className={`h-10 rounded-lg border text-[13px] font-semibold transition-colors ${topupAmount === amt.toString() ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    {formatCurrency(amt).replace("Rp", "")}
                  </button>
                ))}
              </div>
              <div className="relative mb-6">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                <input 
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount((e.target as any).value)}
                  placeholder="Nominal lain (Min. Rp10.000)"
                  className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-xl outline-none focus:border-blue-500 text-[14px] font-semibold text-gray-800"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || Number(topupAmount) < 10000}
                className="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-[14px] transition-colors disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Lanjut Top-up"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
