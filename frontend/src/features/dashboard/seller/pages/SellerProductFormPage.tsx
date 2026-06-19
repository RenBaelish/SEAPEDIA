import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
import { z } from "zod";
import { api } from "../../../../lib/api";
import { useAlert } from "../../../../contexts/AlertContext";
import { Card } from "../../../../components/ui/Card";
import { Input, Textarea } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";

// ─── Zod schema (mirrors backend) ────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(3, "Min. 3 karakter").max(200),
  description: z.string().min(10, "Min. 10 karakter"),
  price: z.coerce.number().positive("Harga harus positif"),
  comparePrice: z.coerce.number().positive().optional().or(z.literal("")),
  stock: z.coerce.number().int().nonnegative(),
  weight: z.coerce.number().positive("Berat harus positif"),
  categoryId: z.string().min(1, "Pilih kategori"),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]),
  images: z.array(z.string().url()).max(8).optional(),
});

type ProductForm = z.infer<typeof productSchema>;
type FieldErrors = Partial<Record<keyof ProductForm, string>>;

interface Category { id: string; name: string; slug: string; }

// ─── Component ────────────────────────────────────────────────────────────────

export default function SellerProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { showAlert } = useAlert();
  const isEdit = !!id;

  const [form, setForm] = useState<ProductForm>({
    name: "",
    description: "",
    price: 0,
    comparePrice: "",
    stock: 0,
    weight: 500,
    categoryId: "",
    status: "DRAFT",
    images: [],
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Fetch categories + product data (edit mode)
  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.data ?? [])).catch(() => {});

    if (isEdit) {
      api.get(`/products/${id}`)
        .then((res) => {
          const p = res.data.data;
          setForm({
            name: p.name,
            description: p.description,
            price: p.price,
            comparePrice: p.comparePrice ?? "",
            stock: p.stock,
            weight: p.weight,
            categoryId: p.categoryId,
            status: p.status,
            images: p.images ?? [],
          });
        })
        .catch(() => navigate("/seller/products"));
    }
  }, [id]);

  const setField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm((prev: ProductForm) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    try {
      new URL(newImageUrl); // validate URL format
      setField("images", [...(form.images ?? []), newImageUrl.trim()]);
      setNewImageUrl("");
    } catch {
      showAlert({ title: "Gagal", message: "URL gambar tidak valid." });
    }
  };

  const removeImage = (index: number) => {
    setField("images", (form.images ?? []).filter((_: string, i: number) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    let finalImages = form.images ?? [];
    if (newImageUrl.trim()) {
      try {
        new URL(newImageUrl.trim());
        finalImages = [...finalImages, newImageUrl.trim()];
        setNewImageUrl("");
      } catch {
        showAlert({ title: "Peringatan", message: "URL gambar baru tidak valid dan akan diabaikan." });
      }
    }

    const parsed = productSchema.safeParse({ ...form, images: finalImages });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      parsed.error.issues.forEach((issue: z.ZodIssue) => {
        const key = issue.path[0] as keyof ProductForm;
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const payload = {
      ...parsed.data,
      comparePrice: parsed.data.comparePrice || undefined,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      navigate("/seller/products");
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Gagal menyimpan produk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/seller/products"
          className="p-2 rounded-md text-tertiary hover:text-secondary hover:bg-muted transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-headline-md text-secondary">
          {isEdit ? "Edit Produk" : "Tambah Produk"}
        </h1>
      </div>

      {apiError && (
        <div className="p-3 bg-red-50 text-error text-[12px] font-semibold rounded-md">{apiError}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <Card>
          <h3 className="text-[14px] font-bold text-secondary mb-4">Informasi Produk</h3>
          <div className="space-y-4">
            <Input
              label="Nama Produk *"
              placeholder="cth: MacBook Pro M3 Max 14-inch"
              value={form.name}
              onChange={(e) => setField("name", (e.target as any).value)}
              error={errors.name}
            />
            <Textarea
              label="Deskripsi *"
              placeholder="Jelaskan produk Anda secara detail..."
              value={form.description}
              onChange={(e) => setField("description", (e.target as any).value)}
              error={errors.description}
              className="min-h-[120px]"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-secondary">Kategori *</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setField("categoryId", (e.target as any).value)}
                  className={`w-full bg-surface text-on-surface text-[12px] border rounded-md outline-none h-10 px-3 transition-colors ${
                    errors.categoryId ? "border-error" : "border-border focus:border-primary"
                  }`}
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-[11px] text-error">{errors.categoryId}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-secondary">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setField("status", (e.target as any).value as any)}
                  className="w-full bg-surface text-on-surface text-[12px] border border-border rounded-md outline-none h-10 px-3 focus:border-primary transition-colors"
                >
                  <option value="DRAFT">Draft (tidak tampil)</option>
                  <option value="ACTIVE">Aktif (tampil publik)</option>
                  <option value="INACTIVE">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Pricing & Stock */}
        <Card>
          <h3 className="text-[14px] font-bold text-secondary mb-4">Harga & Stok</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Harga (IDR) *"
              type="number"
              placeholder="0"
              value={form.price || ""}
              onChange={(e) => setField("price", Number((e.target as any).value))}
              error={errors.price}
            />
            <Input
              label="Harga Coret (IDR)"
              type="number"
              placeholder="Opsional"
              value={form.comparePrice || ""}
              onChange={(e) => setField("comparePrice", (e.target as any).value ? Number((e.target as any).value) : "")}
              error={errors.comparePrice}
            />
            <Input
              label="Stok *"
              type="number"
              placeholder="0"
              value={form.stock || ""}
              onChange={(e) => setField("stock", Number((e.target as any).value))}
              error={errors.stock}
            />
            <Input
              label="Berat (gram) *"
              type="number"
              placeholder="500"
              value={form.weight || ""}
              onChange={(e) => setField("weight", Number((e.target as any).value))}
              error={errors.weight}
            />
          </div>
        </Card>

        {/* Images */}
        <Card>
          <h3 className="text-[14px] font-bold text-secondary mb-2">Gambar Produk</h3>
          <p className="text-[11px] text-tertiary mb-4">
            Tambahkan URL gambar (maks. 8). Pastikan URL dapat diakses publik.
          </p>

          {/* Existing images */}
          {(form.images ?? []).length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {(form.images ?? []).map((url, i) => (
                <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-muted group">
                  <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-error opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new image URL */}
          {(form.images ?? []).length < 8 && (
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/image.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl((e.target as any).value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addImage}
                leftIcon={<Upload size={14} />}
              >
                Tambah
              </Button>
            </div>
          )}
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Link to="/seller/products" className="btn-secondary h-10 px-4 inline-flex items-center rounded-md text-[12px] font-bold">
            Batal
          </Link>
          <Button type="submit" loading={loading}>
            {isEdit ? "Simpan Perubahan" : "Buat Produk"}
          </Button>
        </div>
      </form>
    </div>
  );
}
