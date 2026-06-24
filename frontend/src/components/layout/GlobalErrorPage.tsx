import { Link, useRouteError } from "react-router-dom";
import { ServerCrash, Home, RefreshCcw } from "lucide-react";

export function GlobalErrorPage() {
  const error: any = useRouteError();
  console.error("Global Error Boundary caught:", error);

  return (
    <div className="bg-[#F7F5F0] min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border-4 border-nb-black shadow-[8px_8px_0px_#0A0A0A] p-8 text-center" style={{ borderWidth: '4px' }}>
        <div className="w-20 h-20 bg-nb-red border-4 border-nb-black text-white flex items-center justify-center mx-auto mb-6 transform -rotate-3" style={{ borderWidth: '4px' }}>
          <ServerCrash size={36} strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-black text-nb-black uppercase tracking-wide mb-3">Terjadi Kesalahan Sistem</h1>
        <p className="text-sm font-bold text-gray-700 leading-relaxed mb-6">
          Sistem kami sedang mengalami kendala teknis. Tim developer kami telah diberitahu dan sedang menangani masalah ini.
        </p>
        
        {(error?.message || error?.statusText || error?.data || error?.toString()) && (
          <div className="bg-nb-yellow border-3 border-nb-black p-4 mb-6 text-left max-h-48 overflow-auto hide-scrollbar shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)]" style={{ borderWidth: '3px' }}>
            <p className="text-xs font-black text-nb-black uppercase tracking-wider mb-2">Detail Error:</p>
            <div className="text-xs font-mono font-bold text-nb-black whitespace-pre-wrap">
              {error?.stack || error?.message || error?.data || JSON.stringify(error)}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button 
            onClick={() => window.location.reload()}
            className="flex-1 h-12 flex items-center justify-center gap-2 border-3 border-nb-black bg-white text-nb-black font-black text-sm uppercase hover:bg-nb-yellow transition-colors shadow-[4px_4px_0px_#0A0A0A]"
            style={{ borderWidth: '3px' }}
          >
            <RefreshCcw size={18} strokeWidth={2.5} /> Coba Lagi
          </button>
          <Link 
            to="/"
            className="flex-1 h-12 flex items-center justify-center gap-2 border-3 border-nb-black bg-nb-black text-white font-black text-sm uppercase hover:bg-nb-blue transition-colors shadow-[4px_4px_0px_#FFE600]"
            style={{ borderWidth: '3px' }}
          >
            <Home size={18} strokeWidth={2.5} /> Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
