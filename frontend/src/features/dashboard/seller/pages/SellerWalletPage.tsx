import { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from "../../../../lib/format";
import { api } from "../../../../lib/api";
import { WalletDto, WalletTransactionDto } from '@/types';
import { Wallet as WalletIcon, Info, DollarSign, TrendingUp } from "lucide-react";

export default function SellerWalletPage() {
  const [wallet, setWallet] = useState<WalletDto | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionDto[]>([]);

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
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-nb-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-nb-black">Dompet Pendapatan</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="md:col-span-1 bg-nb-blue border-4 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-6 relative overflow-hidden h-fit">
          <div className="relative z-10 text-white space-y-6">
            <div className="flex items-center gap-2">
              <WalletIcon size={20} className="fill-white text-nb-blue" strokeWidth={2.5} />
              <span className="font-black tracking-widest text-sm uppercase">Saldo Pendapatan</span>
            </div>
            
            <div>
              <p className="text-white/90 text-sm font-bold mb-1 uppercase tracking-wide">Total Tersedia</p>
              <h2 className="text-3xl font-black tracking-tight">{formatCurrency(Number(wallet.balance))}</h2>
            </div>

            <div className="pt-4 border-t-3 border-black/20" style={{ borderTopWidth: '3px' }}>
              <div className="flex items-center gap-2 text-sm font-bold">
                <Info size={16} strokeWidth={3} />
                <span>Saldo dapat ditarik ke rekening terdaftar.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions History */}
        <div className="md:col-span-2 bg-white border-4 border-nb-black shadow-[6px_6px_0px_#0A0A0A] p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
            <h3 className="text-base font-extrabold text-nb-black uppercase tracking-wide">Riwayat Penjualan</h3>
          </div>

          <div className="space-y-6">
            {Object.keys(groupedTransactions).length === 0 ? (
              <div className="text-center py-12 bg-[#F7F5F0] border-2 border-nb-black text-nb-black text-sm font-extrabold shadow-[2px_2px_0px_#0A0A0A]">
                Belum ada transaksi penjualan bulan ini.
              </div>
            ) : (
              Object.entries(groupedTransactions).map(([date, txs]) => (
                <div key={date} className="border-3 border-nb-black bg-white p-4 shadow-[4px_4px_0px_#0A0A0A]" style={{ borderWidth: '3px' }}>
                  <h4 className="text-sm font-black text-nb-black bg-[#EBF5FF] border-2 border-nb-black px-3 py-1 inline-block mb-4 uppercase tracking-wide">{date}</h4>
                  <div className="space-y-0">
                    {txs.map((tx, index) => {
                      const isIncome = tx.type === 'DELIVERY_EARNING' || tx.type === 'COMMISSION' || tx.type === 'REFUND';
                      const isTopup = tx.type === 'TOPUP';
                      const isPayment = tx.type === 'PURCHASE' || tx.type === 'WITHDRAWAL';
                      
                      let Icon = WalletIcon;
                      let iconBg = 'bg-gray-100';
                      let iconColor = 'text-gray-500';
                      
                      if (isIncome || isTopup) {
                        Icon = TrendingUp;
                        iconBg = 'bg-nb-yellow';
                        iconColor = 'text-nb-black';
                      } else if (isPayment) {
                        Icon = DollarSign;
                        iconBg = 'bg-red-100';
                        iconColor = 'text-nb-red';
                      }
                      
                      return (
                        <div key={tx.id} className={`flex items-center justify-between py-4 ${index !== txs.length - 1 ? "border-b-2 border-gray-100" : ""}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 border-2 border-nb-black flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
                              <Icon size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                              <p className="text-sm font-extrabold text-nb-black mb-1">{tx.description || tx.type}</p>
                              <p className="text-xs font-bold text-gray-500">
                                {new Date(tx.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • Berhasil
                              </p>
                            </div>
                          </div>
                          <div className={`font-black text-base ${isIncome || isTopup ? 'text-nb-green' : 'text-nb-black'}`}>
                            {isIncome || isTopup ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
