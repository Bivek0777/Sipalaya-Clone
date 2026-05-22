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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Today's date in YYYY-MM-DD format for date input min constraint
  const todayDate = new Date().toISOString().split('T')[0];

  const validateField = (name, value) => {
    let errorMsg = '';
    
    if (name === 'fullName') {
      if (!value.trim()) errorMsg = 'Full name is required';
      else if (value.trim().length < 3) errorMsg = 'Name must be at least 3 characters';
    }
    
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) errorMsg = 'Email address is required';
      else if (!emailRegex.test(value)) errorMsg = 'Enter a valid email address';
    }
    
    if (name === 'phone') {
      const phoneRegex = /^9\d{9}$/;
      if (!value) errorMsg = 'Phone number is required';
      else if (!phoneRegex.test(value)) errorMsg = 'Nepali phone must start with 9 & be 10 digits';
    }

    if (name === 'course' && !value) {
      errorMsg = 'Please select a course';
    }

    if (name === 'date' && !value) {
      errorMsg = 'Please select a date';
    }

    if (name === 'timeSlot' && !value) {
      errorMsg = 'Please select a time slot';
    }

    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    return !errorMsg;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    let isValid = true;
    Object.keys(formData).forEach(key => {
      const fieldValid = validateField(key, formData[key]);
      if (!fieldValid) isValid = false;
    });

    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await axios.post('/api/demos', formData);
      alert('Demo session booked successfully!');
      onClose();
    } catch (error) {
      console.error('Error booking demo', error);
      alert('Failed to book demo: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (name) => {
    const baseClass = "w-full px-3.5 py-2.5 border rounded-xl outline-none text-sm transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20";
    if (errors[name]) {
      return `${baseClass} border-red-400 focus:border-red-500 bg-red-50/10 focus:ring-red-200`;
    }
    if (formData[name] && !errors[name]) {
      return `${baseClass} border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100`;
    }
    return `${baseClass} border-slate-200 focus:border-indigo-500`;
  };

  return (
    <div className="fixed inset-0 bg-slate-955 bg-slate-950/40 z-50 flex items-center justify-center p-4 backdrop-blur-md">
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
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Full Name</label>
            <input 
              type="text" 
              name="fullName"
              placeholder="e.g. Mahin Shah"
              value={formData.fullName} 
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClass('fullName')}
            />
            {errors.fullName && <p className="mt-1 text-xs font-semibold text-red-600">{errors.fullName}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email Address</label>
              <input 
                type="email" 
                name="email"
                placeholder="your@email.com"
                value={formData.email} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('email')}
              />
              {errors.email && <p className="mt-1 text-xs font-semibold text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                placeholder="98XXXXXXXX"
                value={formData.phone} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('phone')}
              />
              {errors.phone && <p className="mt-1 text-xs font-semibold text-red-600">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Course of Interest</label>
            {courseName ? (
              <input 
                type="text" 
                value={formData.course} 
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50 text-sm font-semibold text-slate-600 border-dashed" 
                readOnly 
              />
            ) : (
              <select 
                name="course"
                value={formData.course} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('course')}
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
            {errors.course && <p className="mt-1 text-xs font-semibold text-red-600">{errors.course}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center">
                <CalendarIcon size={14} className="mr-1 text-slate-400"/> Date
              </label>
              <input 
                type="date" 
                name="date"
                min={todayDate}
                value={formData.date} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('date')}
              />
              {errors.date && <p className="mt-1 text-xs font-semibold text-red-600">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center">
                <Clock size={14} className="mr-1 text-slate-400"/> Time Slot
              </label>
              <select 
                name="timeSlot"
                value={formData.timeSlot} 
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('timeSlot')}
              >
                <option value="">Select time...</option>
                <option value="10:00 AM">10:00 AM - 11:00 AM</option>
                <option value="1:00 PM">1:00 PM - 2:00 PM</option>
                <option value="4:00 PM">4:00 PM - 5:00 PM</option>
              </select>
              {errors.timeSlot && <p className="mt-1 text-xs font-semibold text-red-600">{errors.timeSlot}</p>}
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemoBookingModal;
