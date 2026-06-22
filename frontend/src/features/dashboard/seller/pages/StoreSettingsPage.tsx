import { useState, useEffect } from 'react';
import { Store, Save } from "lucide-react";
import { z } from "zod";
import { api } from "../../../../lib/api";

const createStoreSchema = z.object({
  name: z.string().min(3, "Min. 3 karakter").max(100),
  description: z.string().max(1000).optional(),
});

const updateStoreSchema = z.object({
  name: z.string().min(3, "Min. 3 karakter").max(100).optional(),
  description: z.string().max(1000).optional(),
  logoUrl: z.string().url("URL tidak valid").optional().or(z.literal("")),
  bannerUrl: z.string().url("URL tidak valid").optional().or(z.literal("")),
});

interface StoreForm {
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
}

export default function StoreSettingsPage() {
  const [store, setStore] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<StoreForm>({ name: "", description: "", logoUrl: "", bannerUrl: "" });
  const [errors, setErrors] = useState<Partial<StoreForm>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    api.get("/stores/me")
      .then((res) => {
        const s = res.data.data;
        setStore(s);
        if (s) {
          setForm({
            name: s.name,
            description: s.description ?? "",
            logoUrl: s.logoUrl ?? "",
            bannerUrl: s.bannerUrl ?? "",
          });
        }
      })
      .catch(() => setStore(null))
      .finally(() => setLoading(false));
  }, []);

  const setField = (key: keyof StoreForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSuccessMsg(null);
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMsg(null);

    const schema = store ? updateStoreSchema : createStoreSchema;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<StoreForm> = {};
      parsed.error.issues.forEach((issue: z.ZodIssue) => {
        fieldErrors[issue.path[0] as keyof StoreForm] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    try {
      if (store) {
        const res = await api.patch("/stores/me", parsed.data);
        setStore(res.data.data);
        setSuccessMsg("Informasi toko berhasil diperbarui!");
      } else {
        const res = await api.post("/stores", parsed.data);
        setStore(res.data.data);
        setSuccessMsg("Toko berhasil dibuat! Anda bisa mulai menambahkan produk.");
      }
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Gagal menyimpan toko.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-10 h-10 border-4 border-nb-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-nb-black">
            {store ? "Pengaturan Toko" : "Buat Toko"}
          </h1>
          <p className="text-sm font-semibold text-gray-600 mt-1">Ubah profil, deskripsi, dan status toko Anda.</p>
        </div>
      </div>

      {/* Store avatar preview */}
      {store && (
        <div className="flex items-center gap-5 bg-white border-2 border-nb-black p-5 shadow-[4px_4px_0px_#0A0A0A]">
          <div className="w-16 h-16 border-2 border-nb-black flex items-center justify-center overflow-hidden shrink-0 bg-nb-yellow">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-nb-black">{store.name?.charAt(0) || "S"}</span>
            )}
          </div>
          <div>
            <p className="text-base font-extrabold text-nb-black">{store.name}</p>
            <p className="text-xs font-bold text-gray-600 mt-0.5">/{store.slug}</p>
            <p className={`text-xs font-black uppercase tracking-wide border-2 px-2 py-0.5 inline-block mt-2 ${store.status === "ACTIVE" ? "border-nb-green bg-green-50 text-nb-green" : "border-nb-red bg-red-50 text-nb-red"}`}>
              {store.status}
            </p>
          </div>
        </div>
      )}

      {apiError && (
        <div className="p-3 bg-red-50 text-nb-red text-xs font-bold border-2 border-nb-red">{apiError}</div>
      )}
      {successMsg && (
        <div className="p-3 bg-green-50 text-nb-green text-xs font-bold border-2 border-nb-green">{successMsg}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border-2 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-6">
          <h3 className="text-base font-extrabold text-nb-black mb-5 pb-2 border-b-2 border-gray-100 flex items-center gap-2">
            <Store size={18} className="text-nb-black" strokeWidth={2.5} /> Informasi Toko
          </h3>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1.5">Nama Toko *</label>
              <input
                type="text"
                placeholder="cth: Toko Elektronik Murah"
                value={form.name}
                onChange={(e) => setField("name", (e.target as any).value)}
                className={`nb-input w-full ${errors.name ? "border-nb-red focus:border-nb-red bg-red-50" : ""}`}
              />
              {errors.name && <p className="text-nb-red font-bold text-xs mt-1">{errors.name}</p>}
              <p className="text-[11px] font-semibold text-gray-500 mt-1.5">Nama toko harus unik di seluruh platform.</p>
            </div>
            
            <div>
              <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1.5">Deskripsi Toko</label>
              <textarea
                placeholder="Ceritakan tentang toko Anda..."
                value={form.description}
                onChange={(e) => setField("description", (e.target as any).value)}
                className={`nb-input w-full min-h-[100px] py-3 ${errors.description ? "border-nb-red focus:border-nb-red bg-red-50" : ""}`}
              />
              {errors.description && <p className="text-nb-red font-bold text-xs mt-1">{errors.description}</p>}
            </div>

            {store && (
              <>
                <div>
                  <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1.5">URL Logo Toko</label>
                  <input
                    type="text"
                    placeholder="https://example.com/logo.png"
                    value={form.logoUrl}
                    onChange={(e) => setField("logoUrl", (e.target as any).value)}
                    className={`nb-input w-full ${errors.logoUrl ? "border-nb-red focus:border-nb-red bg-red-50" : ""}`}
                  />
                  {errors.logoUrl && <p className="text-nb-red font-bold text-xs mt-1">{errors.logoUrl}</p>}
                </div>
                
                <div>
                  <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1.5">URL Banner Toko</label>
                  <input
                    type="text"
                    placeholder="https://example.com/banner.jpg"
                    value={form.bannerUrl}
                    onChange={(e) => setField("bannerUrl", (e.target as any).value)}
                    className={`nb-input w-full ${errors.bannerUrl ? "border-nb-red focus:border-nb-red bg-red-50" : ""}`}
                  />
                  {errors.bannerUrl && <p className="text-nb-red font-bold text-xs mt-1">{errors.bannerUrl}</p>}
                </div>
              </>
            )}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full md:w-auto px-8 disabled:opacity-50 flex items-center justify-center gap-2">
          <Save size={18} strokeWidth={2.5} /> {store ? "Simpan Perubahan" : "Buat Toko"}
        </button>
      </form>
    </div>
  );
}
