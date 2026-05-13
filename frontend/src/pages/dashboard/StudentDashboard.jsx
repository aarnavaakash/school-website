import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { assetUrl } from '../../config/api';
import { motion } from 'framer-motion';
import { User, Book, ClipboardList, LogOut, X, FileText, Download, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [topperModalOpen, setTopperModalOpen] = useState(false);
  const [admitCardModalOpen, setAdmitCardModalOpen] = useState(false);
  const [examRoutine, setExamRoutine] = useState(null);
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

  useEffect(() => {
    const fetchExamRoutine = async () => {
      if (!profile?.class) return;
      try {
        const res = await axios.get(`/exams/class/${profile.class}`);
        setExamRoutine(res.data);
      } catch (error) {
        console.error('Error fetching exam routine', error);
      }
    };
    fetchExamRoutine();
  }, [profile?.class]);

  const handlePrint = () => {
    window.print();
  };

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
                    <img src={assetUrl(profile.photo)} alt={profile.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4 shadow-md" />
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
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                     <div className="flex-1">
                        <p className="text-slate-500 text-sm">Class Rank</p>
                        <h3 className="text-2xl font-bold text-slate-800">#{profile.classRank} <span className="text-sm font-normal text-slate-500">/ {profile.classTotalStudents}</span></h3>
                        <button onClick={(e) => { e.stopPropagation(); setResultModalOpen(true); }} className="text-purple-600 text-xs font-medium hover:underline mt-1">View Details &rarr;</button>
                     </div>
                 </motion.div>
                 
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} 
                     onClick={() => examRoutine && setAdmitCardModalOpen(true)}
                     className={`p-6 rounded-2xl shadow-sm border flex items-center transition-all ${examRoutine ? 'bg-white border-blue-200 cursor-pointer hover:bg-blue-50' : 'bg-slate-50 border-slate-200 opacity-75'}`}>
                     <div className={`p-4 rounded-full mr-4 ${examRoutine ? 'bg-blue-100' : 'bg-slate-200'}`}>
                         <FileText className={`w-8 h-8 ${examRoutine ? 'text-blue-600' : 'text-slate-400'}`} />
                     </div>
                     <div className="flex-1">
                        <p className="text-slate-500 text-sm font-medium">Examination Admit Card</p>
                        <h3 className={`text-lg font-bold ${examRoutine ? 'text-slate-800' : 'text-slate-400'}`}>
                          {examRoutine ? examRoutine.examName : 'Not Available Yet'}
                        </h3>
                        {examRoutine ? (
                          <div className="flex gap-3 mt-2">
                            <button onClick={(e) => { e.stopPropagation(); setAdmitCardModalOpen(true); }} className="text-blue-600 text-xs font-bold hover:underline">View Preview</button>
                            <button onClick={(e) => { e.stopPropagation(); setAdmitCardModalOpen(true); setTimeout(handlePrint, 500); }} className="text-emerald-600 text-xs font-bold hover:underline flex items-center">
                              <Printer className="w-3 h-3 mr-1" /> Save as PDF
                            </button>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 mt-1 italic">Will appear here once released by school.</p>
                        )}
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
              {/* Show all exam results from examResults array */}
              {profile.examResults && profile.examResults.length > 0 ? (
                <div className="space-y-6">
                  {[...profile.examResults].reverse().map((exam, examIdx) => {
                    const examTotal = exam.marks.reduce((sum, m) => sum + Number(m.score), 0);
                    const examMax = exam.marks.reduce((sum, m) => sum + Number(m.maxScore), 0);
                    const examPct = examMax > 0 ? ((examTotal / examMax) * 100).toFixed(1) : null;
                    return (
                      <div key={examIdx} className="rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-blue-50 px-5 py-3 flex items-center justify-between border-b border-gray-200">
                          <div>
                            <p className="text-sm font-bold text-blue-800">📝 {exam.examName}</p>
                            <p className="text-xs text-slate-500">{new Date(exam.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              exam.result === 'Distinction' ? 'bg-green-100 text-green-700' :
                              exam.result === 'First Class' ? 'bg-blue-100 text-blue-700' :
                              exam.result === 'Fail' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>{exam.result}</span>
                            {examPct && <span className="text-sm font-bold text-blue-700">{examPct}%</span>}
                          </div>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                              <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                              <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Maximum Marks</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {exam.marks.map((mark, mIdx) => (
                              <tr key={mIdx}>
                                <td className="px-5 py-3 text-sm font-medium text-gray-900">{mark.subject}</td>
                                <td className="px-5 py-3 text-sm text-gray-500 text-right font-bold">{mark.score}</td>
                                <td className="px-5 py-3 text-sm text-gray-500 text-right">{mark.maxScore}</td>
                              </tr>
                            ))}
                            <tr className="bg-slate-50 font-bold">
                              <td className="px-5 py-3 text-sm text-gray-900">Total</td>
                              <td className="px-5 py-3 text-sm text-blue-600 text-right">{examTotal}</td>
                              <td className="px-5 py-3 text-sm text-gray-900 text-right">{examMax}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              ) : profile.marks && profile.marks.length > 0 ? (
                /* Fallback: show legacy marks if no examResults */
                <div>
                  {profile.examName && (
                    <p className="text-sm font-semibold text-blue-600 mb-4">📝 {profile.examName}</p>
                  )}
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Maximum Marks</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {profile.marks.map((mark, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mark.subject}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-bold">{mark.score}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{mark.maxScore}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right">
                          {profile.marks.reduce((sum, m) => sum + Number(m.score), 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {profile.marks.reduce((sum, m) => sum + Number(m.maxScore), 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="mt-6 text-center">
                    <div className="inline-block bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-slate-500 text-sm font-medium mb-1">Overall Percentage</p>
                      <p className="text-3xl font-black text-blue-700">
                        {((profile.marks.reduce((sum, m) => sum + Number(m.score), 0) / 
                           profile.marks.reduce((sum, m) => sum + Number(m.maxScore), 0)) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-gray-500">No marks have been updated yet.</div>
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


      {/* Admit Card Modal */}
      {admitCardModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Admit Card Preview</h3>
                <p className="text-sm text-gray-500">Download your examination admit card</p>
              </div>
              <button onClick={() => setAdmitCardModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {examRoutine ? (
                <div id="printable-admit-card" className="bg-white border-2 border-slate-800 p-8 mx-auto max-w-[800px] shadow-sm relative overflow-hidden print:m-0 print:border-0 print:shadow-none">
                  {/* Header */}
                  <div className="mb-4">
                    <img src="/folder/admit-card/header.jpg" alt="School Header" className="w-full" />
                  </div>

                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-black uppercase tracking-widest border-2 border-black inline-block px-8 py-2 bg-slate-50">Admit Card</h2>
                    <p className="text-xl font-bold mt-4 text-slate-900 underline decoration-2 underline-offset-4">{examRoutine.examName}</p>
                  </div>

                  {/* Student Info */}
                  <div className="grid grid-cols-2 gap-8 mb-8 border-y-2 border-slate-200 py-6 text-left">
                    <div className="space-y-3">
                      <p className="text-lg"><span className="font-bold w-32 inline-block">Name:</span> <span className="font-medium text-blue-900 uppercase">{profile.name}</span></p>
                      <p className="text-lg"><span className="font-bold w-32 inline-block">Father's Name:</span> <span className="font-medium">{profile.parentName}</span></p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-lg"><span className="font-bold w-32 inline-block">Class:</span> <span className="font-medium">{profile.class}</span></p>
                      <p className="text-lg"><span className="font-bold w-32 inline-block">Roll No:</span> <span className="font-medium">{profile.rollNumber}</span></p>
                    </div>
                  </div>

                  {/* Routine */}
                  <div className="mb-8 text-left">
                    <h4 className="font-bold text-lg mb-3 uppercase tracking-wide bg-slate-900 text-white px-4 py-1 inline-block">Examination Schedule</h4>
                    <table className="w-full border-collapse border-2 border-slate-800">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border-2 border-slate-800 p-3 text-left font-black uppercase">Subject</th>
                          <th className="border-2 border-slate-800 p-3 text-center font-black uppercase">Date</th>
                          <th className="border-2 border-slate-800 p-3 text-center font-black uppercase">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examRoutine.routine.map((row, rIdx) => (
                          <tr key={rIdx}>
                            <td className="border-2 border-slate-800 p-3 font-bold text-slate-800 uppercase">{row.subject}</td>
                            <td className="border-2 border-slate-800 p-3 text-center font-medium">{row.date}</td>
                            <td className="border-2 border-slate-800 p-3 text-center font-medium">{row.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Instructions */}
                  <div className="mb-10 text-[10px] leading-relaxed text-slate-700 text-left border-t border-slate-200 pt-6">
                    <h5 className="font-bold uppercase mb-3 text-slate-900">Important Instructions for Candidates:</h5>
                    <div className="grid grid-cols-1 gap-1.5">
                      <p>1. Candidates should reach the exam centre latest by 10:00 AM (IST).</p>
                      <p>2. No candidate shall be allowed to leave the examination centre before the exam is over.</p>
                      <p>3. If the PWD category of a student is "Yes", the Centre Superintendent will ensure availability of desired exemptions.</p>
                      <p>4. Kindly follow instructions given by invigilators, especially for writing the Roll Number in your Answer Book.</p>
                      <p>5. MOBILE, ChatGPT and other communication devices are not allowed inside the examination centre.</p>
                      <p>6. Do not believe in fake videos and messages on social media. Do not spread rumours.</p>
                      <p>7. Carry only Blue/Royal Blue ballpoint/Gel/Fountain Pen, Pencil, Eraser, Scale, Sharpener, Geometry Instruments.</p>
                      <p>8. If you are a regular candidate, you should wear a school uniform to appear in the examinations.</p>
                      <p>9. Both regular and private candidates will appear only in the subjects mentioned above.</p>
                      <p>10. In case of any ambiguity found in the question paper, the same will be addressed as per policy.</p>
                      <p>11. The English version of the question paper will prevail over the other version.</p>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="flex justify-between items-end mt-8 pt-6 border-t-2 border-dashed border-slate-300">
                    <div className="text-center">
                      <img
                        src="/folder/admit-card/sign-rituraj.png?v=2"
                        alt="Exam Controller Sign"
                        className="h-16 mx-auto mb-2 object-contain mix-blend-multiply"
                      />
                      <div className="border-t-2 border-black w-44 pt-1">
                        <p className="text-[10px] font-bold text-slate-700 uppercase">Exam Controller</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <img
                        src="/folder/admit-card/sign-rohit.png?v=2"
                        alt="Principal Sign"
                        className="h-16 mx-auto mb-2 object-contain mix-blend-multiply"
                      />
                      <div className="border-t-2 border-black w-44 pt-1">
                        <p className="text-[10px] font-bold text-slate-700 uppercase">Principal</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Watermark */}
                  <div className="absolute bottom-4 right-4 opacity-5 font-black text-2xl rotate-[-25deg] select-none pointer-events-none">
                    HNP INSTITUTE
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                  <p className="text-slate-500">Exam routine not available for your class yet.</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3 no-print">
              <button onClick={() => setAdmitCardModalOpen(false)} className="px-6 py-2 rounded-lg border border-gray-300 font-medium hover:bg-gray-100 transition-colors">Close</button>
              {examRoutine && (
                <button 
                  onClick={handlePrint}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center transition-colors shadow-sm"
                >
                  <Printer className="w-4 h-4 mr-2" /> Print / Save as PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
