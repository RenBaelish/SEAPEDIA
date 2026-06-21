import { useState, useEffect } from 'react';
import { Store, Save } from "lucide-react";
import { z } from "zod";
import { api } from "../../../../lib/api";
import { Card } from "../../../../components/ui/Card";
import { Input, Textarea } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";
import { Avatar } from "../../../../components/ui/Avatar";

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
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {store ? "Pengaturan Toko" : "Buat Toko"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Ubah profil, deskripsi, dan status toko Anda.</p>
        </div>
      </div>

      {/* Store avatar preview */}
      {store && (
        <Card className="flex items-center gap-4">
          <Avatar name={store.name} src={store.logoUrl} size="xl" />
          <div>
            <p className="text-sm font-bold text-secondary">{store.name}</p>
            <p className="text-xs text-tertiary">/{store.slug}</p>
            <p className={`text-xs font-bold mt-1 ${store.status === "ACTIVE" ? "text-success" : "text-error"}`}>
              {store.status}
            </p>
          </div>
        </Card>
      )}

      {apiError && (
        <div className="p-3 bg-red-50 text-error text-xs font-semibold rounded-md">{apiError}</div>
      )}
      {successMsg && (
        <div className="p-3 bg-green-50 text-success text-xs font-semibold rounded-md">{successMsg}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <h3 className="text-sm font-bold text-secondary mb-4 flex items-center gap-2">
            <Store size={16} /> Informasi Toko
          </h3>
          <div className="space-y-4">
            <Input
              label="Nama Toko *"
              placeholder="cth: Toko Elektronik Murah"
              value={form.name}
              onChange={(e) => setField("name", (e.target as any).value)}
              error={errors.name}
              hint="Nama toko harus unik di seluruh platform."
            />
            <Textarea
              label="Deskripsi Toko"
              placeholder="Ceritakan tentang toko Anda..."
              value={form.description}
              onChange={(e) => setField("description", (e.target as any).value)}
              error={errors.description}
            />
            {store && (
              <>
                <Input
                  label="URL Logo Toko"
                  placeholder="https://example.com/logo.png"
                  value={form.logoUrl}
                  onChange={(e) => setField("logoUrl", (e.target as any).value)}
                  error={errors.logoUrl}
                />
                <Input
                  label="URL Banner Toko"
                  placeholder="https://example.com/banner.jpg"
                  value={form.bannerUrl}
                  onChange={(e) => setField("bannerUrl", (e.target as any).value)}
                  error={errors.bannerUrl}
                />
              </>
            )}
          </div>
        </Card>

        <Button type="submit" loading={saving} leftIcon={<Save size={14} />}>
          {store ? "Simpan Perubahan" : "Buat Toko"}
        </Button>
      </form>
    </div>
  );
}
