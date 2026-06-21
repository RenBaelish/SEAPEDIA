import { useState, useEffect } from 'react';
import { api } from "../../../../lib/api";
import { Tag, Search, Plus, Loader2 } from "lucide-react";
import { Input } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
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
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kategori Produk</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola kategori utama untuk produk yang dijual.</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
          {showAddForm ? 'Tutup Form' : <><Plus size={18} /> Tambah Kategori</>}
        </Button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Tambah Kategori Baru</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nama Kategori</label>
              <Input 
                value={formData.name} 
                onChange={handleNameChange} 
                placeholder="Contoh: Pakaian Pria" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Slug (URL)</label>
              <Input 
                value={formData.slug} 
                onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                placeholder="pakaian-pria" 
                required 
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={submitting} className="bg-orange-600 hover:bg-orange-700">
              {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Kategori'}
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
              placeholder="Cari kategori..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Memuat kategori...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Nama Kategori</th>
                  <th className="px-6 py-4">Slug</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-800">{cat.name}</td>
                      <td className="px-6 py-4 font-mono text-gray-500 text-xs bg-gray-50 px-2 py-1 rounded inline-block mt-4">{cat.slug}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
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
