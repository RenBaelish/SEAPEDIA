import { Hammer, ArrowLeft } from "lucide-react";
import { Button } from "./Button";
import { useNavigate } from "react-router-dom";

interface Props {
  title?: string;
  description?: string;
  backUrl?: string;
}

export function UnderConstruction({ 
  title = "Dalam Pengembangan", 
  description = "Halaman ini sedang dibangun dan akan tersedia pada versi berikutnya. Terima kasih atas kesabaran Anda.", 
  backUrl 
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-border shadow-sm min-h-[400px]">
      <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
        <Hammer size={32} />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 max-w-md text-sm leading-relaxed mb-6">
        {description}
      </p>
      {backUrl ? (
        <Button onClick={() => navigate(backUrl)} variant="secondary" className="flex items-center gap-2">
          <ArrowLeft size={16} /> Kembali
        </Button>
      ) : (
        <Button onClick={() => navigate(-1)} variant="secondary" className="flex items-center gap-2">
          <ArrowLeft size={16} /> Kembali
        </Button>
      )}
    </div>
  );
}
