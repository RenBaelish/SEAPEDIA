import { useState, useEffect } from 'react';
import { useAlert } from "../../../../contexts/AlertContext";
import { formatCurrency } from "../../../../lib/format";
import { api } from "../../../../lib/api";
import { Button } from "../../../../components/ui/Button";
import { Package, Navigation, PlusCircle } from "lucide-react";

export default function DriverJobBoardPage() {
  const { showAlert } = useAlert();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/deliveries/available");
      setJobs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAcceptJob = async (jobId: string) => {
    setProcessingId(jobId);
    try {
      await api.post(`/deliveries/${jobId}/take`);
      await showAlert({ title: "Berhasil", message: "Pekerjaan berhasil diambil!" });
      fetchJobs();
    } catch (err: any) {
      showAlert({ title: "Gagal", message: err.response?.data?.message || "Gagal mengambil pekerjaan. Mungkin sudah diambil driver lain." });
      fetchJobs(); // refresh to remove the taken job
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat pekerjaan...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Job Board Pengiriman</h1>
          <p className="text-sm text-gray-500 mt-1">Pilih dan ambil order pengiriman yang tersedia di sekitar Anda.</p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-800 mb-2">Belum Ada Pekerjaan Baru</h2>
          <p className="text-gray-500">Silakan kembali lagi nanti untuk melihat pesanan yang menunggu pengiriman.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col hover:border-brand-300 transition-colors">
              <div className="p-5 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{formatCurrency(Number(job.deliveryFee))}</h3>
                    <p className="text-xs text-gray-500">Estimasi Pendapatan</p>
                  </div>
                  <div className="bg-brand-50 text-brand-600 text-xs font-bold px-2 py-1 rounded">
                    Pesanan #{job.orderId.substring(0, 8).toUpperCase()}
                  </div>
                </div>

                <div className="space-y-3 relative border-l-2 border-gray-100 ml-2 pl-4 py-2">
                  <div className="absolute -left-1.5 top-2 w-3 h-3 bg-brand-500 rounded-full"></div>
                  <div>
                    <p className="text-xs font-bold text-brand-600 mb-1">Lokasi Pengambilan</p>
                    <p className="text-sm text-gray-800 font-medium">{job.storeName}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{job.pickupAddress}</p>
                  </div>

                  <div className="absolute -left-1.5 bottom-6 w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div className="pt-2">
                    <p className="text-xs font-bold text-orange-600 mb-1">Tujuan Pengiriman</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{job.dropAddress}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-50 bg-gray-50/50 rounded-b-xl">
                <Button 
                  onClick={() => handleAcceptJob(job.id)}
                  disabled={processingId === job.id}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {processingId === job.id ? "Memproses..." : <><PlusCircle size={18} /> Ambil Pekerjaan</>}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
