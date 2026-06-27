import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Upload, X, ImagePlus } from "lucide-react";
import { z } from "zod";
import { api } from "../../../../lib/api";
import { useAlert } from "../../../../contexts/AlertContext";
import { Modal } from "../../../../components/ui/Modal";

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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
      new URL(newImageUrl);
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
      {}
      <div className="flex items-center gap-3">
        <Link
          to="/seller/products"
          className="w-10 h-10 border-2 border-nb-black bg-white hover:bg-nb-yellow flex items-center justify-center transition-colors text-nb-black shadow-[2px_2px_0px_#0A0A0A]"
        >
          <ArrowLeft size={18} strokeWidth={3} />
        </Link>
        <h1 className="text-2xl font-extrabold text-nb-black">
          {isEdit ? "Edit Produk" : "Tambah Produk"}
        </h1>
      </div>

      {apiError && (
        <div className="p-3 bg-red-50 text-nb-red text-sm font-bold border-2 border-nb-red">{apiError}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {}
        <div className="bg-white border-2 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-6">
          <h3 className="text-base font-extrabold text-nb-black mb-5 border-b-2 border-gray-100 pb-2">Informasi Produk</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1.5">Nama Produk *</label>
              <input
                type="text"
                placeholder="cth: MacBook Pro M3 Max 14-inch"
                value={form.name}
                onChange={(e) => setField("name", (e.target as any).value)}
                className={`nb-input w-full ${errors.name ? "border-nb-red focus:border-nb-red bg-red-50" : ""}`}
              />
              {errors.name && <p className="text-nb-red font-bold text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1.5">Deskripsi *</label>
              <textarea
                placeholder="Jelaskan produk Anda secara detail..."
                value={form.description}
                onChange={(e) => setField("description", (e.target as any).value)}
                className={`nb-input w-full min-h-[120px] py-3 ${errors.description ? "border-nb-red focus:border-nb-red bg-red-50" : ""}`}
              />
              {errors.description && <p className="text-nb-red font-bold text-xs mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-nb-black uppercase tracking-wide">Kategori *</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setField("categoryId", (e.target as any).value)}
                  className={`nb-input h-11 w-full ${errors.categoryId ? "border-nb-red focus:border-nb-red bg-red-50" : ""}`}
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-nb-red font-bold text-xs mt-1">{errors.categoryId}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-nb-black uppercase tracking-wide">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setField("status", (e.target as any).value as any)}
                  className="nb-input h-11 w-full"
                >
                  <option value="DRAFT">Draft (tidak tampil)</option>
                  <option value="ACTIVE">Aktif (tampil publik)</option>
                  <option value="INACTIVE">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white border-2 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-6">
          <h3 className="text-base font-extrabold text-nb-black mb-5 border-b-2 border-gray-100 pb-2">Harga & Stok</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1.5">Harga (IDR) *</label>
              <input
                type="number"
                placeholder="0"
                value={form.price || ""}
                onChange={(e) => setField("price", Number((e.target as any).value))}
                className={`nb-input w-full ${errors.price ? "border-nb-red focus:border-nb-red bg-red-50" : ""}`}
              />
              {errors.price && <p className="text-nb-red font-bold text-xs mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1.5">Harga Coret (IDR)</label>
              <input
                type="number"
                placeholder="Opsional"
                value={form.comparePrice || ""}
                onChange={(e) => setField("comparePrice", (e.target as any).value ? Number((e.target as any).value) : "")}
                className={`nb-input w-full ${errors.comparePrice ? "border-nb-red focus:border-nb-red bg-red-50" : ""}`}
              />
              {errors.comparePrice && <p className="text-nb-red font-bold text-xs mt-1">{errors.comparePrice}</p>}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1.5">Stok *</label>
              <input
                type="number"
                placeholder="0"
                value={form.stock || ""}
                onChange={(e) => setField("stock", Number((e.target as any).value))}
                className={`nb-input w-full ${errors.stock ? "border-nb-red focus:border-nb-red bg-red-50" : ""}`}
              />
              {errors.stock && <p className="text-nb-red font-bold text-xs mt-1">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1.5">Berat (gram) *</label>
              <input
                type="number"
                placeholder="500"
                value={form.weight || ""}
                onChange={(e) => setField("weight", Number((e.target as any).value))}
                className={`nb-input w-full ${errors.weight ? "border-nb-red focus:border-nb-red bg-red-50" : ""}`}
              />
              {errors.weight && <p className="text-nb-red font-bold text-xs mt-1">{errors.weight}</p>}
            </div>
          </div>
        </div>

        {}
        <div className="bg-white border-2 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-6">
          <h3 className="text-base font-extrabold text-nb-black mb-2 border-b-2 border-gray-100 pb-2">Gambar Produk</h3>
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-semibold text-gray-500">
              Tambahkan URL gambar (maks. 8). Pastikan URL dapat diakses publik.
            </p>
            <button 
              type="button" 
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-nb-black border-2 border-nb-black px-3 py-1.5 bg-gray-50 hover:bg-nb-yellow transition-colors"
            >
              <ImagePlus size={14} strokeWidth={2.5} />
              Upload Foto
            </button>
          </div>

          {}
          {(form.images ?? []).length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-5">
              {(form.images ?? []).map((url, i) => (
                <div key={i} className="relative aspect-square border-2 border-nb-black overflow-hidden group bg-gray-100">
                  <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-white border-2 border-nb-black text-nb-red opacity-0 group-hover:opacity-100 transition-opacity hover:bg-nb-yellow"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {}
          {(form.images ?? []).length < 8 && (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl((e.target as any).value)}
                className="nb-input w-full h-11"
              />
              <button
                type="button"
                onClick={addImage}
                className="btn-secondary px-5 h-11 flex items-center gap-2 shrink-0"
              >
                <Upload size={16} strokeWidth={2.5} /> Tambah
              </button>
            </div>
          )}
        </div>

        {}
        <div className="flex gap-4">
          <Link to="/seller/products" className="btn-secondary px-6 py-3">
            Batal
          </Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 disabled:opacity-50">
            {loading ? "Menyimpan..." : (isEdit ? "Simpan Perubahan" : "Buat Produk")}
          </button>
        </div>
      </form>

      {}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Foto">
        <div className="p-4 text-center">
          <ImagePlus size={48} className="mx-auto text-gray-300 mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-extrabold text-nb-black mb-2">Fitur Belum Tersedia</h3>
          <p className="text-sm font-medium text-gray-600 mb-6">
            Fitur upload gambar langsung dari komputer sedang dalam pengembangan. Untuk sementara, gunakan fitur tautan (URL) gambar untuk mengunggah foto produk Anda.
          </p>
          <button onClick={() => setIsUploadModalOpen(false)} className="btn-primary px-6 py-2 mx-auto">
            Mengerti
          </button>
        </div>
      </Modal>
    </div>
  );
}
