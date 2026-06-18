import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';

export function Account() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          route('/login');
          return;
        }

        const res = await fetch('http://localhost:8787/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
          route('/login');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeRole');
    route('/login');
  };

  if (loading) return <div class="min-h-[80vh] flex items-center justify-center">Memuat profil...</div>;

  return (
    <div class="max-w-2xl mx-auto p-8 py-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Akun Saya</h1>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center">
        <div class="h-24 w-24 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-4xl mb-4">
          {user?.fullName?.charAt(0).toUpperCase()}
        </div>
        
        <h2 class="text-2xl font-bold text-gray-900 mb-1">{user?.fullName}</h2>
        <p class="text-gray-500 mb-6">@{user?.username}</p>

        <div class="w-full space-y-4 mb-8">
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
            <span class="text-gray-500 font-medium">Peran Anda</span>
            <div class="flex gap-2">
              {user?.roles?.map((role: string) => (
                <span class="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">{role}</span>
              ))}
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
            <span class="text-gray-500 font-medium">Email</span>
            <span class="font-bold text-gray-900">{user?.email || '-'}</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          class="w-full bg-red-50 text-red-600 font-bold py-3 px-4 rounded-xl hover:bg-red-100 transition-colors"
        >
          Keluar (Logout)
        </button>
      </div>
    </div>
  );
}
