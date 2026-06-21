import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import { Input } from "../../../components/ui/Input";
import { ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-[440px]">
        <div className="bg-white py-10 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-2xl border border-gray-100 relative sm:px-10">
          <div className="text-center mb-6">
            <Link to="/" className="inline-block">
              <img
                className="mx-auto h-12 w-auto"
                src="/logo-name.png"
                alt="SEAPEDIA"
              />
            </Link>
          </div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Daftar Sekarang</h2>
            <p className="mt-2 text-sm text-gray-500">
              Sudah punya akun SEAPEDIA?{" "}
              <Link to="/auth/login" className="font-bold text-green-600 hover:text-green-500 transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>

          {apiError && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Lengkap"
              type="text"
              placeholder="Contoh: John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: (e.target as any).value })}
              error={errors.fullName}
            />
            
            <Input
              label="Username"
              type="text"
              placeholder="Contoh: johndoe_99"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: (e.target as any).value })}
              error={errors.username}
            />
            
            <Input
              label="Email"
              type="email"
              placeholder="contoh@email.com"
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? "Memproses..." : "Daftar SEAPEDIA"}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              Dengan mendaftar, Anda menyetujui<br/> 
              <a href="#" className="font-semibold text-green-600">Syarat & Ketentuan</a> serta <a href="#" className="font-semibold text-green-600">Kebijakan Privasi</a> SEAPEDIA.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <ShieldCheck size={14} className="text-green-500" />
            Terlindungi oleh reCAPTCHA dan Kebijakan Privasi SEAPEDIA
          </div>
        </div>
      </div>
    </div>
  );
}
