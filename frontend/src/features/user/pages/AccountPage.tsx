import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { Input } from "../../../components/ui/Input";
import {
  MapPin, Plus, Trash2, Star, User, Package, Heart,
  Settings, ChevronRight, CheckCircle, Edit3, Phone,
  Mail, Lock, ShieldCheck, Wallet, AlertCircle, X, LogOut
} from "lucide-react";

const TABS = [
  { id: "profile", label: "Biodata Diri" },
  { id: "address", label: "Daftar Alamat" },
  { id: "security", label: "Keamanan" },
];

const EMPTY_FORM = {
  label: "Rumah",
  recipientName: "",
  phone: "",
  street: "",
  city: "",
  province: "",
  postalCode: "",
  isDefault: false,
};

export default function AccountPage() {
  const { user } = useAuthStore();
  const { showConfirm } = useConfirm();
  const [activeTab, setActiveTab] = useState("profile");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [savingAddress, setSavingAddress] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM, recipientName: user?.fullName || "", phone: user?.phoneNumber || "" });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    gender: user?.gender || "",
    birthDate: user?.birthDate || "",
    profilePictureUrl: user?.profilePictureUrl || "",
    password: ""
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await api.get("/addresses");
      setAddresses(res.data.data);
    } catch (error) {
      console.error("Failed to fetch addresses", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
    setSavingAddress(true);
    try {
      if (editingAddressId) {
        await api.patch(`/addresses/${editingAddressId}`, formData);
      } else {
        await api.post("/addresses", formData);
      }
      setShowAddForm(false);
      setEditingAddressId(null);
      setFormData({ ...EMPTY_FORM, recipientName: user?.fullName || "", phone: user?.phoneNumber || "" });
      await fetchAddresses();
    } catch (error: any) {
      const data = error.response?.data;
      if (data?.errors) {
        setFieldErrors(data.errors);
        setFormError("Terdapat kesalahan pada isian form Anda.");
      } else {
        setFormError(data?.error || data?.message || "Gagal menyimpan alamat.");
      }
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!await showConfirm({ title: "Hapus Alamat", message: "Apakah Anda yakin ingin menghapus alamat ini?", danger: true })) return;
    try {
      await api.delete(`/addresses/${id}`);
      await fetchAddresses();
    } catch (error) {
      console.error("Failed to delete address", error);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/addresses/${id}`, { isDefault: true });
      await fetchAddresses();
    } catch (error) {
      console.error("Failed to set default address", error);
    }
  };

  const field = (name: keyof typeof formData) => ({
    value: formData[name] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [name]: (e.target as any).value }),
    className: `nb-input ${fieldErrors[name] ? "border-nb-red focus:border-nb-red bg-red-50" : ""}`,
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setFormError("");
    try {
      const payload: any = { ...profileForm };
      if (!payload.password) delete payload.password;

      const res = await api.put("/auth/profile", payload);
      const updatedUser = { 
        ...user!, 
        fullName: profileForm.fullName, 
        email: profileForm.email, 
        phoneNumber: profileForm.phoneNumber,
        gender: profileForm.gender,
        birthDate: profileForm.birthDate,
        profilePictureUrl: profileForm.profilePictureUrl 
      };

      if (res.data.data?.accessToken) {
        useAuthStore.getState().setUser(updatedUser, { ...useAuthStore.getState().tokens!, accessToken: res.data.data.accessToken });
      } else {
        useAuthStore.getState().setUser(updatedUser, useAuthStore.getState().tokens!);
      }
      setShowProfileModal(false);
    } catch (error: any) {
      setFormError(error.response?.data?.message || "Gagal menyimpan profil.");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-white border-4 border-nb-black shadow-[6px_6px_0px_#0A0A0A] p-6 min-h-[600px]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-extrabold text-nb-black nb-section-title">Pengaturan Akun</h1>
        <button 
          onClick={() => {
            useAuthStore.getState().clearAuth();
            window.location.href = "/auth/login";
          }}
          className="md:hidden btn-primary h-9 px-4 text-xs font-bold flex items-center gap-2 bg-nb-red border-nb-black text-white hover:bg-red-600"
        >
          <LogOut size={14} strokeWidth={3} /> Keluar
        </button>
      </div>
      <div className="mb-6">
        <div className="flex overflow-x-auto hide-scrollbar border-b-4 border-nb-black">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-4 text-sm font-extrabold whitespace-nowrap transition-colors relative ${activeTab === tab.id ? "text-nb-black bg-[#EBF5FF]" : "text-gray-500 hover:text-nb-black"}`}
            >
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1.5 bg-nb-blue" />}
            </button>
          ))}
        </div>
      </div>

      {}
      {activeTab === "profile" && (
        <div className="p-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-extrabold text-nb-black">Biodata Diri</h2>
            <button onClick={() => setShowProfileModal(true)} className="btn-secondary h-9 px-4 text-xs font-bold">
              Edit Profil
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex flex-col items-center gap-4 shrink-0 md:w-1/3">
              <div className="w-28 h-28 border-4 border-nb-black overflow-hidden bg-nb-yellow flex items-center justify-center text-nb-black font-black text-5xl shadow-[4px_4px_0px_#0A0A0A]">
                {user?.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.charAt(0)?.toUpperCase() ?? "?"
                )}
              </div>
              <button 
                onClick={() => setShowProfileModal(true)}
                className="w-full max-w-[140px] text-xs font-black bg-white border-2 border-nb-black text-nb-black py-2 hover:bg-nb-yellow transition-colors shadow-[2px_2px_0px_#0A0A0A]"
              >
                <Edit3 size={12} className="inline mr-1 -mt-0.5" strokeWidth={3} /> UBAH FOTO
              </button>
              <p className="text-xs font-bold text-gray-600 text-center leading-relaxed px-4">
                Foto profil Anda membantu pengguna lain mengenali Anda. Klik <b className="text-nb-black">Ubah Foto</b> untuk mengubahnya.
              </p>
            </div>

            {}
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-nb-black mb-1">Ubah Biodata Diri</h3>
                <div className="space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b-2 border-gray-100 gap-2 sm:gap-4">
                    <span className="text-sm font-bold text-gray-500 w-32 shrink-0">Nama</span>
                    <span className="text-sm text-nb-black font-extrabold flex-1">{user?.fullName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b-2 border-gray-100 gap-2 sm:gap-4">
                    <span className="text-sm font-bold text-gray-500 w-32 shrink-0">Tanggal Lahir</span>
                    {user?.birthDate ? (
                      <span className="text-sm text-nb-black font-extrabold flex-1">{user.birthDate}</span>
                    ) : (
                      <span className="text-sm text-gray-400 font-bold flex-1 italic">Belum diatur</span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b-2 border-gray-100 gap-2 sm:gap-4">
                    <span className="text-sm font-bold text-gray-500 w-32 shrink-0">Jenis Kelamin</span>
                    {user?.gender ? (
                      <span className="text-sm text-nb-black font-extrabold flex-1">{user.gender}</span>
                    ) : (
                      <span className="text-sm text-gray-400 font-bold flex-1 italic">Belum diatur</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-nb-black mb-1">Kontak</h3>
                <div className="space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b-2 border-gray-100 gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 w-32 shrink-0">
                      <Mail size={16} className="text-nb-black" strokeWidth={2.5} />
                      <span className="text-sm font-bold text-gray-500">Email</span>
                    </div>
                    <span className="text-sm text-nb-black font-extrabold flex-1 truncate">{user?.email}</span>
                    <span className="flex items-center gap-1 text-xs border-2 border-nb-green bg-green-50 text-nb-green px-2 py-0.5 font-bold">
                      <CheckCircle size={12} strokeWidth={3} /> Terverifikasi
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b-2 border-gray-100 gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 w-32 shrink-0">
                      <Phone size={16} className="text-nb-black" strokeWidth={2.5} />
                      <span className="text-sm font-bold text-gray-500">Nomor HP</span>
                    </div>
                    {user?.phoneNumber ? (
                      <span className="text-sm text-nb-black font-extrabold flex-1">{user.phoneNumber}</span>
                    ) : (
                      <span className="text-sm text-gray-400 font-bold flex-1 italic">Belum diatur</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {activeTab === "address" && (
        <div className="p-2">
          <div className="pb-5 mb-5 border-b-2 border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-nb-black">Daftar Alamat Pengiriman</h2>
            <button
              onClick={() => { setShowAddForm(true); setEditingAddressId(null); setFormError(""); setFieldErrors({}); setFormData({ ...EMPTY_FORM, recipientName: user?.fullName || "", phone: user?.phoneNumber || "" }); }}
              className="btn-primary h-11 px-5 flex items-center gap-2"
            >
              <Plus size={18} strokeWidth={3} /> Tambah Alamat
            </button>
          </div>

          {}
          {showAddForm && (
            <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
              <div className="bg-white border-4 border-nb-black shadow-[8px_8px_0px_#0A0A0A] w-full max-w-[520px]">
                <div className="flex items-center justify-between px-6 py-4 border-b-4 border-nb-black">
                  <h3 className="text-base font-extrabold text-nb-black">{editingAddressId ? "Edit Alamat" : "Tambah Alamat Baru"}</h3>
                  <button onClick={() => setShowAddForm(false)} className="w-8 h-8 flex items-center justify-center text-nb-black hover:bg-nb-yellow border-2 border-transparent hover:border-nb-black transition-colors">
                    <X size={20} strokeWidth={3} />
                  </button>
                </div>
                <form onSubmit={handleAddAddress} className="p-6 space-y-4">
                  {formError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border-2 border-nb-red font-bold text-xs text-nb-red">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" strokeWidth={2.5} />
                      {formError}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1">Label Alamat</label>
                      <input {...field("label")} placeholder="Contoh: Rumah" required />
                      {fieldErrors.label && <p className="text-nb-red font-bold text-xs mt-1">{fieldErrors.label[0]}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1">Nama Penerima</label>
                      <input {...field("recipientName")} placeholder="Nama lengkap penerima" required />
                      {fieldErrors.recipientName && <p className="text-nb-red font-bold text-xs mt-1">{fieldErrors.recipientName[0]}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1">No HP</label>
                      <input {...field("phone")} placeholder="08xxxxxxxxxx" required />
                      {fieldErrors.phone && <p className="text-nb-red font-bold text-xs mt-1">{fieldErrors.phone[0]}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1">Kode Pos</label>
                      <input {...field("postalCode")} placeholder="Contoh: 10220" required />
                      {fieldErrors.postalCode && <p className="text-nb-red font-bold text-xs mt-1">{fieldErrors.postalCode[0]}</p>}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1">Jalan / Gedung / No. Rumah</label>
                      <input {...field("street")} placeholder="Contoh: Jl. Sudirman No. 1, RT 01/RW 02" required />
                      {fieldErrors.street && <p className="text-nb-red font-bold text-xs mt-1">{fieldErrors.street[0]}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1">Kota / Kabupaten</label>
                      <input {...field("city")} placeholder="Contoh: Jakarta Pusat" required />
                      {fieldErrors.city && <p className="text-nb-red font-bold text-xs mt-1">{fieldErrors.city[0]}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-nb-black uppercase tracking-wide mb-1">Provinsi</label>
                      <input {...field("province")} placeholder="Contoh: DKI Jakarta" required />
                      {fieldErrors.province && <p className="text-nb-red font-bold text-xs mt-1">{fieldErrors.province[0]}</p>}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-2 bg-gray-50 p-3 border-2 border-gray-200 hover:border-nb-black transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: (e.target as any).checked })}
                      className="w-5 h-5 accent-nb-black"
                    />
                    <span className="text-sm font-extrabold text-nb-black">Jadikan sebagai alamat utama</span>
                  </label>
                  <div className="flex gap-3 justify-end pt-4 border-t-2 border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="btn-secondary px-6"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="btn-primary px-6 disabled:opacity-50"
                    >
                      {savingAddress ? "Menyimpan..." : "Simpan Alamat"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div>
            {loadingAddresses ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-32 skeleton border-3 border-nb-black" style={{ borderWidth: '3px' }} />)}
              </div>
            ) : addresses.length === 0 ? (
              <div className="py-16 border-4 border-nb-black bg-[#F7F5F0] text-center shadow-[4px_4px_0px_#0A0A0A]">
                <div className="inline-flex w-16 h-16 border-3 border-nb-black bg-white mb-3 rotate-3 flex-items-center justify-center" style={{ borderWidth: '3px' }}>
                  <MapPin size={28} className="text-nb-black mt-3.5" strokeWidth={2.5} />
                </div>
                <p className="text-base font-extrabold text-nb-black mb-1">Belum ada alamat</p>
                <p className="text-sm font-semibold text-gray-600 mb-5">Tambahkan alamat pengirimanmu sekarang</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus size={16} strokeWidth={3} /> Tambah Alamat
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map(addr => (
                  <div
                    key={addr.id}
                    className={`relative border-3 p-5 transition-all ${addr.isDefault ? "border-nb-black bg-[#EBF5FF] shadow-[4px_4px_0px_#0A0A0A]" : "border-gray-200 hover:border-nb-black bg-white"}`}
                    style={{ borderWidth: '3px' }}
                  >
                    {addr.isDefault && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle size={24} className="text-nb-blue" strokeWidth={2.5} />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-extrabold border-2 border-nb-black bg-white text-nb-black px-2 py-0.5">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="text-xs font-extrabold border-2 border-nb-black bg-nb-blue text-white px-2 py-0.5">Utama</span>
                      )}
                    </div>
                    <p className="text-base font-black text-nb-black mb-1">{addr.recipientName}</p>
                    <p className="text-sm font-bold text-gray-700">{addr.phone}</p>
                    <p className="text-sm font-medium text-gray-600 mt-1 mb-4">{addr.street}, {addr.city}, {addr.province} {addr.postalCode}</p>
                    
                    <div className="flex items-center gap-3 pt-4 border-t-2 border-gray-200">
                      <div className="flex items-center gap-1.5 border-2 border-nb-green bg-green-50 text-nb-green px-2 py-1 text-xs font-extrabold">
                        <MapPin size={14} strokeWidth={3} /> Sudah Pinpoint
                      </div>
                      <div className="flex items-center gap-3 ml-auto">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            className="text-xs text-nb-blue font-extrabold border-b-2 border-transparent hover:border-nb-blue pb-0.5 transition-colors"
                          >
                            Jadikan Utama
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setFormData({
                              label: addr.label,
                              recipientName: addr.recipientName,
                              phone: addr.phone,
                              street: addr.street,
                              city: addr.city,
                              province: addr.province,
                              postalCode: addr.postalCode,
                              isDefault: addr.isDefault,
                            });
                            setEditingAddressId(addr.id);
                            setShowAddForm(true);
                          }}
                          className="text-xs text-nb-black font-extrabold border-2 border-nb-black bg-white hover:bg-nb-yellow px-3 py-1.5 transition-colors flex items-center gap-1.5"
                        >
                          <Edit3 size={14} strokeWidth={2.5} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-xs text-nb-red font-extrabold border-2 border-nb-red bg-white hover:bg-nb-red hover:text-white px-3 py-1.5 transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 size={14} strokeWidth={2.5} /> Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {}
      {activeTab === "security" && (
        <div className="bg-white border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-6 space-y-4" style={{ borderWidth: '3px' }}>
          <h3 className="text-base font-extrabold text-nb-black mb-2">Keamanan Akun</h3>
          {[
            { icon: Lock, label: "Buat Kata Sandi", desc: "Lindungi akun dengan kata sandi yang kuat", action: "Ubah" },
            { icon: ShieldCheck, label: "PIN SEAPEDIA", desc: "Gunakan PIN untuk transaksi yang lebih aman", action: "Aktifkan" },
            { icon: CheckCircle, label: "Verifikasi Instan", desc: "Aktifkan verifikasi dua langkah", action: "Aktifkan" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div 
                key={i} 
                onClick={() => showConfirm({ title: "Fitur Belum Tersedia", message: "Maaf, fitur Keamanan Akun belum tersedia dan masih dalam tahap pengembangan.", confirmText: "Tutup", hideCancel: true })}
                className="flex items-center gap-4 p-4 border-3 border-nb-black bg-white hover:bg-[#EBF5FF] transition-colors shadow-[2px_2px_0px_#0A0A0A] cursor-pointer" style={{ borderWidth: '3px' }}
              >
                <div className="w-12 h-12 bg-nb-yellow border-2 border-nb-black flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-nb-black" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-nb-black">{item.label}</p>
                  <p className="text-xs font-bold text-gray-600 mt-0.5">{item.desc}</p>
                </div>
                <div className="border-2 border-nb-black bg-white px-3 py-1 text-xs font-bold text-nb-black hidden md:block">
                  {item.action}
                </div>
                <ChevronRight size={18} className="text-nb-black md:hidden" strokeWidth={3} />
              </div>
            );
          })}
        </div>
      )}

      {}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
          <div className="bg-white border-4 border-nb-black shadow-[8px_8px_0px_#0A0A0A] w-full max-w-[440px]">
            <div className="flex items-center justify-between px-6 py-4 border-b-4 border-nb-black">
              <h3 className="text-base font-extrabold text-nb-black">Edit Profil</h3>
              <button onClick={() => setShowProfileModal(false)} className="w-8 h-8 flex items-center justify-center text-nb-black hover:bg-nb-yellow border-2 border-transparent hover:border-nb-black transition-colors">
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border-2 border-nb-red font-bold text-xs text-nb-red flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" strokeWidth={2.5} />
                  <span>{formError}</span>
                </div>
              )}
              <Input
                label="Nama Lengkap"
                value={profileForm.fullName}
                onChange={e => setProfileForm({...profileForm, fullName: e.target.value})}
                required
              />
              <Input
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                required
              />
              <Input
                label="Nomor HP"
                placeholder="08123456789"
                value={profileForm.phoneNumber}
                onChange={e => setProfileForm({...profileForm, phoneNumber: e.target.value})}
              />
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    label="Tanggal Lahir"
                    type="date"
                    value={profileForm.birthDate}
                    onChange={e => setProfileForm({...profileForm, birthDate: e.target.value})}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-nb-black uppercase tracking-wide">Jenis Kelamin</label>
                  <select 
                    value={profileForm.gender} 
                    onChange={e => setProfileForm({...profileForm, gender: e.target.value})}
                    className="nb-input h-11"
                  >
                    <option value="">Pilih</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <Input
                label="URL Gambar Profil"
                placeholder="https://..."
                value={profileForm.profilePictureUrl}
                onChange={e => setProfileForm({...profileForm, profilePictureUrl: e.target.value})}
              />
              <Input
                label="Ubah Password (Opsional)"
                type="password"
                placeholder="Kosongkan jika tidak ubah"
                value={profileForm.password}
                onChange={e => setProfileForm({...profileForm, password: e.target.value})}
              />

              <div className="flex justify-end gap-3 pt-5 border-t-2 border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="btn-secondary px-6"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary px-8 disabled:opacity-50"
                >
                  {savingProfile ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
