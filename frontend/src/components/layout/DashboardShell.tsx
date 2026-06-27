import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { api } from "../../lib/api";
import { clsx } from "clsx";
import {
  LayoutDashboard, Package, ShoppingBag, Store, Ticket, Wallet,
  Users, BarChart3, Tag, Megaphone, Truck, Map, DollarSign,
  Menu, X, LogOut, ChevronRight, Home,
} from "lucide-react";
import { RoleType } from '@/types';
import { useAuthStore } from "../../store/auth.store";
import { Avatar } from "../ui/Avatar";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: Record<RoleType, NavItem[]> = {
  SELLER: [
    { label: "Dashboard",  path: "/seller",                    icon: <LayoutDashboard size={16} strokeWidth={2} /> },
    { label: "Produk",     path: "/seller/products",           icon: <Package size={16} strokeWidth={2} /> },
    { label: "Pesanan",    path: "/seller/orders",             icon: <ShoppingBag size={16} strokeWidth={2} /> },
    { label: "Toko Saya",  path: "/seller/store/settings",     icon: <Store size={16} strokeWidth={2} /> },
    { label: "Voucher",    path: "/seller/vouchers",           icon: <Ticket size={16} strokeWidth={2} /> },
    { label: "Dompet",     path: "/seller/wallet",             icon: <Wallet size={16} strokeWidth={2} /> },
  ],
  DRIVER: [
    { label: "Dashboard",       path: "/driver",                icon: <LayoutDashboard size={16} strokeWidth={2} /> },
    { label: "Job Board",       path: "/driver/jobs",           icon: <Map size={16} strokeWidth={2} /> },
    { label: "Pengiriman Saya", path: "/driver/my-deliveries", icon: <Truck size={16} strokeWidth={2} /> },
    { label: "Penghasilan",     path: "/driver/earnings",       icon: <DollarSign size={16} strokeWidth={2} /> },
    { label: "Dompet",          path: "/driver/wallet",         icon: <Wallet size={16} strokeWidth={2} /> },
  ],
  ADMIN: [
    { label: "Dashboard",  path: "/admin",              icon: <LayoutDashboard size={16} strokeWidth={2} /> },
    { label: "Pengguna",   path: "/admin/users",        icon: <Users size={16} strokeWidth={2} /> },
    { label: "Toko",       path: "/admin/stores",       icon: <Store size={16} strokeWidth={2} /> },
    { label: "Kategori",   path: "/admin/categories",   icon: <Tag size={16} strokeWidth={2} /> },
    { label: "Promo",      path: "/admin/promos",       icon: <Megaphone size={16} strokeWidth={2} /> },
    { label: "Analitik",   path: "/admin/analytics",    icon: <BarChart3 size={16} strokeWidth={2} /> },
  ],
  BUYER: [],
};

const roleColors: Record<RoleType, string> = {
  SELLER: "bg-nb-yellow text-nb-black",
  DRIVER: "bg-nb-blue text-white",
  ADMIN:  "bg-nb-red text-white",
  BUYER:  "bg-gray-200 text-gray-700",
};

const roleTitles: Record<RoleType, string> = {
  SELLER: "Dashboard Penjual",
  DRIVER: "Dashboard Driver",
  ADMIN:  "Dashboard Admin",
  BUYER:  "",
};

interface DashboardShellProps {
  role: RoleType;
}

export function DashboardShell({ role }: DashboardShellProps) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    if (role === "SELLER") {
      api.get("/stores/me").then(res => setStore(res.data.data)).catch(() => {});
    }
  }, [role]);

  const items = navItems[role] ?? [];

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-[#F7F5F0]">
      {}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full bg-white z-[50]",
          "flex flex-col transition-all duration-200",
          "border-r-4 border-nb-black shadow-[4px_0px_0px_#0A0A0A]",
          sidebarOpen ? "w-56" : "w-14"
        )}
      >
        {}
        <div className={clsx("h-2 w-full shrink-0 border-b-4 border-nb-black", roleColors[role])} />

        {}
        <div className="h-14 flex items-center justify-between px-3 border-b-4 border-nb-black shrink-0 bg-[#F7F5F0]">
          {sidebarOpen && (
            <img src="/logo-seapedia.png" alt="SEAPEDIA" className="h-10 w-auto ml-1" />
          )}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="p-1.5 text-nb-black border-2 border-transparent hover:border-nb-black hover:bg-nb-yellow transition-colors ml-auto"
            aria-label={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {}
        <nav className="flex-1 py-3 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/${role.toLowerCase()}`}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 mx-2 mb-1 px-2.5 py-2.5 text-sm font-extrabold transition-all border-2",
                  isActive
                    ? `border-nb-black bg-nb-yellow text-nb-black shadow-[2px_2px_0px_#0A0A0A] ${sidebarOpen ? 'pl-2' : ''}`
                    : "border-transparent text-gray-600 hover:bg-[#F7F5F0] hover:border-nb-black hover:text-nb-black hover:shadow-[2px_2px_0px_#0A0A0A]"
                )
              }
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate text-xs">{item.label}</span>}
              {sidebarOpen && <ChevronRight size={12} className="ml-auto text-gray-300 shrink-0" />}
            </NavLink>
          ))}
        </nav>

        {}
        <div className="p-3 border-t-4 border-nb-black shrink-0 bg-[#F7F5F0]">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <Avatar
                src={store?.logoUrl || user?.profilePictureUrl}
                name={store?.name || user?.fullName}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-nb-black truncate">{store?.name || user?.fullName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => navigate("/")}
                  className="p-1.5 text-nb-black border-2 border-transparent hover:border-nb-black hover:bg-white transition-colors"
                  title="Kembali ke Beranda"
                >
                  <Home size={14} strokeWidth={3} />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-nb-red border-2 border-transparent hover:border-nb-red hover:bg-white transition-colors"
                  title="Keluar"
                >
                  <LogOut size={14} strokeWidth={3} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => navigate("/")}
                className="w-full flex justify-center p-1.5 text-nb-black border-2 border-transparent hover:border-nb-black hover:bg-white transition-colors"
                title="Beranda"
              >
                <Home size={16} strokeWidth={3} />
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex justify-center p-1.5 text-nb-red border-2 border-transparent hover:border-nb-red hover:bg-white transition-colors"
                title="Keluar"
              >
                <LogOut size={16} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {}
      <main
        className={clsx(
          "flex-1 flex flex-col min-h-screen transition-all duration-200",
          sidebarOpen ? "ml-56" : "ml-14"
        )}
      >
        {}
        <div className="h-14 bg-white border-b-4 border-nb-black flex items-center px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className={clsx("w-2 h-6 border-2 border-nb-black shrink-0", roleColors[role].split(' ')[0])} />
            <h1 className="text-base font-extrabold text-nb-black">{roleTitles[role]}</h1>
          </div>
        </div>

        {}
        <div className="flex-1 p-5 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
