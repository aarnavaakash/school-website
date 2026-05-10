import { useState } from 'react';
import axios from '../api/axios';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await axios.post('/contacts', formData);
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Contact Us</h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-8 text-blue-900">Get In Touch</h2>
            <div className="space-y-6 mb-10">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full mr-4 text-blue-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Address</h4>
                  <p className="text-slate-600">HNP Institute of Education<br /><a href="https://maps.app.goo.gl/5QawDQhWfw3vMog68?g_st=awb" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View on Google Maps</a></p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4 text-blue-600">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Phone</h4>
                  <p className="text-slate-600">+91 9234326276<br/>+91 9122266272</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4 text-blue-600">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Email</h4>
                  <p className="text-slate-600">hnpinstituteofeduction2021@gmail.com</p>
                </div>
              </div>
            </div>

            <div className="w-full h-64 bg-slate-200 rounded-xl overflow-hidden shadow-inner">
               <iframe 
                 title="Map"
                 src="https://maps.google.com/maps?q=H.N.P+INSTITUTE+OF+EDUCATION,+bazar,+near+annapurna+bakery,+Chhatauni,+Motihari,+Bihar+845401&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                 width="100%" 
                 height="100%" 
                 style={{ border: 0 }} 
                 allowFullScreen="" 
                 loading="lazy"
               ></iframe>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-50 p-8 rounded-2xl shadow-lg border border-slate-100">
            <h3 className="text-2xl font-bold mb-6 text-slate-800">Send us a Message</h3>
            {status === 'success' && (
              <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">Message sent successfully!</div>
            )}
            {status === 'error' && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">Error sending message. Please try again.</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input required type="text" className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input required type="email" className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input required type="text" className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea required rows="4" className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                  value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
              </div>
              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {status === 'submitting' ? 'Sending...' : <><Send className="h-5 w-5 mr-2" /> Send Message</>}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
