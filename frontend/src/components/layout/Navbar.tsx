import { Link, useNavigate } from "react-router-dom";
import {
  Search, ShoppingCart, User, ChevronDown, Package, LogOut, Settings,
  Bell, Wallet, Smartphone, Laptop, Monitor, Heart, Shirt, Home, BookOpen,
  Gamepad, Car, Baby, Bike, UtensilsCrossed, Gem, Dumbbell, Wrench, ChevronRight,
  Mail, Store
} from "lucide-react";
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from "../../store/auth.store";
import { useCartStore } from "../../store/cart.store";
import { Avatar } from "../ui/Avatar";
import { RoleType } from '@/types';
import { api } from "../../lib/api";

const roleLabels: Record<RoleType, string> = {
  ADMIN: "Admin",
  SELLER: "Penjual",
  BUYER: "Pembeli",
  DRIVER: "Driver",
};

const roleDashboardPath: Partial<Record<RoleType, string>> = {
  SELLER: "/seller",
  ADMIN: "/admin",
  DRIVER: "/driver",
};

const CATEGORIES = [
  { label: "Handphone & Tablet", icon: Smartphone, slug: "handphone-tablet", subs: ["Smartphone", "Tablet", "Aksesoris HP"] },
  { label: "Komputer & Laptop", icon: Laptop, slug: "komputer-laptop", subs: ["Laptop", "PC Desktop", "Mouse & Keyboard"] },
  { label: "Elektronik", icon: Monitor, slug: "elektronik", subs: ["TV & Monitor", "Audio", "Kamera"] },
  { label: "Fashion Wanita", icon: Shirt, slug: "fashion-muslim", subs: ["Atasan", "Bawahan", "Hijab & Kerudung"] },
  { label: "Kesehatan", icon: Heart, slug: "kesehatan", subs: ["Vitamin", "Alat Kesehatan", "Perawatan Tubuh"] },
  { label: "Kecantikan", icon: Gem, slug: "kecantikan", subs: ["Skincare", "Makeup", "Parfum"] },
  { label: "Rumah & Dapur", icon: Home, slug: "home-living", subs: ["Furnitur", "Peralatan Masak", "Dekorasi"] },
  { label: "Makanan & Minuman", icon: UtensilsCrossed, slug: "makanan-minuman", subs: ["Makanan Ringan", "Kopi & Teh", "Bahan Masak"] },
  { label: "Olahraga", icon: Dumbbell, slug: "olahraga", subs: ["Pakaian Olahraga", "Alat Fitness", "Sepatu Olahraga"] },
  { label: "Otomotif", icon: Car, slug: "otomotif", subs: ["Aksesori Mobil", "Aksesori Motor", "Oli & Pelumas"] },
  { label: "Mainan & Hobi", icon: Gamepad, slug: "mainan-hobi", subs: ["Action Figure", "Board Game", "Puzzle"] },
  { label: "Bayi & Anak", icon: Baby, slug: "bayi-anak", subs: ["Pakaian Bayi", "Mainan Edukasi", "Perlengkapan Bayi"] },
  { label: "Buku & Alat Tulis", icon: BookOpen, slug: "buku-alat-tulis", subs: ["Novel", "Buku Pelajaran", "Alat Tulis"] },
  { label: "Sepeda & Skuter", icon: Bike, slug: "sepeda-skuter", subs: ["Sepeda Gunung", "Skuter Listrik", "Helm & Aksesori"] },
  { label: "Perkakas & Industri", icon: Wrench, slug: "perkakas", subs: ["Alat Tangan", "Mesin & Bor", "Keselamatan Kerja"] },
];

export function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { cart } = useCartStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  
  // Hover states for popovers
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [isNotifHovered, setIsNotifHovered] = useState(false);
  const [isMailHovered, setIsMailHovered] = useState(false);

  const [hoveredCategory, setHoveredCategory] = useState(CATEGORIES[0]);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [storeInfo, setStoreInfo] = useState<{name: string, logoUrl: string | null} | null>(null);

  const totalCartItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.roles.includes(RoleType.SELLER)) {
      api.get('/stores/me').then(res => {
        setStoreInfo(res.data.data);
      }).catch(() => {});
    }
  }, [isAuthenticated, user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
      setCategoryMenuOpen(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    setAccountMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-[100] bg-white shadow-sm font-sans">
      {/* Top bar */}
      <div className="border-b border-gray-100 hidden md:block bg-[#f3f4f5]">
        <div className="page-container">
          <div className="flex items-center justify-between h-8 text-[12px] text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 font-semibold text-gray-800 hover:text-green-600 transition-colors cursor-pointer">
                <Smartphone size={14}/> Download SEAPEDIA App
              </span>
            </div>
            <div className="flex items-center gap-5">
              <Link to="/about" className="hover:text-green-600 transition-colors">Tentang SEAPEDIA</Link>
              <Link to="/seller" className="hover:text-green-600 transition-colors">Pusat Edukasi Seller</Link>
              <Link to="/search" className="hover:text-green-600 transition-colors">Promo</Link>
              <Link to="/help" className="hover:text-green-600 transition-colors">SEAPEDIA Care</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="page-container relative">
        <div className="flex items-center gap-4 h-[72px]">

          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0 mr-4" aria-label="SEAPEDIA Beranda">
            <img src="/logo-name.png" alt="SEAPEDIA Logo" className="h-[42px] w-auto object-contain" />
          </Link>

          {/* Category Dropdown (Tokopedia style text button) */}
          <div className="relative shrink-0" ref={categoryRef}>
            <button
              onMouseEnter={() => setCategoryMenuOpen(true)}
              onClick={() => setCategoryMenuOpen(o => !o)}
              className="flex items-center px-3 py-1.5 rounded-md text-[13px] text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Kategori
            </button>

            {/* Category Mega Menu */}
            {categoryMenuOpen && (
              <div className="absolute left-0 top-full pt-2 z-[200]">
                <div
                  className="w-[680px] bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 flex animate-slideDown origin-top-left"
                  onMouseLeave={() => setCategoryMenuOpen(false)}
                >
                  {/* Left: Category List */}
                <div className="w-56 bg-gray-50 py-2 border-r border-gray-100 overflow-y-auto max-h-[480px]">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.slug}
                        onMouseEnter={() => setHoveredCategory(cat)}
                        onClick={() => { navigate(`/search?q=${cat.label}`); setCategoryMenuOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] text-left transition-colors ${
                          hoveredCategory.slug === cat.slug
                            ? "bg-white text-green-600 font-semibold border-l-[3px] border-green-500"
                            : "text-gray-700 hover:bg-white"
                        }`}
                      >
                        <Icon size={16} className={hoveredCategory.slug === cat.slug ? "text-green-500" : "text-gray-400"} />
                        <span className="flex-1">{cat.label}</span>
                        <ChevronRight size={14} className="text-gray-300" />
                      </button>
                    );
                  })}
                </div>

                {/* Right: Sub-categories */}
                <div className="flex-1 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <hoveredCategory.icon size={20} className="text-green-500"/>
                    <h3 className="font-extrabold text-gray-800 text-[16px]">{hoveredCategory.label}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {hoveredCategory.subs.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => { navigate(`/search?q=${sub}`); setCategoryMenuOpen(false); }}
                        className="text-left text-[13px] text-gray-600 hover:text-green-600 py-1.5 rounded-lg transition-colors"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="flex-1 relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative z-[10]">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery((e.target as any).value)}
                placeholder="Cari di SEAPEDIA"
                className="w-full h-[40px] pl-10 pr-4 bg-white border border-gray-300 rounded-lg text-[13px] outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder:text-gray-400"
                aria-label="Cari produk"
              />
            </form>
            
            {/* Search Dropdown */}
            {isSearchFocused && (
              <div className="absolute left-0 top-0 w-full pt-[50px] pb-4 bg-white border border-gray-200 rounded-b-xl shadow-lg z-[5]">
                <div className="px-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-bold text-gray-800">Pencarian Populer</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["MacBook Pro M3", "Sepatu Ventela", "Kipas Angin", "Poco X6 Pro"].map(term => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => { setSearchQuery(term); setIsSearchFocused(false); navigate(`/search?q=${term}`); }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-green-50 hover:text-green-600 rounded-full text-[12px] text-gray-600 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4 shrink-0">

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2">
                  {/* Cart Icon */}
                  {user?.activeRole === "BUYER" && (
                    <div 
                      className="relative py-2 px-1"
                      onMouseEnter={() => setIsCartHovered(true)}
                      onMouseLeave={() => setIsCartHovered(false)}
                    >
                      <Link to="/cart" className="relative p-1.5 rounded-md hover:bg-gray-100 transition-colors block">
                        <ShoppingCart size={22} className="text-gray-600" />
                        {totalCartItems > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                            {totalCartItems > 99 ? "99+" : totalCartItems}
                          </span>
                        )}
                      </Link>
                      
                      {/* Cart Dropdown */}
                      {isCartHovered && (
                        <div className="absolute right-0 top-full pt-2 z-[200]">
                          <div className="w-[300px] bg-white border border-gray-200 shadow-xl rounded-lg animate-slideDown origin-top-right">
                            <div className="p-4 flex flex-col items-center justify-center text-center">
                            {totalCartItems === 0 ? (
                              <>
                                <ShoppingCart size={40} className="text-gray-300 mb-3" />
                                <p className="text-[14px] font-bold text-gray-800">Wah, keranjang belanjamu kosong</p>
                                <p className="text-[12px] text-gray-500 mt-1 mb-4">Yuk, isi dengan barang-barang impianmu!</p>
                                <Link to="/search" className="btn-primary w-full py-2 text-[12px] font-bold rounded-md">
                                  Mulai Belanja
                                </Link>
                              </>
                            ) : (
                              <>
                                <p className="text-[14px] font-bold text-gray-800">Keranjang ({totalCartItems})</p>
                                <Link to="/cart" className="mt-4 text-green-600 text-[12px] font-bold hover:underline">
                                  Lihat Keranjang
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notification Icon */}
                  <div 
                    className="relative py-2 px-1"
                    onMouseEnter={() => setIsNotifHovered(true)}
                    onMouseLeave={() => setIsNotifHovered(false)}
                  >
                    <button className="relative p-1.5 rounded-md hover:bg-gray-100 transition-colors block">
                      <Bell size={22} className="text-gray-600" />
                    </button>

                    {/* Notif Dropdown */}
                    {isNotifHovered && (
                      <div className="absolute right-0 top-full pt-2 z-[200]">
                        <div className="w-[320px] bg-white border border-gray-200 shadow-xl rounded-lg animate-slideDown origin-top-right">
                          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                          <span className="font-bold text-[14px] text-gray-800">Notifikasi</span>
                          <Settings size={14} className="text-gray-500 cursor-pointer hover:text-green-600" />
                        </div>
                        <div className="p-6 text-center text-gray-500 text-[12px]">
                          Belum ada notifikasi baru.
                        </div>
                      </div>
                      </div>
                    )}
                  </div>

                  {/* Messages Icon */}
                  <div 
                    className="relative py-2 px-1"
                    onMouseEnter={() => setIsMailHovered(true)}
                    onMouseLeave={() => setIsMailHovered(false)}
                  >
                    <button className="relative p-1.5 rounded-md hover:bg-gray-100 transition-colors block">
                      <Mail size={22} className="text-gray-600" />
                    </button>

                    {/* Mail Dropdown */}
                    {isMailHovered && (
                      <div className="absolute right-0 top-full pt-2 z-[200]">
                        <div className="w-[320px] bg-white border border-gray-200 shadow-xl rounded-lg animate-slideDown origin-top-right">
                          <div className="p-4 border-b border-gray-100">
                          <span className="font-bold text-[14px] text-gray-800">Pesan</span>
                        </div>
                        <div className="p-6 text-center text-gray-500 text-[12px]">
                          Belum ada pesan baru.
                        </div>
                      </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-6 w-px bg-gray-200 mx-2"></div>

                {/* User Profile Section (Tokopedia Style Dual-Profile) */}
                <div className="flex items-center gap-4 relative" ref={menuRef}>
                  
                  {/* Left: Toko (if seller) */}
                  {user.roles.includes(RoleType.SELLER) && (
                    <Link to="/seller" className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-md transition-colors">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                        {storeInfo?.logoUrl ? (
                          <img src={storeInfo.logoUrl} alt="Store" className="w-full h-full object-cover" />
                        ) : (
                          <Store size={14} className="text-gray-400" />
                        )}
                      </div>
                      <span className="text-[13px] font-semibold text-gray-700 truncate max-w-[80px]">Toko</span>
                    </Link>
                  )}

                  {/* Right: User Menu */}
                  <button
                    onClick={() => setAccountMenuOpen(o => !o)}
                    className="flex items-center gap-2 px-1.5 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Avatar src={user.profilePictureUrl} name={user.fullName} size="sm" />
                    <span className="text-[13px] font-semibold text-gray-700 max-w-[90px] truncate">{user.fullName.split(" ")[0]}</span>
                  </button>

                  {/* Account Dropdown */}
                  {accountMenuOpen && (
                    <div className="absolute right-0 top-full pt-2 z-[101]">
                      <div className="w-64 bg-white border border-gray-100 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] py-2 animate-slideDown origin-top-right">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                        <Avatar src={user.profilePictureUrl} name={user.fullName} size="md" />
                        <div className="flex flex-col min-w-0">
                          <p className="text-[14px] font-bold text-gray-800 truncate">{user.fullName}</p>
                          <p className="text-[12px] text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link to="/account" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50">
                          Pengaturan Akun
                        </Link>
                        <Link to="/orders" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50">
                          Pesanan Saya
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-red-500 hover:bg-red-50"
                        >
                          Keluar
                        </button>
                      </div>
                    </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth/login" className="text-[13px] font-semibold text-green-600 px-4 h-9 border border-green-500 rounded-md flex items-center hover:bg-green-50 transition-colors">
                  Masuk
                </Link>
                <Link to="/auth/register" className="text-[13px] font-semibold text-white px-4 h-9 bg-green-500 hover:bg-green-600 rounded-md flex items-center transition-colors">
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
