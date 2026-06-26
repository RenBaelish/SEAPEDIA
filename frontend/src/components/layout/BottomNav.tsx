import { Home, Search, ShoppingCart, Receipt, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useCartStore } from "../../store/cart.store";

export function BottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { cart } = useCartStore();
  const cartCount = cart?.items?.length ?? 0;

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Cari", path: "/search", icon: Search },
    { label: "Keranjang", path: "/cart", icon: ShoppingCart, badge: cartCount },
    { label: "Transaksi", path: "/orders", icon: Receipt, requiresAuth: true },
    { label: "Akun", path: "/account", icon: User, requiresAuth: true },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t-4 border-nb-black flex justify-around items-center h-[72px] pb-safe shadow-[0_-4px_0px_#0A0A0A]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
        const targetPath = item.requiresAuth && !isAuthenticated ? "/auth/login" : item.path;
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            to={targetPath}
            className={`relative flex flex-col items-center justify-center w-full h-full text-nb-black transition-colors ${isActive ? "bg-nb-yellow" : "bg-white hover:bg-[#F7F5F0]"}`}
          >
            {/* Active Indicator (Brutalism line at top) */}
            {isActive && (
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-nb-black"></div>
            )}
            
            <div className={`relative mb-1 ${isActive ? "scale-110" : ""} transition-transform`}>
              <Icon size={24} strokeWidth={isActive ? 3 : 2.5} />
              
              {/* Badge for Cart */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-nb-red text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-none border-2 border-nb-black shadow-[1px_1px_0px_#0A0A0A]">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-extrabold ${isActive ? "text-nb-black" : "text-gray-600"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
