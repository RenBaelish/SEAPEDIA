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
    <div className="bg-[#F7F5F0] min-h-screen pb-16">
      <div className="page-container max-w-[1100px] py-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* ─── Sidebar Kiri ─────────────────────────────────────── */}
          <aside className="w-full md:w-[240px] shrink-0 space-y-5">
            {/* User Card */}
            <div className="bg-white border-4 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-4 flex flex-col items-center text-center">
              <div className="w-16 h-16 border-3 border-nb-black overflow-hidden bg-nb-yellow flex items-center justify-center text-nb-black font-black text-3xl mb-3 shadow-[2px_2px_0px_#0A0A0A]" style={{ borderWidth: '3px' }}>
                {user?.profilePictureUrl && user.profilePictureUrl !== "https://i.pinimg.com/736x/22/87/85/2287856db3ec37b4d0d3fd0ffd99930a.jpg" ? (
                  <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.charAt(0)?.toUpperCase() ?? "?"
                )}
              </div>
              <p className="text-base font-black text-nb-black line-clamp-1 w-full">{user?.fullName}</p>
              <Link to="/account" className="text-xs font-extrabold text-nb-blue border-b-2 border-transparent hover:border-nb-blue mt-1 transition-colors">
                Edit Profil
              </Link>
              
              {/* Member badge */}
              <div className="mt-4 flex items-center justify-center gap-1.5 bg-[#EBF5FF] border-2 border-nb-black px-3 py-1 shadow-[2px_2px_0px_#0A0A0A] w-full">
                <Star size={14} className="text-nb-yellow fill-nb-yellow stroke-nb-black" strokeWidth={2} />
                <span className="text-xs font-black text-nb-black uppercase tracking-wide">Member</span>
              </div>
            </div>

            {/* Menu groups */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-4 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
              {SIDEBAR_MENU.map(group => (
                <div key={group.group} className="bg-white border-4 border-nb-black shadow-[4px_4px_0px_#0A0A0A] min-w-[200px] sm:flex-1 md:w-full">
                  <div className="px-4 py-3 bg-[#F7F5F0] border-b-4 border-nb-black">
                    <p className="text-xs font-black text-nb-black uppercase tracking-widest">{group.group}</p>
                  </div>
                  <div className="flex flex-col">
                    {group.items.map((item, index) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.id}
                          to={item.href}
                          className={clsx(
                            "flex items-center gap-3 px-4 py-3.5 text-sm font-extrabold transition-all border-nb-black",
                            index !== group.items.length - 1 ? "border-b-3" : "",
                            active 
                              ? "bg-nb-yellow text-nb-black" 
                              : "text-gray-600 hover:bg-[#EBF5FF] hover:text-nb-black"
                          )}
                          style={{ borderBottomWidth: index !== group.items.length - 1 ? '3px' : '0px' }}
                        >
                          <span className={clsx("transition-colors", active ? "text-nb-black" : "text-gray-500")}>
                            {item.icon}
                          </span>
                          <span className="flex-1">{item.label}</span>
                          {!active && <ChevronRight size={16} className="text-gray-400" strokeWidth={3} />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
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
