import { useState, useEffect } from 'react';
import { api } from "../../../../lib/api";
import { Users, Search } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/admin/users')
      .then(res => setUsers(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-nb-black">Manajemen Pengguna</h1>
          <p className="text-sm font-semibold text-gray-600 mt-1">Kelola status dan akun pengguna yang terdaftar.</p>
        </div>
      </div>

      <div className="bg-white border-2 border-nb-black shadow-[4px_4px_0px_#0A0A0A] overflow-hidden">
        <div className="p-4 border-b-2 border-nb-black flex items-center justify-between bg-[#F7F5F0]">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nb-black" strokeWidth={3} />
            <input 
              type="text" 
              placeholder="Cari nama, email, username..." 
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
                  <th className="px-5 py-4 border-r-2 border-nb-black w-[40%]">Pengguna</th>
                  <th className="px-5 py-4 border-r-2 border-nb-black">Kontak</th>
                  <th className="px-5 py-4 border-r-2 border-nb-black">Status</th>
                  <th className="px-5 py-4 border-r-2 border-nb-black">Bergabung</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[#F7F5F0] transition-colors border-b-2 border-nb-black last:border-b-0">
                      <td className="px-5 py-4 border-r-2 border-nb-black">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 border-2 border-nb-black bg-nb-yellow overflow-hidden shrink-0">
                            {user.profilePictureUrl ? (
                              <img src={user.profilePictureUrl} alt={user.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-black text-nb-black">{user.fullName.charAt(0)}</div>
                            )}
                          </div>
                          <div>
                            <p className="font-extrabold text-nb-black">{user.fullName}</p>
                            <p className="text-xs font-bold text-gray-500 mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-600 border-r-2 border-nb-black">@{user.username}</td>
                      <td className="px-5 py-4 border-r-2 border-nb-black">
                        <span className={`px-2 py-0.5 text-xs font-black uppercase tracking-wide border-2 ${
                          user.status === 'ACTIVE' ? 'bg-green-50 text-nb-green border-nb-green' : 'bg-red-50 text-nb-red border-nb-red'
                        }`}>
                          {user.status === 'ACTIVE' ? 'Aktif' : 'Diblokir'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-600 border-r-2 border-nb-black">
                        {new Date(user.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button 
                          onClick={async () => {
                            try {
                              const newStatus = user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
                              await api.put(`/admin/users/${user.id}/status`, { status: newStatus });
                              setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className={`text-xs px-3 py-1.5 font-black uppercase tracking-wide border-2 transition-colors ${
                            user.status === 'ACTIVE' 
                              ? 'text-nb-red bg-white border-nb-black hover:bg-nb-red hover:text-white' 
                              : 'text-nb-green bg-white border-nb-black hover:bg-nb-green hover:text-white'
                          }`}
                        >
                          {user.status === 'ACTIVE' ? 'Blokir' : 'Buka Blokir'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-gray-500">
                      Tidak ada pengguna ditemukan
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
