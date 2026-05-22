import { useState, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const navigate = useNavigate();

  const validateName = (value) => {
    if (!value.trim()) {
      setNameError('Full name is required');
      return false;
    }
    if (value.trim().length < 3) {
      setNameError('Full name must be at least 3 characters long');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateEmail = (value) => {
    if (!value) {
      setEmailError('Email address is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value) => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validatePhone = (value) => {
    const normalized = value.trim();
    if (!normalized) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.0-9]{5,20}$/.test(normalized)) {
      setPhoneError('Please enter a valid phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validateAddress = (value) => {
    if (!value.trim()) {
      setAddressError('Address is required');
      return false;
    }
    if (value.trim().length < 5) {
      setAddressError('Please enter a more complete address');
      return false;
    }
    setAddressError('');
    return true;
  };

  const handleBlur = (field) => {
    if (field === 'name') validateName(formData.name);
    if (field === 'email') validateEmail(formData.email);
    if (field === 'password') validatePassword(formData.password);
    if (field === 'phone') validatePhone(formData.phone);
    if (field === 'address') validateAddress(formData.address);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const isNameValid = validateName(formData.name);
    const isEmailValid = validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password);
    const isPhoneValid = validatePhone(formData.phone);
    const isAddressValid = validateAddress(formData.address);

    if (!isNameValid || !isEmailValid || !isPasswordValid || !isPhoneValid || !isAddressValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.phone, formData.address, 'student');
      if (redirect) {
        navigate(redirect);
      } else {
        navigate('/student-portal');
      }
    } catch (err) {
      setError(err || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-lg shadow-indigo-600/30">
          S
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account? <Link to={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'} className="font-medium text-indigo-600 hover:text-indigo-500">Sign in</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({...formData, name: e.target.value});
                    if (nameError) validateName(e.target.value);
                  }}
                  onBlur={() => handleBlur('name')}
                  className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 py-3 sm:text-sm border rounded-xl bg-slate-50 outline-none transition-all ${
                    nameError 
                      ? 'border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50/10' 
                      : formData.name && !nameError 
                      ? 'border-emerald-400 focus:ring-emerald-100 focus:border-emerald-500' 
                      : 'border-slate-300'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {nameError && <p className="mt-1.5 text-xs font-semibold text-red-600">{nameError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    if (emailError) validateEmail(e.target.value);
                  }}
                  onBlur={() => handleBlur('email')}
                  className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 py-3 sm:text-sm border rounded-xl bg-slate-50 outline-none transition-all ${
                    emailError 
                      ? 'border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50/10' 
                      : formData.email && !emailError 
                      ? 'border-emerald-400 focus:ring-emerald-100 focus:border-emerald-500' 
                      : 'border-slate-300'
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {emailError && <p className="mt-1.5 text-xs font-semibold text-red-600">{emailError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Phone number</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({...formData, phone: e.target.value});
                    if (phoneError) validatePhone(e.target.value);
                  }}
                  onBlur={() => handleBlur('phone')}
                  className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full px-4 py-3 sm:text-sm border rounded-xl bg-slate-50 outline-none transition-all ${
                    phoneError 
                      ? 'border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50/10' 
                      : formData.phone && !phoneError 
                      ? 'border-emerald-400 focus:ring-emerald-100 focus:border-emerald-500' 
                      : 'border-slate-300'
                  }`}
                  placeholder="+977 98XXXXXXXX"
                />
              </div>
              {phoneError && <p className="mt-1.5 text-xs font-semibold text-red-600">{phoneError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <textarea
                  name="address"
                  required
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({...formData, address: e.target.value});
                    if (addressError) validateAddress(e.target.value);
                  }}
                  onBlur={() => handleBlur('address')}
                  className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full px-4 py-3 sm:text-sm border rounded-xl bg-slate-50 outline-none transition-all ${
                    addressError 
                      ? 'border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50/10' 
                      : formData.address && !addressError 
                      ? 'border-emerald-400 focus:ring-emerald-100 focus:border-emerald-500' 
                      : 'border-slate-300'
                  }`}
                  placeholder="Street address, city, district"
                  rows={3}
                />
              </div>
              {addressError && <p className="mt-1.5 text-xs font-semibold text-red-600">{addressError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({...formData, password: e.target.value});
                    if (passwordError) validatePassword(e.target.value);
                  }}
                  onBlur={() => handleBlur('password')}
                  className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 py-3 sm:text-sm border rounded-xl bg-slate-50 outline-none transition-all ${
                    passwordError 
                      ? 'border-red-400 focus:ring-red-200 focus:border-red-500 bg-red-50/10' 
                      : formData.password && !passwordError 
                      ? 'border-emerald-400 focus:ring-emerald-100 focus:border-emerald-500' 
                      : 'border-slate-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {passwordError && <p className="mt-1.5 text-xs font-semibold text-red-600">{passwordError}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
