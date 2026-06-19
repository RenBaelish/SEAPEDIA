import { Link, useRouteError } from "react-router-dom";
import { ServerCrash } from "lucide-react";
import { Button } from "../ui/Button";

export function GlobalErrorPage() {
  const error: any = useRouteError();
  console.error("Global Error Boundary caught:", error);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <ServerCrash size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Terjadi Kesalahan Sistem</h1>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          Sistem kami sedang mengalami kendala teknis. Tim developer kami telah diberitahu dan sedang menangani masalah ini.
        </p>
        
        {(error?.message || error?.statusText || error?.data || error?.toString()) && (
          <div className="bg-gray-50 rounded text-left p-3 mb-6 overflow-auto max-h-48 text-xs font-mono text-gray-600 border border-gray-200 whitespace-pre-wrap">
            {error?.stack || error?.message || error?.data || JSON.stringify(error)}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
          <Link to="/">
            <Button>Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
