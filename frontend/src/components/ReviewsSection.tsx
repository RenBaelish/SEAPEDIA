import { useState, useEffect } from 'preact/hooks';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    fullName: string;
    username: string;
  }
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isLoggedIn = !!localStorage.getItem('token');

  const fetchReviews = async () => {
    try {
      const res = await fetch('http://localhost:8787/reviews');
      const data = await res.json();
      setReviews(data.data || []);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8787/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: newRating, comment: newComment })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit review');
      }

      setNewComment('');
      setNewRating(5);
      fetchReviews();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div class="mt-20 border-t border-gray-100 pt-16">
      <h2 class="text-3xl font-bold text-center mb-10 text-gray-900">Ulasan Pengguna SEAPEDIA</h2>
      
      {isLoggedIn && (
        <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm max-w-2xl mx-auto mb-12">
          <h3 class="font-bold text-lg mb-4">Tulis Ulasan Anda</h3>
          {error && <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
              <input type="number" min="1" max="5" value={newRating} onInput={(e) => setNewRating(Number(e.currentTarget.value))} class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Komentar</label>
              <textarea required rows={3} value={newComment} onInput={(e) => setNewComment(e.currentTarget.value)} class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"></textarea>
            </div>
            <button type="submit" disabled={submitting} class="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50">
              {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div class="text-center text-gray-500">Memuat ulasan...</div>
      ) : reviews.length === 0 ? (
        <div class="text-center text-gray-500">Belum ada ulasan.</div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map(review => (
            <div key={review.id} class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div class="flex items-center gap-2 mb-3">
                <div class="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                  {review.user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div class="font-bold text-gray-900">{review.user.fullName}</div>
                  <div class="text-xs text-gray-500">@{review.user.username} • {new Date(review.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div class="flex text-yellow-400 mb-2 text-sm">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </div>
              <p class="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
