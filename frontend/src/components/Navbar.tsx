import { route } from "preact-router";
import { useState, useEffect } from "preact/hooks";
import { Search, ShoppingCart, User, ChevronDown, Package, LogOut, Settings, Wallet } from "lucide-preact";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch('http://localhost:8787/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
        }
      } catch (e) {
        // ignore
      }
    }
  };

  useEffect(() => {
    checkAuth();
    // Re-check periodically or listen to custom events if needed
  }, []);

  const handleSearch = (e: Event) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      route(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAccountMenuOpen(false);
    route('/');
  };

  return (
    <header className="sticky top-0 z-[100] bg-white shadow-sm">
      <div className="border-b border-gray-100 hidden md:block">
        <div className="page-container">
          <div className="flex items-center justify-between h-8 text-[11px] text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 font-semibold text-primary">🎉 Gratis Ongkir + Banyak Promo • Belanja di Aplikasi</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/about" className="hover:text-primary transition-colors">Tentang SEAPEDIA</a>
              <a href="/seller-dashboard" className="hover:text-primary transition-colors">Pusat Edukasi Seller</a>
              <a href="/" className="hover:text-primary transition-colors">Promo</a>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container">
        <div className="flex items-center gap-4 h-[60px]">
          <a href="/" className="flex items-center shrink-0 mr-1">
            <img src="/logo-name.png" alt="SEAPEDIA Logo" className="h-9 w-auto object-contain" />
          </a>

          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                placeholder="Cari produk..."
                className="w-full h-10 pl-9 pr-4 bg-white border-2 border-primary rounded-full text-[13px] outline-none focus:border-primary-hover placeholder:text-gray-400"
              />
            </div>
          </form>

          <div className="flex items-center gap-1 shrink-0">
            {user && (
              <a href="/cart" className="relative flex flex-col items-center justify-center w-10 h-10 rounded-md hover:bg-gray-50 transition-colors">
                <ShoppingCart size={20} className="text-gray-700" />
              </a>
            )}

            {user && (
              <a href="/wallet" className="flex flex-col items-center justify-center w-10 h-10 rounded-md hover:bg-gray-50 transition-colors">
                <Wallet size={20} className="text-gray-700" />
              </a>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(o => !o)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-[12px] font-semibold text-gray-800 max-w-[90px] truncate">{user.fullName.split(" ")[0]}</span>
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-60 bg-white border border-gray-100 rounded-xl shadow-2xl z-[101] py-2 animate-[fadeInScale_100ms_ease]">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-[13px] font-bold text-gray-800 truncate">{user.fullName}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    </div>

                    <a href="/account" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 transition-colors">
                      <Settings size={15} className="text-gray-400" /> Pengaturan Akun
                    </a>
                    <a href="/wallet" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 transition-colors">
                      <Wallet size={15} className="text-gray-400" /> Dompet Saya
                    </a>
                    <a href="/orders" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 transition-colors">
                      <Package size={15} className="text-gray-400" /> Pesanan Saya
                    </a>
                    {user.roles && user.roles.includes('DRIVER') && (
                      <a href="/driver-dashboard" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 transition-colors">
                        <Package size={15} className="text-gray-400" /> Driver Dashboard
                      </a>
                    )}
                    {user.roles && user.roles.includes('SELLER') && (
                      <a href="/seller-dashboard" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 transition-colors">
                        <User size={15} className="text-gray-400" /> Toko Saya
                      </a>
                    )}

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut size={15} /> Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a href="/login" className="text-[13px] font-semibold text-primary px-4 h-9 border-2 border-primary rounded-full flex items-center hover:bg-primary-light transition-colors">
                  Masuk
                </a>
                <a href="/register" className="text-[13px] font-semibold text-white px-4 h-9 bg-primary hover:bg-primary-hover rounded-full flex items-center transition-colors">
                  Daftar
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
