import { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from "../../../../lib/format";
import { api } from "../../../../lib/api";
import { WalletDto, WalletTransactionDto } from '@/types';
import { Wallet as WalletIcon, Info, DollarSign, TrendingUp } from "lucide-react";
import { Card } from "../../../../components/ui/Card";

export default function DriverWalletPage() {
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
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dompet Driver</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <Card className="md:col-span-1 bg-gradient-to-br from-green-500 to-green-600 border-none relative overflow-hidden h-fit">
          {/* Decorative Waves */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto text-white fill-current" preserveAspectRatio="none">
              <path d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
          
          <div className="relative z-10 text-white space-y-6">
            <div className="flex items-center gap-2">
              <WalletIcon size={20} className="fill-white" />
              <span className="font-bold tracking-widest text-[14px]">Saldo Pendapatan</span>
            </div>
            
            <div>
              <p className="text-white/80 text-sm mb-1">Total Tersedia</p>
              <h2 className="text-3xl font-medium tracking-tight">{formatCurrency(Number(wallet.balance))}</h2>
            </div>

            <div className="pt-4 border-t border-white/20">
              <div className="flex items-center gap-2 text-sm">
                <Info size={16} />
                <span>Saldo dapat ditarik ke rekening terdaftar.</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Transactions History */}
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[14px] font-bold text-secondary">Riwayat Transaksi</h3>
          </div>

          <div className="space-y-6">
            {Object.keys(groupedTransactions).length === 0 ? (
              <div className="text-center py-12 text-tertiary text-[12px]">
                Belum ada transaksi bulan ini.
              </div>
            ) : (
              Object.entries(groupedTransactions).map(([date, txs]) => (
                <div key={date}>
                  <h4 className="text-[12px] font-bold text-secondary mb-3">{date}</h4>
                  <div className="space-y-3">
                    {txs.map((tx) => {
                      const isIncome = tx.type === 'INCOME';
                      const isTopup = tx.type === 'TOP_UP';
                      const isPayment = tx.type === 'PAYMENT';
                      
                      let Icon = WalletIcon;
                      let iconBg = 'bg-gray-100';
                      let iconColor = 'text-gray-500';
                      
                      if (isIncome || isTopup) {
                        Icon = TrendingUp;
                        iconBg = 'bg-green-100';
                        iconColor = 'text-green-600';
                      } else if (isPayment) {
                        Icon = DollarSign;
                        iconBg = 'bg-red-100';
                        iconColor = 'text-red-500';
                      }
                      
                      return (
                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-muted hover:border-gray-300 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
                              <Icon size={20} />
                            </div>
                            <div>
                              <p className="text-[13px] font-bold text-secondary">{tx.description || tx.type}</p>
                              <p className="text-[11px] text-tertiary">
                                {new Date(tx.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} â€¢ Berhasil
                              </p>
                            </div>
                          </div>
                          <div className={`font-medium text-[14px] ${isIncome || isTopup ? 'text-green-600' : 'text-secondary'}`}>
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
        </Card>
      </div>
    </div>
  );
}
