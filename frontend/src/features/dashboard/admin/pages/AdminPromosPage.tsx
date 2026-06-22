import { useState, useEffect } from 'react';
import { api } from "../../../../lib/api";
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-nb-black">Promo Platform</h1>
          <p className="text-sm font-semibold text-gray-600 mt-1">Buat dan pantau promosi diskon serta ongkir gratis.</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary h-10 px-4 gap-2 text-sm flex items-center shrink-0">
          {showAddForm ? 'Tutup Form' : <><Plus size={18} strokeWidth={3} /> Buat Promo</>}
        </button>
      </div>

      {message.text && (
        <div className={`p-4 font-bold text-sm border-2 ${message.type === 'success' ? 'bg-green-50 text-nb-green border-nb-green' : 'bg-red-50 text-nb-red border-nb-red'}`}>
          {message.text}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-6 space-y-5">
          <h2 className="text-base font-extrabold text-nb-black mb-5 border-b-2 border-gray-100 pb-2 flex items-center gap-2 uppercase tracking-wide">
            <div className="w-8 h-8 bg-nb-yellow border-2 border-nb-black flex items-center justify-center">
              <Megaphone size={16} strokeWidth={2.5} className="text-nb-black" />
            </div>
            Buat Promo Platform Baru
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1.5">Kode Promo</label>
              <input 
                name="code" 
                value={formData.code} 
                onChange={handleChange as any} 
                placeholder="Contoh: HARBOLNAS12" 
                required 
                className="nb-input w-full font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1.5">Tipe Promo</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="nb-input w-full h-11"
              >
                <option value="DISCOUNT">Diskon Harga (Rp)</option>
                <option value="SHIPPING">Diskon Ongkir (Rp)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1.5">Potongan (Rp)</label>
              <input 
                type="number"
                name="discountAmount" 
                value={formData.discountAmount} 
                onChange={handleChange as any} 
                required 
                min="1000"
                className="nb-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1.5">Kuota</label>
              <input 
                type="number"
                name="quota" 
                value={formData.quota} 
                onChange={handleChange as any} 
                required 
                min="1"
                className="nb-input w-full"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button type="submit" disabled={submitting} className="btn-primary px-8 flex items-center gap-2">
              {submitting ? <><Loader2 size={18} strokeWidth={2.5} className="animate-spin" /> Menyimpan...</> : 'Simpan Promo'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border-2 border-nb-black shadow-[4px_4px_0px_#0A0A0A] overflow-hidden">
        <div className="p-4 border-b-2 border-nb-black flex items-center justify-between bg-[#F7F5F0]">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nb-black" strokeWidth={3} />
            <input 
              type="text" 
              placeholder="Cari kode promo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm font-bold text-nb-black bg-white border-2 border-nb-black outline-none focus:bg-nb-yellow transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-nb-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-nb-yellow text-nb-black font-black uppercase tracking-wide border-b-2 border-nb-black">
                <tr>
                  <th className="px-5 py-4 border-r-2 border-nb-black">Kode Promo</th>
                  <th className="px-5 py-4 border-r-2 border-nb-black">Tipe</th>
                  <th className="px-5 py-4 border-r-2 border-nb-black">Potongan</th>
                  <th className="px-5 py-4 border-r-2 border-nb-black">Sisa Kuota</th>
                  <th className="px-5 py-4">Dibuat</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-100">
                {filteredPromos.length > 0 ? (
                  filteredPromos.map((promo) => (
                    <tr key={promo.id} className="hover:bg-[#F7F5F0] transition-colors border-b-2 border-nb-black last:border-b-0">
                      <td className="px-5 py-4 font-black text-nb-black tracking-widest uppercase border-r-2 border-nb-black">{promo.code}</td>
                      <td className="px-5 py-4 border-r-2 border-nb-black">
                        <span className={`px-2 py-0.5 text-xs font-black uppercase tracking-wide border-2 inline-block ${
                          promo.type === 'SHIPPING' ? 'bg-[#EBF5FF] text-nb-blue border-nb-blue' : 'bg-nb-yellow text-nb-black border-nb-black'
                        }`}>
                          {promo.type === 'SHIPPING' ? 'Ongkir' : 'Diskon'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-black text-nb-red border-r-2 border-nb-black">
                        -Rp {promo.discountAmount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-700 border-r-2 border-nb-black">{promo.quota}x pemakaian</td>
                      <td className="px-5 py-4 font-bold text-gray-600">
                        {new Date(promo.createdAt).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-gray-500">
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
