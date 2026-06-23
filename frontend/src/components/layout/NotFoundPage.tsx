import { Link } from "react-router-dom";
import { AlertOctagon } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F5F0] px-4 py-16">
      <div className="w-full max-w-md bg-white p-10 border-4 border-nb-black shadow-[8px_8px_0px_#0A0A0A] text-center">
        <div className="w-20 h-20 bg-nb-yellow border-3 border-nb-black text-nb-black flex items-center justify-center mx-auto mb-6 rotate-[-5deg]" style={{ borderWidth: '3px' }}>
          <AlertOctagon size={40} strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-black text-nb-black mb-2">404</h1>
        <h2 className="text-xl font-extrabold text-nb-black mb-4 uppercase tracking-tight">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-8 text-sm font-semibold leading-relaxed">
          Maaf, halaman yang Anda cari mungkin sedang dalam tahap pengembangan, telah dihapus, atau tidak pernah ada.
        </p>
        <Link to="/" className="inline-flex items-center justify-center w-full h-12 bg-nb-black text-white font-extrabold text-sm border-3 border-nb-black shadow-[4px_4px_0px_#FFE600] hover:shadow-[5px_5px_0px_#FFE600] hover:-translate-x-px hover:-translate-y-px transition-all" style={{ borderWidth: '3px' }}>
          KEMBALI KE BERANDA
        </Link>
      </div>
    </div>
  );
}
