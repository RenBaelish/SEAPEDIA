import { useState, useEffect } from 'react';
import { api } from "../../../../lib/api";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Megaphone, Plus, Search, Loader2 } from "lucide-react";

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountAmount: 0,
    type: "DISCOUNT",
    quota: 100
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchPromos = () => {
    setLoading(true);
    api.get("/admin/promos")
      .then(res => setPromos(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      await api.post("/admin/promos", formData);
      setMessage({ text: "Promo berhasil dibuat!", type: "success" });
      setFormData({ code: "", discountAmount: 0, type: "DISCOUNT", quota: 100 });
      setShowAddForm(false);
      fetchPromos();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "Gagal membuat promo", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPromos = promos.filter(p => 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Promo Platform</h1>
          <p className="text-sm text-gray-500 mt-1">Buat dan pantau promosi diskon serta ongkir gratis.</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
          {showAddForm ? 'Tutup Form' : <><Plus size={18} /> Buat Promo</>}
        </Button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-brand-100 p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Buat Promo Platform Baru</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Kode Promo</label>
              <Input 
                name="code" 
                value={formData.code} 
                onChange={handleChange} 
                placeholder="Contoh: HARBOLNAS12" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tipe Promo</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full h-[40px] px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-brand-500 bg-white"
              >
                <option value="DISCOUNT">Diskon Harga (Rp)</option>
                <option value="SHIPPING">Diskon Ongkir (Rp)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Potongan (Rp)</label>
              <Input 
                type="number"
                name="discountAmount" 
                value={formData.discountAmount} 
                onChange={handleChange} 
                required 
                min="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Kuota</label>
              <Input 
                type="number"
                name="quota" 
                value={formData.quota} 
                onChange={handleChange} 
                required 
                min="1"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={submitting} className="bg-brand-600 hover:bg-brand-700">
              {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Promo'}
            </Button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari kode promo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Memuat promo...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Kode Promo</th>
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4">Potongan</th>
                  <th className="px-6 py-4">Sisa Kuota</th>
                  <th className="px-6 py-4">Dibuat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPromos.length > 0 ? (
                  filteredPromos.map((promo) => (
                    <tr key={promo.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-800 tracking-wide">{promo.code}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          promo.type === 'SHIPPING' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-brand-50 text-brand-600 border border-brand-200'
                        }`}>
                          {promo.type === 'SHIPPING' ? 'Ongkir' : 'Diskon'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-red-600">
                        -Rp {promo.discountAmount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">{promo.quota}x pemakaian</td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(promo.createdAt).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada promo platform ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
