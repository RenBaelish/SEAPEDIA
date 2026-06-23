import { Link, useNavigate } from "react-router-dom";
import {
  Search, ShoppingCart, User, Package, LogOut, Settings,
  Bell, Wallet, ChevronDown, ChevronRight, Menu, X, Store
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
  ADMIN:  "/admin",
  DRIVER: "/driver",
};

// Category icons from /public/icon/
const CATEGORIES = [
  { label: "Handphone & Tablet", icon: "/icon/handphone-icon.png",          slug: "handphone-tablet",   subs: ["Smartphone", "Tablet", "Aksesoris HP"] },
  { label: "Komputer & Laptop",  icon: "/icon/komputer-icon.png",           slug: "komputer-laptop",    subs: ["Laptop", "PC Desktop", "Mouse & Keyboard"] },
  { label: "Elektronik",         icon: "/icon/elektronik-icon.png",         slug: "elektronik",         subs: ["TV & Monitor", "Audio", "Kamera"] },
  { label: "Rumah & Dapur",      icon: "/icon/rumah-tangga-kategori-icon.png", slug: "home-living",    subs: ["Furnitur", "Peralatan Masak", "Dekorasi"] },
  { label: "Top Up & Tagihan",   icon: "/icon/topup-icon.png",              slug: "topup-tagihan",      subs: ["Pulsa", "Paket Data", "Listrik PLN"] },
  { label: "Buku & Alat Tulis",  icon: "/icon/buku-kategori-icon.png",     slug: "buku-alat-tulis",    subs: ["Novel", "Buku Pelajaran", "Alat Tulis"] },
  { label: "Perawatan Hewan",    icon: "/icon/perawatan-hewan-icon.png",   slug: "perawatan-hewan",    subs: ["Makanan Hewan", "Aksesoris Hewan"] },
  { label: "Keuangan",           icon: "/icon/keuangan-icon.png",           slug: "keuangan",           subs: ["Asuransi", "Investasi"] },
  { label: "Semua Kategori",     icon: "/icon/kategori-icon.png",           slug: "",                   subs: [] },
];

export function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { cart } = useCartStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(CATEGORIES[0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storeInfo, setStoreInfo] = useState<any>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.activeRole === "SELLER") {
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

  const cartCount = cart?.items?.length ?? 0;

  return (
    <header className="sticky top-0 z-[100] bg-white border-b-4 border-nb-black font-sans">
      {/* ── Top Strip ── */}
      <div className="bg-nb-black text-white hidden md:block">
        <div className="page-container">
          <div className="flex items-center justify-between h-8 text-xs">
            <span className="font-semibold text-nb-yellow">SEAPEDIA — Belanja Lebih Smart</span>
            <div className="flex items-center gap-5 text-gray-300">
              <Link to="/about" className="hover:text-nb-yellow transition-colors">Tentang Kami</Link>
              <Link to="/seller" className="hover:text-nb-yellow transition-colors">Jadi Penjual</Link>
              <Link to="/search" className="hover:text-nb-yellow transition-colors">Promo</Link>
              <Link to="/help" className="hover:text-nb-yellow transition-colors">Bantuan</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <div className="page-container">
        <div className="flex items-center gap-3 md:gap-4 h-[68px]">

          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0 mr-2" aria-label="SEAPEDIA Beranda">
            <img src="/logo-seapedia.png" alt="SEAPEDIA" className="h-12 w-auto object-contain" />
          </Link>

          {/* Category Button (desktop) */}
          <div
            className="hidden md:block relative"
            onMouseEnter={() => setCategoryMenuOpen(true)}
            onMouseLeave={() => setCategoryMenuOpen(false)}
          >
            <button
              className="flex items-center gap-2 h-10 px-4 border-3 border-nb-black bg-white font-bold text-sm hover:bg-nb-yellow transition-colors"
              style={{ borderWidth: '3px' }}
            >
              <img src="/icon/kategori-icon.png" alt="" className="w-4 h-4 object-contain" />
              Kategori
              <ChevronDown size={14} strokeWidth={3} />
            </button>

            {/* Mega Menu */}
            {categoryMenuOpen && (
              <div
                className="absolute left-0 top-full pt-0 z-[200]"
                style={{ animation: 'slideDown 150ms ease' }}
              >
                <div className="w-[660px] bg-white border-4 border-nb-black shadow-[6px_6px_0px_#0A0A0A] flex mt-0">
                  {/* Left: Category list */}
                  <div className="w-52 border-r-3 border-nb-black overflow-y-auto max-h-[420px] bg-gray-50"
                    style={{ borderRightWidth: '3px' }}>
                    {CATEGORIES.filter(c => c.subs.length > 0).map((cat) => (
                      <button
                        key={cat.slug}
                        onMouseEnter={() => setHoveredCategory(cat)}
                        onClick={() => { navigate(`/search?category=${cat.slug || ''}`); setCategoryMenuOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left transition-colors border-b border-gray-200 ${
                          hoveredCategory.slug === cat.slug
                            ? "bg-nb-yellow font-bold border-l-4 border-l-nb-black"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <img src={cat.icon} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
                        <span className="flex-1 font-semibold">{cat.label}</span>
                        <ChevronRight size={12} className="text-gray-400" />
                      </button>
                    ))}
                  </div>

                  {/* Right: Sub-categories */}
                  <div className="flex-1 p-5">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-nb-black">
                      <img src={hoveredCategory.icon} alt="" className="w-6 h-6 object-contain" />
                      <h3 className="font-extrabold text-base text-nb-black">{hoveredCategory.label}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {hoveredCategory.subs.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => { navigate(`/search?q=${sub}`); setCategoryMenuOpen(false); }}
                          className="text-left text-sm font-semibold text-gray-700 hover:text-nb-black py-2 px-3 hover:bg-nb-yellow transition-colors border border-transparent hover:border-nb-black"
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
            <form onSubmit={handleSearch} className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" strokeWidth={2.5} />
              <input
                type="search"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery((e.target as any).value)}
                placeholder="Cari produk, toko, atau kategori..."
                className="w-full h-11 pl-10 pr-4 bg-white border-3 border-nb-black text-sm font-medium outline-none focus:shadow-[3px_3px_0px_#FFE600] transition-shadow placeholder:text-gray-400 placeholder:font-normal"
                style={{ borderWidth: '3px' }}
                aria-label="Cari produk"
              />
            </form>

            {/* Search Dropdown */}
            {isSearchFocused && (
              <div className="absolute left-0 top-full w-full bg-white border-3 border-nb-black border-t-0 shadow-[4px_4px_0px_#0A0A0A] z-[5] p-4"
                style={{ borderWidth: '3px' }}>
                <p className="text-xs font-bold text-nb-black uppercase tracking-wide mb-2">Pencarian Populer</p>
                <div className="flex flex-wrap gap-2">
                  {["MacBook Pro", "Sepatu Ventela", "Kipas Angin", "Poco X6"].map(term => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => { setSearchQuery(term); setIsSearchFocused(false); navigate(`/search?q=${term}`); }}
                      className="px-3 py-1.5 border-2 border-nb-black bg-white hover:bg-nb-yellow font-semibold text-xs transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">

            {isAuthenticated ? (
              <>
                {/* Cart */}
                {user?.activeRole === "BUYER" && (
                  <Link
                    to="/cart"
                    className="relative flex items-center justify-center w-11 h-11 border-3 border-nb-black bg-white hover:bg-nb-yellow transition-colors"
                    style={{ borderWidth: '3px' }}
                    aria-label="Keranjang"
                  >
                    <ShoppingCart size={20} strokeWidth={2.5} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 flex items-center justify-center bg-nb-red text-white text-xs font-bold border-2 border-nb-black px-1">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Notification */}
                <button
                  className="hidden md:flex items-center justify-center w-11 h-11 border-3 border-nb-black bg-white hover:bg-nb-yellow transition-colors"
                  style={{ borderWidth: '3px' }}
                  aria-label="Notifikasi"
                >
                  <Bell size={20} strokeWidth={2.5} />
                </button>

                {/* Account Menu */}
                <div className="relative" ref={accountRef}>
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center gap-2 h-11 px-3 border-3 border-nb-black bg-white hover:bg-nb-yellow transition-colors"
                    style={{ borderWidth: '3px' }}
                  >
                    <Avatar name={user?.fullName} size="sm" />
                    <ChevronDown size={14} strokeWidth={3} className="hidden md:block" />
                  </button>

                  {accountMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-64 bg-white border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] z-[200]"
                      style={{ borderWidth: '3px' }}>
                      {/* Header */}
                      <div className="p-4 border-b-3 border-nb-black bg-nb-yellow"
                        style={{ borderBottomWidth: '3px' }}>
                        <p className="font-extrabold text-sm text-nb-black">{user?.fullName}</p>
                        <p className="text-xs text-gray-700 font-medium">@{user?.username}</p>
                        <span className="mt-1.5 inline-block px-2 py-0.5 border-2 border-nb-black bg-white text-xs font-bold">
                          {roleLabels[user?.activeRole as RoleType]}
                        </span>
                      </div>

                      {/* Dashboard link */}
                      {roleDashboardPath[user?.activeRole as RoleType] && (
                        <Link
                          to={roleDashboardPath[user?.activeRole as RoleType]!}
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 border-b-2 border-gray-100 text-sm font-bold hover:bg-nb-yellow transition-colors"
                        >
                          <Settings size={16} strokeWidth={2.5} />
                          Dashboard
                        </Link>
                      )}

                      <Link
                        to="/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 border-b-2 border-gray-100 text-sm font-semibold hover:bg-gray-50 transition-colors"
                      >
                        <Package size={16} strokeWidth={2} />
                        Pesanan Saya
                      </Link>

                      <Link
                        to="/wallet"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 border-b-2 border-gray-100 text-sm font-semibold hover:bg-gray-50 transition-colors"
                      >
                        <Wallet size={16} strokeWidth={2} />
                        Dompet
                      </Link>

                      <Link
                        to="/account"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 border-b-2 border-gray-100 text-sm font-semibold hover:bg-gray-50 transition-colors"
                      >
                        <User size={16} strokeWidth={2} />
                        Profil Saya
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-nb-red hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} strokeWidth={2.5} />
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="auth/login"
                  className="hidden md:flex items-center justify-center h-11 px-4 border-3 border-nb-black bg-white hover:bg-gray-50 font-bold text-sm transition-colors"
                  style={{ borderWidth: '3px' }}
                >
                  Masuk
                </Link>
                <Link
                  to="auth/register"
                  className="flex items-center justify-center h-11 px-4 border-3 border-nb-black bg-nb-yellow hover:bg-[#FFD700] font-bold text-sm shadow-[3px_3px_0px_#0A0A0A] hover:shadow-[4px_4px_0px_#0A0A0A] hover:-translate-x-px hover:-translate-y-px transition-all"
                  style={{ borderWidth: '3px' }}
                >
                  Daftar
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden flex items-center justify-center w-11 h-11 border-3 border-nb-black bg-white"
              style={{ borderWidth: '3px' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} strokeWidth={3} /> : <Menu size={20} strokeWidth={3} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t-3 border-nb-black"
          style={{ borderTopWidth: '3px' }}>
          <div className="p-4 space-y-2">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <button
                key={cat.slug}
                onClick={() => { navigate(`/search?category=${cat.slug}`); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 border-2 border-gray-200 bg-gray-50 text-sm font-semibold hover:bg-nb-yellow hover:border-nb-black transition-colors"
              >
                <img src={cat.icon} alt="" className="w-5 h-5 object-contain" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
