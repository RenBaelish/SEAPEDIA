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
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Masuk ke Akun Anda</h2>
        </div>
        
        {error && <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">{error}</div>}

        <form class="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Email address</label>
              <input type="email" required value={email} onInput={(e) => setEmail(e.currentTarget.value)} class="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="anda@email.com" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" required value={password} onInput={(e) => setPassword(e.currentTarget.value)} class="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="••••••••" />
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
