import { Link } from "react-router-dom";
import { AlertOctagon } from "lucide-react";
import { Button } from "../ui/Button";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertOctagon size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-800 mb-3">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          Maaf, halaman yang Anda cari mungkin telah dihapus, dipindahkan, atau memang tidak pernah ada di SEAPEDIA.
        </p>
        <Link to="/">
          <Button className="w-full justify-center">Kembali ke Beranda</Button>
        </Link>
      </div>
    </div>
  );
}
