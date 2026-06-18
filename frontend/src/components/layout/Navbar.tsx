import { Link, useNavigate } from "react-router-dom";
import {
  Search, ShoppingCart, User, ChevronDown, Package, LogOut, Settings,
  Bell, Wallet, Smartphone, Laptop, Monitor, Heart, Shirt, Home, BookOpen,
  Gamepad, Car, Baby, Bike, UtensilsCrossed, Gem, Dumbbell, Wrench, ChevronRight
} from "lucide-react";
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from "../../store/auth.store";
import { useCartStore } from "../../store/cart.store";
import { Avatar } from "../ui/Avatar";
import { RoleType } from '@/types';

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
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(CATEGORIES[0]);
  const menuRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const totalCartItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setCategoryMenuOpen(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    setAccountMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-[100] bg-white shadow-sm">
      {/* Top bar */}
      <div className="border-b border-gray-100 hidden md:block">
        <div className="page-container">
          <div className="flex items-center justify-between h-8 text-[11px] text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 font-semibold text-green-700"> Gratis Ongkir + Banyak Promo • Belanja di Aplikasi</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/about" className="hover:text-green-600 transition-colors">Tentang SEAPEDIA</Link>
              <Link to="/seller" className="hover:text-green-600 transition-colors">Pusat Edukasi Seller</Link>
              <Link to="/search" className="hover:text-green-600 transition-colors">Promo</Link>
              <Link to="/help" className="hover:text-green-600 transition-colors">SEAPEDIA Care</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="page-container">
        <div className="flex items-center gap-3 h-[60px]">

          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0 mr-1" aria-label="SEAPEDIA Beranda">
            <img src="/logo-name.png" alt="SEAPEDIA Logo" className="h-9 w-auto object-contain" />
          </Link>

          {/* Category Dropdown */}
          <div className="relative shrink-0" ref={categoryRef}>
            <button
              onMouseEnter={() => setCategoryMenuOpen(true)}
              onClick={() => setCategoryMenuOpen(o => !o)}
              className="flex items-center gap-1 px-3 h-9 rounded-md text-[13px] font-semibold text-gray-700 hover:bg-gray-50 border border-gray-200 transition-colors"
            >
              <span className="hidden md:block">Kategori</span>
              <ChevronDown size={14} className={`transition-transform ${categoryMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Category Mega Menu */}
            {categoryMenuOpen && (
              <div
                className="absolute left-0 top-full mt-1 w-[680px] bg-white rounded-xl shadow-2xl border border-gray-100 z-[200] flex animate-[fadeInScale_120ms_ease]"
                onMouseLeave={() => setCategoryMenuOpen(false)}
              >
                {/* Left: Category List */}
                <div className="w-56 bg-gray-50 rounded-l-xl py-2 border-r border-gray-100 overflow-y-auto max-h-[480px]">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.slug}
                        onMouseEnter={() => setHoveredCategory(cat)}
                        onClick={() => { navigate(`/search?q=${cat.label}`); setCategoryMenuOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] text-left transition-colors ${
                          hoveredCategory.slug === cat.slug
                            ? "bg-white text-green-600 font-semibold border-r-2 border-green-500"
                            : "text-gray-700 hover:bg-white"
                        }`}
                      >
                        <Icon size={15} className={hoveredCategory.slug === cat.slug ? "text-green-500" : "text-gray-400"} />
                        <span className="flex-1">{cat.label}</span>
                        <ChevronRight size={12} className="text-gray-300" />
                      </button>
                    );
                  })}
                </div>

                {/* Right: Sub-categories */}
                <div className="flex-1 p-5">
                  <h3 className="font-bold text-gray-800 text-[14px] mb-4">{hoveredCategory.label}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {hoveredCategory.subs.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => { navigate(`/search?q=${sub}`); setCategoryMenuOpen(false); }}
                        className="text-left text-[12px] text-gray-600 hover:text-green-600 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link
                      to={`/search?q=${hoveredCategory.label}`}
                      onClick={() => setCategoryMenuOpen(false)}
                      className="text-[12px] text-green-600 font-semibold hover:underline"
                    >
                      Lihat semua {hoveredCategory.label} →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery((e.target as any).value)}
                placeholder="Cari produk, toko, atau kategori..."
                className="w-full h-10 pl-9 pr-4 bg-white border-2 border-green-500 rounded-full text-[13px] outline-none focus:border-green-600 placeholder:text-gray-400"
                aria-label="Cari produk"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">

            {/* Cart */}
            {isAuthenticated && user?.activeRole === "BUYER" && (
              <Link
                to="/cart"
                className="relative flex flex-col items-center justify-center w-10 h-10 rounded-md hover:bg-gray-50 transition-colors"
                aria-label={`Keranjang (${totalCartItems} item)`}
              >
                <ShoppingCart size={20} className="text-gray-700" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                    {totalCartItems > 99 ? "99+" : totalCartItems}
                  </span>
                )}
                <span className="hidden md:block text-[9px] text-gray-500 mt-0.5">Keranjang</span>
              </Link>
            )}

            {/* Notification bell */}
            {isAuthenticated && (
              <button className="flex flex-col items-center justify-center w-10 h-10 rounded-md hover:bg-gray-50 transition-colors">
                <Bell size={20} className="text-gray-700" />
                <span className="hidden md:block text-[9px] text-gray-500 mt-0.5">Notifikasi</span>
              </button>
            )}

            {/* Wallet */}
            {isAuthenticated && user?.activeRole === "BUYER" && (
              <Link to="/wallet" className="flex flex-col items-center justify-center w-10 h-10 rounded-md hover:bg-gray-50 transition-colors">
                <Wallet size={20} className="text-gray-700" />
                <span className="hidden md:block text-[9px] text-gray-500 mt-0.5">Dompet</span>
              </Link>
            )}

            {/* Account */}
            {isAuthenticated && user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setAccountMenuOpen(o => !o)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                  aria-label="Menu akun"
                  aria-expanded={accountMenuOpen}
                >
                  <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-[12px] font-semibold text-gray-800 max-w-[90px] truncate">{user.fullName.split(" ")[0]}</span>
                    <span className="text-[10px] text-gray-400">{roleLabels[user.activeRole]}</span>
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-60 bg-white border border-gray-100 rounded-xl shadow-2xl z-[101] py-2 animate-[fadeInScale_100ms_ease]">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-[13px] font-bold text-gray-800 truncate">{user.fullName}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    </div>

                    {[
                      { to: "/account", icon: Settings, label: "Pengaturan Akun" },
                      { to: "/wallet", icon: Wallet, label: "Dompet Saya" },
                      { to: "/orders", icon: Package, label: "Pesanan Saya" },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Icon size={15} className="text-gray-400" /> {item.label}
                        </Link>
                      );
                    })}

                    {user.roles.map((role) => {
                      const path = roleDashboardPath[role];
                      if (!path) return null;
                      return (
                        <Link
                          key={role}
                          to={path}
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User size={15} className="text-gray-400" /> Dashboard {roleLabels[role]}
                        </Link>
                      );
                    })}

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} /> Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth/login" className="text-[13px] font-semibold text-green-600 px-4 h-9 border-2 border-green-500 rounded-full flex items-center hover:bg-green-50 transition-colors">
                  Masuk
                </Link>
                <Link to="/auth/register" className="text-[13px] font-semibold text-white px-4 h-9 bg-green-500 hover:bg-green-600 rounded-full flex items-center transition-colors">
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
