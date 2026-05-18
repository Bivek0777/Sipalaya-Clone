import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Monitor, Award, Users, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import axios from 'axios';
import SEO from '../components/SEO';
import DemoBookingModal from '../components/DemoBookingModal';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, testRes] = await Promise.all([
          axios.get('/api/courses'),
          axios.get('/api/testimonials')
        ]);
        setFeaturedCourses(courseRes.data.slice(0, 6));
        setTestimonials(testRes.data);
      } catch (err) {
        console.error('Failed to fetch home data', err);
      }
    };
    fetchData();
  }, []);

  const slides = [
    {
      badge: '🎉 10% Off for January Batch! Enroll Now',
      title: 'Master the Tech Skills',
      highlight: 'of Tomorrow',
      desc: 'Join Sipalaya IT Training to kickstart your career with industry-leading courses in Web Development, Data Science, Cyber Security, and more.'
    },
    {
      badge: '🚀 New Python Course Launched',
      title: 'Dive deep into',
      highlight: 'Data Science',
      desc: 'Learn Python programming, Pandas, NumPy, and Machine Learning. Get ready for the data-driven future.'
    },
    {
      badge: '🎨 Master UI/UX',
      title: 'Design Stunning',
      highlight: 'User Interfaces',
      desc: 'Learn Figma, prototyping, and user-centric design principles to become a top-tier UI/UX Designer.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col">
      <SEO 
        title="Leading IT Training Institute in Nepal" 
        description="Sipalaya Info Tech offers world-class IT training in Kathmandu with expert instructors and 100% placement assistance."
        keywords="IT training Nepal, best IT institute Kathmandu, web development course Nepal, data science Nepal"
        url="/"
      />
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white pt-24 pb-32 overflow-hidden min-h-[600px] flex items-center transition-all duration-1000">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-slate-900/90 z-0"></div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center w-full">
          <div className="transition-opacity duration-500 ease-in-out" key={currentSlide}>
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/20 text-indigo-200 text-sm font-semibold mb-6 border border-indigo-500/30">
              {slides[currentSlide].badge}
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              {slides[currentSlide].title} <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                {slides[currentSlide].highlight}
              </span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-300 mb-10 min-h-[60px]">
              {slides[currentSlide].desc}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/courses" className="px-8 py-3.5 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-1">
              Explore Courses
            </Link>
            <button 
              onClick={() => setShowDemoModal(true)} 
              className="px-8 py-3.5 border border-slate-600 text-lg font-medium rounded-lg text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              Schedule a Demo
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-16 max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-32 py-4 bg-white/10 border border-white/20 rounded-xl leading-5 text-white placeholder-slate-400 focus:outline-none focus:bg-white/20 focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-lg backdrop-blur-md transition-all"
                placeholder="What do you want to learn? (e.g., Python, UI/UX)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Services & Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Why Choose Sipalaya?</h2>
            <p className="mt-4 text-lg text-slate-600">We provide more than just classes. We offer a complete ecosystem for your career growth.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Monitor size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Industry-Ready IT Training</h3>
              <p className="text-slate-600 leading-relaxed">
                Hands-on practical training designed by industry experts to meet current market demands and technologies.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Award size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Certification Preparation</h3>
              <p className="text-slate-600 leading-relaxed">
                Get ready for global certifications from Microsoft, AWS, Cisco, and more with our specialized prep courses.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Corporate Workshops</h3>
              <p className="text-slate-600 leading-relaxed">
                Customized training solutions for companies looking to upskill their workforce in cutting-edge tech.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-extrabold mb-2">5,000+</div>
              <div className="text-indigo-200 font-medium">Students Trained</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">95%</div>
              <div className="text-indigo-200 font-medium">Placement Rate</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">50+</div>
              <div className="text-indigo-200 font-medium">Expert Instructors</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">100+</div>
              <div className="text-indigo-200 font-medium">Hiring Partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Featured Courses</h2>
              <p className="mt-2 text-slate-600">Start learning from our top-rated programs.</p>
            </div>
            <Link to="/courses" className="hidden sm:flex items-center text-indigo-600 font-semibold hover:text-indigo-700">
              View All Courses <ArrowRight size={18} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCourses.length > 0 ? featuredCourses.map((course) => (
              <div key={course._id} className="group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  <img src={course.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-4 left-4 z-20">
                    <span className="px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-md">{course.category || 'Tech'}</span>
                  </div>
                </div>
                <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-500">{course.duration} • {course.level || 'All Levels'}</span>
                    <div className="flex items-center text-amber-500 text-sm font-bold">
                      <Star size={16} className="fill-current mr-1"/> {course.rating || 4.5}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-grow">{course.description || 'Comprehensive training to elevate your IT skills.'}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <span className="font-bold text-lg text-slate-900">Rs. {course.fee}</span>
                    <Link to={`/courses/${course._id}`} className="text-indigo-600 font-medium hover:text-indigo-800">Details</Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-10 text-slate-500">Loading courses...</div>
            )}
          </div>
          <div className="mt-8 sm:hidden flex justify-center">
            <Link to="/courses" className="flex items-center text-indigo-600 font-semibold">
              View All Courses <ArrowRight size={18} className="ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Students Say</h2>
            <p className="text-lg text-slate-300">Over 5,000 students successfully trained and placed in top companies.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.length > 0 ? testimonials.map((item, idx) => (
              <div key={item._id || idx} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 relative">
                <div className="text-amber-400 flex mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={20} className="fill-current"/>)}
                </div>
                <p className="text-slate-300 italic mb-6">"{item.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-600 mr-4 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold">{item.name}</h4>
                    <p className="text-sm text-indigo-400">{item.role}</p>
                  </div>
                </div>
              </div>
            )) : (
              <p className="col-span-3 text-slate-400">Loading testimonials...</p>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-50 py-20 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 bg-indigo-600 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -ml-20 -mb-20"></div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">Ready to start your tech journey?</h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto relative z-10">
            Join thousands of successful graduates who have transformed their careers with our expert-led courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link to="/admission" className="px-8 py-3.5 bg-white text-indigo-600 font-bold rounded-lg hover:bg-slate-100 transition-colors">
              Enroll Now
            </Link>
            <Link to="/contact" className="px-8 py-3.5 bg-transparent border border-indigo-200 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors">
              Talk to an Advisor
            </Link>
          </div>
        </div>
      </section>

      {showDemoModal && (
        <DemoBookingModal onClose={() => setShowDemoModal(false)} />
      )}
    </div>
  );
};

export default Home;
