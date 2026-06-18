import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import { Input } from "../../../components/ui/Input";
import { ShieldCheck } from "lucide-react";

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
            <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">Masuk</h2>
            <p className="mt-2 text-[13px] text-gray-500">
              Belum punya akun SEAPEDIA?{" "}
              <Link to="/auth/register" className="font-bold text-green-600 hover:text-green-500 transition-colors">
                Daftar di sini
              </Link>
            </p>
          </div>

          {apiError && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-[13px] font-medium rounded-lg text-center">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nomor HP atau Email"
              type="text"
              placeholder="Contoh: 08123456789 atau email@domain.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: (e.target as any).value })}
              error={errors.email}
            />
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-bold text-gray-700">Password</label>
                <a href="#" className="text-[12px] font-semibold text-green-600 hover:text-green-500 transition-colors">Lupa Kata Sandi?</a>
              </div>
              <Input
                type="password"
                placeholder="Masukkan password Anda"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: (e.target as any).value })}
                error={errors.password}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-[14px] font-bold text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 text-[12px]">atau masuk dengan</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-2" alt="Google" />
                Google
              </button>
              <button className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
                Facebook
              </button>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck size={14} className="text-green-500" />
            Terlindungi oleh reCAPTCHA dan Kebijakan Privasi SEAPEDIA
          </div>
        </div>
      </div>
    </div>
  );
}
