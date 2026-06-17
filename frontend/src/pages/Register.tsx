import { useState } from 'preact/hooks';
import { route } from 'preact-router';

/**
 * Register Component
 * 
 * Renders the registration form and handles user registration with the backend.
 * Allows users to select multiple roles.
 * 
 * @returns {preact.VNode} The rendered Register component.
 */
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

  /**
   * Toggles the selection of a role.
   * 
   * @param {string} role - The role to toggle (e.g., "BUYER").
   */
  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  /**
   * Handles the submission of the registration form.
   * 
   * @param {Event} e - The form submission event.
   */
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
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Daftar Akun Baru</h2>
        </div>
        
        {error && <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">{error}</div>}

        <form class="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input type="text" required value={fullName} onInput={(e) => setFullName(e.currentTarget.value)} class="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Username</label>
              <input type="text" required value={username} onInput={(e) => setUsername(e.currentTarget.value)} class="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email address</label>
              <input type="email" required value={email} onInput={(e) => setEmail(e.currentTarget.value)} class="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" required value={password} onInput={(e) => setPassword(e.currentTarget.value)} class="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Peran Anda (Bisa pilih lebih dari satu)</label>
              <div class="flex gap-3 flex-wrap">
                {roles.map(role => (
                  <button 
                    type="button" 
                    onClick={() => handleRoleToggle(role.id)}
                    class={`px-4 py-2 border rounded-full text-sm font-medium transition-colors ${selectedRoles.includes(role.id) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
              {loading ? 'Memproses...' : 'Daftar SEAPEDIA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
