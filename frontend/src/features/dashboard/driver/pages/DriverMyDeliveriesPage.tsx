import { useState, useEffect } from 'react';
import { useAlert } from "../../../../contexts/AlertContext";
import { formatCurrency } from "../../../../lib/format";
import { api } from "../../../../lib/api";
import { useAuthStore } from "../../../../store/auth.store";
import { DeliveryStatusBadge } from "../../../../components/ui/Badge";
import { Navigation, CheckCircle, Package } from "lucide-react";

export default function DriverMyDeliveriesPage() {
  const { user } = useAuthStore();
  const { showAlert } = useAlert();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    try {
      const res = await api.get("/deliveries/my-jobs");
      setDeliveries(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleUpdateStatus = async (jobId: string, action: string) => {
    setUpdatingId(jobId);
    try {
      await api.post(`/deliveries/${jobId}/${action}`);
      await showAlert({ title: "Berhasil", message: `Status pengiriman berhasil diperbarui.` });
      fetchDeliveries();
    } catch (err: any) {
      showAlert({ title: "Gagal", message: err.response?.data?.message || "Gagal memperbarui status." });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-10 h-10 border-4 border-nb-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const activeDeliveries = deliveries.filter(d => ['MENUNGGU_DRIVER', 'DIKIRIM'].includes(d.status));
  const completedDeliveries = deliveries.filter(d => ['SELESAI', 'FAILED'].includes(d.status));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-nb-black">Pengiriman Saya</h1>
          <p className="text-sm font-semibold text-gray-600 mt-1">Pantau dan selesaikan pengiriman aktif Anda di sini.</p>
        </div>
      </div>

      <div className="space-y-5">
        <h2 className="text-base font-extrabold text-nb-black flex items-center gap-2 uppercase tracking-wide">
          <div className="w-8 h-8 bg-[#EBF5FF] border-2 border-nb-black flex items-center justify-center">
            <Navigation size={16} className="text-nb-black" strokeWidth={2.5} />
          </div>
          Pengiriman Aktif
        </h2>

        {activeDeliveries.length === 0 ? (
          <div className="bg-[#F7F5F0] border-2 border-nb-black p-10 text-center shadow-[4px_4px_0px_#0A0A0A]">
            <p className="text-sm font-extrabold text-nb-black">Tidak ada pengiriman aktif saat ini.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {activeDeliveries.map((job) => (
              <div key={job.id} className="bg-white border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] p-5" style={{ borderWidth: '3px' }}>
                <div className="flex justify-between items-start mb-5 pb-4 border-b-2 border-gray-100">
                  <div className="flex items-center gap-4">
                    <DeliveryStatusBadge status={job.status} />
                    <span className="text-base font-black text-nb-green">{formatCurrency(Math.floor(Number(job.deliveryFee || 0) * 0.9))}</span>
                  </div>
                  <span className="text-xs font-black text-nb-black bg-nb-yellow border-2 border-nb-black px-2 py-0.5 uppercase tracking-wide">Order #{job.orderId.slice(-6).toUpperCase()}</span>
                </div>

                <div className="space-y-4 relative border-l-3 border-nb-black ml-2 pl-5 py-2 mb-6" style={{ borderLeftWidth: '3px' }}>
                  <div className="absolute -left-2.5 top-2 w-4 h-4 border-2 border-nb-black bg-white rounded-full"></div>
                  <div>
                    <p className="text-xs font-black text-nb-blue mb-1 uppercase tracking-wide">Lokasi Pengambilan</p>
                    <p className="text-sm text-nb-black font-extrabold">{job.order?.store?.name}</p>
                    <p className="text-xs font-bold text-gray-600 mt-0.5">{job.pickupAddress}</p>
                  </div>

                  <div className="absolute -left-2.5 bottom-6 w-4 h-4 border-2 border-nb-black bg-nb-black rounded-full"></div>
                  <div className="pt-2">
                    <p className="text-xs font-black text-nb-yellow bg-nb-black px-1.5 py-0.5 inline-block mb-1 uppercase tracking-wide">Tujuan Pengiriman</p>
                    <p className="text-xs font-bold text-gray-600 mt-0.5">{job.dropAddress}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t-2 border-gray-100">
                  {job.status === 'MENUNGGU_DRIVER' && (
                    <button 
                      className="btn-primary flex-1 justify-center disabled:opacity-50" 
                      onClick={() => handleUpdateStatus(job.id, 'take')}
                      disabled={updatingId === job.id}
                    >
                      {updatingId === job.id ? "Memproses..." : "Ambil Pekerjaan"}
                    </button>
                  )}
                  {job.status === 'DIKIRIM' && (
                    <button 
                      className="w-full h-11 border-3 border-nb-black bg-nb-green text-white font-black text-sm hover:bg-nb-black transition-colors shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center gap-2 disabled:opacity-50" 
                      onClick={() => handleUpdateStatus(job.id, 'complete')}
                      disabled={updatingId === job.id}
                      style={{ borderWidth: '3px' }}
                    >
                      {updatingId === job.id ? "Memproses..." : <><CheckCircle size={18} strokeWidth={2.5} /> Konfirmasi Selesai</>}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {completedDeliveries.length > 0 && (
        <div className="space-y-4 pt-6 mt-6 border-t-4 border-nb-black">
          <h2 className="text-base font-extrabold text-nb-black flex items-center gap-2 uppercase tracking-wide">
            <div className="w-8 h-8 bg-nb-yellow border-2 border-nb-black flex items-center justify-center">
              <Package size={16} className="text-nb-black" strokeWidth={2.5} />
            </div>
            Riwayat Terakhir
          </h2>
          <div className="grid grid-cols-1 gap-5">
            {completedDeliveries.slice(0, 4).map((job) => (
              <div key={job.id} className="bg-white border-3 border-nb-black p-4 opacity-90 hover:opacity-100 transition-opacity shadow-[4px_4px_0px_#0A0A0A]" style={{ borderWidth: '3px' }}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-3 border-b-2 border-gray-100 pb-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-nb-black bg-gray-100 border border-nb-black px-2 py-0.5 uppercase tracking-wide w-fit">Order #{job.orderId.slice(-6).toUpperCase()}</span>
                    <DeliveryStatusBadge status={job.status} />
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Pendapatan Bersih (Dipostong 10%)</p>
                    <p className="font-black text-nb-green text-lg">+{formatCurrency(Math.floor(Number(job.deliveryFee || 0) * 0.9))}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Toko Asal</p>
                    <p className="text-sm font-extrabold text-nb-black">{job.storeName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Tanggal Dibuat</p>
                    <p className="text-sm font-bold text-gray-700">{new Date(job.createdAt).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Tujuan</p>
                    <p className="text-sm font-bold text-gray-700 leading-snug">{job.dropAddress}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
