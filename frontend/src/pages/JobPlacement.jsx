import { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, ArrowRight, Building, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

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
      {/* Hero Section */}
      <section className="bg-indigo-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Launch Your Career with Confidence</h1>
            <p className="text-xl text-indigo-200 mb-8 leading-relaxed">
              We don't just teach you; we help you get hired. Benefit from our dedicated placement cell and extensive network of hiring partners.
            </p>
            <button onClick={() => document.getElementById('jobs').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-3.5 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors">
              View Latest Jobs
            </button>
          </div>
        </div>
      </section>

      {/* Placement Assistance Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Placement Assistance</h2>
            <p className="text-lg text-slate-600">A comprehensive approach to make you job-ready from day one.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Briefcase size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Resume Building</h3>
              <p className="text-slate-600">Expert guidance on crafting a standout resume and portfolio that highlights your practical skills and projects.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Mock Interviews</h3>
              <p className="text-slate-600">Practice technical and HR interviews with industry experts to build confidence before the real thing.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <Building size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Direct Referrals</h3>
              <p className="text-slate-600">Get your profile directly forwarded to top IT companies in our partner network for priority shortlisting.</p>
            </div>
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
            <button onClick={() => document.getElementById('jobs').scrollIntoView({ behavior: 'smooth' })} className="hidden sm:flex text-indigo-600 font-semibold hover:text-indigo-800 items-center">
              Scroll Down <ArrowRight size={16} className="ml-1" />
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500">Loading career opportunities...</p>
              </div>
            ) : jobs.length > 0 ? (
              jobs.map((job, idx) => (
                <div key={job._id || idx} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{job.title}</h3>
                    <div className="flex flex-wrap items-center text-sm text-slate-500 mb-3 gap-3">
                      <span className="flex items-center"><Building size={14} className="mr-1"/> {job.company}</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">Full-time</span>
                      <span>📍 Remote / Kathmandu</span>
                    </div>
                    {job.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{job.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col md:items-end justify-between min-w-[150px]">
                    {job.deadline && (
                      <span className="text-sm text-red-500 font-medium mb-3">Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    )}
                    <a href={`mailto:infotech@sipalaya.com?subject=Application for ${job.title}`} className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors w-full md:w-auto inline-flex items-center justify-center text-center">
                      Apply Now
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500">No active job openings at the moment. Please check back later!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Alumni Success Stories */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-12">Alumni Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {testimonials.length > 0 ? testimonials.map((item, idx) => (
              <div key={item._id || idx} className="bg-slate-800 rounded-2xl p-8 border border-slate-700 relative mt-8">
                <div className="absolute top-0 left-8 -mt-8 w-16 h-16 rounded-full border-4 border-slate-900 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="pt-6">
                  <Award className="text-amber-400 mb-4 opacity-50" size={32} />
                  <p className="text-slate-300 italic mb-6 leading-relaxed">
                    "{item.quote}"
                  </p>
                  <div>
                    <h4 className="font-bold text-white text-lg">{item.name}</h4>
                    <p className="text-indigo-400 text-sm">{item.role}</p>
                  </div>
                </div>
              </div>
            )) : (
              <p className="col-span-3 text-slate-400">Loading stories...</p>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default JobPlacement;
