import { useState } from 'react';
import { api } from "../../../../lib/api";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Tag } from "lucide-react";

export default function AdminPromosPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    validFrom: "",
    validUntil: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: (e.target as any).value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await api.post("/admin/promos", {
        ...formData,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString()
      });
      setMessage({ text: "Promo berhasil dibuat!", type: "success" });
      setFormData({ title: "", description: "", validFrom: "", validUntil: "" });
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "Gagal membuat promo", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Tag size={28} className="text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-800">Buat Promo Platform</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Judul Promo</label>
          <Input 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            placeholder="Contoh: Promo Harbolnas 12.12" 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Promo</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Deskripsi..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mulai Berlaku</label>
            <Input 
              type="datetime-local" 
              name="validFrom" 
              value={formData.validFrom} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Berakhir Pada</label>
            <Input 
              type="datetime-local" 
              name="validUntil" 
              value={formData.validUntil} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        {message.text && (
          <div className={`p-3 rounded text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message.text}
          </div>
        )}

        <div className="pt-4 border-t border-gray-100">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Memproses..." : "Buat Promo"}
          </Button>
        </div>
      </form>
    </div>
  );
}
