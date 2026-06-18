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

const STATUS_BADGE: Record<string, "success" | "warning" | "error" | "info"> = {
  ACTIVE: "success",
  DRAFT: "warning",
  INACTIVE: "error",
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
      <div className="max-w-lg mx-auto py-16 text-center">
        <Store size={48} className="text-tertiary mx-auto mb-4" />
        <h2 className="text-headline-md text-secondary mb-2">Buat Toko Dulu</h2>
        <p className="text-body-sm text-tertiary mb-6">Anda harus memiliki toko sebelum bisa menambah produk.</p>
        <Link to="/seller/store/settings" className="btn-primary h-10 px-6 inline-flex items-center gap-2 rounded-md text-[12px] font-bold">
          Buat Toko
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-headline-md text-secondary">Produk Saya</h1>
        <Link
          to="/seller/products/new"
          className="btn-primary h-10 px-4 inline-flex items-center gap-2 rounded-md text-[12px] font-bold"
        >
          <Plus size={14} /> Tambah Produk
        </Link>
      </div>

      {/* Search */}
      <Input
        placeholder="Cari produk..."
        value={search}
        onChange={(e) => setSearch((e.target as any).value)}
        leftIcon={<Search size={14} />}
        className="max-w-sm"
      />

      {/* Table */}
      <Card padding="none">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-tertiary text-[12px]">
            {products.length === 0
              ? "Belum ada produk. Tambahkan produk pertama Anda!"
              : "Tidak ada produk yang cocok."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-muted bg-[#f9fafb]">
                  <th className="text-left px-4 py-3 font-bold text-secondary w-[40%]">Produk</th>
                  <th className="text-right px-4 py-3 font-bold text-secondary">Harga</th>
                  <th className="text-right px-4 py-3 font-bold text-secondary">Stok</th>
                  <th className="text-center px-4 py-3 font-bold text-secondary">Status</th>
                  <th className="text-right px-4 py-3 font-bold text-secondary">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-muted last:border-0 hover:bg-[#fafafa] transition-colors">
                    {/* Product info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || "https://placehold.co/48x48/e5e7eb/a3a3a3?text=IMG"}
                          alt={product.name}
                          className="w-12 h-12 rounded-md object-cover border border-muted shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-secondary line-clamp-1">{product.name}</p>
                          <p className="text-[11px] text-tertiary">{product.categoryName}</p>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 text-right font-semibold text-secondary">
                      {formatCurrency(product.price)}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-right">
                      <span className={product.stock <= 5 ? "text-error font-bold" : "text-secondary"}>
                        {product.stock}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <Badge variant={STATUS_BADGE[product.status] ?? "info"}>
                        {product.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className="p-1.5 rounded-md text-tertiary hover:text-secondary hover:bg-muted transition-colors"
                          title={product.status === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"}
                        >
                          {product.status === "ACTIVE" ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => navigate(`/seller/products/${product.id}/edit`)}
                          className="p-1.5 rounded-md text-tertiary hover:text-primary hover:bg-primary-light transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="p-1.5 rounded-md text-tertiary hover:text-error hover:bg-red-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Hapus Produk?"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteId(null)} disabled={deleting}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Ya, Hapus
            </Button>
          </div>
        }
      >
        <p className="text-[12px] text-secondary">
          Produk ini akan dihapus dari katalog publik. Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </div>
  );
}
