import { Calendar, Mail, Phone, BookOpen, Trash2, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API = '/api/admin';

export default function AdminDemos({ demos, token, onRefresh }) {
  const handleDismiss = async id => {
    if (!window.confirm('Mark as contacted and remove?')) return;
    try { await axios.delete(`${API}/demos/${id}`); onRefresh(); }
    catch (e) { alert('Failed to remove demo request'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">{demos.length} pending demo request{demos.length !== 1 ? 's' : ''}</p>
        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">{demos.length} Total</span>
      </div>

      {demos.length === 0 && (
        <div className="py-20 text-center text-slate-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>No demo requests at the moment.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demos.map(d => (
          <div key={d._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-slate-800 text-base">{d.fullName || d.name}</h4>
                <p className="text-xs text-indigo-500 font-semibold mt-0.5">Interested in: {d.course}</p>
              </div>
              <span className="px-2 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-200">Pending</span>
            </div>
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <span>{d.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <span>{d.phone}</span>
              </div>
              {d.date && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  <span>{new Date(d.date).toLocaleDateString()} {d.timeSlot && `at ${d.timeSlot}`}</span>
                </div>
              )}
              {d.message && (
                <p className="text-xs text-slate-500 mt-2 border-t border-slate-100 pt-2 italic">"{d.message}"</p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleDismiss(d._id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded-xl text-sm font-semibold transition-colors">
                <CheckCircle size={15} /> Contacted
              </button>
              <button onClick={() => handleDismiss(d._id)}
                className="p-2 border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
