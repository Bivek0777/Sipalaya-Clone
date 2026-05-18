import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, Mail } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await register(formData.name, formData.email, formData.password, formData.role);
      if (user.role === 'instructor') navigate('/instructor-portal');
      else navigate('/student-portal');
    } catch (err) {
      setError(err);
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
          Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Sign in</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text" required
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 py-3 sm:text-sm border-slate-300 rounded-xl bg-slate-50 border outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email" required
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 py-3 sm:text-sm border-slate-300 rounded-xl bg-slate-50 border outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password" required
                  value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 py-3 sm:text-sm border-slate-300 rounded-xl bg-slate-50 border outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`cursor-pointer border rounded-xl p-3 text-center text-sm font-medium transition-colors ${formData.role === 'student' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <input type="radio" className="sr-only" checked={formData.role === 'student'} onChange={() => setFormData({...formData, role: 'student'})} />
                  Student
                </label>
                <label className={`cursor-pointer border rounded-xl p-3 text-center text-sm font-medium transition-colors ${formData.role === 'instructor' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <input type="radio" className="sr-only" checked={formData.role === 'instructor'} onChange={() => setFormData({...formData, role: 'instructor'})} />
                  Instructor
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
