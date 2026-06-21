import { useState, useEffect } from 'react';
import { api } from "../../../../lib/api";
import { Store, Search, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminStoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/admin/stores')
      .then(res => setStores(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    store.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Daftar Toko</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau dan moderasi toko yang beroperasi di platform.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama toko, domain..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Memuat data toko...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Toko</th>
                  <th className="px-6 py-4">Domain</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Bergabung</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStores.length > 0 ? (
                  filteredStores.map((store) => (
                    <tr key={store.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={store.logoUrl || 'https://i.pinimg.com/736x/d9/5f/28/d95f284e3d6f1c4e7ab5a7ecb9308e0d.jpg'} alt={store.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                          <div>
                            <p className="font-bold text-gray-800">{store.name}</p>
                            <p className="text-gray-500 text-xs line-clamp-1">{store.description || 'Tidak ada deskripsi'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-blue-600">
                        <Link to={`/store/${store.domain}`} className="hover:underline flex items-center gap-1">
                          {store.domain}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          store.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border border-green-200' :
                          store.status === 'SUSPENDED' ? 'bg-red-50 text-red-600 border border-red-200' :
                          'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {store.status === 'ACTIVE' ? 'Aktif' : store.status === 'SUSPENDED' ? 'Ditangguhkan' : 'Tutup'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(store.createdAt).toLocaleDateString('id-ID', {
                          month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <Link to={`/store/${store.domain}`} className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                          <ExternalLink size={18} />
                        </Link>
                        <button 
                          onClick={async () => {
                            try {
                              const newStatus = store.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
                              await api.put(`/admin/stores/${store.id}/status`, { status: newStatus });
                              setStores(stores.map(s => s.id === store.id ? { ...s, status: newStatus } : s));
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className={`text-xs px-3 py-1.5 rounded font-bold transition-colors ${
                            store.status === 'ACTIVE' 
                              ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                              : 'text-green-600 bg-green-50 hover:bg-green-100'
                          }`}
                        >
                          {store.status === 'ACTIVE' ? 'Suspend' : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada toko ditemukan
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
