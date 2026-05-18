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

  // Save changes to localStorage as user types
  useEffect(() => {
    localStorage.setItem('contact_form_data', JSON.stringify(formData));
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/contact', formData);
      alert('Message sent successfully! Our team will get back to you soon.');
      setFormData({ name: '', email: '', purpose: '', message: '' });
      localStorage.removeItem('contact_form_data');
    } catch (error) {
      console.error('Error sending message', error);
      alert('Failed to send message. Please try again.');
    }
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
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                  placeholder="John Doe" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input 
                  type="email" required
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                  placeholder="john@example.com" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Purpose of Inquiry</label>
                <select 
                  required
                  value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                >
                  <option value="" disabled>Select a purpose...</option>
                  <option value="course">Course Inquiry</option>
                  <option value="admission">Admission & Enrollment</option>
                  <option value="corporate">Corporate Training</option>
                  <option value="support">Technical Support</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Your Message</label>
                <textarea 
                  required rows="4"
                  value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none" 
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex justify-center items-center">
                <Send size={18} className="mr-2" /> Send Message
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
