import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-50 pt-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-white">Sipalaya IT</h3>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Empowering the next generation of tech professionals with comprehensive IT training, certification preparation, and corporate workshops.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-indigo-600 transition-colors transform hover:-translate-y-1"><span className="text-xs font-bold text-white">FB</span></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-indigo-600 transition-colors transform hover:-translate-y-1"><span className="text-xs font-bold text-white">TW</span></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-indigo-600 transition-colors transform hover:-translate-y-1"><span className="text-xs font-bold text-white">LI</span></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-indigo-600 transition-colors transform hover:-translate-y-1"><span className="text-xs font-bold text-white">IG</span></a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-slate-400 hover:text-indigo-400 transition-colors">About Us</Link></li>
              <li><Link to="/courses" className="text-slate-400 hover:text-indigo-400 transition-colors">Our Courses</Link></li>
              <li><Link to="/admission" className="text-slate-400 hover:text-indigo-400 transition-colors">Admission Process</Link></li>
              <li><Link to="/placement" className="text-slate-400 hover:text-indigo-400 transition-colors">Job Placement</Link></li>
              <li><Link to="/blog" className="text-slate-400 hover:text-indigo-400 transition-colors">Latest Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Top Courses</h4>
            <ul className="space-y-3">
              <li><Link to="/courses" className="text-slate-400 hover:text-indigo-400 transition-colors">Full Stack Web Development</Link></li>
              <li><Link to="/courses" className="text-slate-400 hover:text-indigo-400 transition-colors">Python Data Science</Link></li>
              <li><Link to="/courses" className="text-slate-400 hover:text-indigo-400 transition-colors">Graphic Design Mastery</Link></li>
              <li><Link to="/courses" className="text-slate-400 hover:text-indigo-400 transition-colors">Cloud Computing (AWS)</Link></li>
              <li><Link to="/courses" className="text-slate-400 hover:text-indigo-400 transition-colors">Cyber Security</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={20} className="text-indigo-400 mr-3 mt-1 flex-shrink-0" />
                <span className="text-slate-400">Narephat 32- Koteshwor, Kathmandu</span>
              </li>
              <li className="flex items-start">
                <Phone size={20} className="text-indigo-400 mr-3 mt-1 flex-shrink-0" />
                <span className="text-slate-400">9851344071 | 9806393939</span>
              </li>
              <li className="flex items-start">
                <Mail size={20} className="text-indigo-400 mr-3 mt-1 flex-shrink-0" />
                <span className="text-slate-400">infotech@sipalaya.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Sipalaya Info Tech Pvt. Ltd. (Pan No: 610189542). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
