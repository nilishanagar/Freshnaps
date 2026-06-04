import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, BadgeCheck, SlidersHorizontal } from 'lucide-react';
import SectionHeading from './SectionHeading';

const ReviewSection = ({ product, user }) => {
  const [sortBy, setSortBy] = useState('recent');
  const [filterStar, setFilterStar] = useState(0);

  const reviews = product.reviews || [];
  const rating = product.rating || 0;
  const numReviews = product.numReviews || 0;

  const distribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++; });
    return dist;
  }, [reviews]);

  const filtered = useMemo(() => {
    let res = [...reviews];
    if (filterStar > 0) res = res.filter(r => r.rating === filterStar);
    if (sortBy === 'highest') res.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'lowest') res.sort((a, b) => a.rating - b.rating);
    else res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res;
  }, [reviews, sortBy, filterStar]);

  return (
    <div>
      <SectionHeading eyebrow="What Customers Say" title="Reviews &" gradient="Ratings" />
      <div className="bg-white dark:bg-surface-950 rounded-xl border border-gray-200 dark:border-surface-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-surface-700">
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="text-center sm:text-left flex-shrink-0">
              <span className="text-5xl font-extrabold text-gray-900 dark:text-white font-display">{rating.toFixed(1)}</span>
              <div className="flex gap-0.5 justify-center sm:justify-start mt-2">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={18} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-surface-700'} />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">{numReviews} verified {numReviews === 1 ? 'review' : 'reviews'}</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5,4,3,2,1].map(star => {
                const count = distribution[star - 1];
                const pct = numReviews > 0 ? Math.round((count / numReviews) * 100) : 0;
                return (
                  <button key={star} onClick={() => setFilterStar(filterStar === star ? 0 : star)} className={`w-full flex items-center gap-3 py-1 px-2 rounded-lg text-xs transition-colors ${filterStar === star ? 'bg-primary-50 dark:bg-primary-950/20' : 'hover:bg-gray-50 dark:hover:bg-surface-900'}`}>
                    <span className="w-6 font-bold text-gray-600 dark:text-gray-300 text-right">{star}★</span>
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-surface-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-10 text-right text-gray-400 font-medium">{pct}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="px-6 py-3 border-b border-gray-200 dark:border-surface-700 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">{filtered.length} {filtered.length === 1 ? 'review' : 'reviews'}{filterStar > 0 && ` (${filterStar}★)`}</span>
            {filterStar > 0 && <button onClick={() => setFilterStar(0)} className="text-[10px] text-primary-500 font-bold hover:underline">Clear</button>}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-surface-900 border border-gray-200 dark:border-surface-700 rounded-lg px-2.5 py-1.5 outline-none">
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-surface-700">
          {filtered.length > 0 ? filtered.map((r, i) => (
            <div key={i} className="p-5 hover:bg-gray-50/50 dark:hover:bg-surface-900/50 transition-colors">
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">{r.name?.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{r.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={11} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-surface-700'} />)}</div>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold"><BadgeCheck size={10} /> Verified</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{r.comment}</p>
            </div>
          )) : (
            <div className="text-center py-12"><span className="text-4xl block mb-3">✍️</span><h4 className="font-bold text-gray-800 dark:text-white mb-1">{filterStar > 0 ? `No ${filterStar}★ reviews` : 'No Reviews Yet'}</h4><p className="text-sm text-gray-400">Be the first to share your experience!</p></div>
          )}
        </div>
        {!user && (
          <div className="px-6 pb-5"><p className="text-sm text-gray-500 bg-gray-50 dark:bg-surface-900 border border-gray-200 dark:border-surface-700 rounded-xl p-4 text-center"><Link to="/login" className="text-primary-500 font-semibold hover:underline">Login</Link> to write a review.</p></div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
