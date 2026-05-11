import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { assetUrl } from '../config/api';
import { motion } from 'framer-motion';

const Faculty = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

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
            {teachers.map((teacher, idx) => (
              <motion.div 
                key={teacher._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col"
              >
                <div className="h-48 bg-slate-200 w-full">
                  <img 
                    src={teacher.photo ? assetUrl(teacher.photo) : 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'} 
                    alt={teacher.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{teacher.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{teacher.subject}</p>
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-600"><span className="font-semibold">Qual:</span> {teacher.qualification}</p>
                    <p className="text-sm text-slate-600 mt-1"><span className="font-semibold">Exp:</span> {teacher.experience}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Faculty;
