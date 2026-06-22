import { useState } from 'react';
import { Star } from "lucide-react";
import { Input, Textarea } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { api } from "../../../lib/api";

interface AppReviewFormProps {
  onSuccess: () => void;
}

export function AppReviewForm({ onSuccess }: AppReviewFormProps) {
  const [guestName, setGuestName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/reviews/app", { guestName, rating, comment });
      setGuestName("");
      setRating(5);
      setComment("");
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengirim ulasan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="border-2 border-nb-red bg-red-50 text-nb-red p-3 text-xs font-bold">
          {error}
        </div>
      )}

      <Input
        label="Nama Lengkap"
        placeholder="Masukkan nama Anda"
        value={guestName}
        onChange={(e) => setGuestName((e.target as any).value)}
        required
        minLength={2}
        maxLength={100}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-nb-black uppercase tracking-wide">Penilaian</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-0.5 focus:outline-none hover:scale-110 transition-transform"
            >
              <Star
                size={28}
                className={star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}
              />
            </button>
          ))}
        </div>
      </div>

      <Textarea
        label="Ulasan Anda"
        placeholder="Ceritakan pengalaman Anda menggunakan SEAPEDIA..."
        value={comment}
        onChange={(e) => setComment((e.target as any).value)}
        required
        minLength={10}
        maxLength={1000}
      />

      <Button type="submit" loading={loading} className="w-full bg-nb-black text-white border-3 border-nb-black hover:bg-nb-black hover:text-nb-yellow font-bold py-3" style={{ borderWidth: '3px' }}>
        Kirim Ulasan
      </Button>
    </form>
  );
}
