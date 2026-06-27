import { useState, useEffect } from 'react';
import { api } from "../../../../lib/api";
import { formatCurrency } from "../../../../lib/format";
import { useAlert } from "../../../../contexts/AlertContext";
import { Ticket, Plus, Tag, RefreshCcw, Trash2 } from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import { Modal } from "../../../../components/ui/Modal";
import { Input } from "../../../../components/ui/Input";

interface Promo {
  id: string;
  code: string;
  discountAmount: number;
  type: 'SHIPPING' | 'DISCOUNT';
  quota: number;
  usedCount: number;
  createdAt: string;
}

export default function VoucherManagePage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showAlert } = useAlert();

  const [code, setCode] = useState('');
  const [type, setType] = useState<'SHIPPING' | 'DISCOUNT'>('DISCOUNT');
  const [amount, setAmount] = useState('');
  const [quota, setQuota] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/promos/mine");
      setPromos(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !amount || !quota) return;

    setSubmitting(true);
    try {
      await api.post("/promos", {
        code: code.toUpperCase(),
        type,
        discountAmount: parseInt(amount),
        quota: parseInt(quota)
      });
      await showAlert({ title: "Berhasil", message: "Voucher berhasil dibuat!" });
      setIsModalOpen(false);
      setCode('');
      setAmount('');
      setQuota('');
      fetchPromos();
    } catch (err: any) {
      showAlert({ title: "Gagal", message: err.response?.data?.message || "Terjadi kesalahan" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-nb-black">Voucher Toko</h1>
          <p className="text-sm font-semibold text-gray-600 mt-1">Buat dan kelola voucher promo khusus untuk pelanggan toko Anda.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={18} strokeWidth={2.5} />
          Buat Voucher
        </Button>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-nb-blue border-2 border-nb-black flex items-center justify-center shrink-0">
            <Ticket size={24} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Voucher Aktif</p>
            <p className="text-2xl font-black text-nb-black">{promos.filter(p => p.quota > 0).length}</p>
          </div>
        </Card>
      </div>

      {}
      <Card className="overflow-hidden">
        <div className="p-4 border-b-3 border-nb-black bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-nb-black flex items-center gap-2">
            <Tag size={16} strokeWidth={2.5} /> Daftar Voucher
          </h2>
          <button onClick={fetchPromos} className="p-1.5 border-2 border-transparent hover:border-nb-black hover:bg-white transition-colors rounded">
            <RefreshCcw size={16} className={`text-nb-black ${loading ? 'animate-spin' : ''}`} strokeWidth={2.5} />
          </button>
        </div>
        
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-8 h-8 border-4 border-nb-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : promos.length === 0 ? (
          <div className="p-12 text-center bg-white">
            <Ticket size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1.5} />
            <h3 className="text-base font-extrabold text-nb-black mb-1">Belum Ada Voucher</h3>
            <p className="text-sm font-semibold text-gray-500 mb-4">Anda belum membuat voucher apapun untuk toko ini.</p>
            <Button onClick={() => setIsModalOpen(true)} variant="secondary" className="mx-auto">Buat Voucher Pertama</Button>
          </div>
        ) : (
          <div className="divide-y-2 divide-gray-100 bg-white">
            {promos.map((promo) => (
              <div key={promo.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-nb-yellow border-2 border-nb-black flex items-center justify-center shrink-0">
                    <Ticket size={24} className="text-nb-black" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-lg text-nb-black">{promo.code}</span>
                      <Badge variant={promo.quota > 0 ? "green" : "red"} className="text-[10px]">
                        {promo.quota > 0 ? "Aktif" : "Habis"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-gray-600">
                      <span className="flex items-center gap-1">
                        <Tag size={12} strokeWidth={2.5} />
                        {promo.type === 'SHIPPING' ? 'Gratis Ongkir' : 'Diskon Harga'}
                      </span>
                      <span>Potongan: <strong className="text-nb-blue">{formatCurrency(promo.discountAmount)}</strong></span>
                      <span>Sisa Kuota: <strong className="text-nb-black">{promo.quota}</strong></span>
                      <span>Terpakai: <strong className="text-nb-black">{promo.usedCount}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Voucher Baru">
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            label="Kode Voucher"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Misal: DISKON20"
            required
            className="uppercase"
            maxLength={15}
          />
          
          <div className="space-y-2">
            <label className="text-sm font-extrabold text-nb-black">Tipe Promo</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('DISCOUNT')}
                className={`p-3 border-3 font-bold text-sm transition-all ${
                  type === 'DISCOUNT' 
                    ? 'border-nb-black bg-nb-yellow shadow-[3px_3px_0px_#0A0A0A]' 
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
                style={{ borderWidth: '3px' }}
              >
                Diskon Harga
              </button>
              <button
                type="button"
                onClick={() => setType('SHIPPING')}
                className={`p-3 border-3 font-bold text-sm transition-all ${
                  type === 'SHIPPING' 
                    ? 'border-nb-black bg-nb-blue text-white shadow-[3px_3px_0px_#0A0A0A]' 
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
                style={{ borderWidth: '3px' }}
              >
                Gratis Ongkir
              </button>
            </div>
          </div>

          <Input
            label={type === 'DISCOUNT' ? 'Nominal Diskon (Rp)' : 'Maksimal Potongan Ongkir (Rp)'}
            type="number"
            min={1000}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10000"
            required
          />

          <Input
            label="Kuota Penggunaan"
            type="number"
            min={1}
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
            placeholder="100"
            required
          />

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" disabled={submitting || !code || !amount || !quota}>
              {submitting ? 'Menyimpan...' : 'Simpan Voucher'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
