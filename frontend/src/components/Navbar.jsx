import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, User } from 'lucide-react';
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path) => {
    return location.pathname === path ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600';
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur z-50 border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="text-2xl font-extrabold tracking-tight text-slate-900">
            Sipalaya<span className="text-indigo-600">IT</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/" className={`font-medium ${isActive('/')}`}>Home</Link>
            <Link to="/courses" className={`font-medium ${isActive('/courses')}`}>Courses</Link>
            <Link to="/about" className={`font-medium ${isActive('/about')}`}>About Us</Link>
            <Link to="/admission" className={`font-medium ${isActive('/admission')}`}>Admission</Link>
            
            <Link to="/placement" className={`font-medium ${isActive('/placement')}`}>Placement</Link>
            <Link to="/blog" className={`font-medium ${isActive('/blog')}`}>Blog</Link>
            <Link to="/contact" className={`font-medium ${isActive('/contact')}`}>Contact</Link>
            
            {user ? (
              <div className="flex items-center space-x-6 border-l border-slate-200 pl-6">
                {user.role === 'student' && (
                  <Link to="/student-portal" className="flex items-center text-indigo-600 font-bold hover:text-indigo-800">
                    <User size={18} className="mr-1.5" /> Profile
                  </Link>
                )}
                {user.role === 'instructor' && (
                  <Link to="/instructor-portal" className="flex items-center text-indigo-600 font-bold hover:text-indigo-800">
                    <BookOpen size={18} className="mr-1.5" /> Instructor Portal
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center text-indigo-600 font-bold hover:text-indigo-800">
                    <User size={18} className="mr-1.5" /> Admin Dashboard
                  </Link>
                )}
                <button onClick={logout} className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-800">Log in</Link>
                <Link to="/register" className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button onClick={toggleMenu} className="text-slate-600 hover:text-slate-900 focus:outline-none">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 z-40 bg-white transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out pt-24 px-6 overflow-y-auto`}>
        <div className="flex flex-col space-y-6">
          <Link to="/" onClick={toggleMenu} className="text-xl font-semibold text-slate-800">Home</Link>
          <Link to="/courses" onClick={toggleMenu} className="text-xl font-semibold text-slate-800">Courses</Link>
          <Link to="/about" onClick={toggleMenu} className="text-xl font-semibold text-slate-800">About Us</Link>
          <Link to="/admission" onClick={toggleMenu} className="text-xl font-semibold text-slate-800">Admission</Link>
          <Link to="/placement" onClick={toggleMenu} className="text-xl font-semibold text-slate-800">Placement</Link>
          <Link to="/blog" onClick={toggleMenu} className="text-xl font-semibold text-slate-800">Blog</Link>
          <Link to="/contact" onClick={toggleMenu} className="text-xl font-semibold text-slate-800">Contact</Link>
          
          {user ? (
            <div className="flex flex-col space-y-4 mt-4 pt-4 border-t border-slate-100">
              {user.role === 'student' && (
                <Link to="/student-portal" onClick={toggleMenu} className="flex items-center text-xl font-bold text-indigo-600">
                  <User size={20} className="mr-2" /> Profile
                </Link>
              )}
              {user.role === 'instructor' && (
                <Link to="/instructor-portal" onClick={toggleMenu} className="flex items-center text-xl font-bold text-indigo-600">
                  <BookOpen size={20} className="mr-2" /> Instructor Portal
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" onClick={toggleMenu} className="flex items-center text-xl font-bold text-indigo-600">
                  <User size={20} className="mr-2" /> Admin Dashboard
                </Link>
              )}
              <button onClick={() => { logout(); toggleMenu(); }} className="text-xl font-semibold text-red-600 text-left pt-2">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 mt-4 pt-4 border-t border-slate-100">
              <Link to="/login" onClick={toggleMenu} className="text-xl font-semibold text-indigo-600">Log in</Link>
              <Link to="/register" onClick={toggleMenu} className="text-xl font-semibold text-indigo-600">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
