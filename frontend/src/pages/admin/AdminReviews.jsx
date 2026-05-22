import { useState } from 'react';
import { Search, CheckCircle2, Trash2, MessageSquare } from 'lucide-react';
import axios from 'axios';

const API = '/api/reviews';

const statusBadge = approved => approved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';

export default function AdminReviews({ reviews = [], token, onRefresh }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const filtered = (reviews || []).filter(review => {
    const text = `${review.studentName || ''} ${review.reviewText || ''} ${review.courseId?.title || ''}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'pending' ? !review.approved : review.approved);
    return matchesSearch && matchesFilter;
  });

  const handleApprove = async review => {
    setLoading(true);
    try {
      await axios.put(`${API}/${review._id}`, { approved: true }, { headers: { Authorization: `Bearer ${token}` } });
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async review => {
    if (!window.confirm(`Delete review by ${review.studentName}?`)) return;
    setLoading(true);
    try {
      await axios.delete(`${API}/${review._id}`, { headers: { Authorization: `Bearer ${token}` } });
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reviews…"
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            <option value="all">All Reviews</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
          Total reviews: {reviews.length}
        </span>
        <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
          Approved: {reviews.filter(r => r.approved).length}
        </span>
        <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
          Pending: {reviews.filter(r => !r.approved).length}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Student</th>
                <th className="px-5 py-3.5 font-semibold">Course</th>
                <th className="px-5 py-3.5 font-semibold">Review</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">No reviews found.</td>
                </tr>
              )}
              {filtered.map(review => (
                <tr key={review._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-900">{review.studentName}</p>
                    <p className="text-xs text-slate-500">{new Date(review.createdAt || Date.now()).toLocaleDateString()}</p>
                  </td>
                  <td className="px-5 py-3.5 text-indigo-600 font-medium">{review.courseId?.title || 'Unknown course'}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-slate-600 line-clamp-2">{review.reviewText}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(review.approved)}`}>
                      {review.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-2">
                      {!review.approved && (
                        <button
                          onClick={() => handleApprove(review)}
                          disabled={loading}
                          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
                        >
                          <CheckCircle2 size={14} /> Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
