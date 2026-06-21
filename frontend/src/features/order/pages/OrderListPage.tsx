import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { formatCurrency } from "../../../lib/format";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import {
  Package, Search, ShoppingBag, Store, ChevronRight,
  Wallet, Heart, Settings, Bell, Star, Edit3, User, CheckCircle
} from "lucide-react";

const SIDEBAR_MENU = [
  {
    group: "Kotak Masuk",
    items: [
      { id: "notif", label: "Notifikasi", icon: <Bell size={18} /> },
    ],
  },
  {
    group: "Pembelian",
    items: [
      { id: "orders", label: "Daftar Transaksi", icon: <Package size={18} />, href: "/orders" },
      { id: "wallet", label: "Dompet SEAPAY", icon: <Wallet size={18} />, href: "/wallet" },
    ],
  },
  {
    group: "Profil Saya",
    items: [
      { id: "wishlist", label: "Wishlist", icon: <Heart size={18} /> },
      { id: "settings", label: "Pengaturan", icon: <Settings size={18} />, href: "/account" },
    ],
  },
];

const ORDER_STATUS_LABELS: Record<string, { label: string, color: string, bg: string }> = {
  PENDING: { label: "Menunggu Pembayaran", color: "text-amber-700", bg: "bg-amber-100" },
  PAID: { label: "Sudah Dibayar", color: "text-blue-700", bg: "bg-blue-100" },
  PROCESSING: { label: "Diproses", color: "text-blue-700", bg: "bg-blue-100" },
  READY_FOR_PICKUP: { label: "Menunggu Kurir", color: "text-purple-700", bg: "bg-purple-100" },
  IN_DELIVERY: { label: "Sedang Dikirim", color: "text-brand-700", bg: "bg-brand-100" },
  DELIVERED: { label: "Pesanan Selesai", color: "text-green-700", bg: "bg-green-100" },
  CANCELED: { label: "Dibatalkan", color: "text-red-700", bg: "bg-red-100" },
};

export default function OrderListPage() {
  const { user } = useAuthStore();
  const location = useLocation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        setOrders(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    let matchStatus = true;
    if (activeFilter === "Berlangsung") {
      matchStatus = ["PENDING", "PAID", "PROCESSING", "READY_FOR_PICKUP", "IN_DELIVERY"].includes(order.status);
    } else if (activeFilter === "Berhasil") {
      matchStatus = order.status === "DELIVERED";
    } else if (activeFilter === "Tidak Berhasil") {
      matchStatus = order.status === "CANCELED";
    }

    let matchSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      matchSearch = order.store?.name?.toLowerCase().includes(q) || 
                    order.items?.some((i: any) => i.productName?.toLowerCase().includes(q));
    }

    return matchStatus && matchSearch;
  });

  return (
    <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[600px]">
            <h1 className="text-xl font-bold text-gray-800 mb-6">Daftar Transaksi</h1>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1 md:max-w-[320px]">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari transaksimu di sini"
                  className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery((e.target as any).value)}
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
                <span className="text-sm font-semibold text-gray-700 mr-2 shrink-0">Status</span>
                {["Semua", "Berlangsung", "Berhasil", "Tidak Berhasil"].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`shrink-0 px-4 h-9 rounded-lg border text-sm font-semibold transition-colors ${activeFilter === filter ? "border-green-500 bg-green-50 text-green-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Content List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl " />)}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-gray-50 rounded-full mb-6">
                  <ShoppingBag size={48} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Oops, nggak ada transaksi yang sesuai filter</h3>
                <p className="text-sm text-gray-500 mb-6">Coba ubah filter atau kata kunci pencarianmu, ya.</p>
                <button
                  onClick={() => { setActiveFilter("Semua"); setSearchQuery(""); }}
                  className="px-6 h-10 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-lg transition-colors"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(order => {
                  const statusInfo = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: "text-gray-700", bg: "bg-gray-100" };
                  const firstItem = order.items?.[0] || {};
                  const extraItemsCount = (order.items?.length || 1) - 1;

                  return (
                    <div key={order.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      {/* Card Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                        <div className="flex items-center gap-3">
                          <ShoppingBag size={16} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600">Belanja</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span className="text-gray-300">•</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${statusInfo.bg} ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 hidden md:block">INV/{order.id.substring(0, 8).toUpperCase()}</span>
                      </div>

                      {/* Store Name */}
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle size={14} className="text-blue-500" />
                        <span className="text-sm font-bold text-gray-800">{order.store?.name || "Toko SEAPEDIA"}</span>
                      </div>

                      {/* Content Row */}
                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex flex-1 gap-4">
                          <div className="w-[60px] h-[60px] rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                            {firstItem.productImage ? (
                              <img src={firstItem.productImage} alt={firstItem.productName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={24} /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1">{firstItem.productName || "Produk SEAPEDIA"}</h4>
                            <p className="text-xs text-gray-500 mb-1">{firstItem.quantity || 1} barang x {formatCurrency(Number(firstItem.price || order.total))}</p>
                            {extraItemsCount > 0 && (
                              <p className="text-xs text-gray-400">+{extraItemsCount} produk lainnya</p>
                            )}
                          </div>
                        </div>

                        {/* Total & Action */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-[150px] shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4">
                          <div className="text-left md:text-right mb-0 md:mb-3">
                            <p className="text-xs text-gray-500 mb-0.5">Total Belanja</p>
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(Number(order.total))}</p>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100">
                        <Link 
                          to={`/orders/${order.id}`}
                          className="px-6 h-9 flex items-center justify-center rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors"
                        >
                          Lihat Detail Transaksi
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
    </div>
  );
}
