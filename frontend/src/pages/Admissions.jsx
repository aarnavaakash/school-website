import { useState } from 'react';
import axios from '../api/axios';
import { motion } from 'framer-motion';

const Admissions = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    classApplying: '',
    parentName: '',
    phone: '',
    email: '',
    address: '',
    previousSchool: '',
    dateOfBirth: '',
    photoFile: null
  });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });
      
      await axios.post('/admissions', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus('success');
      setFormData({ studentName: '', classApplying: '', parentName: '', phone: '', email: '', address: '', previousSchool: '', dateOfBirth: '', photoFile: null });
      e.target.reset(); // Reset file input
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Admissions</h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-blue-900">Admission Process</h2>
            <div className="space-y-6 text-slate-600">
              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-4">1</div>
                <div>
                  <h4 className="font-bold text-slate-800">Submit Application</h4>
                  <p>Fill out the online admission form with all accurate details.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-4">2</div>
                <div>
                  <h4 className="font-bold text-slate-800">Interaction / Test</h4>
                  <p>Depending on the grade, an informal interaction or a baseline assessment will be scheduled.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-4">3</div>
                <div>
                  <h4 className="font-bold text-slate-800">Document Verification</h4>
                  <p>Submit previous school records, birth certificate, and address proof.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-4">4</div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Eligibility</h4>
                  <ul className="space-y-1">
                    <li><strong className="font-bold">Play Group:</strong> 2.5+ Years</li>
                    <li><strong className="font-bold">Nursery:</strong> 3+ Years</li>
                    <li><strong className="font-bold">Class 1:</strong> 5.5+ Years</li>
                  </ul>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-4">5</div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Fee Structure</h4>
                  <p className="mb-2">We provide affordable quality education. Please contact the school office or download the detailed fee structure brochure.</p>
                  <a href="#" className="text-blue-600 font-bold hover:underline">Download Fee Structure (PDF)</a>
                </div>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-50 p-8 rounded-2xl shadow-xl"
          >
            <h3 className="text-2xl font-bold mb-6 text-slate-800">Online Application Form</h3>
            {status === 'success' && (
              <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">Application submitted successfully! We will contact you soon.</div>
            )}
            {status === 'error' && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">Error submitting application. Please try again.</div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
                  <input required type="text" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class Applying For *</label>
                  <input required type="text" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    value={formData.classApplying} onChange={e => setFormData({...formData, classApplying: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input required type="date" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name *</label>
                  <input required type="text" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input required type="text" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input required type="email" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea required rows="2" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Previous School (if any)</label>
                <input type="text" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                  value={formData.previousSchool} onChange={e => setFormData({...formData, previousSchool: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Photo</label>
                <input type="file" accept="image/*" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white" 
                  onChange={e => setFormData({...formData, photoFile: e.target.files[0]})} />
                <p className="text-xs text-gray-500 mt-1">Upload a recent passport-size photograph (JPG/PNG).</p>
              </div>
              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {status === 'submitting' ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Admissions;
