import { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, ArrowRight, Building, Award, CheckCircle, TrendingUp, Users, Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const placementStats = [
  { label: 'Placement Rate', value: '92%', icon: TrendingUp, color: 'bg-indigo-600', description: 'Of graduates placed within 3 months' },
  { label: 'Hiring Partners', value: '50+', icon: Building, color: 'bg-emerald-600', description: 'Companies actively hiring our grads' },
  { label: 'Alumni Placed', value: '1,200+', icon: Users, color: 'bg-amber-500', description: 'Successful career transitions' },
  { label: 'Avg. Salary', value: 'Rs. 45K', icon: Star, color: 'bg-purple-600', description: 'Monthly starting package' },
];

const trackStats = [
  { name: 'Full Stack Web Development', rate: 94, salary: 'Rs. 50–80K/mo' },
  { name: 'Python & Data Science', rate: 89, salary: 'Rs. 45–75K/mo' },
  { name: 'Flutter Mobile Dev', rate: 85, salary: 'Rs. 40–70K/mo' },
  { name: 'UI/UX Design', rate: 91, salary: 'Rs. 35–65K/mo' },
  { name: 'Cyber Security', rate: 87, salary: 'Rs. 55–90K/mo' },
];

const partners = [
  'Cotiviti Nepal', 'Deerwalk Services', 'Leapfrog Technology', 'F1Soft International',
  'Yomari Inc', 'Cloud Factory', 'LogPoint', 'Deerhold Limited',
  'Verisk Analytics', 'Smart Tech Solutions'
];

const JobPlacement = () => {
  const [jobs, setJobs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, testRes] = await Promise.all([
          axios.get('/api/jobs'),
          axios.get('/api/testimonials')
        ]);
        setJobs(jobsRes.data);
        setTestimonials(testRes.data);
      } catch (err) {
        console.error('Error fetching placement data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="Job Placement Assistance"
        description="Launch your career with Sipalaya Info Tech placement assistance. We connect our students with top IT companies in Nepal."
        url="/placement"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-indigo-500/30 text-indigo-200 text-sm font-semibold rounded-full mb-6 border border-indigo-500/30">Career Placement Program</span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">Launch Your Career <br/>with Confidence</h1>
            <p className="text-xl text-indigo-200 mb-8 leading-relaxed">
              We don't just teach you — we get you hired. Benefit from our dedicated placement cell and an extensive network of 50+ hiring partners across Nepal.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => document.getElementById('jobs').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3.5 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
              >
                View Latest Jobs
              </button>
              <Link to="/admission" className="px-8 py-3.5 bg-indigo-500/30 border border-indigo-400/50 text-white font-bold rounded-xl hover:bg-indigo-500/50 transition-colors">
                Enroll Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Placement Statistics */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Our Placement Track Record</h2>
            <p className="text-lg text-slate-600">Numbers that speak for themselves</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {placementStats.map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon size={26} className="text-white" />
                </div>
                <p className="text-3xl font-extrabold text-slate-900 mb-1">{stat.value}</p>
                <p className="font-bold text-slate-700 mb-1">{stat.label}</p>
                <p className="text-xs text-slate-500">{stat.description}</p>
              </div>
            ))}
          </div>

          {/* Track-wise Placement Rates */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Placement Rate by Course Track</h3>
            <div className="space-y-5">
              {trackStats.map((track, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-semibold text-slate-800 text-sm">{track.name}</span>
                      <span className="ml-3 text-xs text-slate-500">{track.salary}</span>
                    </div>
                    <span className="font-bold text-indigo-600 text-sm">{track.rate}% placed</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-700"
                      style={{ width: `${track.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Placement Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Placement Assistance</h2>
            <p className="text-lg text-slate-600">A comprehensive approach to make you job-ready from day one.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Briefcase, color: 'bg-blue-100 text-blue-600', title: 'Resume Building', desc: 'Expert guidance on crafting a standout resume and portfolio that highlights your practical skills and projects.' },
              { icon: CheckCircle, color: 'bg-green-100 text-green-600', title: 'Mock Interviews', desc: 'Practice technical and HR interviews with industry experts to build confidence before the real thing.' },
              { icon: Building, color: 'bg-amber-100 text-amber-600', title: 'Direct Referrals', desc: 'Get your profile directly forwarded to top IT companies in our partner network for priority shortlisting.' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-6`}>
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring Partners */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Our Hiring Partners</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {partners.map((partner, i) => (
              <div key={i} className="bg-white rounded-xl px-4 py-4 border border-slate-200 text-center hover:border-indigo-200 hover:shadow-sm transition-all">
                <MapPin size={16} className="text-indigo-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 leading-tight">{partner}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section id="jobs" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Recent Job Openings</h2>
              <p className="mt-2 text-slate-600">Exclusive opportunities for Sipalaya IT students.</p>
            </div>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500">Loading career opportunities...</p>
              </div>
            ) : jobs.length > 0 ? jobs.map((job, idx) => (
              <div key={job._id || idx} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{job.title}</h3>
                  <div className="flex flex-wrap items-center text-sm text-slate-500 mb-3 gap-3">
                    <span className="flex items-center"><Building size={14} className="mr-1" />{job.company}</span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">Full-time</span>
                    <span>📍 Remote / Kathmandu</span>
                  </div>
                  {job.description && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{job.description}</p>}
                </div>
                <div className="flex flex-col md:items-end justify-between min-w-[150px]">
                  {job.deadline && <span className="text-sm text-red-500 font-medium mb-3">Deadline: {new Date(job.deadline).toLocaleDateString()}</span>}
                  <a href={`mailto:infotech@sipalaya.com?subject=Application for ${job.title}`}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors w-full md:w-auto inline-flex items-center justify-center gap-2">
                    Apply Now <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500">No active job openings at the moment. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Alumni Success Stories */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-12">Alumni Success Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {testimonials.map((item, idx) => (
                <div key={item._id || idx} className="bg-slate-800 rounded-2xl p-8 border border-slate-700 relative mt-8">
                  <div className="absolute top-0 left-8 -mt-8 w-16 h-16 rounded-full border-4 border-slate-900 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="pt-6">
                    <Award className="text-amber-400 mb-4 opacity-50" size={32} />
                    <p className="text-slate-300 italic mb-6 leading-relaxed">"{item.quote}"</p>
                    <div>
                      <h4 className="font-bold text-white text-lg">{item.name}</h4>
                      <p className="text-indigo-400 text-sm">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default JobPlacement;
