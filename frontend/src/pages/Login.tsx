import { useState } from 'preact/hooks';
import { route } from 'preact-router';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8787/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      const userRoles = data.data.user.roles || [];
      if (userRoles.length > 1) {
        route('/role-selection');
      } else {
        localStorage.setItem('activeRole', userRoles[0] || 'GUEST');
        route('/');
      }
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
          <h2 class="text-center text-2xl font-bold text-gray-900">Masuk ke Akun Anda</h2>
        </div>
        
        {error && <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">{error}</div>}

        <form class="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div class="space-y-4">
            <div>
              <label class="block text-[12px] font-bold text-gray-700 mb-1">Email address</label>
              <input type="email" required value={email} onInput={(e) => setEmail(e.currentTarget.value)} class="input" placeholder="anda@email.com" />
            </div>
            <div>
              <label class="block text-[12px] font-bold text-gray-700 mb-1">Password</label>
              <input type="password" required value={password} onInput={(e) => setPassword(e.currentTarget.value)} class="input" placeholder="••••••••" />
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} class="w-full btn-primary h-12 text-[14px]">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
          <div class="text-center mt-4">
            <span class="text-[12px] text-gray-500">Belum punya akun? </span>
            <button type="button" onClick={() => route('/register')} class="text-[12px] font-bold text-primary hover:underline">
              Daftar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
