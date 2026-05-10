import { motion } from 'framer-motion';
import { BookOpen, Award, Clock } from 'lucide-react';

const Academics = () => {
  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Academics</h1>
          <p className="text-slate-700 text-lg">We offer a comprehensive curriculum designed to foster intellectual, social, and emotional growth.</p>
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.6, delay: 0.2 }}
             className="bg-white p-8 rounded-lg shadow-sm border-l-4 border-[#0b2b53]"
          >
            <h3 className="text-xl font-bold text-[#0b2b53] mb-4">Teaching Methodology</h3>
            <p className="text-slate-700 leading-relaxed">
              We utilize the <strong className="text-slate-900">"Learn-Through-Play"</strong> method, ensuring concepts are understood rather than memorized. Our classrooms are equipped with modern aids to support interactive learning.
            </p>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.6, delay: 0.4 }}
             className="bg-white p-8 rounded-lg shadow-sm border-l-4 border-[#0b2b53]"
          >
            <h3 className="text-xl font-bold text-[#0b2b53] mb-4">Examination & Grading</h3>
            <p className="text-slate-700 leading-relaxed">
              We follow a Continuous and Comprehensive Evaluation (CCE) system. Regular unit tests, terminal examinations, and observational assessments ensure a stress-free evaluation process.
            </p>
          </motion.div>
        </div>

        {/* Curriculum Table */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Curriculum & Subjects</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0b2b53] text-white">
                  <th className="p-4 font-bold border-r border-[#154175] w-1/3">Class Level</th>
                  <th className="p-4 font-bold">Subjects Offered</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="p-4 border-r border-slate-200">Play Group / Nursery</td>
                  <td className="p-4">English (Oral/Written), Number Work, Art & Craft, Rhymes, General Awareness</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="p-4 border-r border-slate-200">LKG / UKG</td>
                  <td className="p-4">English, Hindi, Mathematics, EVS, Drawing, Conversation</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="p-4 border-r border-slate-200">Class I - V</td>
                  <td className="p-4">English, Hindi, Mathematics, Science, Social Studies, Computer Science, G.K., Moral Value</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 border-r border-slate-200">Class VI - VIII</td>
                  <td className="p-4">English, Hindi, Mathematics, Science, Social Studies, Sanskrit</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
};

export default Academics;
