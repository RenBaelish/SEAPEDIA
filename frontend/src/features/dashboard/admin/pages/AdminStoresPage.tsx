import { useState, useEffect } from 'react';
import { api } from "../../../../lib/api";
import { Store, Search, ExternalLink, Info, Star, CreditCard, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { Modal } from "../../../../components/ui/Modal";
import { Avatar } from "../../../../components/ui/Avatar";

export default function AdminStoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState<any>(null);

  useEffect(() => {
    api.get('/admin/stores')
      .then(res => setStores(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (store.slug && store.slug.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-nb-black">Daftar Toko</h1>
          <p className="text-sm font-semibold text-gray-600 mt-1">Pantau dan moderasi toko yang beroperasi di platform.</p>
        </div>
      </div>

      <div className="bg-white border-2 border-nb-black shadow-[4px_4px_0px_#0A0A0A] overflow-hidden">
        <div className="p-4 border-b-2 border-nb-black flex items-center justify-between bg-[#F7F5F0]">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nb-black" strokeWidth={3} />
            <input 
              type="text" 
              placeholder="Cari nama toko, domain..." 
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
            <table className="w-full min-w-[800px] text-sm text-left">
              <thead className="bg-nb-yellow text-nb-black font-black uppercase tracking-wide border-b-2 border-nb-black">
                <tr>
                  <th className="px-5 py-4 border-r-2 border-nb-black w-[40%]">Toko</th>
                  <th className="px-5 py-4 border-r-2 border-nb-black">Slug / Link</th>
                  <th className="px-5 py-4 border-r-2 border-nb-black">Status</th>
                  <th className="px-5 py-4 border-r-2 border-nb-black">Bergabung</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-100">
                {filteredStores.length > 0 ? (
                  filteredStores.map((store) => (
                    <tr key={store.id} className="hover:bg-[#F7F5F0] transition-colors border-b-2 border-nb-black last:border-b-0">
                      <td className="px-5 py-4 border-r-2 border-nb-black">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 shrink-0">
                            <Avatar src={store.logoUrl} name={store.name} size="md" />
                          </div>
                          <div>
                            <p className="font-extrabold text-nb-black">{store.name}</p>
                            <p className="text-xs font-bold text-gray-500 line-clamp-1 mt-0.5">{store.description || 'Tidak ada deskripsi'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-nb-blue border-r-2 border-nb-black">
                        <Link to={`/store/${store.slug}`} className="hover:underline flex items-center gap-1">
                          {store.slug}
                        </Link>
                      </td>
                      <td className="px-5 py-4 border-r-2 border-nb-black">
                        <span className={`px-2 py-0.5 text-xs font-black uppercase tracking-wide border-2 inline-block ${
                          store.status === 'ACTIVE' ? 'bg-green-50 text-nb-green border-nb-green' :
                          store.status === 'SUSPENDED' ? 'bg-red-50 text-nb-red border-nb-red' :
                          'bg-gray-100 text-nb-black border-nb-black'
                        }`}>
                          {store.status === 'ACTIVE' ? 'Aktif' : store.status === 'SUSPENDED' ? 'Ditangguhkan' : 'Tutup'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-600 border-r-2 border-nb-black">
                        {new Date(store.createdAt).toLocaleDateString('id-ID', {
                          month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setSelectedStore(store)}
                            className="w-8 h-8 flex items-center justify-center border-2 border-nb-black bg-white hover:bg-nb-yellow text-nb-black transition-colors" 
                            title="Lihat Detail Toko"
                          >
                            <Info size={16} strokeWidth={2.5} />
                          </button>
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
                            className={`text-xs px-3 h-8 flex items-center font-black uppercase tracking-wide border-2 transition-colors ${
                              store.status === 'ACTIVE' 
                                ? 'text-nb-red bg-white border-nb-black hover:bg-nb-red hover:text-white' 
                                : 'text-nb-green bg-white border-nb-black hover:bg-nb-green hover:text-white'
                            }`}
                          >
                            {store.status === 'ACTIVE' ? 'Suspend' : 'Aktifkan'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-gray-500">
                      Tidak ada toko ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedStore} onClose={() => setSelectedStore(null)} title="Detail Toko Khusus Admin">
        {selectedStore && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b-2 border-gray-100">
              <div className="w-16 h-16 shrink-0">
                <Avatar src={selectedStore.logoUrl} name={selectedStore.name} size="lg" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-nb-black leading-tight">{selectedStore.name}</h3>
                <p className="text-sm font-bold text-nb-blue mb-1">@{selectedStore.slug}</p>
                <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wide border-2 inline-block ${
                  selectedStore.status === 'ACTIVE' ? 'bg-green-50 text-nb-green border-nb-green' :
                  selectedStore.status === 'SUSPENDED' ? 'bg-red-50 text-nb-red border-nb-red' :
                  'bg-gray-100 text-nb-black border-nb-black'
                }`}>
                  {selectedStore.status === 'ACTIVE' ? 'Aktif' : selectedStore.status === 'SUSPENDED' ? 'Ditangguhkan' : 'Tutup'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F7F5F0] border-2 border-nb-black p-3">
                <p className="text-[10px] font-extrabold text-gray-500 uppercase flex items-center gap-1.5 mb-1"><DollarSign size={12} /> Total Penjualan</p>
                <p className="text-lg font-black text-nb-green">{selectedStore.totalSales || 0}</p>
              </div>
              <div className="bg-[#F7F5F0] border-2 border-nb-black p-3">
                <p className="text-[10px] font-extrabold text-gray-500 uppercase flex items-center gap-1.5 mb-1"><Star size={12} /> Rating</p>
                <p className="text-lg font-black text-nb-black">{selectedStore.rating || 0}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-extrabold text-gray-500 uppercase mb-1">Deskripsi Toko</p>
              <p className="text-sm font-bold text-gray-800 bg-gray-50 p-3 border-2 border-gray-200">
                {selectedStore.description || 'Toko ini belum menambahkan deskripsi apapun.'}
              </p>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-3 border-2 border-gray-200">
              <div>
                <p className="text-[10px] font-extrabold text-gray-500 uppercase mb-1">Terdaftar Sejak</p>
                <p className="text-sm font-black text-nb-black">
                  {new Date(selectedStore.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <Link to={`/store/${selectedStore.slug}`} className="btn-secondary h-9 px-4 text-xs flex items-center gap-2">
                Kunjungi Halaman <ExternalLink size={14} strokeWidth={2.5} />
              </Link>
            </div>
            
            <button onClick={() => setSelectedStore(null)} className="btn-primary w-full py-2.5">Tutup</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
