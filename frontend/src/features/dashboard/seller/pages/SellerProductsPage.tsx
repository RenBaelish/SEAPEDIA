import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Store } from "lucide-react";
import { api } from "../../../../lib/api";
import { formatCurrency } from "../../../../lib/format";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import { Input } from "../../../../components/ui/Input";
import { Modal } from "../../../../components/ui/Modal";
import { useAlert } from "../../../../contexts/AlertContext";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  sold: number;
  status: string;
  images: string[];
  categoryName: string;
}

const STATUS_BADGE: Record<string, "green" | "yellow" | "red" | "blue"> = {
  ACTIVE: "green",
  DRAFT: "yellow",
  INACTIVE: "red",
};

export default function SellerProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasStore, setHasStore] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showAlert } = useAlert();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/seller/mine");
      setProducts(res.data.data);
    } catch (err: any) {
      if (err.response?.status === 404) setHasStore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteId}`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      showAlert({ title: "Gagal", message: err.response?.data?.message || "Gagal menghapus produk." });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const nextStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await api.patch(`/products/${product.id}`, { status: nextStatus });
      setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, status: nextStatus } : p));
    } catch (err: any) {
      showAlert({ title: "Gagal", message: err.response?.data?.message || "Gagal mengubah status." });
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!hasStore) {
    return (
      <div className="w-full max-w-lg mx-auto py-16 text-center border-2 border-nb-black bg-white shadow-[4px_4px_0px_#0A0A0A] p-8 mt-10">
        <Store size={48} className="text-nb-black mx-auto mb-4" strokeWidth={2} />
        <h2 className="text-xl font-extrabold text-nb-black mb-2">Buat Toko Dulu</h2>
        <p className="text-sm font-semibold text-gray-600 mb-6">Anda harus memiliki toko sebelum bisa menambah produk.</p>
        <Link to="/seller/store/settings" className="btn-primary inline-flex items-center gap-2 h-10 px-6 text-sm">
          Buat Toko
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-nb-black">Daftar Produk</h1>
          <p className="text-sm font-semibold text-gray-600 mt-1">Kelola inventaris dan katalog produk toko Anda.</p>
        </div>
        <button onClick={() => navigate("/seller/products/new")} className="btn-primary h-10 px-4 gap-2 text-sm flex items-center">
          <Plus size={18} strokeWidth={3} /> Tambah Produk
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nb-black" strokeWidth={3} />
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch((e.target.value))}
          className="nb-input pl-10 h-10 w-full bg-white text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-nb-black shadow-[4px_4px_0px_#0A0A0A] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-nb-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-600 text-sm font-bold bg-[#F7F5F0]">
            {products.length === 0
              ? "Belum ada produk. Tambahkan produk pertama Anda!"
              : "Tidak ada produk yang cocok dengan pencarian."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-semibold text-left">
              <thead>
                <tr className="border-b-2 border-nb-black bg-nb-yellow text-nb-black uppercase tracking-wide text-xs">
                  <th className="px-5 py-4 font-black w-[40%] border-r-2 border-nb-black">Produk</th>
                  <th className="px-5 py-4 font-black border-r-2 border-nb-black">Harga</th>
                  <th className="px-5 py-4 font-black border-r-2 border-nb-black">Stok</th>
                  <th className="px-5 py-4 font-black text-center border-r-2 border-nb-black">Status</th>
                  <th className="px-5 py-4 font-black text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b-2 border-nb-black last:border-b-0 hover:bg-[#F7F5F0] transition-colors">
                    {/* Product info */}
                    <td className="px-5 py-4 border-r-2 border-nb-black">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 border-2 border-nb-black shrink-0 bg-white overflow-hidden">
                          <img
                            src={product.images?.[0] || "https://placehold.co/48x48/FCD34D/0A0A0A?text=IMG"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-extrabold text-nb-black line-clamp-1">{product.name}</p>
                          <p className="text-xs font-bold text-gray-500 mt-0.5">{product.categoryName}</p>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 font-extrabold text-nb-black border-r-2 border-nb-black">
                      {formatCurrency(product.price)}
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-4 border-r-2 border-nb-black">
                      <span className={`font-extrabold px-2 py-0.5 border-2 ${product.stock <= 5 ? "border-nb-red bg-red-50 text-nb-red" : "border-nb-black bg-white text-nb-black"}`}>
                        {product.stock}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center border-r-2 border-nb-black">
                      <Badge variant={STATUS_BADGE[product.status] ?? "blue"} className="border-2 border-nb-black">
                        {product.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className="w-8 h-8 flex items-center justify-center border-2 border-nb-black bg-white hover:bg-nb-yellow text-nb-black transition-colors"
                          title={product.status === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"}
                        >
                          {product.status === "ACTIVE" ? <EyeOff size={16} strokeWidth={2.5} /> : <Eye size={16} strokeWidth={2.5} />}
                        </button>
                        <button
                          onClick={() => navigate(`/seller/products/${product.id}/edit`)}
                          className="w-8 h-8 flex items-center justify-center border-2 border-nb-black bg-white hover:bg-nb-blue hover:text-white text-nb-black transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="w-8 h-8 flex items-center justify-center border-2 border-nb-black bg-white hover:bg-nb-red hover:text-white text-nb-black transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Hapus Produk?"
        footer={
          <div className="flex gap-3 justify-end">
            <button className="btn-secondary px-6" onClick={() => setDeleteId(null)} disabled={deleting}>
              Batal
            </button>
            <button className="btn-primary px-6 disabled:opacity-50" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        }
      >
        <p className="text-sm font-bold text-gray-700">
          Produk ini akan dihapus dari katalog publik. Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </div>
  );
}
