import { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from "../../../lib/format";
import { api } from "../../../lib/api";
import { WalletDto, WalletTransactionDto } from '@/types';
import { useConfirm } from "../../../contexts/ConfirmContext";
import { Settings, PlusCircle, CreditCard, Coins, Calendar, ChevronDown, CheckCircle, Info, X, Wallet as WalletIcon } from "lucide-react";

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletDto | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionDto[]>([]);
  const [topupAmount, setTopupAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const { showConfirm } = useConfirm();

  const handleNotAvailable = () => {
    showConfirm({ 
      title: "Fitur Belum Tersedia", 
      message: "Maaf, fitur ini sedang dalam tahap pengembangan.", 
      confirmText: "Tutup", 
      hideCancel: true 
    });
  };

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
      <div className="flex-1 w-full bg-white border-4 border-nb-black shadow-[6px_6px_0px_#0A0A0A] p-6 min-h-[600px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-nb-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-white border-4 border-nb-black shadow-[6px_6px_0px_#0A0A0A] p-6 min-h-[600px] flex flex-col gap-6">
      <h1 className="text-xl font-extrabold text-nb-black nb-section-title">Dompet SEAPAY</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        
        {}
        <div className="w-full md:w-[320px] shrink-0">
          <div className="bg-nb-blue border-4 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-6 text-white relative overflow-hidden mb-6">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <WalletIcon size={20} className="fill-white text-nb-blue" strokeWidth={2.5} />
                  <span className="font-black tracking-widest text-sm uppercase">SEAPAY <span className="text-nb-yellow">PLUS</span></span>
                  <Info size={14} className="ml-1 opacity-90" strokeWidth={3} />
                </div>
                <button onClick={handleNotAvailable} className="text-white hover:text-nb-yellow transition-colors">
                  <Settings size={20} strokeWidth={2.5} />
                </button>
              </div>
              
              <div className="flex flex-col mb-6">
                <p className="text-xs font-bold text-blue-100 uppercase tracking-wide mb-1">Total Saldo</p>
                <h1 className="text-3xl font-black tracking-tight">{formatCurrency(Number(wallet.balance))}</h1>
              </div>
              
              <button 
                onClick={() => setIsTopupModalOpen(true)}
                className="w-full h-11 border-3 border-nb-black bg-nb-yellow text-nb-black font-black text-sm hover:bg-white transition-colors shadow-[2px_2px_0px_#0A0A0A]"
                style={{ borderWidth: '3px' }}
              >
                Top-up Saldo
              </button>

              {}
              <div className="flex gap-3 mt-5 pt-5 border-t-3 border-black/20" style={{ borderTopWidth: '3px' }}>
                <div onClick={handleNotAvailable} className="flex-1 cursor-pointer group">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <CreditCard size={14} className="text-blue-100 group-hover:text-nb-yellow transition-colors" strokeWidth={2.5} />
                    <span className="text-sm font-black text-white uppercase">Pay<span className="text-nb-yellow font-bold">later</span></span>
                  </div>
                  <p className="text-xs font-bold text-nb-yellow">Daftar Sekarang</p>
                </div>
                <div onClick={handleNotAvailable} className="flex-1 cursor-pointer group">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Coins size={14} className="text-blue-100 group-hover:text-nb-yellow transition-colors" strokeWidth={2.5} />
                    <span className="text-sm font-black text-white uppercase">SEAPAY<span className="text-nb-yellow font-bold">coins</span></span>
                  </div>
                  <p className="text-sm font-black text-white">0</p>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="mt-8">
            <h3 className="text-base font-extrabold text-nb-black mb-3">Penting untuk kamu</h3>
            <div className="bg-nb-yellow border-3 border-nb-black p-4 shadow-[4px_4px_0px_#0A0A0A] overflow-hidden relative group cursor-pointer" style={{ borderWidth: '3px' }}>
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
                <WalletIcon size={80} />
              </div>
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <div className="w-7 h-7 bg-nb-blue border-2 border-nb-black flex items-center justify-center text-white">
                  <PlusCircle size={14} strokeWidth={3} />
                </div>
                <span className="text-xs font-extrabold text-nb-black uppercase tracking-wide">Top-up SEAPAY</span>
              </div>
              <p className="text-sm font-bold text-gray-800 leading-relaxed mb-3 relative z-10">
                Dapatkan <span className="font-black text-nb-black">3x bonus cashback</span> bulanan dengan minimal top-up Rp500.000!
              </p>
              <button onClick={handleNotAvailable} className="text-sm font-black text-nb-blue border-b-2 border-nb-blue hover:text-nb-black hover:border-nb-black relative z-10 transition-colors">
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>
        </div>

        {}
        <div className="flex-1 w-full mt-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-nb-black flex items-center gap-2">
              <div className="w-8 h-8 bg-[#EBF5FF] border-2 border-nb-black flex items-center justify-center">
                <WalletIcon size={16} className="text-nb-black" strokeWidth={2.5} />
              </div>
              Riwayat Transaksi
            </h2>
          </div>
          
          {}
          <div className="flex flex-wrap gap-3 mb-6 border-b-3 border-nb-black pb-6" style={{ borderBottomWidth: '3px' }}>
            <button onClick={handleNotAvailable} className="flex items-center gap-2 px-4 h-10 border-2 border-nb-black bg-white text-sm font-extrabold hover:bg-nb-yellow transition-colors">
              Semua Tanggal <Calendar size={16} className="ml-2" strokeWidth={2.5} />
            </button>
            <button onClick={handleNotAvailable} className="flex items-center gap-2 px-4 h-10 border-2 border-nb-black bg-white text-sm font-extrabold hover:bg-nb-yellow transition-colors">
              Semua Metode <ChevronDown size={16} className="ml-2" strokeWidth={2.5} />
            </button>
          </div>

          {}
          <div className="space-y-6">
            {Object.keys(groupedTransactions).length === 0 ? (
              <div className="py-12 border-3 border-nb-black bg-gray-50 text-center font-extrabold text-nb-black shadow-[4px_4px_0px_#0A0A0A]" style={{ borderWidth: '3px' }}>
                Belum ada transaksi bulan ini.
              </div>
            ) : (
              Object.entries(groupedTransactions).map(([dateStr, txs]) => (
                <div key={dateStr} className="border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] bg-white p-4" style={{ borderWidth: '3px' }}>
                  <h4 className="text-sm font-black text-nb-black bg-[#F7F5F0] border-2 border-nb-black px-3 py-1 inline-block mb-4 uppercase tracking-wide">{dateStr}</h4>
                  <div className="space-y-0">
                    {txs.map((tx, index) => {
                      const isIncome = tx.type === "TOP_UP" || tx.type === "TOPUP" || tx.type === "REFUND" || tx.type === "COMMISSION" || tx.type === "INCOME";
                      const timeStr = new Date(tx.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                      
                      return (
                        <div key={tx.id} className={`flex items-start justify-between py-4 ${index !== txs.length - 1 ? "border-b-2 border-gray-100" : ""}`}>
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 border-2 border-nb-black bg-nb-yellow rounded-none px-1.5 py-0.5 text-xs font-black text-nb-black">
                              RP
                            </div>
                            <div>
                              <p className="text-sm font-extrabold text-nb-black mb-1">{tx.description || tx.type}</p>
                              <p className="text-xs font-bold text-gray-500">{timeStr} WIB</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-base font-black mb-1 ${isIncome ? "text-nb-green" : "text-nb-red"}`}>
                              {isIncome ? "+" : "-"}{formatCurrency(Number(tx.amount))}
                            </p>
                            <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-gray-600">
                              <WalletIcon size={12} className="text-nb-blue fill-nb-blue" /> SEAPAY
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
              <button onClick={handleNotAvailable} className="btn-secondary w-full justify-center">
                Lihat Transaksi Sebelumnya
              </button>
            )}
          </div>
        </div>
      </div>

      {}
      {isTopupModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white border-4 border-nb-black shadow-[8px_8px_0px_#0A0A0A] w-full max-w-[400px]">
            <div className="flex items-center justify-between p-4 border-b-4 border-nb-black">
              <h3 className="font-extrabold text-nb-black uppercase tracking-wide">Top-up SEAPAY</h3>
              <button onClick={() => setIsTopupModalOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-nb-yellow border-2 border-transparent hover:border-nb-black transition-colors text-nb-black">
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            <form onSubmit={handleTopup} className="p-6">
              <label className="block text-sm font-extrabold text-nb-black mb-3">Pilih Nominal Top-up</label>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[10000, 50000, 100000, 250000, 500000, 1000000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopupAmount(amt.toString())}
                    className={`h-11 border-2 text-sm font-extrabold transition-all ${topupAmount === amt.toString() ? "border-nb-black bg-nb-blue text-white shadow-[2px_2px_0px_#0A0A0A]" : "border-nb-black bg-white text-nb-black hover:bg-nb-yellow"}`}
                  >
                    {formatCurrency(amt).replace("Rp", "")}
                  </button>
                ))}
              </div>
              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-nb-black font-black">Rp</span>
                <input 
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount((e.target as any).value)}
                  placeholder="Nominal lain (Min. Rp10.000)"
                  className="w-full h-12 pl-12 pr-4 border-3 border-nb-black bg-white outline-none focus:bg-nb-yellow text-sm font-bold text-nb-black transition-colors"
                  style={{ borderWidth: '3px' }}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || Number(topupAmount) < 10000}
                className="btn-primary w-full justify-center disabled:opacity-50"
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
