import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { motion } from 'framer-motion';
import { Calendar, Tag } from 'lucide-react';

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await axios.get('/notices');
        setNotices(res.data);
      } catch (error) {
        console.error('Error fetching notices', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const categories = ['All', ...new Set(notices.map(n => n.category))];
  const filteredNotices = filter === 'All' ? notices : notices.filter(n => n.category === filter);

  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Notice Board</h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
           <div className="flex justify-center py-12">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
           </div>
        ) : (
          <div className="space-y-6">
            {filteredNotices.map((notice, idx) => (
              <motion.div 
                key={notice._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-center text-sm text-slate-500 mb-3 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(notice.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-blue-600 font-medium">
                    <Tag className="h-4 w-4 mr-1" />
                    {notice.category}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{notice.title}</h3>
                <p className="text-slate-600 whitespace-pre-wrap">{notice.description}</p>
              </motion.div>
            ))}
            {filteredNotices.length === 0 && (
              <div className="text-center py-12 text-slate-500">No notices found in this category.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;
