import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('/api/blogs');
        setPosts(res.data);
      } catch (err) {
        console.error('Error fetching blogs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const categories = ['All', 'Industry Trends', 'Web Development', 'Mobile Tech', 'Digital Marketing', 'Career Guidance', 'Technology'];

  const featuredPost = posts[0];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'All' || 
      (post.category && post.category.trim().toLowerCase() === activeCategory.trim().toLowerCase());
    
    // Exclude featured post from grid if on 'All' view
    const isNotFeatured = activeCategory !== 'All' || post._id !== featuredPost?._id;
    
    return matchesCategory && isNotFeatured;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <SEO 
        title="Insights & Resources - IT Blog" 
        description="Stay updated with the latest IT trends, career guidance, and technical tutorials from Sipalaya Info Tech expert instructors."
        keywords="IT blog, technology trends, career guidance Nepal, learn programming, Sipalaya blog"
        url="/blog"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Insights & Resources</h1>
          <p className="text-lg text-slate-600">
            Discover the latest IT trends, learning tips, and career guidance from our expert instructors and industry professionals.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Fetching latest insights...</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && activeCategory === 'All' && (
              <div className="mb-16">
                <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-shadow grid grid-cols-1 lg:grid-cols-2">
                  <div className="h-64 lg:h-auto relative">
                    <img src={featuredPost.image || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80"} alt="Featured" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">Featured</span>
                      <span className="text-sm text-slate-500">{new Date(featuredPost.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Link to={`/blog/${featuredPost.slug}`}>
                      <h2 className="text-3xl font-bold text-slate-900 mb-4 hover:text-indigo-600 cursor-pointer transition-colors">
                        {featuredPost.title}
                      </h2>
                    </Link>
                    <p className="text-slate-600 mb-6 leading-relaxed line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold mr-3">
                          {featuredPost.author?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{featuredPost.author || 'Sipalaya Expert'}</p>
                          <p className="text-xs text-slate-500">{featuredPost.readTime || '5 min read'}</p>
                        </div>
                      </div>
                      <Link to={`/blog/${featuredPost.slug}`} className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center">
                        Read Article <ArrowRight size={16} className="ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Categories Bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12 border-y border-slate-200 py-6">
              <span className="font-bold text-slate-900 mr-2 flex items-center"><Tag size={18} className="mr-2"/> Topics:</span>
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.length > 0 ? (
                filteredPosts.map(post => (
                  <article key={post._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
                    <div className="h-48 relative overflow-hidden">
                      <img src={post.image || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur text-indigo-700 text-xs font-bold rounded-md shadow-sm">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <Link to={`/blog/${post.slug}`}>
                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="border-t border-slate-100 pt-4 flex items-center justify-between mt-auto text-sm text-slate-500">
                        <div className="flex items-center">
                          <User size={14} className="mr-1" /> {post.author}
                        </div>
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" /> {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200">
                   <p className="text-slate-500 text-lg">No articles found in this category.</p>
                   <button onClick={() => setActiveCategory('All')} className="mt-4 text-indigo-600 font-bold hover:underline">View all articles</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Newsletter */}
        <div className="mt-20 bg-indigo-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] opacity-10 bg-cover mix-blend-overlay"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Subscribe to our Newsletter</h2>
            <p className="text-indigo-200 mb-8">Get the latest tech news, tutorials, and exclusive course discounts delivered straight to your inbox.</p>
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email address" className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-900" required />
              <button type="submit" className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30">
                Subscribe
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Blog;
