import { useState, useEffect } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import {
  HiOutlineStar,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineTrash
} from 'react-icons/hi2';

export default function AdminReviews() {
  const { getAuthHeaders } = useAdminStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, overall, product
  const [filterApproval, setFilterApproval] = useState('all'); // all, approved, pending

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/admin/reviews', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success && data.data) {
        setReviews(data.data);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`http://localhost:5001/api/admin/reviews/${id}/approve`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_approved: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setReviews(prev =>
          prev.map(r => (r.id === id ? { ...r, is_approved: !currentStatus } : r))
        );
      }
    } catch (err) {
      console.error('Failed to update review approval:', err);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer review?')) return;

    try {
      const res = await fetch(`http://localhost:5001/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setReviews(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const filtered = reviews.filter((r) => {
    if (filterType !== 'all' && r.review_type !== filterType) return false;
    if (filterApproval === 'approved' && !r.is_approved) return false;
    if (filterApproval === 'pending' && r.is_approved) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="font-heading text-2xl font-light text-stone-100 flex items-center gap-3">
            <span>Customer Reviews Moderation</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-stone-800 text-[#F3C082] border border-stone-700">
              {reviews.length} Total
            </span>
          </h1>
          <p className="text-xs text-stone-300 mt-1">
            Moderate testimonials, verified purchase ratings, and public feedback.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#141820] border border-stone-800 rounded-xl px-3 py-2 text-stone-300 focus:outline-none focus:border-[#B48346]"
          >
            <option value="all">All Types</option>
            <option value="overall">Brand Experience</option>
            <option value="product">Product Specific</option>
          </select>

          <select
            value={filterApproval}
            onChange={(e) => setFilterApproval(e.target.value)}
            className="bg-[#141820] border border-stone-800 rounded-xl px-3 py-2 text-stone-300 focus:outline-none focus:border-[#B48346]"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved &amp; Live</option>
            <option value="pending">Pending Moderation</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-stone-300 font-mono">
            <div className="w-8 h-8 border-2 border-[#B48346]/20 border-t-[#B48346] rounded-full animate-spin mx-auto mb-3"></div>
            Loading reviews...
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#141820] border border-stone-800/90 rounded-2xl p-5 hover:border-stone-700 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Star Rating */}
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <HiOutlineStar
                        key={i}
                        className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-700'}`}
                      />
                    ))}
                  </div>

                  <span className="text-xs font-mono uppercase text-[#F3C082] px-2 py-0.5 rounded bg-stone-900 border border-stone-800">
                    {rev.review_type === 'product' ? (rev.product_name || 'Product Review') : 'Overall Brand Review'}
                  </span>

                  {rev.is_verified_purchase && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Verified Purchase
                    </span>
                  )}

                  <span className="text-[11px] text-stone-300 font-mono">
                    {new Date(rev.created_at).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {rev.title && (
                  <h4 className="font-heading text-sm font-medium text-white">{rev.title}</h4>
                )}

                <p className="text-xs text-stone-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>

                <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-stone-300">
                  <span className="font-medium text-stone-300">{rev.customer_name}</span>
                  {rev.customer_email && <span>({rev.customer_email})</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center sm:flex-col gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-800">
                <button
                  onClick={() => handleToggleApproval(rev.id, rev.is_approved)}
                  className={`w-full sm:w-32 px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    rev.is_approved
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                  }`}
                >
                  {rev.is_approved ? (
                    <>
                      <HiOutlineCheckCircle className="w-4 h-4" />
                      <span>Approved</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineXCircle className="w-4 h-4" />
                      <span>Pending</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDeleteReview(rev.id)}
                  className="px-3 py-1.5 text-xs text-stone-300 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-mono flex items-center gap-1 cursor-pointer"
                  title="Delete Review"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center text-stone-300 font-mono bg-[#141820] rounded-2xl border border-stone-800">
            No customer reviews match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
