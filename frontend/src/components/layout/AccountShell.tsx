import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { Star, Wallet, User, ChevronRight, Package, Settings } from "lucide-react";
import clsx from "clsx";

const SIDEBAR_MENU = [
  {
    group: "Pembelian",
    items: [
      { id: "orders", label: "Pesanan Saya", icon: <Package size={18} />, href: "/orders" },
      { id: "wallet", label: "Dompet SEAPAY", icon: <Wallet size={18} />, href: "/wallet" },
    ],
  },
  {
    group: "Profil Saya",
    items: [
      { id: "settings", label: "Pengaturan Akun", icon: <Settings size={18} />, href: "/account" },
    ],
  },
];

export default function AccountShell() {
  const { user } = useAuthStore();
  const location = useLocation();

  const isActive = (path: string) => {
    // /account matches exactly or /account?tab=address
    // /orders matches /orders and /orders/123
    if (path === "/account") return location.pathname === "/account";
    if (path === "/orders") return location.pathname.startsWith("/orders");
    if (path === "/wallet") return location.pathname === "/wallet";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="page-container max-w-[1100px] py-6">
        <div className="flex flex-col md:flex-row gap-5 items-start">
          
          {/* ─── Sidebar Kiri ─────────────────────────────────────── */}
          <aside className="w-full md:w-[220px] shrink-0 space-y-3">
            {/* User Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {user?.profilePictureUrl && user.profilePictureUrl !== "https://i.pinimg.com/736x/22/87/85/2287856db3ec37b4d0d3fd0ffd99930a.jpg" ? (
                    <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.fullName?.charAt(0)?.toUpperCase() ?? "?"
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{user?.fullName}</p>
                  <Link to="/account" className="text-xs text-green-600 font-semibold hover:underline flex items-center gap-1">
                    Edit Profil
                  </Link>
                </div>
              </div>

              {/* Member badge */}
              <div className="mt-3 flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-2.5 py-1.5 rounded-lg">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-amber-700">Member SEAPEDIA</span>
              </div>
            </div>

            {/* Menu groups */}
            {SIDEBAR_MENU.map(group => (
              <div key={group.group} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{group.group}</p>
                </div>
                {group.items.map(item => (
                  <Link
                    key={item.id}
                    to={item.href}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-gray-50 last:border-0",
                      isActive(item.href) 
                        ? "bg-green-50 text-green-700 font-semibold border-l-2 border-l-green-500" 
                        : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                    )}
                  >
                    <span className={clsx("transition-colors", isActive(item.href) ? "text-green-500" : "text-gray-400")}>{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {!isActive(item.href) && <ChevronRight size={14} className="text-gray-300" />}
                  </Link>
                ))}
              </div>
            ))}
          </aside>

          {/* ─── Konten Kanan (Outlet) ─────────────────────────────────────── */}
          <div className="flex-1 w-full min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
