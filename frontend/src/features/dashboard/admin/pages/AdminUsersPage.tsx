import { useState, useEffect } from 'react';
import { api } from "../../../../lib/api";
import { Users, Search } from "lucide-react";
import { Input } from "../../../../components/ui/Input";

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
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola status dan akun pengguna yang terdaftar.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama, email, username..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Memuat data pengguna...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Pengguna</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Bergabung Sejak</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={user.profilePictureUrl} alt={user.fullName} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                          <div>
                            <p className="font-bold text-gray-800">{user.fullName}</p>
                            <p className="text-gray-500 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">@{user.username}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          user.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
                        }`}>
                          {user.status === 'ACTIVE' ? 'Aktif' : 'Diblokir'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
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
                          className={`text-xs px-3 py-1.5 rounded font-bold transition-colors ${
                            user.status === 'ACTIVE' 
                              ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                              : 'text-green-600 bg-green-50 hover:bg-green-100'
                          }`}
                        >
                          {user.status === 'ACTIVE' ? 'Blokir' : 'Buka Blokir'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
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
