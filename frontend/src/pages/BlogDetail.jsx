import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, ArrowLeft, Clock, Tag, Share2 } from 'lucide-react';
import SEO from '../components/SEO';

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/blogs/${slug}`);
        setPost(res.data);
      } catch (err) {
        console.error('Error fetching blog post', err);
        setError('Article not found or something went wrong.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{error || 'Post not found'}</h2>
        <Link to="/blog" className="flex items-center text-indigo-600 font-bold hover:underline">
          <ArrowLeft size={18} className="mr-2" /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <SEO 
        title={post.title} 
        description={post.excerpt} 
        image={post.image}
        url={`/blog/${post.slug}`}
      />

      {/* Hero Section */}
      <div className="bg-slate-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={post.image} alt="" className="w-full h-full object-cover blur-sm" />
        </div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <Link to="/blog" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 mb-8 transition-colors">
            <ArrowLeft size={18} className="mr-2" /> Back to Resources
          </Link>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/30 uppercase tracking-wider">
              {post.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-300 text-sm">
            <div className="flex items-center">
              <User size={16} className="mr-2 text-indigo-400" /> {post.author}
            </div>
            <div className="flex items-center">
              <Calendar size={16} className="mr-2 text-indigo-400" /> {new Date(post.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-2 text-indigo-400" /> {post.readTime || '5 min read'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-6 md:p-12">
          {/* Main Image */}
          <div className="rounded-2xl overflow-hidden mb-12 shadow-lg">
             <img src={post.image || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80"} alt={post.title} className="w-full object-cover" />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg prose-indigo max-w-none text-slate-700 leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Footer Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <span className="text-slate-500 font-bold flex items-center mr-2"><Tag size={18} className="mr-2"/> Tags:</span>
              {post.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Share Section */}
          <div className="mt-12 p-8 bg-slate-50 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Enjoyed this article?</h4>
              <p className="text-slate-600 text-sm">Share it with your network to help others learn too.</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-800 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
              <Share2 size={18} /> Share Article
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-between">
          <Link to="/blog" className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all">
             Newer Post
          </Link>
          <Link to="/blog" className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all">
             Older Post
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
