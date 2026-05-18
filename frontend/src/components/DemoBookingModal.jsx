import { useState } from 'react';
import axios from 'axios';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';

const DemoBookingModal = ({ courseName, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    course: courseName || '',
    date: '',
    timeSlot: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/demos', formData);
      alert('Demo session booked successfully!');
      onClose();
    } catch (error) {
      console.error('Error booking demo', error);
      alert('Failed to book demo.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-20 h-20 bg-indigo-50 rounded-full opacity-50 z-0"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-slate-900">Schedule a Free Demo</h2>
            <p className="text-xs text-slate-500 mt-1">Book your live training consultation session.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-2 rounded-full border border-slate-200 transition-all relative z-10">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Full Name</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Mahin Shah"
              value={formData.fullName} 
              onChange={e => setFormData({...formData, fullName: e.target.value})} 
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all placeholder:text-slate-400" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="your@email.com"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all placeholder:text-slate-400" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input 
                type="tel" 
                required 
                placeholder="98XXXXXXXX"
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all placeholder:text-slate-400" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Course of Interest</label>
            {courseName ? (
              <input 
                type="text" 
                required 
                value={formData.course} 
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50 text-sm font-semibold text-slate-600 border-dashed" 
                readOnly 
              />
            ) : (
              <select 
                required 
                value={formData.course} 
                onChange={e => setFormData({...formData, course: e.target.value})} 
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-sm"
              >
                <option value="">Select a Course</option>
                <option value="MERN Stack Web Development">MERN Stack Web Development</option>
                <option value="Python & Django for Data Science">Python & Django for Data Science</option>
                <option value="Flutter & Dart Mobile App Development">Flutter & Dart Mobile App Development</option>
                <option value="UI/UX Design Masterclass">UI/UX Design Masterclass</option>
                <option value="Cyber Security & Ethical Hacking">Cyber Security & Ethical Hacking</option>
                <option value="Quality Assurance (QA) Testing">Quality Assurance (QA) Testing</option>
                <option value="Digital Marketing Mastery">Digital Marketing Mastery</option>
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center">
                <CalendarIcon size={14} className="mr-1 text-slate-400"/> Date
              </label>
              <input 
                type="date" 
                required 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})} 
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center">
                <Clock size={14} className="mr-1 text-slate-400"/> Time Slot
              </label>
              <select 
                required 
                value={formData.timeSlot} 
                onChange={e => setFormData({...formData, timeSlot: e.target.value})} 
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-sm"
              >
                <option value="">Select time...</option>
                <option value="10:00 AM">10:00 AM - 11:00 AM</option>
                <option value="1:00 PM">1:00 PM - 2:00 PM</option>
                <option value="4:00 PM">4:00 PM - 5:00 PM</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm cursor-pointer"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemoBookingModal;
