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
    className: `w-full h-10 px-3 rounded-lg border text-[13px] outline-none transition-colors ${fieldErrors[name] ? "border-red-400 focus:border-red-500 bg-red-50" : "border-gray-200 focus:border-green-500 bg-white"}`,
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="page-container max-w-[1100px] py-6">
        <div className="flex flex-col md:flex-row gap-5 items-start">

          {/* ─── Sidebar Kiri ─────────────────────────────────────── */}
          <aside className="w-full md:w-[220px] shrink-0 space-y-3">
            {/* User Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {user?.fullName?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-gray-800 truncate">{user?.fullName}</p>
                  <button className="text-[11px] text-green-600 font-semibold hover:underline flex items-center gap-1">
                    <Edit3 size={10} /> Edit Profil
                  </button>
                </div>
              </div>

              {/* Member badge */}
              <div className="mt-3 flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-2.5 py-1.5 rounded-lg">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-[11px] font-bold text-amber-700">Member SEAPEDIA</span>
              </div>

              {/* Quick stats */}
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                {[
                  { icon: Wallet, label: "SEAPAY Saldo", value: "Rp0" },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Icon size={13} />
                        <span>{item.label}</span>
                      </div>
                      <span className="font-bold text-gray-700">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Menu groups */}
            {SIDEBAR_MENU.map(group => (
              <div key={group.group} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{group.group}</p>
                </div>
                {group.items.map(item => (
                  (item as any).href ? (
                    <Link
                      key={item.id}
                      to={(item as any).href}
                      className="flex items-center gap-3 px-4 py-3 text-[13px] text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <span>{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight size={14} className="text-gray-300" />
                    </Link>
                  ) : (
                    <button
                      key={item.id}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <span>{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronRight size={14} className="text-gray-300" />
                    </button>
                  )
                ))}
              </div>
            ))}

            {/* Pengaturan Akun */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pengaturan Akun</p>
              </div>
              {[
                { id: "profile", label: "Biodata Diri", icon: User },
                { id: "address", label: "Daftar Alamat", icon: MapPin },
                { id: "security", label: "Keamanan", icon: Lock },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] transition-colors border-b border-gray-50 last:border-0 ${activeTab === item.id ? "text-green-700 bg-green-50 font-semibold border-l-2 border-l-green-500" : "text-gray-700 hover:bg-green-50 hover:text-green-700"}`}
                  >
                    <Icon size={15} className={activeTab === item.id ? "text-green-500" : "text-gray-400"} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {activeTab === item.id && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ─── Konten Kanan ─────────────────────────────────────── */}
          <div className="flex-1 w-full">
            {/* Breadcrumb + Heading */}
            <div className="flex items-center gap-2 text-[12px] text-gray-400 mb-4">
              <User size={13} />
              <span className="font-semibold text-gray-700">{user?.fullName}</span>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
              <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-100 px-2">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-4 text-[13px] font-semibold whitespace-nowrap transition-colors relative ${activeTab === tab.id ? "text-green-600" : "text-gray-500 hover:text-green-600"}`}
                  >
                    {tab.label}
                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-t" />}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Tab: Biodata Diri ── */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Avatar area */}
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-4xl shadow">
                      {user?.fullName?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <button className="w-28 h-9 rounded-lg border-2 border-gray-200 text-[12px] font-semibold text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors">
                      Pilih Foto
                    </button>
                    <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                      Besar file: maks. 10 MB<br />Ekstensi: JPG, JPEG, PNG
                    </p>
                  </div>

                  {/* Form area */}
                  <div className="flex-1 space-y-5">
                    <div>
                      <h3 className="text-[14px] font-bold text-gray-700 mb-3">Ubah Biodata Diri</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 py-2 border-b border-gray-100">
                          <span className="text-[13px] text-gray-400 w-28 shrink-0">Nama</span>
                          <span className="text-[13px] text-gray-800 flex-1">{user?.fullName}</span>
                          <button className="text-[12px] text-green-600 font-semibold hover:underline">Ubah</button>
                        </div>
                        <div className="flex items-center gap-4 py-2 border-b border-gray-100">
                          <span className="text-[13px] text-gray-400 w-28 shrink-0">Tanggal Lahir</span>
                          <button className="text-[13px] text-green-600 font-semibold hover:underline">Tambah Tanggal Lahir</button>
                        </div>
                        <div className="flex items-center gap-4 py-2 border-b border-gray-100">
                          <span className="text-[13px] text-gray-400 w-28 shrink-0">Jenis Kelamin</span>
                          <button className="text-[13px] text-green-600 font-semibold hover:underline">Tambah Jenis Kelamin</button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[14px] font-bold text-gray-700 mb-3">Ubah Kontak</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 py-2 border-b border-gray-100">
                          <div className="flex items-center gap-2 w-28 shrink-0">
                            <Mail size={13} className="text-gray-400" />
                            <span className="text-[13px] text-gray-400">Email</span>
                          </div>
                          <span className="text-[13px] text-gray-800 flex-1 truncate">{user?.email}</span>
                          <span className="flex items-center gap-1 text-[11px] bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
                            <CheckCircle size={10} /> Terverifikasi
                          </span>
                          <button className="text-[12px] text-green-600 font-semibold hover:underline">Ubah</button>
                        </div>
                        <div className="flex items-center gap-4 py-2 border-b border-gray-100">
                          <div className="flex items-center gap-2 w-28 shrink-0">
                            <Phone size={13} className="text-gray-400" />
                            <span className="text-[13px] text-gray-400">Nomor HP</span>
                          </div>
                          <span className="text-[13px] text-gray-800 flex-1">{user?.phoneNumber || "–"}</span>
                          <button className="text-[12px] text-green-600 font-semibold hover:underline">
                            {user?.phoneNumber ? "Ubah" : "Tambah Nomor HP"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: Daftar Alamat ── */}
            {activeTab === "address" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      placeholder="Tulis Nama Alamat / Kota / Kecamatan tujuan pengiriman"
                      className="w-full h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-green-500 bg-gray-50"
                    />
                  </div>
                  <button
                    onClick={() => { setShowAddForm(true); setFormError(""); setFieldErrors({}); }}
                    className="flex items-center gap-2 px-4 h-9 rounded-lg bg-green-500 hover:bg-green-600 text-white text-[13px] font-bold transition-colors shrink-0"
                  >
                    <Plus size={16} /> Tambah Alamat Baru
                  </button>
                </div>

                {/* Add form modal */}
                {showAddForm && (
                  <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-[520px] shadow-2xl">
                      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 className="text-[16px] font-bold text-gray-800">Tambah Alamat Baru</h3>
                        <button onClick={() => setShowAddForm(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">
                          <X size={18} />
                        </button>
                      </div>
                      <form onSubmit={handleAddAddress} className="p-6 space-y-4">
                        {formError && (
                          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-[12px] text-red-600">
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            {formError}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Label Alamat</label>
                            <input {...field("label")} placeholder="Contoh: Rumah" required />
                            {fieldErrors.label && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.label[0]}</p>}
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Nama Penerima</label>
                            <input {...field("recipientName")} placeholder="Nama lengkap penerima" required />
                            {fieldErrors.recipientName && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.recipientName[0]}</p>}
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">No HP</label>
                            <input {...field("phone")} placeholder="08xxxxxxxxxx (min. 8 digit)" required />
                            {fieldErrors.phone && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.phone[0]}</p>}
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Kode Pos</label>
                            <input {...field("postalCode")} placeholder="Contoh: 10220" required />
                            {fieldErrors.postalCode && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.postalCode[0]}</p>}
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Jalan / Gedung / No. Rumah</label>
                            <input {...field("street")} placeholder="Contoh: Jl. Sudirman No. 1, RT 01/RW 02" required />
                            {fieldErrors.street && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.street[0]}</p>}
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Kota / Kabupaten</label>
                            <input {...field("city")} placeholder="Contoh: Jakarta Pusat" required />
                            {fieldErrors.city && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.city[0]}</p>}
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Provinsi</label>
                            <input {...field("province")} placeholder="Contoh: DKI Jakarta" required />
                            {fieldErrors.province && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.province[0]}</p>}
                          </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.isDefault}
                            onChange={(e) => setFormData({ ...formData, isDefault: (e.target as any).checked })}
                            className="w-4 h-4 rounded text-green-500 focus:ring-green-500"
                          />
                          <span className="text-[13px] text-gray-700">Jadikan sebagai alamat utama</span>
                        </label>
                        <div className="flex gap-3 justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="px-5 h-10 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            disabled={savingAddress}
                            className="px-6 h-10 rounded-xl bg-green-500 hover:bg-green-600 text-white text-[13px] font-bold transition-colors disabled:opacity-60"
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
                      <p className="text-[14px] font-semibold text-gray-700 mb-1">Belum ada alamat</p>
                      <p className="text-[12px] text-gray-400 mb-5">Tambahkan alamat pengirimanmu sekarang</p>
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="inline-flex items-center gap-2 px-5 h-10 rounded-xl border-2 border-green-500 text-green-600 font-bold text-[13px] hover:bg-green-50 transition-colors"
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
                            <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="text-[11px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Utama</span>
                            )}
                          </div>
                          <p className="text-[14px] font-bold text-gray-800">{addr.recipientName}</p>
                          <p className="text-[13px] text-gray-600">{addr.phone}</p>
                          <p className="text-[13px] text-gray-500 mt-1">{addr.street}, {addr.city}, {addr.province} {addr.postalCode}</p>
                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-1 text-green-500 text-[12px] font-semibold">
                              <MapPin size={13} /> Sudah Pinpoint
                            </div>
                            <div className="flex items-center gap-3 ml-auto">
                              {!addr.isDefault && (
                                <button
                                  onClick={() => handleSetDefault(addr.id)}
                                  className="text-[12px] text-green-600 font-semibold hover:underline"
                                >
                                  Jadikan Utama
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="text-[12px] text-gray-400 hover:text-red-500 font-semibold transition-colors flex items-center gap-1"
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
                <h3 className="text-[15px] font-bold text-gray-800">Keamanan Akun</h3>
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
                        <p className="text-[13px] font-bold text-gray-800">{item.label}</p>
                        <p className="text-[11px] text-gray-400">{item.desc}</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-300" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
