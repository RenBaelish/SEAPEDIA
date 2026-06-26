import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import toast from "react-hot-toast";

import { Input } from "../../../components/ui/Input";
import { ShieldCheck, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();


  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const parsed = loginSchema.safeParse(formData);
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
      const res = await api.post("/auth/login", formData);
      const { user, tokens } = res.data.data;
      setUser(user, tokens);
      if (user.roles.length > 1) {
        navigate("/auth/switch-role");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Login gagal. Periksa kembali kredensial Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col justify-center py-12 px-4">
      <div className="mx-auto w-full max-w-[420px]">
        {/* Card */}
        <div className="bg-white border-4 border-nb-black shadow-[8px_8px_0px_#0A0A0A]">
          {/* Yellow header bar */}
          <div className="bg-nb-yellow border-b-4 border-nb-black px-6 py-5 flex flex-col items-center text-center">
            <Link to="/" className="mb-3 inline-block bg-white px-3 py-1.5 border-2 border-nb-black shadow-[3px_3px_0px_#0A0A0A]">
              <img src="/logo-seapedia.png" alt="SEAPEDIA" className="h-8 w-auto object-contain" />
            </Link>
            <h2 className="text-xl font-extrabold text-nb-black tracking-tight">Masuk ke Akun Anda</h2>
            <p className="text-sm font-medium text-gray-700 mt-1">
              Belum punya akun?{" "}
              <Link to="/auth/register" className="font-extrabold text-nb-black underline hover:no-underline hover:text-nb-blue transition-colors">
                Daftar di sini
              </Link>
            </p>
          </div>

          <div className="px-6 py-6">
            {/* API Error */}
            {apiError && (
              <div className="mb-5 p-3 border-2 border-nb-red bg-red-50 text-nb-red text-sm font-bold">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="email@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: (e.target as any).value })}
                error={errors.email}
              />

              <div className="space-y-1.5">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Masukkan password Anda"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: (e.target as any).value })}
                  error={errors.password}
                />
                <div className="flex justify-end pt-1">
                  <button 
                    type="button" 
                    onClick={() => toast.error('Fitur pemulihan kata sandi belum tersedia pada versi ini.')}
                    className="text-xs font-bold text-nb-blue hover:underline hover:text-nb-black transition-colors"
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border-3 border-nb-black bg-nb-black text-white font-extrabold text-sm shadow-[4px_4px_0px_#FFE600] hover:shadow-[5px_5px_0px_#FFE600] hover:-translate-x-px hover:-translate-y-px transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none mt-2"
                style={{ borderWidth: '3px' }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Masuk <ArrowRight size={16} strokeWidth={3} /></>
                )}
              </button>
            </form>

            <div className="mt-6 p-3 border-3 border-nb-black bg-[#EBF5FF] flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black text-nb-black uppercase tracking-wide shadow-[4px_4px_0px_#0A0A0A]" style={{ borderWidth: '3px' }}>
              <ShieldCheck size={16} className="text-nb-blue fill-white" strokeWidth={2.5} />
              Terlindungi Kebijakan Privasi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
