import { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import SEO from '../components/SEO';

const Contact = () => {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('contact_form_data');
    const defaultData = {
      name: '',
      email: '',
      purpose: '',
      message: ''
    };
    if (saved) {
      try {
        return { ...defaultData, ...JSON.parse(saved) };
      } catch (e) {
        return defaultData;
      }
    }
    return defaultData;
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save changes to localStorage as user types
  useEffect(() => {
    localStorage.setItem('contact_form_data', JSON.stringify(formData));
  }, [formData]);

  const validateField = (name, value) => {
    let errorMsg = '';
    
    if (name === 'name') {
      if (!value.trim()) errorMsg = 'Your name is required';
      else if (value.trim().length < 3) errorMsg = 'Name must be at least 3 characters long';
    }
    
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) errorMsg = 'Email address is required';
      else if (!emailRegex.test(value)) errorMsg = 'Please enter a valid email address';
    }
    
    if (name === 'purpose' && !value) {
      errorMsg = 'Please select a purpose for your inquiry';
    }
    
    if (name === 'message') {
      if (!value.trim()) errorMsg = 'Your message is required';
      else if (value.trim().length < 10) errorMsg = 'Message must be at least 10 characters long';
    }

    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    return !errorMsg;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    let isValid = true;
    Object.keys(formData).forEach(key => {
      const fieldValid = validateField(key, formData[key]);
      if (!fieldValid) isValid = false;
    });

    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await axios.post('/api/contact', formData);
      alert('Message sent successfully! Our team will get back to you soon.');
      setFormData({ name: '', email: '', purpose: '', message: '' });
      setErrors({});
      localStorage.removeItem('contact_form_data');
    } catch (error) {
      console.error('Error sending message', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (name) => {
    const baseClass = "w-full px-4 py-3 rounded-lg border outline-none transition-all focus:ring-2 focus:ring-indigo-500/20";
    if (errors[name]) {
      return `${baseClass} border-red-400 focus:border-red-500 bg-red-50/10 focus:ring-red-200`;
    }
    if (formData[name] && !errors[name]) {
      return `${baseClass} border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100`;
    }
    return `${baseClass} border-slate-300 focus:border-indigo-500`;
  };

  return (
    <div className="bg-white min-h-screen">
      <SEO 
        title="Contact Us" 
        description="Have questions? Reach out to Sipalaya Info Tech for course inquiries, demo bookings, or any other assistance."
        url="/contact"
      />
      
      {/* Header */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold mb-4">Get in Touch</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Have questions about our courses, admission process, or anything else? We're here to help you.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Contact Information</h2>
            
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Our Location</h3>
                  <p className="text-slate-600">Narephat 32- Koteshwor, Kathmandu<br/>Bagmati Province, Nepal</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Phone Numbers</h3>
                  <p className="text-slate-600">+977 9851344071<br/>+977 9806393939</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Email Addresses</h3>
                  <p className="text-slate-600">infotech@sipalaya.com<br/>support@sipalaya.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Working Hours</h3>
                  <p className="text-slate-600">Sunday - Friday: 7:00 AM - 6:00 PM<br/>Saturday: Closed</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-12">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-12 h-12 bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white rounded-full flex items-center justify-center transition-colors">
                  <span className="text-sm font-bold">FB</span>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-12 h-12 bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white rounded-full flex items-center justify-center transition-colors">
                  <span className="text-sm font-bold">TW</span>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-12 h-12 bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white rounded-full flex items-center justify-center transition-colors">
                  <span className="text-sm font-bold">LI</span>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-12 h-12 bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white rounded-full flex items-center justify-center transition-colors">
                  <span className="text-sm font-bold">IG</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('name')}
                  placeholder="John Doe" 
                />
                {errors.name && <p className="mt-1 text-xs font-semibold text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('email')}
                  placeholder="john@example.com" 
                />
                {errors.email && <p className="mt-1 text-xs font-semibold text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Purpose of Inquiry</label>
                <select 
                  name="purpose"
                  value={formData.purpose} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('purpose')}
                >
                  <option value="" disabled>Select a purpose...</option>
                  <option value="course">Course Inquiry</option>
                  <option value="admission">Admission & Enrollment</option>
                  <option value="corporate">Corporate Training</option>
                  <option value="support">Technical Support</option>
                  <option value="other">Other</option>
                </select>
                {errors.purpose && <p className="mt-1 text-xs font-semibold text-red-600">{errors.purpose}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Your Message</label>
                <textarea 
                  name="message"
                  rows="4"
                  value={formData.message} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('message')}
                  placeholder="How can we help you?"
                ></textarea>
                {errors.message && <p className="mt-1 text-xs font-semibold text-red-600">{errors.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-750 transition-all shadow-lg shadow-indigo-200 flex justify-center items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} className="mr-2" /> {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Google Map Embedded */}
      <div className="w-full h-96 bg-slate-200 relative">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3533.023249079361!2d85.34000301506141!3d27.68565148280145!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1990c0a8862f%3A0xc31481dce6532d02!2sKoteshwor%2C%20Kathmandu%2044600%2C%20Nepal!5e0!3m2!1sen!2sus!4v1698246845345!5m2!1sen!2sus" 
          className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Map Location"
        ></iframe>
      </div>

    </div>
  );
};

export default Contact;
