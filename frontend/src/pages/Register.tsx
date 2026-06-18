import { useState } from 'preact/hooks';
import { route } from 'preact-router';

export function Register() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['BUYER']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 'BUYER', label: 'Pembeli' },
    { id: 'SELLER', label: 'Penjual' },
    { id: 'DRIVER', label: 'Pengemudi' }
  ];

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (selectedRoles.length === 0) {
      setError('Pilih minimal 1 peran (role)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8787/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, username, email, password, roles: selectedRoles })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Register failed');

      alert('Registrasi berhasil! Silakan login.');
      route('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-card border border-muted">
        <div class="flex flex-col items-center">
          <img src="/logo-name.png" alt="SEAPEDIA" class="h-12 w-auto mb-4" />
          <h2 class="text-center text-2xl font-bold text-gray-900">Daftar Akun Baru</h2>
        </div>
        
        {error && <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">{error}</div>}

        <form class="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div class="space-y-4">
            <div>
              <label class="block text-[12px] font-bold text-gray-700 mb-1">Nama Lengkap</label>
              <input type="text" required value={fullName} onInput={(e) => setFullName(e.currentTarget.value)} class="input" />
            </div>
            <div>
              <label class="block text-[12px] font-bold text-gray-700 mb-1">Username</label>
              <input type="text" required value={username} onInput={(e) => setUsername(e.currentTarget.value)} class="input" />
            </div>
            <div>
              <label class="block text-[12px] font-bold text-gray-700 mb-1">Email address</label>
              <input type="email" required value={email} onInput={(e) => setEmail(e.currentTarget.value)} class="input" />
            </div>
            <div>
              <label class="block text-[12px] font-bold text-gray-700 mb-1">Password</label>
              <input type="password" required value={password} onInput={(e) => setPassword(e.currentTarget.value)} class="input" />
            </div>
            
            <div>
              <label class="block text-[12px] font-bold text-gray-700 mb-2">Peran Anda (Bisa pilih lebih dari satu)</label>
              <div class="flex gap-2 flex-wrap">
                {roles.map(role => (
                  <button 
                    type="button" 
                    onClick={() => handleRoleToggle(role.id)}
                    class={`chip ${selectedRoles.includes(role.id) ? 'active' : ''}`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} class="w-full btn-primary h-12 text-[14px]">
              {loading ? 'Memproses...' : 'Daftar SEAPEDIA'}
            </button>
          </div>
          <div class="text-center mt-4">
            <span class="text-[12px] text-gray-500">Sudah punya akun? </span>
            <button type="button" onClick={() => route('/login')} class="text-[12px] font-bold text-primary hover:underline">
              Masuk
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
