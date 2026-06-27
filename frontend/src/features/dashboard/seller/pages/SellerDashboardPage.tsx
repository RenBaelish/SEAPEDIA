import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Package, ShoppingBag, TrendingUp, Store, Plus, ArrowRight } from "lucide-react";
import { api } from "../../../../lib/api";
import { useAuthStore } from "../../../../store/auth.store";
import { formatCurrency } from "../../../../lib/format";

interface StoreData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  rating: number;
  totalSales: number;
  status: string;
  _count: { products: number; orders: number };
}

export default function SellerDashboardPage() {
  const { user } = useAuthStore();
  const [store, setStore] = useState<StoreData | null>(null);
  const [income, setIncome] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasStore, setHasStore] = useState(true);

  useEffect(() => {
    api.get("/stores/me/stats")
      .then((res) => {
        setStore(res.data.data.store);
        setHasStore(true);
        setIncome(res.data.data.income);
      })
      .catch((err) => {
        if (err.response?.status === 404) setHasStore(false);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 skeleton border-2 border-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (!hasStore) {
    return (
      <div className="w-full max-w-lg mx-auto py-16 text-center">
        <div className="border-4 border-nb-black shadow-[6px_6px_0px_#0A0A0A] p-10 bg-white">
          <div className="w-16 h-16 bg-nb-yellow border-2 border-nb-black mx-auto mb-4 flex items-center justify-center">
            <Store size={32} strokeWidth={2} />
          </div>
          <h2 className="text-xl font-extrabold text-nb-black mb-2">Belum Punya Toko</h2>
          <p className="text-sm text-gray-500 mb-6">
            Buat toko Anda sekarang untuk mulai berjualan di SEAPEDIA.
          </p>
          <Link
            to="/seller/store/settings"
            className="inline-flex items-center gap-2 px-6 py-3 border-3 border-nb-black bg-nb-black text-white font-bold text-sm shadow-[4px_4px_0px_#FFE600] hover:shadow-[5px_5px_0px_#FFE600] hover:-translate-x-px hover:-translate-y-px transition-all"
            style={{ borderWidth: '3px' }}
          >
            <Plus size={16} /> Buat Toko Sekarang
          </Link>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Pendapatan",
      value: formatCurrency(income?.totalIncome || 0),
      icon: TrendingUp,
      accent: "bg-nb-yellow",
      link: "/seller/wallet",
      linkLabel: "Cek Saldo",
    },
    {
      label: "Total Penjualan",
      value: store?.totalSales ?? 0,
      icon: ShoppingBag,
      accent: "bg-nb-blue",
      link: "/seller/orders",
      linkLabel: "Kelola Pesanan",
    },
    {
      label: "Total Produk",
      value: store?._count?.products ?? 0,
      icon: Package,
      accent: "bg-gray-800",
      link: "/seller/products",
      linkLabel: "Kelola Produk",
    },
    {
      label: "Rating Toko",
      value: `${(store?.rating ?? 0).toFixed(1)} ★`,
      icon: Store,
      accent: "bg-nb-green",
      link: `/store/${store?.slug}`,
      linkLabel: "Lihat Toko",
    },
  ];

  const quickLinks = [
    { label: "Tambah Produk", to: "/seller/products/new", icon: Plus },
    { label: "Kelola Produk", to: "/seller/products", icon: Package },
    { label: "Lihat Pesanan", to: "/seller/orders", icon: ShoppingBag },
    { label: "Pengaturan Toko", to: "/seller/store/settings", icon: Store },
  ];

  return (
    <div className="space-y-5">

      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-nb-black">
            Selamat datang, <span className="text-nb-blue">{user?.fullName}</span>!
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 font-medium">
            Toko: <span className="font-bold text-nb-black">{store?.name}</span>
            &nbsp;·&nbsp;
            <span className={store?.status === "ACTIVE" ? "text-green-600 font-bold" : "text-nb-red font-bold"}>
              {store?.status === 'ACTIVE' ? '● Aktif' : '● Ditangguhkan'}
            </span>
          </p>
        </div>
        <Link
          to="/seller/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-nb-black bg-nb-black text-white font-bold text-sm shadow-[3px_3px_0px_#FFE600] hover:shadow-[4px_4px_0px_#FFE600] hover:-translate-x-px hover:-translate-y-px transition-all self-start"
        >
          <Plus size={14} strokeWidth={3} /> Tambah Produk
        </Link>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white border-2 border-gray-200 hover:border-nb-black shadow-[2px_2px_0px_rgba(0,0,0,0.08)] hover:shadow-[3px_3px_0px_#0A0A0A] transition-all p-4 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 flex items-center justify-center ${stat.accent} border-2 border-nb-black`}>
                  <Icon size={18} className="text-white" strokeWidth={2} />
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
              </div>
              <p className="text-2xl font-extrabold text-nb-black mb-3">{stat.value}</p>
              <Link
                to={stat.link}
                className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-nb-black hover:text-nb-blue transition-colors"
              >
                {stat.linkLabel} <ArrowRight size={12} strokeWidth={3} />
              </Link>
            </div>
          );
        })}
      </div>

      {}
      <div className="bg-white border-2 border-gray-200 p-4">
        <h3 className="text-sm font-extrabold text-nb-black mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-nb-yellow inline-block" />
          Aksi Cepat
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-2 p-3 border-2 border-gray-200 bg-white hover:border-nb-black hover:bg-gray-50 text-gray-700 hover:text-nb-black transition-all text-xs font-bold"
              >
                <Icon size={15} strokeWidth={2} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
