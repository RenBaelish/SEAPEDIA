import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';

export function RoleSelection() {
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      route('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (!user.roles || user.roles.length === 0) {
      route('/login');
      return;
    }
    setRoles(user.roles);
  }, []);

  const handleSelectRole = (role: string) => {
    localStorage.setItem('activeRole', role);
    route('/'); // Redirect to the corresponding dashboard based on active role in the future
  };

  return (
    <div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Select Your Role</h2>
          <p class="mt-2 text-sm text-gray-500">You have multiple roles. Please select one to continue.</p>
        </div>
        
        <div class="mt-8 space-y-4">
          {roles.map(role => (
            <button 
              key={role}
              onClick={() => handleSelectRole(role)}
              class="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Continue as {role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
