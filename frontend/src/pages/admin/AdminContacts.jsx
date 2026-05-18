import React, { useState } from 'react';
import { Mail, Trash2, CheckCircle, Eye, Tag, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function AdminContacts({ contacts, onRefresh }) {
  const [filter, setFilter] = useState('all');

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/api/contact/${id}`, { status });
      onRefresh();
    } catch (e) {
      console.error(e);
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message permanently?')) return;
    try {
      await axios.delete(`/api/contact/${id}`);
      onRefresh();
    } catch (e) {
      console.error(e);
      alert('Failed to delete message.');
    }
  };

  const filteredContacts = contacts.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-200 flex items-center gap-1"><AlertCircle size={12} /> New</span>;
      case 'read':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-200 flex items-center gap-1"><Eye size={12} /> Read</span>;
      case 'resolved':
        return <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-200 flex items-center gap-1"><CheckCircle size={12} /> Resolved</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-full border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            Showing {filteredContacts.length} of {contacts.length} total message{contacts.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'new', 'read', 'resolved'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                filter === item
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {filteredContacts.length === 0 && (
        <div className="py-20 text-center bg-white border border-slate-200 rounded-3xl">
          <Mail size={48} className="mx-auto mb-4 text-slate-300 opacity-70" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Messages Found</h3>
          <p className="text-slate-500 text-sm">There are no inquiries matching your filter at this time.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5">
        {filteredContacts.map(c => (
          <div 
            key={c._id} 
            className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden ${
              c.status === 'new' ? 'border-l-4 border-l-red-500 border-slate-200' : 'border-slate-200'
            }`}
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <div>
                <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  {c.name}
                  <span className="text-xs font-normal text-slate-400">({c.email})</span>
                </h4>
                
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Tag size={13} className="text-slate-400" />
                    <span className="font-semibold text-indigo-600 uppercase tracking-wide">{c.purpose}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock size={13} />
                    <span>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="shrink-0">{getStatusBadge(c.status)}</div>
            </div>

            {/* Message content */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-5">
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {c.message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                {c.status !== 'resolved' && (
                  <button 
                    onClick={() => handleUpdateStatus(c._id, 'resolved')}
                    className="flex items-center gap-1.5 px-3 py-1.8 bg-green-50 border border-green-200 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-xl transition-all"
                  >
                    <CheckCircle size={14} /> Mark Resolved
                  </button>
                )}
                
                {c.status === 'new' && (
                  <button 
                    onClick={() => handleUpdateStatus(c._id, 'read')}
                    className="flex items-center gap-1.5 px-3 py-1.8 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition-all"
                  >
                    <Eye size={14} /> Mark Read
                  </button>
                )}

                {c.status !== 'new' && c.status !== 'resolved' && (
                  <button 
                    onClick={() => handleUpdateStatus(c._id, 'new')}
                    className="flex items-center gap-1.5 px-3 py-1.8 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl transition-all"
                  >
                    <AlertCircle size={14} /> Mark Unread
                  </button>
                )}
              </div>

              <button 
                onClick={() => handleDelete(c._id)}
                className="flex items-center justify-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-xl transition-all"
                title="Delete Inquiry"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
