import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Clock, Star, Calendar } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import SEO from '../components/SEO';
import DemoBookingModal from '../components/DemoBookingModal';

const categories = ['All', 'Web Development', 'Data Science', 'Design', 'Mobile Dev', 'Backend', 'Marketing', 'Testing', 'Security'];

const Courses = () => {
  const [searchParams] = useSearchParams();
  const [coursesData, setCoursesData] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('popularity');
  const [priceFilter, setPriceFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses');
        if (response.data.length === 0) {
          const seedRes = await axios.post('/api/courses/seed');
          setCoursesData(seedRes.data);
        } else {
          setCoursesData(response.data);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = coursesData.filter(course => {
    const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || course.level.toLowerCase() === levelFilter.toLowerCase();
    
    let matchesPrice = true;
    if (priceFilter === 'under20k') matchesPrice = course.fee < 20000;
    if (priceFilter === 'over20k') matchesPrice = course.fee >= 20000;

    return matchesCategory && matchesSearch && matchesLevel && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.fee - b.fee;
    if (sortBy === 'price-high') return b.fee - a.fee;
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    return b.rating - a.rating; // Default popularity
  });

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <SEO 
        title="Professional IT Courses" 
        description="Explore our wide range of professional IT courses including Full Stack Web Development, Python for Data Science, and more."
        keywords="programming courses, web development training, data science classes, IT certifications Nepal"
        url="/courses"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Explore Our Courses</h1>
          <p className="text-lg text-slate-600">
            Find the perfect program to advance your career. Expert instructors, hands-on projects, and real-world skills.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            
            {/* Search */}
            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search courses..."
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Advanced Filters Row */}
            <div className="flex flex-wrap gap-4">
              <select 
                value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <select 
                value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500"
              >
                <option value="all">All Prices</option>
                <option value="under20k">Under Rs. 20,000</option>
                <option value="over20k">Over Rs. 20,000</option>
              </select>

              <select 
                value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 bg-slate-50"
              >
                <option value="popularity">Sort by Popularity</option>
                <option value="newest">Sort by Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-6 flex overflow-x-auto pb-2 -mx-2 px-2 hide-scrollbar gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              <div className="h-48 relative overflow-hidden group">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-800">
                  {course.category}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-3 text-sm text-slate-500">
                  <span className="flex items-center"><Clock size={14} className="mr-1"/> {course.duration}</span>
                  <span className="flex items-center"><BookOpen size={14} className="mr-1"/> {course.level}</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h3>
                <p className="text-slate-600 text-sm mb-4 flex-1">{course.description}</p>
                
                <div className="flex items-center mb-4">
                  <div className="flex text-amber-400 mr-2">
                    <Star size={16} className="fill-current"/>
                    <Star size={16} className="fill-current"/>
                    <Star size={16} className="fill-current"/>
                    <Star size={16} className="fill-current"/>
                    <Star size={16} className="fill-current"/>
                  </div>
                  <span className="text-sm font-medium text-slate-700">{course.rating}</span>
                </div>

                <div className="border-t border-slate-100 pt-4 flex items-center justify-between mt-auto">
                  <div>
                    <span className="block text-xs text-slate-500">Course Fee</span>
                    <span className="font-bold text-lg text-indigo-600">Rs. {course.fee}</span>
                  </div>
                  <Link to={`/courses/${course._id}`} className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-sm font-medium transition-colors">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Class CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-xl">
          <div className="mb-6 md:mb-0 md:mr-8 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Not sure which course to choose?</h2>
            <p className="text-blue-100">Schedule a free demo class with our expert instructors and find your perfect fit.</p>
          </div>
          <button 
            onClick={() => setShowDemoModal(true)} 
            className="flex-shrink-0 px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-slate-100 shadow-lg transition-colors flex items-center cursor-pointer text-base"
          >
            <Calendar className="mr-2" size={20} />
            Book Free Demo
          </button>
        </div>

      </div>

      {showDemoModal && (
        <DemoBookingModal onClose={() => setShowDemoModal(false)} />
      )}
    </div>
  );
};

export default Courses;
