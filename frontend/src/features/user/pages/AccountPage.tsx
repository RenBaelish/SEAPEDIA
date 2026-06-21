import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth.store";
import { useConfirm } from "../../../contexts/ConfirmContext";
import { Input } from "../../../components/ui/Input";
import {
  MapPin, Plus, Trash2, Star, User, Package, Heart,
  Settings, ChevronRight, CheckCircle, Edit3, Phone,
  Mail, Lock, ShieldCheck, Wallet, AlertCircle, X
} from "lucide-react";

const SIDEBAR_MENU = [
  {
    group: "Kotak Masuk",
    items: [
      { id: "notif", label: "Notifikasi", icon: "" },
    ],
  },
  {
    group: "Pembelian",
    items: [
      { id: "orders", label: "Pesanan Saya", icon: "", href: "/orders" },
      { id: "wallet", label: "Dompet SEAPAY", icon: "", href: "/wallet" },
    ],
  },
  {
    group: "Profil Saya",
    items: [
      { id: "wishlist", label: "Wishlist", icon: "️" },
      { id: "settings", label: "Pengaturan", icon: "️" },
    ],
  },
];

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
      await api.post("/addresses", formData);
      setShowAddForm(false);
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
    className: `w-full h-10 px-3 rounded-lg border text-sm outline-none transition-colors ${fieldErrors[name] ? "border-red-400 focus:border-red-500 bg-red-50" : "border-gray-200 focus:border-green-500 bg-white"}`,
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setFormError("");
    try {
      const payload: any = { ...profileForm };
      if (!payload.password) delete payload.password; // only send if changing

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
        useAuthStore.getState().setUser(updatedUser, { accessToken: res.data.data.accessToken });
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
    <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[600px]">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Pengaturan Akun</h1>
            <div className="mb-6">
              <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-4 text-sm font-semibold whitespace-nowrap transition-colors relative ${activeTab === tab.id ? "text-green-600" : "text-gray-500 hover:text-green-600"}`}
                  >
                    {tab.label}
                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-t" />}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Tab: Biodata Diri ── */}
            {activeTab === "profile" && (
              <div className="p-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-bold text-gray-800">Biodata Diri</h2>
                  <button onClick={() => setShowProfileModal(true)} className="px-4 h-9 rounded-lg bg-green-50 text-green-600 font-semibold text-sm hover:bg-green-100 transition-colors">
                    Edit Profil
                  </button>
                </div>
                
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="flex flex-col items-center gap-4 shrink-0 md:w-1/3">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-4xl shadow">
                      {user?.profilePictureUrl && user.profilePictureUrl !== "https://i.pinimg.com/736x/22/87/85/2287856db3ec37b4d0d3fd0ffd99930a.jpg" ? (
                        <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user?.fullName?.charAt(0)?.toUpperCase() ?? "?"
                      )}
                    </div>
                    <p className="text-xs text-gray-500 text-center leading-relaxed px-4">
                      Foto profil Anda membantu pengguna lain mengenali Anda. Klik <b>Edit Profil</b> untuk mengubah foto.
                    </p>
                  </div>

                  {/* Form area */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 mb-3">Ubah Biodata Diri</h3>
                      <div className="space-y-0">
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100 gap-2 sm:gap-4">
                          <span className="text-sm text-gray-500 w-32 shrink-0">Nama</span>
                          <span className="text-sm text-gray-800 font-medium flex-1">{user?.fullName}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100 gap-2 sm:gap-4">
                          <span className="text-sm text-gray-500 w-32 shrink-0">Tanggal Lahir</span>
                          {user?.birthDate ? (
                            <span className="text-sm text-gray-800 font-medium flex-1">{user.birthDate}</span>
                          ) : (
                            <span className="text-sm text-gray-400 font-medium flex-1 italic">Belum diatur</span>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100 gap-2 sm:gap-4">
                          <span className="text-sm text-gray-500 w-32 shrink-0">Jenis Kelamin</span>
                          {user?.gender ? (
                            <span className="text-sm text-gray-800 font-medium flex-1">{user.gender}</span>
                          ) : (
                            <span className="text-sm text-gray-400 font-medium flex-1 italic">Belum diatur</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-1">Kontak</h3>
                      <div className="space-y-0">
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100 gap-2 sm:gap-4">
                          <div className="flex items-center gap-2 w-32 shrink-0">
                            <Mail size={14} className="text-gray-500" />
                            <span className="text-sm text-gray-500">Email</span>
                          </div>
                          <span className="text-sm text-gray-800 font-medium flex-1 truncate">{user?.email}</span>
                          <span className="flex items-center gap-1 text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
                            <CheckCircle size={10} /> Terverifikasi
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100 gap-2 sm:gap-4">
                          <div className="flex items-center gap-2 w-32 shrink-0">
                            <Phone size={14} className="text-gray-500" />
                            <span className="text-sm text-gray-500">Nomor HP</span>
                          </div>
                          {user?.phoneNumber ? (
                            <span className="text-sm text-gray-800 font-medium flex-1">{user.phoneNumber}</span>
                          ) : (
                            <span className="text-sm text-gray-400 font-medium flex-1 italic">Belum diatur</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: Daftar Alamat ── */}
            {activeTab === "address" && (
              <div className="p-2">
                <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      placeholder="Tulis Nama Alamat / Kota / Kecamatan tujuan pengiriman"
                      className="w-full h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-xs outline-none focus:border-green-500 bg-gray-50"
                    />
                  </div>
                  <button
                    onClick={() => { setShowAddForm(true); setFormError(""); setFieldErrors({}); }}
                    className="flex items-center gap-2 px-4 h-9 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-colors shrink-0"
                  >
                    <Plus size={16} /> Tambah Alamat Baru
                  </button>
                </div>

                {/* Add form modal */}
                {showAddForm && (
                  <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-[520px] shadow-2xl">
                      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 className="text-base font-bold text-gray-800">Tambah Alamat Baru</h3>
                        <button onClick={() => setShowAddForm(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">
                          <X size={18} />
                        </button>
                      </div>
                      <form onSubmit={handleAddAddress} className="p-6 space-y-4">
                        {formError && (
                          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            {formError}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Label Alamat</label>
                            <input {...field("label")} placeholder="Contoh: Rumah" required />
                            {fieldErrors.label && <p className="text-red-500 text-xs mt-1">{fieldErrors.label[0]}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Penerima</label>
                            <input {...field("recipientName")} placeholder="Nama lengkap penerima" required />
                            {fieldErrors.recipientName && <p className="text-red-500 text-xs mt-1">{fieldErrors.recipientName[0]}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">No HP</label>
                            <input {...field("phone")} placeholder="08xxxxxxxxxx (min. 8 digit)" required />
                            {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone[0]}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Kode Pos</label>
                            <input {...field("postalCode")} placeholder="Contoh: 10220" required />
                            {fieldErrors.postalCode && <p className="text-red-500 text-xs mt-1">{fieldErrors.postalCode[0]}</p>}
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Jalan / Gedung / No. Rumah</label>
                            <input {...field("street")} placeholder="Contoh: Jl. Sudirman No. 1, RT 01/RW 02" required />
                            {fieldErrors.street && <p className="text-red-500 text-xs mt-1">{fieldErrors.street[0]}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Kota / Kabupaten</label>
                            <input {...field("city")} placeholder="Contoh: Jakarta Pusat" required />
                            {fieldErrors.city && <p className="text-red-500 text-xs mt-1">{fieldErrors.city[0]}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Provinsi</label>
                            <input {...field("province")} placeholder="Contoh: DKI Jakarta" required />
                            {fieldErrors.province && <p className="text-red-500 text-xs mt-1">{fieldErrors.province[0]}</p>}
                          </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.isDefault}
                            onChange={(e) => setFormData({ ...formData, isDefault: (e.target as any).checked })}
                            className="w-4 h-4 rounded text-green-500 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-700">Jadikan sebagai alamat utama</span>
                        </label>
                        <div className="flex gap-3 justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="px-5 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            disabled={savingAddress}
                            className="px-6 h-10 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-colors disabled:opacity-60"
                          >
                            {savingAddress ? "Menyimpan..." : "Simpan Alamat"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="p-5">
                  {loadingAddresses ? (
                    <div className="space-y-3">
                      {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl " />)}
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="text-5xl mb-3"></div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Belum ada alamat</p>
                      <p className="text-xs text-gray-400 mb-5">Tambahkan alamat pengirimanmu sekarang</p>
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="inline-flex items-center gap-2 px-5 h-10 rounded-xl border-2 border-green-500 text-green-600 font-bold text-sm hover:bg-green-50 transition-colors"
                      >
                        <Plus size={16} /> Tambah Alamat
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map(addr => (
                        <div
                          key={addr.id}
                          className={`relative rounded-xl border-2 p-4 transition-colors ${addr.isDefault ? "border-green-500 bg-green-50/30" : "border-gray-100 hover:border-gray-200"}`}
                        >
                          {addr.isDefault && (
                            <div className="absolute top-4 right-4">
                              <CheckCircle size={20} className="text-green-500" />
                            </div>
                          )}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Utama</span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-gray-800">{addr.recipientName}</p>
                          <p className="text-sm text-gray-600">{addr.phone}</p>
                          <p className="text-sm text-gray-500 mt-1">{addr.street}, {addr.city}, {addr.province} {addr.postalCode}</p>
                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-1 text-green-500 text-xs font-semibold">
                              <MapPin size={13} /> Sudah Pinpoint
                            </div>
                            <div className="flex items-center gap-3 ml-auto">
                              {!addr.isDefault && (
                                <button
                                  onClick={() => handleSetDefault(addr.id)}
                                  className="text-xs text-green-600 font-semibold hover:underline"
                                >
                                  Jadikan Utama
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors flex items-center gap-1"
                              >
                                <Trash2 size={13} /> Hapus
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

            {/* ── Tab: Keamanan ── */}
            {activeTab === "security" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                <h3 className="text-base font-bold text-gray-800">Keamanan Akun</h3>
                {[
                  { icon: Lock, label: "Buat Kata Sandi", desc: "Lindungi akun dengan kata sandi yang kuat", action: "Ubah" },
                  { icon: ShieldCheck, label: "PIN SEAPEDIA", desc: "Gunakan PIN untuk transaksi yang lebih aman", action: "Aktifkan" },
                  { icon: CheckCircle, label: "Verifikasi Instan", desc: "Aktifkan verifikasi dua langkah", action: "Aktifkan" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon size={20} className="text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">{item.label}</p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-300" />
                    </div>
                  );
                })}
              </div>
            )}
      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">Edit Profil</h3>
              <button onClick={() => setShowProfileModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
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
                  <label className="text-sm font-semibold text-gray-700">Jenis Kelamin</label>
                  <select 
                    value={profileForm.gender} 
                    onChange={e => setProfileForm({...profileForm, gender: e.target.value})}
                    className="w-full h-[40px] px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-green-500 bg-white"
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
                placeholder="Biarkan kosong jika tidak ingin mengubah"
                value={profileForm.password}
                onChange={e => setProfileForm({...profileForm, password: e.target.value})}
              />

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 h-9 rounded-lg font-semibold text-sm text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 h-9 rounded-lg font-semibold text-sm text-white bg-green-500 hover:bg-green-600 disabled:opacity-50"
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
