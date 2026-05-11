import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { assetUrl } from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await axios.get('/gallery');
        setImages(res.data);
      } catch (error) {
        console.error('Error fetching gallery', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const categories = ['All', ...new Set(images.map(img => img.category))];
  const filteredImages = filter === 'All' ? images : images.filter(img => img.category === filter);

  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Gallery</h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${filter === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm'}`}
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
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredImages.map((img) => (
                <motion.div
                  key={img._id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="relative group cursor-pointer overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all"
                  onClick={() => setSelectedImage(img)}
                >
                  {img.imageUrl && img.imageUrl.toLowerCase().endsWith('.pdf') ? (
                    <div className="w-full h-64 bg-slate-200 flex flex-col items-center justify-center text-red-500">
                      <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                      <span className="font-bold">PDF Document</span>
                    </div>
                  ) : (
                    <img src={assetUrl(img.imageUrl)} alt={img.title} className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110" />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="text-white">
                      <p className="font-bold text-lg">{img.title}</p>
                      <p className="text-sm bg-blue-600 inline-block px-2 py-1 rounded mt-1">{img.category}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 z-50">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          {selectedImage.imageUrl && selectedImage.imageUrl.toLowerCase().endsWith('.pdf') ? (
             <iframe src={assetUrl(selectedImage.imageUrl)} className="w-full h-full max-w-4xl max-h-[80vh] bg-white rounded-lg shadow-2xl" title={selectedImage.title}></iframe>
          ) : (
             <img src={assetUrl(selectedImage.imageUrl)} alt={selectedImage.title} className="max-w-full max-h-full rounded-lg shadow-2xl" />
          )}
        </div>
      )}
    </div>
  );
};

export default Gallery;
