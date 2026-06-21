import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { User, Store, Car } from "lucide-react";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import { RoleType } from '@/types';
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

const ROLE_CONFIG = {
  [RoleType.BUYER]: { icon: User, label: "Pembeli", desc: "Belanja kebutuhan Anda" },
  [RoleType.SELLER]: { icon: Store, label: "Penjual", desc: "Kelola toko Anda" },
  [RoleType.DRIVER]: { icon: Car, label: "Driver", desc: "Mulai antar pesanan" },
  [RoleType.ADMIN]: { icon: User, label: "Admin", desc: "Panel administrasi" },
};

export default function SwitchRolePage() {
  const navigate = useNavigate();
  const { user, setActiveRole, setUser, tokens } = useAuthStore();
  
  const [loading, setLoading] = useState<RoleType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If not logged in, shouldn't be here
  if (!user) {
    navigate("/auth/login");
    return null;
  }

  const handleRoleSelect = async (role: RoleType) => {
    setLoading(role);
    setError(null);

    try {
      // Hit API to switch role on the session
      const res = await api.patch("/auth/switch-role", { role });
      const { accessToken, refreshToken, activeRole } = res.data.data;
      
      // Update tokens and activeRole in Zustand
      if (tokens) {
        setUser(user, { accessToken, refreshToken, expiresIn: tokens.expiresIn });
      }
      setActiveRole(activeRole);
      
      // Route appropriately
      if (activeRole === RoleType.SELLER) navigate("/seller");
      else if (activeRole === RoleType.DRIVER) navigate("/driver");
      else if (activeRole === RoleType.ADMIN) navigate("/admin");
      else navigate("/");

    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengganti peran.");
      setLoading(null);
    }
  };

  return (
    <div className="flex justify-center items-center py-16">
      <Card padding="lg" className="w-full max-w-[450px]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-secondary mb-2">Pilih Peran Anda</h1>
          <p className="text-xs text-tertiary">
            Akun Anda memiliki akses ke beberapa peran. Masuk sebagai:
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-error text-xs font-semibold rounded-md text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {user.roles.map((role) => {
            const Config = ROLE_CONFIG[role];
            if (!Config) return null;
            
            const Icon = Config.icon;
            const isActive = user.activeRole === role;

            return (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                disabled={loading !== null}
                className={`flex items-center gap-4 p-4 rounded-md border text-left transition-all ${
                  isActive 
                    ? "border-primary bg-primary-light" 
                    : "border-muted hover:border-primary hover:shadow-panel bg-surface"
                }`}
              >
                <div className={`p-3 rounded-full ${isActive ? "bg-primary text-white" : "bg-muted text-tertiary"}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm font-bold ${isActive ? "text-primary" : "text-secondary"}`}>
                    {Config.label}
                  </h3>
                  <p className="text-xs text-tertiary">{Config.desc}</p>
                </div>
                {loading === role && (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            );
          })}
        </div>

        {/* Back to home as default role */}
        <div className="mt-8">
          <Button variant="secondary" fullWidth onClick={() => navigate("/")}>
            Batal
          </Button>
        </div>
      </Card>
    </div>
  );
}
