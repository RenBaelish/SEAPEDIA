import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Package, ShoppingBag, TrendingUp, Store, Plus } from "lucide-react";
import { api } from "../../../../lib/api";
import { useAuthStore } from "../../../../store/auth.store";
import { Card } from "../../../../components/ui/Card";
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
      <div className="flex justify-center items-center h-40">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No store yet — prompt to create one
  if (!hasStore) {
    return (
      <div className="w-full max-w-lg mx-auto py-16 text-center">
        <Store size={48} className="text-tertiary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-secondary mb-2">Belum Punya Toko</h2>
        <p className="text-xs text-tertiary mb-8">
          Buat toko Anda sekarang untuk mulai berjualan di SEAPEDIA.
        </p>
        <Link to="/seller/store/settings" className="btn-primary h-10 px-6 inline-flex items-center gap-2 rounded-md text-xs font-bold">
          <Plus size={16} /> Buat Toko Sekarang
        </Link>
      </div>
    );
  }

  const stats = [
    { label: "Total Pendapatan", value: formatCurrency(income?.totalIncome || 0), icon: TrendingUp, color: "text-brand-500", bg: "bg-brand-100", link: "/seller/wallet", linkLabel: "Cek Saldo" },
    { label: "Total Penjualan", value: store?.totalSales ?? 0, icon: ShoppingBag, color: "text-primary", bg: "bg-primary-light", link: "/seller/orders", linkLabel: "Kelola Pesanan" },
    { label: "Total Produk", value: store?._count?.products ?? 0, icon: Package, color: "text-blue-500", bg: "bg-blue-100", link: "/seller/products", linkLabel: "Kelola Produk" },
    { label: "Rating Toko", value: (store?.rating ?? 0).toFixed(1), icon: Store, color: "text-purple-500", bg: "bg-purple-100", link: `/store/${store?.domain}`, linkLabel: "Lihat Toko" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Selamat datang, <span className="text-brand-600">{user?.fullName}</span>!
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Toko: <span className="font-bold text-gray-700">{store?.name}</span>
            &nbsp;·&nbsp;
            <span className={`font-semibold ${store?.status === "ACTIVE" ? "text-green-600" : "text-red-600"}`}>
              {store?.status === 'ACTIVE' ? 'Aktif' : store?.status === 'SUSPENDED' ? 'Ditangguhkan' : store?.status}
            </span>
          </p>
        </div>
        <Link
          to="/seller/products/new"
          className="btn-primary h-10 px-4 inline-flex items-center gap-2 rounded-md text-xs font-bold"
        >
          <Plus size={14} /> Tambah Produk
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                </div>
              </div>
              <Link to={stat.link} className="text-brand-600 text-sm font-medium mt-auto hover:underline">
                {stat.linkLabel} &rarr;
              </Link>
            </Card>
          );
        })}
      </div>

      {/* Quick links */}
      <Card>
        <h3 className="text-sm font-bold text-secondary mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Kelola Produk", to: "/seller/products", icon: Package },
            { label: "Lihat Pesanan", to: "/seller/orders", icon: ShoppingBag },
            { label: "Pengaturan Toko", to: "/seller/store/settings", icon: Store },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-2 p-3 border border-muted rounded-md hover:border-primary hover:bg-primary-light text-secondary hover:text-primary transition-all text-xs font-semibold"
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
