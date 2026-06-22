import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { formatCurrency } from "../../../lib/format";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import {
  Package, Search, ShoppingBag, Store, ChevronRight,
  Wallet, Heart, Settings, Bell, Star, Edit3, User, CheckCircle
} from "lucide-react";

const ORDER_STATUS_LABELS: Record<string, { label: string, color: string, bg: string }> = {
  PENDING: { label: "Menunggu Pembayaran", color: "text-nb-black", bg: "bg-nb-yellow" },
  PAID: { label: "Sudah Dibayar", color: "text-white", bg: "bg-nb-blue" },
  PROCESSING: { label: "Diproses", color: "text-white", bg: "bg-nb-blue" },
  READY_FOR_PICKUP: { label: "Menunggu Kurir", color: "text-white", bg: "bg-[#9C27B0]" },
  IN_DELIVERY: { label: "Sedang Dikirim", color: "text-white", bg: "bg-[#00BCD4]" },
  DELIVERED: { label: "Pesanan Selesai", color: "text-white", bg: "bg-nb-green" },
  CANCELED: { label: "Dibatalkan", color: "text-white", bg: "bg-nb-red" },
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
    <div className="flex-1 w-full bg-white border-4 border-nb-black shadow-[6px_6px_0px_#0A0A0A] p-6 min-h-[600px]">
      <h1 className="text-xl font-extrabold text-nb-black mb-6 nb-section-title">Daftar Transaksi</h1>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 md:max-w-[320px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-nb-black" strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Cari transaksimu di sini"
            className="w-full h-11 pl-10 pr-4 border-3 border-nb-black bg-white font-semibold text-sm outline-none focus:bg-nb-yellow transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery((e.target as any).value)}
            style={{ borderWidth: '3px' }}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
          <span className="text-sm font-extrabold text-nb-black mr-2 shrink-0">Status</span>
          {["Semua", "Berlangsung", "Berhasil", "Tidak Berhasil"].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 px-4 h-11 border-3 border-nb-black text-sm font-extrabold transition-all ${activeFilter === filter ? "bg-nb-black text-white shadow-[3px_3px_0px_#FFE600]" : "bg-white text-nb-black hover:bg-nb-yellow"}`}
              style={{ borderWidth: '3px' }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 skeleton border-3 border-nb-black" style={{ borderWidth: '3px' }} />)}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center border-4 border-nb-black bg-[#F7F5F0] shadow-[6px_6px_0px_#0A0A0A]">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white border-4 border-nb-black mb-6 rotate-3">
            <ShoppingBag size={40} className="text-nb-black" strokeWidth={2} />
          </div>
          <h3 className="text-xl font-extrabold text-nb-black mb-2">Belum ada transaksi</h3>
          <p className="text-sm font-semibold text-gray-600 mb-6">Coba ubah filter atau kata kunci pencarianmu, ya.</p>
          <button
            onClick={() => { setActiveFilter("Semua"); setSearchQuery(""); }}
            className="btn-primary"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map(order => {
            const statusInfo = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: "text-nb-black", bg: "bg-gray-200" };
            const firstItem = order.items?.[0] || {};
            const extraItemsCount = (order.items?.length || 1) - 1;

            return (
              <div key={order.id} className="border-4 border-nb-black p-4 bg-white hover:bg-[#F7F5F0] transition-colors shadow-[4px_4px_0px_#0A0A0A]">
                {/* Card Header */}
                <div className="flex items-center justify-between pb-3 border-b-3 border-nb-black mb-3" style={{ borderBottomWidth: '3px' }}>
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={18} className="text-nb-black" strokeWidth={2.5} />
                    <span className="text-xs font-extrabold text-nb-black uppercase tracking-wide">Belanja</span>
                    <span className="text-nb-black font-black">•</span>
                    <span className="text-xs font-bold text-gray-600">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="text-nb-black font-black">•</span>
                    <span className={`text-xs font-extrabold px-2 py-1 border-2 border-nb-black ${statusInfo.bg} ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-500 hidden md:block">INV/{order.id.substring(0, 8).toUpperCase()}</span>
                </div>

                {/* Store Name */}
                <div className="flex items-center gap-2 mb-3">
                  <img src="/icon/verify-icon.png" alt="verified" className="w-4 h-4 object-contain" />
                  <span className="text-sm font-extrabold text-nb-black">{order.store?.name || "Toko SEAPEDIA"}</span>
                </div>

                {/* Content Row */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex flex-1 gap-4">
                    <div className="w-16 h-16 bg-gray-100 overflow-hidden shrink-0 border-2 border-nb-black">
                      {firstItem.productImage ? (
                        <img src={firstItem.productImage} alt={firstItem.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={24} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-extrabold text-nb-black mb-1 line-clamp-1">{firstItem.productName || "Produk SEAPEDIA"}</h4>
                      <p className="text-xs font-bold text-gray-600 mb-1">{firstItem.quantity || 1} barang x {formatCurrency(Number(firstItem.price || order.total))}</p>
                      {extraItemsCount > 0 && (
                        <p className="text-xs font-bold text-nb-blue">+{extraItemsCount} produk lainnya</p>
                      )}
                    </div>
                  </div>

                  {/* Total & Action */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-[150px] shrink-0 border-t-2 md:border-t-0 md:border-l-3 border-nb-black pt-3 md:pt-0 md:pl-4" style={{ borderLeftWidth: '3px' }}>
                    <div className="text-left md:text-right mb-0 md:mb-3">
                      <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-1">Total Belanja</p>
                      <p className="text-base font-black text-nb-black">{formatCurrency(Number(order.total))}</p>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-end mt-4 pt-3 border-t-3 border-nb-black" style={{ borderTopWidth: '3px' }}>
                  <Link 
                    to={`/orders/${order.id}`}
                    className="btn-secondary h-10 px-6 text-xs"
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
