import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, BookOpen, Star, Calendar, CheckCircle2, ChevronRight, User, MessageSquare } from 'lucide-react';
import DemoBookingModal from '../components/DemoBookingModal';
import { AuthContext } from '../context/AuthContext';
import SEO from '../components/SEO';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [reviews, setReviews] = useState([]);
  const [reviewStatus, setReviewStatus] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${id}`);
        setCourse(response.data);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await axios.get(`/api/reviews/course/${id}`);
        setReviews(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchCourse();
    fetchReviews();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!course) return <div className="flex justify-center items-center h-screen">Course not found</div>;

  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO 
        title={course.title} 
        description={course.description}
        keywords={`${course.title}, ${course.category}, learn ${course.title} Nepal`}
        image={course.image}
        url={`/courses/${course._id}`}
      />
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="px-3 py-1 bg-indigo-600/30 text-indigo-300 font-bold rounded-full text-sm mb-4 inline-block border border-indigo-500/30">
              {course.category}
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">{course.title}</h1>
            <p className="text-lg text-slate-300 mb-8">{course.description}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-300 mb-8">
              <div className="flex items-center text-amber-400">
                <Star size={18} className="fill-current mr-1" /> {course.rating} Rating
              </div>
              <div className="flex items-center"><Clock size={18} className="mr-2" /> {course.duration}</div>
              <div className="flex items-center"><BookOpen size={18} className="mr-2" /> {course.level}</div>
              <div className="flex items-center"><User size={18} className="mr-2" /> By {course.instructor}</div>
            </div>

            <div className="flex flex-wrap gap-4">
              {(!user || user.role === 'student') ? (
                <>
                  <Link to={`/admission?courseId=${course._id}&amount=${course.fee}${user && user.role === 'student' ? '&skipRegister=true' : ''}`} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-lg">
                    Enroll & Pay - Rs. {course.fee}
                  </Link>
                </>
              ) : (
                <div className="px-8 py-3 bg-slate-800 text-slate-400 font-bold rounded-lg border border-slate-700 cursor-not-allowed">
                  {user.role === 'admin' ? 'Admins cannot enroll' : 'Instructors cannot enroll'}
                </div>
              )}
              <button onClick={() => setShowDemoModal(true)} className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-lg transition-colors backdrop-blur">
                Book Free Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            {/* About Course */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">About This Course</h2>
              <p className="text-slate-600 leading-relaxed">
                {course.description} Expand your skill set and prepare for a rewarding career. This course is designed to take you from fundamentals to advanced concepts with hands-on projects and real-world applications.
              </p>
            </section>

            {/* Prerequisites */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Prerequisites</h2>
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <p className="text-slate-600 flex items-start">
                  <CheckCircle2 size={20} className="text-indigo-600 mr-3 flex-shrink-0 mt-0.5" />
                  {course.prerequisites || 'No prior experience required. Just a passion to learn!'}
                </p>
              </div>
            </section>

            {/* Syllabus */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Syllabus</h2>
              <div className="space-y-4">
                {Array.isArray(course.syllabus) && course.syllabus.length > 0 ? (
                  course.syllabus.map((item, index) => (
                    <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center font-bold mr-4 flex-shrink-0">
                        {index + 1}
                      </div>
                      <h4 className="font-bold text-slate-800">{item}</h4>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600">Syllabus will be updated soon.</p>
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Instructor */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Your Instructor</h3>
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-400 mr-4 shrink-0 shadow-inner">
                  <User size={24} className="stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{course.instructor}</h4>
                  <p className="text-sm text-indigo-600 font-medium">Expert Instructor</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                An industry veteran from Sipalaya's expert team with extensive experience building scalable solutions and teaching.
              </p>
            </div>

            {/* Deadlines */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Important Dates</h3>
              <div className="flex items-center text-slate-600 mb-3">
                <Calendar size={20} className="text-indigo-600 mr-3" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">Enrollment Deadline</p>
                  <p className="font-medium text-slate-900">
                    {course.enrollmentDeadline ? new Date(course.enrollmentDeadline).toLocaleDateString() : 'Rolling Admission'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Reviews Section */}
        <div className="mt-16 border-t border-slate-200 pt-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Student Reviews</h2>
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Write a Review</h3>
            {user ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setReviewStatus('');

                if (!reviewText.trim()) {
                  setReviewStatus('Please write your review before submitting.');
                  return;
                }

                try {
                  const response = await axios.post('/api/reviews', {
                    courseId: course._id,
                    studentName: user.name || 'Anonymous Student',
                    rating,
                    reviewText: reviewText.trim(),
                  });

                  const newReview = response.data?.data;
                  if (newReview) {
                    setReviews(prev => [newReview, ...prev]);
                  }

                  setReviewStatus('Review submitted successfully!');
                  setReviewText('');
                  setRating(5);
                } catch (error) {
                  console.error('Review submit error:', error);
                  setReviewStatus('Failed to submit review. Please try again.');
                }
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button" onClick={() => setRating(star)} className={`${rating >= star ? 'text-amber-400' : 'text-slate-300'}`}>
                        <Star size={24} className="fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Your Review</label>
                  <textarea rows="4" value={reviewText} onChange={e => setReviewText(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none" placeholder="Share your experience..."></textarea>
                </div>
                {reviewStatus && <p className="mb-4 text-sm text-slate-700">{reviewStatus}</p>}
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center">
                  <MessageSquare size={18} className="mr-2" /> Submit Review
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-6">
                <p className="text-slate-700 mb-3">Please log in to submit a review.</p>
                <button onClick={() => navigate('/login')} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold">Log In</button>
              </div>
            )}
          </div>
          <div className="mt-8 max-w-3xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Reviews</h3>
            {reviews.length > 0 ? reviews.map(review => (
              <div key={review._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
                  <p className="font-semibold text-slate-900">{review.studentName}</p>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: review.rating }).map((_, idx) => (
                      <Star key={idx} size={16} className="fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-700">{review.reviewText}</p>
              </div>
            )) : (
              <p className="text-slate-600">No approved reviews yet. Be the first to share your experience!</p>
            )}
          </div>
        </div>
      </div>
      
      {showDemoModal && (
        <DemoBookingModal courseName={course.title} onClose={() => setShowDemoModal(false)} />
      )}
    </div>
  );
};

export default CourseDetail;
