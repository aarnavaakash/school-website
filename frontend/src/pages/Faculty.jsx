import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { assetUrl } from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';

const Faculty = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get('/teachers');
        setTeachers(res.data);
      } catch (error) {
        console.error('Error fetching teachers', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Our Faculty</h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            Meet our dedicated team of experienced educators committed to nurturing the potential within every student.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {teachers.map((teacher, idx) => {
              const imgSrc = teacher.photo ? assetUrl(teacher.photo) : 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80';
              return (
              <motion.div 
                key={teacher._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow"
              >
                <div className="pt-8 pb-4 flex justify-center w-full bg-gradient-to-b from-blue-50/50 to-white">
                  <div 
                    className="w-full aspect-square rounded-full border-4 border-white shadow-md overflow-hidden cursor-pointer relative group"
                    onClick={() => setSelectedImage(imgSrc)}
                  >
                    <img 
                      src={imgSrc} 
                      alt={teacher.name}
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                       <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                       </svg>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6 flex-grow flex flex-col text-center">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{teacher.name}</h3>
                  <p className="text-blue-600 font-medium mb-4">{teacher.subject}</p>
                  <div className="mt-auto pt-4 border-t border-slate-100 text-left">
                    <p className="text-sm text-slate-600"><span className="font-semibold text-slate-800">Qual:</span> {teacher.qualification}</p>
                    <p className="text-sm text-slate-600 mt-2"><span className="font-semibold text-slate-800">Exp:</span> {teacher.experience}</p>
                  </div>
                </div>
              </motion.div>
            )})}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute -top-12 right-0 text-white/70 hover:text-white text-4xl focus:outline-none transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                &times;
              </button>
              <img 
                src={selectedImage} 
                alt="Full view" 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Faculty;
