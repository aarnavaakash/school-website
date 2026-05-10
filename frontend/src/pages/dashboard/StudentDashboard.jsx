import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { motion } from 'framer-motion';
import { User, Book, ClipboardList, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [topperModalOpen, setTopperModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/students/dashboard/me');
        setProfile(res.data);
      } catch (error) {
        console.error('Error fetching profile', error);
        if (error.response?.status === 401) {
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      navigate('/login');
  }

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
      );
  }

  if (!profile) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <h2 className="text-2xl font-bold mb-4">Student record not found.</h2>
            <button onClick={handleLogout} className="text-blue-600 underline">Back to Login</button>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
            <button onClick={handleLogout} className="flex items-center text-red-600 hover:text-red-800 font-medium">
                <LogOut className="w-5 h-5 mr-2" /> Logout
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
            className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
          >
            <div className="text-center mb-6">
                {profile.photo ? (
                    <img src={`http://localhost:5001${profile.photo}`} alt={profile.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4 shadow-md" />
                ) : (
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-12 h-12 text-blue-600" />
                    </div>
                )}
                <h2 className="text-xl font-bold text-slate-800">{profile.name}</h2>
                <p className="text-slate-500">{profile.class} | Roll: {profile.rollNumber}</p>
            </div>
            <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Parent</span>
                    <span className="font-medium">{profile.parentName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-medium">{profile.phone}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Email</span>
                    <span className="font-medium truncate ml-2">{profile.email}</span>
                </div>
            </div>
          </motion.div>

          <div className="md:col-span-2 space-y-8">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center">
                     <div className="bg-green-100 p-4 rounded-full mr-4">
                         <ClipboardList className="w-8 h-8 text-green-600" />
                     </div>
                     <div>
                         <p className="text-slate-500 text-sm">Attendance</p>
                         <h3 className="text-3xl font-bold text-slate-800">{profile.attendance}%</h3>
                     </div>
                 </motion.div>
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} 
                     onClick={() => setResultModalOpen(true)}
                     className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center cursor-pointer hover:bg-slate-50 transition-colors">
                     <div className="bg-purple-100 p-4 rounded-full mr-4">
                         <Book className="w-8 h-8 text-purple-600" />
                     </div>
                     <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between">
                       <div>
                         <p className="text-slate-500 text-sm">Class Rank</p>
                         <h3 className="text-3xl font-bold text-slate-800">#{profile.classRank} <span className="text-sm font-normal text-slate-500">/ {profile.classTotalStudents}</span></h3>
                         <div className="flex gap-4 mt-2">
                           <button onClick={(e) => { e.stopPropagation(); setResultModalOpen(true); }} className="text-purple-600 text-xs font-medium hover:underline">View Details &rarr;</button>
                           {profile.classTopper && profile.classRank > 1 && (
                             <button onClick={(e) => { e.stopPropagation(); setTopperModalOpen(true); }} className="text-blue-600 text-xs font-medium hover:underline">Compare Topper &rarr;</button>
                           )}
                         </div>
                       </div>
                       <div className="mt-2 sm:mt-0 sm:text-right border-l pl-4 sm:border-l-0 sm:pl-0">
                         <p className="text-slate-500 text-sm">School Rank</p>
                         <h3 className="text-xl font-bold text-slate-700">#{profile.schoolRank} <span className="text-sm font-normal text-slate-500">/ {profile.totalStudents}</span></h3>
                       </div>
                     </div>
                 </motion.div>
             </div>

             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Recent Notices</h3>
                <p className="text-slate-500 mb-4">Check the notice board for recent announcements.</p>
                <a href="/notices" className="text-blue-600 hover:underline font-medium">View Notice Board &rarr;</a>
             </motion.div>
          </div>
        </div>
      </div>

      {/* Result Details Modal */}
      {resultModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Result Details</h3>
                <p className="text-sm text-gray-500">Class {profile.class}</p>
              </div>
              <button onClick={() => setResultModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Maximum Marks</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profile.marks && profile.marks.length > 0 ? (
                    profile.marks.map((mark, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mark.subject}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-bold">{mark.score}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{mark.maxScore}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">No marks have been updated yet.</td>
                    </tr>
                  )}
                  {profile.marks && profile.marks.length > 0 && (
                    <tr className="bg-slate-50 font-bold">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right">
                        {profile.marks.reduce((sum, m) => sum + Number(m.score), 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {profile.marks.reduce((sum, m) => sum + Number(m.maxScore), 0)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {profile.marks && profile.marks.length > 0 && (
                <div className="mt-6 text-center">
                  <div className="inline-block bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-slate-500 text-sm font-medium mb-1">Overall Percentage</p>
                    <p className="text-3xl font-black text-blue-700">
                      {((profile.marks.reduce((sum, m) => sum + Number(m.score), 0) / 
                         profile.marks.reduce((sum, m) => sum + Number(m.maxScore), 0)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setResultModalOpen(false)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Topper Modal */}
      {topperModalOpen && profile.classTopper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Compare with Class Topper</h3>
                <p className="text-sm text-gray-500">Topper: <span className="font-medium text-blue-600">{profile.classTopper.name}</span> | Score: {profile.classTopper.percentage?.toFixed(1)}%</p>
              </div>
              <button onClick={() => setTopperModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Your Marks</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-blue-600 uppercase tracking-wider">Topper Marks</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Max</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profile.classTopper.marks && profile.classTopper.marks.length > 0 ? (
                    profile.classTopper.marks.map((topperMark, index) => {
                      const myMark = profile.marks?.find(m => m.subject.toLowerCase() === topperMark.subject.toLowerCase());
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{topperMark.subject}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center font-bold">{myMark ? myMark.score : '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-center font-bold">{topperMark.score}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{topperMark.maxScore}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">No marks data available for comparison.</td>
                    </tr>
                  )}
                  {profile.classTopper.marks && profile.classTopper.marks.length > 0 && (
                    <tr className="bg-slate-50 font-bold border-t-2 border-gray-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                        {profile.marks?.reduce((sum, m) => sum + Number(m.score), 0) || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-center">
                        {profile.classTopper.marks.reduce((sum, m) => sum + Number(m.score), 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {profile.classTopper.marks.reduce((sum, m) => sum + Number(m.maxScore), 0)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="mt-6 flex justify-center gap-8">
                <div className="text-center bg-gray-50 border rounded-xl p-4 min-w-[150px]">
                  <p className="text-slate-500 text-xs font-medium mb-1">Your Percentage</p>
                  <p className="text-2xl font-black text-gray-700">
                    {profile.marks?.length > 0 ? 
                      ((profile.marks.reduce((sum, m) => sum + Number(m.score), 0) / 
                       profile.marks.reduce((sum, m) => sum + Number(m.maxScore), 0)) * 100).toFixed(1) + '%' 
                    : '-'}
                  </p>
                </div>
                <div className="text-center bg-blue-50 border border-blue-100 rounded-xl p-4 min-w-[150px]">
                  <p className="text-blue-500 text-xs font-medium mb-1">Topper Percentage</p>
                  <p className="text-2xl font-black text-blue-700">
                    {profile.classTopper.percentage?.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setTopperModalOpen(false)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
