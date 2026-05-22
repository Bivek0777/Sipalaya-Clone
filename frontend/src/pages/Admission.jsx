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
  const skipRegister = searchParams.get('skipRegister') === 'true';
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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const currentCourseId = formData.course || urlCourseId;
  const selectedCourse = courses.find(c => c._id === currentCourseId) || null;
  const courseFee = Number(urlAmount || selectedCourse?.fee || 0);
  const amountToPay = courseFee > 0
    ? (formData.paymentPlan === 'full' ? Math.round(courseFee * 0.95) : Math.ceil(courseFee * 0.5))
    : 0;

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

  useEffect(() => {
    if (user && skipRegister) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || prev.phone || '',
        course: urlCourseId || prev.course || ''
      }));
    }
  }, [user, skipRegister, urlCourseId]);

  useEffect(() => {
    if (urlCourseId && !formData.course) {
      setFormData(prev => ({ ...prev, course: urlCourseId }));
    }
  }, [urlCourseId, formData.course]);

  const getFieldError = (name, value) => {
    let errorMsg = '';
    
    if (name === 'fullName') {
      if (!value.trim()) errorMsg = 'Full name is required';
      else if (value.trim().length < 3) errorMsg = 'Full name must be at least 3 characters long';
    }
    
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) errorMsg = 'Email address is required';
      else if (!emailRegex.test(value)) errorMsg = 'Please enter a valid email address';
    }
    
    if (name === 'phone') {
      const normalized = value.replace(/[^0-9]/g, '');
      const nepalNumber = normalized.replace(/^977/, '');
      const phoneRegex = /^9\d{9}$/;
      if (!value) {
        errorMsg = 'Phone number is required';
      } else if (!phoneRegex.test(nepalNumber)) {
        errorMsg = 'Enter a valid Nepali phone number, e.g. 98XXXXXXXX';
      }
    }

    if (name === 'course' && !value) {
      errorMsg = 'Please select a course to enroll';
    }

    if (name === 'paymentPreference' && !value) {
      errorMsg = 'Please select a payment gateway';
    }

    return errorMsg;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errorMsg = getFieldError(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const fieldsToValidate = ['course', 'paymentPreference', 'paymentPlan', 'phone'];
    if (!skipRegister || !user) {
      fieldsToValidate.unshift('email', 'fullName');
    }

    const validationErrors = {};
    fieldsToValidate.forEach(key => {
      const value = key === 'course' ? currentCourseId : formData[key];
      const errorMsg = getFieldError(key, value || '');
      if (errorMsg) {
        validationErrors[key] = errorMsg;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...validationErrors }));
      const firstError = validationErrors.email || validationErrors.fullName || validationErrors.phone || validationErrors.course || validationErrors.paymentPreference || 'Please complete all required fields before proceeding.';
      setSubmitError(firstError);
      return;
    }

    if (!currentCourseId) {
      setSubmitError('Please select a course before proceeding to payment.');
      return;
    }

    if (!amountToPay || amountToPay <= 0) {
      setSubmitError('Unable to calculate the payment amount. Please select a valid course and try again.');
      return;
    }

    if (user && user.enrolledCourses) {
      const alreadyEnrolled = user.enrolledCourses.some(c => {
        const cId = c.course?._id || c.course;
        return cId && cId.toString() === currentCourseId.toString();
      });
      if (alreadyEnrolled) {
        alert('You are already enrolled in this course! You cannot enroll again.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        fullName: user?.name || formData.fullName,
        email: user?.email || formData.email,
        course: currentCourseId,
      };

      if (user) {
        payload.user = user._id || user.id;
      }

      const response = await axios.post('/api/admissions', payload);
      navigate(`/pay?amount=${amountToPay}&productId=${payload.course}&method=${formData.paymentPreference}&admissionId=${response.data.data._id}&plan=${formData.paymentPlan}&total=${courseFee}`);
      localStorage.removeItem('admission_form_data');
    } catch (error) {
      console.error('Error submitting admission:', error);
      setSubmitError(error.response?.data?.message || 'Failed to submit admission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (name) => {
    const baseClass = "w-full px-4 py-3 rounded-lg border outline-none transition-all focus:ring-2 focus:ring-indigo-500/20";
    if (errors[name]) {
      return `${baseClass} border-red-400 focus:border-red-500 bg-red-50/10 focus:ring-red-200`;
    }
    if (formData[name] && !errors[name]) {
      return `${baseClass} border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100`;
    }
    return `${baseClass} border-slate-300 focus:border-indigo-500`;
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
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {submitError && (
                <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                  {submitError}
                </div>
              )}
              {skipRegister && user ? (
                <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 mb-6">
                  <p className="text-sm font-semibold text-indigo-700 mb-2">Authenticated Checkout</p>
                  <p className="text-slate-600">You're logged in as <span className="font-semibold text-slate-900">{user.name}</span> ({user.email}).</p>
                  <p className="text-slate-500 mt-2">Your account details will be used for enrollment, and payment will grant instant access.</p>
                  {!user.phone && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getInputClass('phone')}
                        placeholder="98XXXXXXXX"
                      />
                      {errors.phone && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.phone}</p>}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        className={getInputClass('fullName')}
                        placeholder="John Doe" 
                      />
                      {errors.fullName && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.fullName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        className={getInputClass('phone')}
                        placeholder="98XXXXXXXX" 
                      />
                      {errors.phone && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.phone}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className={getInputClass('email')}
                      placeholder="john@example.com" 
                    />
                    {errors.email && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.email}</p>}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Course</label>
                <select 
                  name="course" 
                  value={formData.course} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                  className={getInputClass('course')}
                >
                  <option value="" disabled>Select a course...</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
                {errors.course && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.course}</p>}
              </div>

              {/* Payment Gateway */}
              <div className="pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-3">Select Payment Gateway</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center transition-all ${formData.paymentPreference === 'esewa' ? 'border-green-500 bg-green-50 ring-2 ring-green-500/20' : 'border-slate-200 hover:border-green-300'}`}>
                    <input type="radio" name="paymentPreference" value="esewa" className="sr-only" onChange={(e) => { handleChange(e); setErrors(prev => ({ ...prev, paymentPreference: '' })); }} required />
                    <img src="https://esewa.com.np/common/images/esewa_logo.png" alt="eSewa" className="h-8 object-contain mb-2" />
                    <span className="text-sm font-medium text-slate-700">eSewa</span>
                  </label>
                  
                  <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center transition-all ${formData.paymentPreference === 'khalti' ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500/20' : 'border-slate-200 hover:border-purple-300'}`}>
                    <input type="radio" name="paymentPreference" value="khalti" className="sr-only" onChange={(e) => { handleChange(e); setErrors(prev => ({ ...prev, paymentPreference: '' })); }} required />
                    <img src="https://khalti.com/static/images/logo.png" alt="Khalti" className="h-8 object-contain mb-2" />
                    <span className="text-sm font-medium text-slate-700">Khalti</span>
                  </label>

                  <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center transition-all ${formData.paymentPreference === 'stripe' ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-indigo-300'}`}>
                    <input type="radio" name="paymentPreference" value="stripe" className="sr-only" onChange={(e) => { handleChange(e); setErrors(prev => ({ ...prev, paymentPreference: '' })); }} required />
                    <div className="h-8 flex items-center text-indigo-600 mb-2">
                      <CreditCard size={32} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Card / Stripe</span>
                  </label>
                </div>
                {errors.paymentPreference && <p className="mt-2 text-xs font-semibold text-red-600">{errors.paymentPreference}</p>}
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

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex justify-center items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Proceed to Payment'} <ChevronRight size={20} className="ml-2" />
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
              <div className="bg-slate-800 rounded-3xl p-4 mb-6 border border-slate-700">
                <p className="text-sm text-slate-400 mb-2">Selected course fee</p>
                <div className="flex justify-between items-center text-white font-bold mb-2">
                  <span>{selectedCourse?.title || 'Course selected at checkout'}</span>
                  <span>Rs. {courseFee.toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-400">
                  {formData.paymentPlan === 'full' ? 'Full payment includes a 5% discount.' : 'Installment plan collects 50% now and 50% later.'}
                </p>
              </div>
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
