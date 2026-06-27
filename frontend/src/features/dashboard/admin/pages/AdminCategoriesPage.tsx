import { useState, useEffect } from 'react';
import { api } from "../../../../lib/api";
import { Tag, Search, Plus, Loader2 } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', iconUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchCategories = () => {
    setLoading(true);
    api.get('/admin/categories')
      .then(res => setCategories(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSlugify = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({ ...formData, name, slug: handleSlugify(name) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      await api.post('/admin/categories', formData);
      setMessage({ text: 'Kategori berhasil ditambahkan!', type: 'success' });
      setFormData({ name: '', slug: '', iconUrl: '' });
      setShowAddForm(false);
      fetchCategories();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Gagal menambahkan kategori', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-nb-black">Kategori Produk</h1>
          <p className="text-sm font-semibold text-gray-600 mt-1">Kelola kategori utama untuk produk yang dijual.</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary h-10 px-4 gap-2 text-sm flex items-center shrink-0">
          {showAddForm ? 'Tutup Form' : <><Plus size={18} strokeWidth={3} /> Tambah Kategori</>}
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
              <Plus size={16} strokeWidth={3} className="text-nb-black" />
            </div>
            Tambah Kategori Baru
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1.5">Nama Kategori</label>
              <input 
                type="text"
                value={formData.name} 
                onChange={handleNameChange} 
                placeholder="Contoh: Pakaian Pria" 
                required 
                className="nb-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1.5">Slug (URL)</label>
              <input 
                type="text"
                value={formData.slug} 
                onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                placeholder="pakaian-pria" 
                required 
                className="nb-input w-full font-mono text-sm"
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button type="submit" disabled={submitting} className="btn-primary px-8 flex items-center gap-2">
              {submitting ? <><Loader2 size={18} strokeWidth={2.5} className="animate-spin" /> Menyimpan...</> : 'Simpan Kategori'}
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
              placeholder="Cari kategori..." 
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
            <table className="w-full min-w-[700px] text-sm text-left">
              <thead className="bg-nb-yellow text-nb-black font-black uppercase tracking-wide border-b-2 border-nb-black">
                <tr>
                  <th className="px-5 py-4 border-r-2 border-nb-black w-[50%]">Kategori</th>
                  <th className="px-5 py-4">Slug</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-100">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#F7F5F0] transition-colors border-b-2 border-nb-black last:border-b-0">
                      <td className="px-5 py-4 font-extrabold text-nb-black border-r-2 border-nb-black">{cat.name}</td>
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-nb-black text-xs bg-white border-2 border-nb-black px-2 py-0.5 inline-block">{cat.slug}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center text-sm font-bold text-gray-500">
                      Tidak ada kategori ditemukan
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
