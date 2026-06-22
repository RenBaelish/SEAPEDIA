import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import { Input } from "../../../components/ui/Input";
import { ShieldCheck, ArrowRight } from "lucide-react";

const registerSchema = z.object({
  fullName: z.string().min(3, "Nama minimal 3 karakter"),
  username: z.string().min(3, "Username minimal 3 karakter").regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const [formData, setFormData] = useState({ fullName: "", username: "", email: "", password: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const parsed = registerSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: any = {};
      parsed.error.issues.forEach((issue: z.ZodIssue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await api.post("/auth/register", { ...formData, roles: ["BUYER"] });
      const { user, tokens } = res.data.data;
      setUser(user, tokens);
      navigate("/");
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Pendaftaran gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col justify-center py-12 px-4">
      <div className="mx-auto w-full max-w-[420px]">

        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/">
            <img src="/logo-name.png" alt="SEAPEDIA" className="h-10 w-auto mx-auto" />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white border-4 border-nb-black shadow-[8px_8px_0px_#0A0A0A]">
          {/* Yellow header bar */}
          <div className="bg-nb-yellow border-b-4 border-nb-black px-6 py-5">
            <h2 className="text-2xl font-extrabold text-nb-black tracking-tight">Daftar Sekarang</h2>
            <p className="text-sm font-medium text-gray-700 mt-1">
              Sudah punya akun?{" "}
              <Link to="/auth/login" className="font-extrabold text-nb-black underline hover:no-underline">
                Masuk di sini
              </Link>
            </p>
          </div>

          <div className="px-6 py-6">
            {apiError && (
              <div className="mb-5 p-3 border-2 border-nb-red bg-red-50 text-nb-red text-sm font-bold">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nama Lengkap"
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: (e.target as any).value })}
                error={errors.fullName}
              />

              <Input
                label="Username"
                type="text"
                placeholder="Contoh: budi_santoso"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: (e.target as any).value })}
                error={errors.username}
              />

              <Input
                label="Email"
                type="email"
                placeholder="email@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: (e.target as any).value })}
                error={errors.email}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Minimal 8 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: (e.target as any).value })}
                error={errors.password}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border-3 border-nb-black bg-nb-black text-white font-extrabold text-sm shadow-[4px_4px_0px_#FFE600] hover:shadow-[5px_5px_0px_#FFE600] hover:-translate-x-px hover:-translate-y-px transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none mt-2"
                style={{ borderWidth: '3px' }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Daftar SEAPEDIA <ArrowRight size={16} strokeWidth={3} /></>
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-xs text-gray-500 leading-relaxed">
                Dengan mendaftar, Anda menyetujui{" "}
                <a href="#" className="font-bold text-nb-black underline">Syarat & Ketentuan</a>
                {" "}dan{" "}
                <a href="#" className="font-bold text-nb-black underline">Kebijakan Privasi</a> SEAPEDIA.
              </p>
            </div>

            <div className="mt-5 pt-5 border-t-2 border-gray-200 flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <ShieldCheck size={14} className="text-green-500" />
              Terlindungi oleh kebijakan privasi SEAPEDIA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
