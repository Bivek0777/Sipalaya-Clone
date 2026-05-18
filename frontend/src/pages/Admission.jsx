import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { CreditCard, CheckCircle2, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import SEO from '../components/SEO';

const Admission = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const urlCourseId = searchParams.get('courseId') || '';
  const urlAmount = searchParams.get('amount') || '';
  const [courses, setCourses] = useState([]);

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('admission_form_data');
    const defaultData = {
      fullName: '',
      email: '',
      phone: '',
      course: urlCourseId,
      paymentPreference: '',
      paymentPlan: 'full'
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultData,
          ...parsed,
          course: urlCourseId || parsed.course || ''
        };
      } catch (e) {
        return defaultData;
      }
    }
    return defaultData;
  });

  // Persist form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('admission_form_data', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/admissions', formData);
      const amountToPay = urlAmount || (courses.find(c => c._id === formData.course)?.fee || 0);
      navigate(`/pay?amount=${amountToPay}&productId=${formData.course}&method=${formData.paymentPreference}&admissionId=${response.data.data._id}`);
    } catch (error) {
      console.error('Error submitting admission:', error);
      alert('Failed to submit admission.');
    }
  };

  if (user && (user.role === 'instructor' || user.role === 'admin')) {
    return (
      <div className="bg-slate-50 min-h-screen py-20 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Enrollment Restricted</h2>
          <p className="text-slate-600 mb-6">Course enrollment is restricted to Student accounts only. Instructors and Admins cannot enroll in courses.</p>
          <Link to="/" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <SEO 
        title="Apply Online - Start Your Tech Career" 
        description="Enroll in our professional IT courses today. Secure online admission with multiple payment options and installment plans."
        url="/admission"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Admission Process</h1>
          <p className="text-lg text-slate-600">
            Start your tech journey in 4 simple steps. Enroll today to secure your spot in our upcoming batches.
          </p>
        </div>

        {/* Steps to Enroll */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Select Course', desc: 'Browse our catalog and pick a course.' },
              { step: '02', title: 'Register Online', desc: 'Fill out the admission form below.' },
              { step: '03', title: 'Make Payment', desc: 'Pay securely via eSewa, Khalti or Card.' },
              { step: '04', title: 'Start Learning', desc: 'Get your portal access and begin.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 text-7xl font-black text-slate-50 opacity-50 group-hover:text-indigo-50 transition-colors z-0">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm mb-4">
                    {idx + 1}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Registration Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Online Registration</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="+977 98XXXXXXXX" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="john@example.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Course</label>
                <select required name="course" value={formData.course} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white">
                  <option value="" disabled>Select a course...</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>

              {/* Payment Gateway */}
              <div className="pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-3">Select Payment Gateway</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center transition-all ${formData.paymentPreference === 'esewa' ? 'border-green-500 bg-green-50 ring-2 ring-green-500/20' : 'border-slate-200 hover:border-green-300'}`}>
                    <input type="radio" name="paymentPreference" value="esewa" className="sr-only" onChange={handleChange} required />
                    <img src="https://esewa.com.np/common/images/esewa_logo.png" alt="eSewa" className="h-8 object-contain mb-2" />
                    <span className="text-sm font-medium text-slate-700">eSewa</span>
                  </label>
                  
                  <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center transition-all ${formData.paymentPreference === 'khalti' ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500/20' : 'border-slate-200 hover:border-purple-300'}`}>
                    <input type="radio" name="paymentPreference" value="khalti" className="sr-only" onChange={handleChange} required />
                    <img src="https://khalti.com/static/images/logo.png" alt="Khalti" className="h-8 object-contain mb-2" />
                    <span className="text-sm font-medium text-slate-700">Khalti</span>
                  </label>

                  <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center transition-all ${formData.paymentPreference === 'stripe' ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-indigo-300'}`}>
                    <input type="radio" name="paymentPreference" value="stripe" className="sr-only" onChange={handleChange} required />
                    <div className="h-8 flex items-center text-indigo-600 mb-2">
                      <CreditCard size={32} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Card / Stripe</span>
                  </label>
                </div>
              </div>

              {/* Payment Plan */}
              <div className="pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-3">Payment Plan</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`cursor-pointer border rounded-xl p-4 flex flex-col transition-all ${formData.paymentPlan === 'full' ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-indigo-300'}`}>
                    <input type="radio" name="paymentPlan" value="full" className="sr-only" onChange={handleChange} required />
                    <span className="font-bold text-slate-900 mb-1">Full Payment</span>
                    <span className="text-sm text-slate-500">Pay the entire course fee upfront (Get 5% discount)</span>
                  </label>
                  
                  <label className={`cursor-pointer border rounded-xl p-4 flex flex-col transition-all ${formData.paymentPlan === 'installment' ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-indigo-300'}`}>
                    <input type="radio" name="paymentPlan" value="installment" className="sr-only" onChange={handleChange} required />
                    <span className="font-bold text-slate-900 mb-1">Installment Plan</span>
                    <span className="text-sm text-slate-500">Pay 50% now, and 50% halfway through the course</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex justify-center items-center">
                Proceed to Payment <ChevronRight size={20} className="ml-2" />
              </button>
            </form>
          </div>

          {/* Payment Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <CreditCard size={28} className="text-indigo-400 mr-3" />
                <h3 className="text-xl font-bold">Secure Payment</h3>
              </div>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                We use industry-standard encryption to protect your payment details. You can pay using local digital wallets or international credit/debit cards.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle2 size={18} className="text-indigo-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">Installment options available for long-term courses.</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 size={18} className="text-indigo-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">Automated invoice generation upon success.</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 size={18} className="text-indigo-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">Instant access to student portal after payment.</span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 text-center">
              <h4 className="font-bold text-indigo-900 mb-2">Need Help?</h4>
              <p className="text-indigo-700 text-sm mb-4">Contact our admission counselor for assistance.</p>
              <div className="text-lg font-black text-indigo-600">9851344071</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Admission;
