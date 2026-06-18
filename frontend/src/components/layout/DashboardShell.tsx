import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from 'react';
import { clsx } from "clsx";
import {
  LayoutDashboard, Package, ShoppingBag, Store, Ticket, Wallet,
  Users, BarChart3, Tag, Megaphone, Truck, Map, DollarSign,
  Menu, X, ChevronRight, LogOut,
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
    { label: "Dashboard", path: "/seller", icon: <LayoutDashboard size={16} /> },
    { label: "Produk", path: "/seller/products", icon: <Package size={16} /> },
    { label: "Pesanan", path: "/seller/orders", icon: <ShoppingBag size={16} /> },
    { label: "Toko Saya", path: "/seller/store/settings", icon: <Store size={16} /> },
    { label: "Voucher", path: "/seller/vouchers", icon: <Ticket size={16} /> },
    { label: "Dompet", path: "/wallet", icon: <Wallet size={16} /> },
  ],
  DRIVER: [
    { label: "Dashboard", path: "/driver", icon: <LayoutDashboard size={16} /> },
    { label: "Job Board", path: "/driver/jobs", icon: <Map size={16} /> },
    { label: "Pengiriman Saya", path: "/driver/my-deliveries", icon: <Truck size={16} /> },
    { label: "Penghasilan", path: "/driver/earnings", icon: <DollarSign size={16} /> },
    { label: "Dompet", path: "/wallet", icon: <Wallet size={16} /> },
  ],
  ADMIN: [
    { label: "Dashboard", path: "/admin", icon: <LayoutDashboard size={16} /> },
    { label: "Pengguna", path: "/admin/users", icon: <Users size={16} /> },
    { label: "Toko", path: "/admin/stores", icon: <Store size={16} /> },
    { label: "Kategori", path: "/admin/categories", icon: <Tag size={16} /> },
    { label: "Promo", path: "/admin/promos", icon: <Megaphone size={16} /> },
    { label: "Analitik", path: "/admin/analytics", icon: <BarChart3 size={16} /> },
  ],
  BUYER: [],
};

const roleTitles: Record<RoleType, string> = {
  SELLER: "Dashboard Penjual",
  DRIVER: "Dashboard Driver",
  ADMIN: "Dashboard Admin",
  BUYER: "",
};

interface DashboardShellProps {
  role: RoleType;
  children?: React.ReactNode;
}

export function DashboardShell({ role }: DashboardShellProps) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const items = navItems[role] ?? [];

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full bg-surface border-r border-muted z-[50]",
          "flex flex-col transition-all duration-200",
          sidebarOpen ? "w-56" : "w-14"
        )}
      >
        {/* Sidebar header */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-muted shrink-0">
          {sidebarOpen && (
            <span className="text-[16px] font-extrabold text-brand leading-none">
              SEA<span className="text-primary">PEDIA</span>
            </span>
          )}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="p-1.5 rounded-md text-tertiary hover:text-secondary hover:bg-muted transition-colors ml-auto"
            aria-label={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Role badge */}
        {sidebarOpen && (
          <div className="px-3 py-3 border-b border-muted">
            <span className="text-[11px] font-bold text-tertiary uppercase tracking-wider">
              {roleTitles[role]}
            </span>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/${role.toLowerCase()}`}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 mx-2 mb-0.5 px-2.5 py-2 rounded-md text-[12px] font-semibold transition-colors",
                  isActive
                    ? "bg-primary-light text-primary"
                    : "text-secondary hover:bg-muted"
                )
              }
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <span className="truncate">{item.label}</span>
              )}
              {sidebarOpen && (
                <ChevronRight size={12} className="ml-auto text-tertiary shrink-0" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-muted shrink-0">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <Avatar src={user?.avatarUrl} name={user?.fullName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-secondary truncate">{user?.fullName}</p>
                <p className="text-[11px] text-tertiary truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md text-tertiary hover:text-error hover:bg-red-50 transition-colors shrink-0"
                aria-label="Keluar"
                title="Keluar"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full p-1.5 rounded-md text-tertiary hover:text-error hover:bg-red-50 transition-colors"
              aria-label="Keluar"
              title="Keluar"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main
        className={clsx(
          "flex-1 flex flex-col min-h-screen transition-all duration-200",
          sidebarOpen ? "ml-56" : "ml-14"
        )}
      >
        {/* Topbar */}
        <div className="h-14 bg-surface border-b border-muted flex items-center px-6 sticky top-0 z-40">
          <h1 className="text-[16px] font-bold text-secondary">{roleTitles[role]}</h1>
        </div>

        {/* Page content */}
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
