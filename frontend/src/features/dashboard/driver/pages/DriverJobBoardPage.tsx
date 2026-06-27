import { useState, useEffect } from 'react';
import { useAlert } from "../../../../contexts/AlertContext";
import { formatCurrency } from "../../../../lib/format";
import { api } from "../../../../lib/api";
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
      fetchJobs();
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-10 h-10 border-4 border-nb-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-nb-black">Job Board Pengiriman</h1>
          <p className="text-sm font-semibold text-gray-600 mt-1">Pilih dan ambil order pengiriman yang tersedia di sekitar Anda.</p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-[#F7F5F0] border-2 border-nb-black p-10 text-center shadow-[4px_4px_0px_#0A0A0A]">
          <Package size={48} className="text-nb-black mx-auto mb-4" strokeWidth={2} />
          <h2 className="text-lg font-extrabold text-nb-black mb-2 uppercase tracking-wide">Belum Ada Pekerjaan Baru</h2>
          <p className="text-sm font-semibold text-gray-600">Silakan kembali lagi nanti untuk melihat pesanan yang menunggu pengiriman.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white border-3 border-nb-black shadow-[4px_4px_0px_#0A0A0A] flex flex-col group transition-transform hover:-translate-y-1" style={{ borderWidth: '3px' }}>
              <div className="p-5 flex-1 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-1">Estimasi Pendapatan</p>
                    <h3 className="font-black text-nb-black text-2xl">{formatCurrency(Number(job.deliveryFee))}</h3>
                  </div>
                  <div className="bg-nb-yellow text-nb-black border-2 border-nb-black text-xs font-black px-2 py-1 uppercase tracking-wide">
                    Pesanan #{job.orderId.substring(0, 8).toUpperCase()}
                  </div>
                </div>

                <div className="space-y-4 relative border-l-3 border-nb-black ml-2 pl-5 py-2" style={{ borderLeftWidth: '3px' }}>
                  <div className="absolute -left-2.5 top-2 w-4 h-4 border-2 border-nb-black bg-white rounded-full"></div>
                  <div>
                    <p className="text-xs font-black text-nb-blue mb-1 uppercase tracking-wide">Lokasi Pengambilan</p>
                    <p className="text-sm text-nb-black font-extrabold">{job.storeName}</p>
                    <p className="text-xs font-bold text-gray-600 line-clamp-2 mt-0.5">{job.pickupAddress}</p>
                  </div>

                  <div className="absolute -left-2.5 bottom-6 w-4 h-4 border-2 border-nb-black bg-nb-black rounded-full"></div>
                  <div className="pt-2">
                    <p className="text-xs font-black text-nb-yellow bg-nb-black px-1.5 py-0.5 inline-block mb-1 uppercase tracking-wide">Tujuan Pengiriman</p>
                    <p className="text-sm font-bold text-gray-600 line-clamp-2 mt-0.5">{job.dropAddress}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t-3 border-nb-black bg-[#F7F5F0]" style={{ borderTopWidth: '3px' }}>
                <button 
                  onClick={() => handleAcceptJob(job.id)}
                  disabled={processingId === job.id}
                  className="btn-primary w-full justify-center disabled:opacity-50"
                >
                  {processingId === job.id ? "Memproses..." : <><PlusCircle size={18} strokeWidth={2.5} /> Ambil Pekerjaan</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
