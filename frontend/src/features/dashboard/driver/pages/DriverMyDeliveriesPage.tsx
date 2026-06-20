import { useState, useEffect } from 'react';
import { useAlert } from "../../../../contexts/AlertContext";
import { formatCurrency } from "../../../../lib/format";
import { api } from "../../../../lib/api";
import { useAuthStore } from "../../../../store/auth.store";
import { Button } from "../../../../components/ui/Button";
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

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat data...</div>;

  const activeDeliveries = deliveries.filter(d => ['MENUNGGU_DRIVER', 'DIKIRIM'].includes(d.status));
  const completedDeliveries = deliveries.filter(d => ['SELESAI', 'FAILED'].includes(d.status));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pengiriman Saya</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau dan selesaikan pengiriman aktif Anda di sini.</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Navigation size={20} className="text-brand-600" /> Pengiriman Aktif
        </h2>

        {activeDeliveries.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-500">Tidak ada pengiriman aktif saat ini.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeDeliveries.map((job) => (
              <div key={job.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <DeliveryStatusBadge status={job.status} />
                    <span className="text-sm font-bold text-gray-800">{formatCurrency(Number(job.fee) * 0.8)}</span>
                  </div>
                  <span className="text-xs text-gray-400">Order #{job.orderId.slice(-6).toUpperCase()}</span>
                </div>

                <div className="space-y-3 relative border-l-2 border-gray-100 ml-2 pl-4 py-2 mb-6">
                  <div className="absolute -left-1.5 top-2 w-3 h-3 bg-brand-500 rounded-full"></div>
                  <div>
                    <p className="text-xs font-bold text-brand-600 mb-1">Lokasi Pengambilan</p>
                    <p className="text-sm text-gray-800 font-medium">{job.order?.store?.name}</p>
                    <p className="text-xs text-gray-500">{job.pickupAddress}</p>
                  </div>

                  <div className="absolute -left-1.5 bottom-6 w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div className="pt-2">
                    <p className="text-xs font-bold text-orange-600 mb-1">Tujuan Pengiriman</p>
                    <p className="text-xs text-gray-500">{job.dropAddress}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {job.status === 'MENUNGGU_DRIVER' && (
                    <Button 
                      className="flex-1" 
                      onClick={() => handleUpdateStatus(job.id, 'take')}
                      disabled={updatingId === job.id}
                    >
                      Ambil Pekerjaan
                    </Button>
                  )}
                  {job.status === 'DIKIRIM' && (
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white" 
                      onClick={() => handleUpdateStatus(job.id, 'complete')}
                      disabled={updatingId === job.id}
                    >
                      <CheckCircle size={18} className="mr-2 inline" /> Konfirmasi Selesai
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {completedDeliveries.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Package size={20} className="text-gray-500" /> Riwayat Terakhir
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedDeliveries.slice(0, 4).map((job) => (
              <div key={job.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex justify-between items-center opacity-80">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Tujuan: {job.dropAddress.split(',')[0]}</p>
                  <DeliveryStatusBadge status={job.status} />
                </div>
                <p className="font-bold text-brand-600 text-sm">+{formatCurrency(Number(job.fee) * 0.8)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
