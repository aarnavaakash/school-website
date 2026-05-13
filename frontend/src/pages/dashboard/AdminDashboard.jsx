import { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import { assetUrl } from '../../config/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Calendar, Mail, MapPin, Phone, Users, FileText, Image as ImageIcon, MessageSquare, Plus, Trash2, Edit2, Eye, X, BookOpen, Search, UserPlus, Printer } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('notices');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Marks Management State
  const [marksModalStudent, setMarksModalStudent] = useState(null);
  const [marksData, setMarksData] = useState([]);
  const [examName, setExamName] = useState('');

  // Admit Card State
  const [admitCardClass, setAdmitCardClass] = useState('Nursery');
  const [admitCardExamName, setAdmitCardExamName] = useState('');
  const [admitCardRoutine, setAdmitCardRoutine] = useState([{ subject: '', date: '', time: '' }]);
  const [activeRoutines, setActiveRoutines] = useState([]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/students');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamRoutine = async (className) => {
    try {
      const res = await axios.get(`/exams/class/${className}`);
      setAdmitCardExamName(res.data.examName);
      setAdmitCardRoutine(res.data.routine);
    } catch (error) {
      setAdmitCardExamName('');
      setAdmitCardRoutine([{ subject: '', date: '', time: '' }]);
    }
  };

  const fetchActiveRoutines = async () => {
    try {
      const res = await axios.get('/exams');
      setActiveRoutines(res.data);
    } catch (error) {
      console.error('Error fetching routines:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'admitcard') {
      fetchExamRoutine(admitCardClass);
      fetchActiveRoutines();
    }
  }, [activeTab, admitCardClass]);

  const saveExamRoutine = async () => {
    try {
      await axios.post('/exams', {
        examName: admitCardExamName,
        class: admitCardClass,
        routine: admitCardRoutine
      });
      setActionMessage('Exam routine saved successfully!');
      fetchActiveRoutines();
    } catch (error) {
      setActionMessage('Error saving exam routine');
    }
  };

  const deleteExamRoutine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam routine?')) return;
    try {
      await axios.delete(`/exams/${id}`);
      setActionMessage('Exam routine deleted successfully');
      fetchActiveRoutines();
      if (activeTab === 'admitcard') fetchExamRoutine(admitCardClass);
    } catch (error) {
      setActionMessage('Error deleting routine');
    }
  };

  const handleRoutineChange = (index, field, value) => {
    const updated = [...admitCardRoutine];
    updated[index][field] = value;
    setAdmitCardRoutine(updated);
  };

  const addRoutineRow = () => setAdmitCardRoutine([...admitCardRoutine, { subject: '', date: '', time: '' }]);
  const removeRoutineRow = (index) => setAdmitCardRoutine(admitCardRoutine.filter((_, i) => i !== index));

  const handlePrint = () => {
    window.print();
  };

  const classGroups = {
    'Play Group': ['play group', 'pg'],
    'Nursery': ['nursery', 'nur'],
    'LKG': ['lkg'],
    'UKG': ['ukg'],
    'Class I': ['1', 'i', 'class i', 'class 1'],
    'Class II': ['2', 'ii', 'class ii', 'class 2'],
    'Class III': ['3', 'iii', 'class iii', 'class 3'],
    'Class IV': ['4', 'iv', 'class iv', 'class 4'],
    'Class V': ['5', 'v', 'class v', 'class 5'],
    'Class VI': ['6', 'vi', 'class vi', 'class 6'],
    'Class VII': ['7', 'vii', 'class vii', 'class 7'],
    'Class VIII': ['8', 'viii', 'class viii', 'class 8']
  };

  const isClassMatch = (itemClass, filter) => {
    if (filter === 'All') return true;
    if (itemClass === filter) return true;
    const group = classGroups[filter];
    if (group && itemClass) {
        return group.includes(String(itemClass).toLowerCase());
    }
    return false;
  };

  const getFilteredData = () => {
    if (activeTab !== 'students') return data;
    return data.filter(item => {
      const classMatch = isClassMatch(item.class, selectedClassFilter);
      const searchMatch = searchQuery 
        ? (item.name || item.studentName || '').toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return classMatch && searchMatch;
    });
  };

  const fetchData = async (endpoint) => {
    if (endpoint === 'students') return fetchStudents();
    if (endpoint === 'admitcard') return fetchStudents(); // Need student list for admit cards
    setLoading(true);
    try {
      const res = await axios.get(`/${endpoint}`);
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setNewItem({});
    setIsEditing(false);
    setEditingId(null);
    setViewItem(null);
    setSelectedStudent(null);
    setShowStudentForm(false);
    setActionMessage('');
    setActionMessage('');
  };
  // ... rest of functions ... (I'll keep them as is in the original file)
  // Re-pasting the sidebar map and adding the new tab

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditingId(item._id);
    setNewItem(item);
    setSelectedStudent(null);
    if (activeTab === 'students') setShowStudentForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setNewItem({});
    if (activeTab === 'students') setShowStudentForm(false);
  };

  const openStudentForm = () => {
    setNewItem({});
    setIsEditing(false);
    setEditingId(null);
    setSelectedStudent(null);
    setShowStudentForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAcceptAdmission = async (admission) => {
    setActionMessage('');
    try {
      await axios.post(`/admissions/${admission._id}/enroll`);
      setActionMessage(`${admission.studentName} has been enrolled as a student. Default login password: student123`);
      fetchData('admissions');
    } catch (error) {
      setActionMessage(error.response?.data?.message || 'Unable to enroll student. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/${activeTab}/${id}`);
      if (editingId === id) cancelEdit();
      fetchData(activeTab);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if ((activeTab === 'teachers' || activeTab === 'students') && newItem.photoFile) {
        const formData = new FormData();
        Object.keys(newItem).forEach(key => {
          if (!['_id', 'createdAt', 'updatedAt', '__v'].includes(key)) {
            if (key === 'photoFile') {
              formData.append('photo', newItem[key]);
            } else {
              formData.append(key, newItem[key]);
            }
          }
        });
        if (isEditing) {
          await axios.put(`/${activeTab}/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        } else {
          await axios.post(`/${activeTab}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
      } else if (activeTab === 'gallery' && newItem.imageFile) {
        const formData = new FormData();
        Object.keys(newItem).forEach(key => {
          if (!['_id', 'createdAt', 'updatedAt', '__v'].includes(key)) {
            if (key === 'imageFile') {
              formData.append('image', newItem[key]);
            } else {
              formData.append(key, newItem[key]);
            }
          }
        });
        if (isEditing) {
          await axios.put(`/${activeTab}/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        } else {
          await axios.post(`/${activeTab}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
      } else {
        if (isEditing) {
          const payload = { ...newItem };
          delete payload._id;
          delete payload.createdAt;
          delete payload.updatedAt;
          delete payload.__v;
          await axios.put(`/${activeTab}/${editingId}`, payload);
        } else {
          await axios.post(`/${activeTab}`, newItem);
        }
      }
      setNewItem({});
      setIsEditing(false);
      setEditingId(null);
      if (activeTab === 'students') setShowStudentForm(false);
      fetchData(activeTab);
    } catch (error) {
      console.error(error);
    }
  };

  const openMarksModal = (student) => {
    setMarksModalStudent(student);
    setMarksData(student.marks && student.marks.length > 0 ? [...student.marks] : []);
    setExamName(student.examName || '');
  };

  const openStudentRecord = (student) => {
    setSelectedStudent(student);
    setViewItem(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeStudentRecord = () => {
    setSelectedStudent(null);
  };

  const getAcademicSummary = (student) => {
    const marks = student?.marks || [];
    const totalScore = marks.reduce((sum, mark) => sum + Number(mark.score || 0), 0);
    const totalMax = marks.reduce((sum, mark) => sum + Number(mark.maxScore || 0), 0);
    const percentage = totalMax > 0 ? ((totalScore / totalMax) * 100).toFixed(1) : null;
    return { marks, totalScore, totalMax, percentage };
  };

  const formatDate = (value) => {
    if (!value) return 'Not available';
    return new Date(value).toLocaleDateString();
  };

  const closeMarksModal = () => {
    setMarksModalStudent(null);
    setMarksData([]);
    setExamName('');
  };

  const handleAddMarkRow = () => {
    setMarksData([...marksData, { subject: '', score: 0, maxScore: 100 }]);
  };

  const handleMarkChange = (index, field, value) => {
    const updatedMarks = [...marksData];
    updatedMarks[index][field] = value;
    setMarksData(updatedMarks);
  };

  const handleRemoveMarkRow = (index) => {
    const updatedMarks = [...marksData];
    updatedMarks.splice(index, 1);
    setMarksData(updatedMarks);
  };

  const saveMarks = async () => {
    try {
      let totalScore = 0;
      let totalMax = 0;
      let hasFailed = false;
      
      marksData.forEach(m => {
        totalScore += Number(m.score);
        totalMax += Number(m.maxScore);
        if ((m.score / m.maxScore) < 0.33) hasFailed = true;
      });
      
      const percentage = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
      let resultStr = 'Pending';
      if (marksData.length > 0) {
        if (hasFailed) resultStr = 'Fail';
        else if (percentage >= 80) resultStr = 'Distinction';
        else if (percentage >= 60) resultStr = 'First Class';
        else if (percentage >= 45) resultStr = 'Second Class';
        else resultStr = 'Pass';
      }

      const response = await axios.put(`/students/${marksModalStudent._id}`, { 
        marks: marksData,
        result: resultStr,
        examName: examName
      });
      if (selectedStudent?._id === marksModalStudent._id) {
        setSelectedStudent(response.data);
      }
      fetchData('students');
      closeMarksModal();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-wider text-blue-400">Admin Panel</h2>
        </div>
        <nav className="mt-6">
          {[
            { id: 'notices', icon: FileText, label: 'Notices' },
            { id: 'students', icon: Users, label: 'Students' },
            { id: 'teachers', icon: Users, label: 'Teachers' },
            { id: 'gallery', icon: ImageIcon, label: 'Gallery' },
            { id: 'admissions', icon: FileText, label: 'Admissions' },
            { id: 'contacts', icon: MessageSquare, label: 'Messages' },
            { id: 'admitcard', icon: Printer, label: 'Admit Card' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full flex items-center px-6 py-4 text-left transition-colors ${activeTab === tab.id ? 'bg-blue-600 border-l-4 border-white' : 'hover:bg-slate-800'}`}
            >
              <tab.icon className="h-5 w-5 mr-3" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 capitalize">
            {selectedStudent ? 'Student Record' : `${activeTab} Management`}
          </h1>
        </div>

        {actionMessage && (
          <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${actionMessage.includes('Unable') ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {actionMessage}
          </div>
        )}

        {selectedStudent && (
          <div className="space-y-6">
            <button
              onClick={closeStudentRecord}
              className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-blue-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
            </button>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                    {selectedStudent.photo ? (
                      <img src={assetUrl(selectedStudent.photo)} alt={selectedStudent.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-600 bg-blue-50">
                        <Users className="w-9 h-9" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedStudent.name}</h2>
                    <p className="text-sm text-slate-500 mt-1">Class {selectedStudent.class} • Roll {selectedStudent.rollNumber}</p>
                    <p className="text-xs text-slate-400 mt-1">Student login: {selectedStudent.email} / student123</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openMarksModal(selectedStudent)}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                  >
                    <BookOpen className="w-4 h-4 mr-2" /> Manage Marks
                  </button>
                  <button
                    onClick={() => handleEdit(selectedStudent)}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200"
                  >
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                  </button>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Student Details</h3>
                  {[
                    { icon: Mail, label: 'Email', value: selectedStudent.email },
                    { icon: Phone, label: 'Phone', value: selectedStudent.phone },
                    { icon: Users, label: 'Parent', value: selectedStudent.parentName },
                    { icon: MapPin, label: 'Address', value: selectedStudent.address },
                    { icon: Calendar, label: 'Date of Birth', value: formatDate(selectedStudent.dateOfBirth) },
                    { icon: Calendar, label: 'Admission Date', value: formatDate(selectedStudent.admissionDate) }
                  ].map((field) => (
                    <div key={field.label} className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <field.icon className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{field.label}</p>
                        <p className="text-sm text-slate-900 break-words">{field.value || 'Not available'}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="lg:col-span-2 space-y-6">
                  {(() => {
                    const summary = getAcademicSummary(selectedStudent);
                    return (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="rounded-lg border border-slate-200 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Attendance</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{selectedStudent.attendance || 0}%</p>
                          </div>
                          <div className="rounded-lg border border-slate-200 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Result</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{selectedStudent.result || 'Pending'}</p>
                          </div>
                          <div className="rounded-lg border border-slate-200 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Percentage</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.percentage ? `${summary.percentage}%` : 'N/A'}</p>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Exam Results History</h3>
                            <div className="inline-flex items-center text-sm text-slate-600">
                              <Award className="w-4 h-4 mr-2 text-blue-600" />
                              {summary.totalMax > 0 ? `Latest: ${summary.totalScore}/${summary.totalMax}` : 'No marks recorded'}
                            </div>
                          </div>

                          {/* Show all exam results from examResults array */}
                          {selectedStudent.examResults && selectedStudent.examResults.length > 0 ? (
                            <div className="space-y-4">
                              {[...selectedStudent.examResults].reverse().map((exam, examIdx) => {
                                const examTotal = exam.marks.reduce((sum, m) => sum + Number(m.score), 0);
                                const examMax = exam.marks.reduce((sum, m) => sum + Number(m.maxScore), 0);
                                const examPct = examMax > 0 ? ((examTotal / examMax) * 100).toFixed(1) : null;
                                return (
                                  <div key={examIdx} className="rounded-lg border border-slate-200 overflow-hidden">
                                    <div className="bg-blue-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
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
                                    <table className="min-w-full divide-y divide-slate-200">
                                      <thead className="bg-slate-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</th>
                                          <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Score</th>
                                          <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Max</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 bg-white">
                                        {exam.marks.map((mark, mIdx) => (
                                          <tr key={mIdx}>
                                            <td className="px-4 py-2 text-sm font-medium text-slate-900">{mark.subject}</td>
                                            <td className="px-4 py-2 text-sm text-slate-700 text-right">{mark.score}</td>
                                            <td className="px-4 py-2 text-sm text-slate-700 text-right">{mark.maxScore}</td>
                                          </tr>
                                        ))}
                                        <tr className="bg-slate-50 font-bold">
                                          <td className="px-4 py-2 text-sm text-slate-900">Total</td>
                                          <td className="px-4 py-2 text-sm text-blue-600 text-right">{examTotal}</td>
                                          <td className="px-4 py-2 text-sm text-slate-900 text-right">{examMax}</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                );
                              })}
                            </div>
                          ) : summary.marks.length > 0 ? (
                            /* Fallback: show legacy marks if no examResults */
                            <div className="overflow-hidden rounded-lg border border-slate-200">
                              <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Score</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Max</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                  {summary.marks.map((mark, index) => (
                                    <tr key={`${mark.subject}-${index}`}>
                                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{mark.subject}</td>
                                      <td className="px-4 py-3 text-sm text-slate-700 text-right">{mark.score}</td>
                                      <td className="px-4 py-3 text-sm text-slate-700 text-right">{mark.maxScore}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                              No academic marks have been added yet.
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add New Form (simplified for Notices, Teachers, Gallery, Students) */}
        {!selectedStudent && ['notices', 'teachers', 'gallery'].includes(activeTab) && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              {isEditing ? <Edit2 className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />} 
              {isEditing ? 'Edit Item' : 'Add New'}
            </h3>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {activeTab === 'notices' && (
                <>
                  <input required placeholder="Title" className="border p-2 rounded" onChange={e => setNewItem({...newItem, title: e.target.value})} value={newItem.title || ''} />
                  <input required placeholder="Category" className="border p-2 rounded" onChange={e => setNewItem({...newItem, category: e.target.value})} value={newItem.category || ''} />
                  <input required placeholder="Description" className="border p-2 rounded" onChange={e => setNewItem({...newItem, description: e.target.value})} value={newItem.description || ''} />
                </>
              )}
              {activeTab === 'teachers' && (
                <>
                  <input required placeholder="Name" className="border p-2 rounded" onChange={e => setNewItem({...newItem, name: e.target.value})} value={newItem.name || ''} />
                  <input required placeholder="Subject" className="border p-2 rounded" onChange={e => setNewItem({...newItem, subject: e.target.value})} value={newItem.subject || ''} />
                  <input required placeholder="Qualification" className="border p-2 rounded" onChange={e => setNewItem({...newItem, qualification: e.target.value})} value={newItem.qualification || ''} />
                  <input required placeholder="Experience" className="border p-2 rounded" onChange={e => setNewItem({...newItem, experience: e.target.value})} value={newItem.experience || ''} />
                  <div className="col-span-1 md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image (Optional)</label>
                    <input type="file" accept="image/*" className="border p-2 rounded w-full" onChange={e => setNewItem({...newItem, photoFile: e.target.files[0]})} />
                  </div>
                </>
              )}
              {activeTab === 'gallery' && (
                <>
                  <input required placeholder="Title" className="border p-2 rounded" onChange={e => setNewItem({...newItem, title: e.target.value})} value={newItem.title || ''} />
                  <input required placeholder="Category" className="border p-2 rounded" onChange={e => setNewItem({...newItem, category: e.target.value})} value={newItem.category || ''} />
                  <div className="col-span-1 md:col-span-2">
                    <input type="file" accept="image/*, .pdf" required={!isEditing} className="border p-2 rounded w-full" onChange={e => setNewItem({...newItem, imageFile: e.target.files[0]})} />
                  </div>
                </>
              )}
              {activeTab === 'students' && (
                <>
                  <input required placeholder="Student Name" className="border p-2 rounded" onChange={e => setNewItem({...newItem, name: e.target.value})} value={newItem.name || ''} />
                  <input required placeholder="Class" className="border p-2 rounded" onChange={e => setNewItem({...newItem, class: e.target.value})} value={newItem.class || ''} />
                  <input required placeholder="Roll Number" className="border p-2 rounded" onChange={e => setNewItem({...newItem, rollNumber: e.target.value})} value={newItem.rollNumber || ''} />
                  <input required placeholder="Parent Name" className="border p-2 rounded" onChange={e => setNewItem({...newItem, parentName: e.target.value})} value={newItem.parentName || ''} />
                  <input required placeholder="Phone" className="border p-2 rounded" onChange={e => setNewItem({...newItem, phone: e.target.value})} value={newItem.phone || ''} />
                  <input required type="email" placeholder="Email (used for login)" className="border p-2 rounded" onChange={e => setNewItem({...newItem, email: e.target.value})} value={newItem.email || ''} />
                  <input required type="date" className="border p-2 rounded text-gray-500" onChange={e => setNewItem({...newItem, dateOfBirth: e.target.value})} value={newItem.dateOfBirth ? new Date(newItem.dateOfBirth).toISOString().split('T')[0] : ''} title="Date of Birth" />
                  <input required type="date" className="border p-2 rounded text-gray-500" onChange={e => setNewItem({...newItem, admissionDate: e.target.value})} value={newItem.admissionDate ? new Date(newItem.admissionDate).toISOString().split('T')[0] : ''} title="Admission Date" />
                  <input required placeholder="Address" className="border p-2 rounded col-span-1 md:col-span-2" onChange={e => setNewItem({...newItem, address: e.target.value})} value={newItem.address || ''} />
                  <div className="col-span-1 md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Photo (Optional)</label>
                    <input id="studentPhotoInput" type="file" accept="image/*" className="border p-2 rounded w-full" onChange={e => setNewItem({...newItem, photoFile: e.target.files[0]})} />
                  </div>
                </>
              )}
              <div className="col-span-1 md:col-span-4 flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold">
                  {isEditing ? 'Update' : 'Save'}
                </button>
                {isEditing && (
                  <button type="button" onClick={cancelEdit} className="bg-slate-200 text-slate-800 px-4 py-2 rounded hover:bg-slate-300 font-bold">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {!selectedStudent && activeTab === 'students' && showStudentForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center">
                {isEditing ? <Edit2 className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                {isEditing ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4 mr-1" /> Close
              </button>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <input required placeholder="Student Name" className="border p-2 rounded" onChange={e => setNewItem({...newItem, name: e.target.value})} value={newItem.name || ''} />
              <input required placeholder="Class" className="border p-2 rounded" onChange={e => setNewItem({...newItem, class: e.target.value})} value={newItem.class || ''} />
              <input required placeholder="Roll Number" className="border p-2 rounded" onChange={e => setNewItem({...newItem, rollNumber: e.target.value})} value={newItem.rollNumber || ''} />
              <input required placeholder="Parent Name" className="border p-2 rounded" onChange={e => setNewItem({...newItem, parentName: e.target.value})} value={newItem.parentName || ''} />
              <input required placeholder="Phone" className="border p-2 rounded" onChange={e => setNewItem({...newItem, phone: e.target.value})} value={newItem.phone || ''} />
              <input required type="email" placeholder="Email (used for login)" className="border p-2 rounded" onChange={e => setNewItem({...newItem, email: e.target.value})} value={newItem.email || ''} />
              <input required type="date" className="border p-2 rounded text-gray-500" onChange={e => setNewItem({...newItem, dateOfBirth: e.target.value})} value={newItem.dateOfBirth ? new Date(newItem.dateOfBirth).toISOString().split('T')[0] : ''} title="Date of Birth" />
              <input required type="date" className="border p-2 rounded text-gray-500" onChange={e => setNewItem({...newItem, admissionDate: e.target.value})} value={newItem.admissionDate ? new Date(newItem.admissionDate).toISOString().split('T')[0] : ''} title="Admission Date" />
              <input required placeholder="Address" className="border p-2 rounded col-span-1 md:col-span-2" onChange={e => setNewItem({...newItem, address: e.target.value})} value={newItem.address || ''} />
              <div className="col-span-1 md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Photo (Optional)</label>
                <input id="studentPhotoInput" type="file" accept="image/*" className="border p-2 rounded w-full" onChange={e => setNewItem({...newItem, photoFile: e.target.files[0]})} />
              </div>
              <div className="col-span-1 md:col-span-4 flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold">
                  {isEditing ? 'Update Student' : 'Save Student'}
                </button>
                <button type="button" onClick={cancelEdit} className="bg-slate-200 text-slate-800 px-4 py-2 rounded hover:bg-slate-300 font-bold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Data Table */}
        {!selectedStudent && activeTab === 'students' && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <input 
                  type="text" 
                  placeholder="Search student name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <button
                type="button"
                onClick={openStudentForm}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" /> ADD NEW
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-bold text-slate-700 mr-2">Classes:</span>
                {['All', 'Play Group', 'Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII'].map(cls => (
                  <button 
                    key={cls}
                    onClick={() => setSelectedClassFilter(cls)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedClassFilter === cls ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {cls === 'All' ? 'All Classes' : cls}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!selectedStudent && <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredData().map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {(item.photo || item.image) && (
                          <div className="flex-shrink-0 h-10 w-10 mr-4">
                            <img className="h-10 w-10 rounded-full object-cover border border-slate-200" src={assetUrl(item.photo || item.image)} alt="Avatar" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.title || item.name || item.studentName || "Item"}
                          </div>
                          <div className="text-sm text-gray-500">
                             {item.email || item.category || item.subject || new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {['admissions', 'contacts', 'students'].includes(activeTab) && (
                        <button onClick={() => activeTab === 'students' ? openStudentRecord(item) : setViewItem(item)} className="text-emerald-600 hover:text-emerald-900 p-2 mr-2" title={activeTab === 'students' ? 'Open Student Record' : 'View Details'}>
                          <Eye className="w-5 h-5 inline" />
                        </button>
                      )}
                      {activeTab === 'admissions' && (
                        <button onClick={() => handleAcceptAdmission(item)} className="text-blue-600 hover:text-blue-900 p-2 mr-2" title="Enroll Student">
                          <UserPlus className="w-5 h-5 inline" />
                        </button>
                      )}
                      {activeTab === 'students' && (
                        <button onClick={() => openMarksModal(item)} className="text-purple-600 hover:text-purple-900 p-2 mr-2" title="Manage Marks">
                          <BookOpen className="w-5 h-5 inline" />
                        </button>
                      )}
                      {['notices', 'teachers', 'gallery', 'students'].includes(activeTab) && (
                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900 p-2 mr-2" title="Edit">
                          <Edit2 className="w-5 h-5 inline" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900 p-2" title="Delete">
                        <Trash2 className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
                {getFilteredData().length === 0 && (
                   <tr>
                     <td colSpan="2" className="px-6 py-8 text-center text-gray-500">No data found</td>
                   </tr>
                )}
              </tbody>
            </table>
          )}
        </div>}

        {/* Admit Card Tab */}
        {!selectedStudent && activeTab === 'admitcard' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-4 flex items-center text-slate-800">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" /> Exam Routine Builder
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Select Class</label>
                  <select 
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                    value={admitCardClass}
                    onChange={(e) => setAdmitCardClass(e.target.value)}
                  >
                    {['Play Group', 'Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII'].map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Exam Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Annual Examination 2024"
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                    value={admitCardExamName}
                    onChange={(e) => setAdmitCardExamName(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-3">Exam Schedule</label>
                <div className="space-y-3">
                  {admitCardRoutine.map((item, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex-1 w-full">
                        <input 
                          placeholder="Subject" 
                          className="w-full border border-slate-300 rounded p-2 text-sm"
                          value={item.subject}
                          onChange={(e) => handleRoutineChange(index, 'subject', e.target.value)}
                        />
                      </div>
                      <div className="flex-1 w-full">
                        <input 
                          placeholder="Date (e.g. 15-05-2024)" 
                          className="w-full border border-slate-300 rounded p-2 text-sm"
                          value={item.date}
                          onChange={(e) => handleRoutineChange(index, 'date', e.target.value)}
                        />
                      </div>
                      <div className="flex-1 w-full">
                        <input 
                          placeholder="Time (e.g. 10:30 AM)" 
                          className="w-full border border-slate-300 rounded p-2 text-sm"
                          value={item.time}
                          onChange={(e) => handleRoutineChange(index, 'time', e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={() => removeRoutineRow(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={addRoutineRow}
                  className="mt-4 inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Subject
                </button>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                <button 
                  onClick={saveExamRoutine}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-bold flex items-center shadow-sm"
                >
                  Save Routine
                </button>
              </div>
            </div>

            {/* Active Routines List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" /> Active Exam Routines
              </h3>
              
              {activeRoutines.length > 0 ? (
                <div className="overflow-hidden border border-slate-100 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Name</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Subjects</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {activeRoutines.map((routine) => (
                        <tr key={routine._id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{routine.class}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{routine.examName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{routine.routine.length} Subjects</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => deleteExamRoutine(routine._id)}
                              className="text-red-600 hover:text-red-900 font-bold ml-4"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  <p className="text-slate-500">No active exam routines found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .admit-cards-container, .admit-cards-container * {
            visibility: visible;
          }
          .admit-cards-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .admit-card-wrapper {
            margin: 0 !important;
            padding: 40px !important;
            border: 3px solid black !important;
            box-shadow: none !important;
            page-break-after: always !important;
            width: 100% !important;
            max-width: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
        .mix-multiply {
          mix-blend-mode: multiply;
        }
      `}</style>


      {/* View Details Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 capitalize">Details</h3>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <dl className="space-y-4">
                {Object.entries(viewItem)
                  .filter(([key]) => !['_id', '__v', 'password', 'createdAt', 'updatedAt', 'marks'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3 rounded-lg">
                      <dt className="text-sm font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 break-words">
                        {value && (key.toLowerCase().includes('date') || key.includes('At')) ? new Date(value).toLocaleDateString() : value?.toString() || 'N/A'}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setViewItem(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Marks Management Modal */}
      {marksModalStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Manage Marks</h3>
                <p className="text-sm text-gray-500">{marksModalStudent.name} (Class: {marksModalStudent.class})</p>
              </div>
              <button onClick={closeMarksModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Exam Name Field */}
            <div className="px-6 py-4 border-b border-gray-100 bg-blue-50">
              <label className="block text-xs font-bold uppercase tracking-wide text-blue-700 mb-1">Exam Name</label>
              <input
                type="text"
                className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                placeholder="e.g. Mid-Term 2024, Annual Exam 2025"
                value={examName}
                onChange={e => setExamName(e.target.value)}
              />
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Subject</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Score</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Max Score</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {marksData.map((mark, index) => (
                    <tr key={index}>
                      <td className="py-3 pr-2">
                        <input type="text" className="w-full border p-2 rounded" placeholder="E.g., Mathematics" value={mark.subject} onChange={e => handleMarkChange(index, 'subject', e.target.value)} />
                      </td>
                      <td className="py-3 px-2">
                        <input type="number" className="w-full border p-2 rounded" placeholder="0" value={mark.score} onChange={e => handleMarkChange(index, 'score', e.target.value)} />
                      </td>
                      <td className="py-3 px-2">
                        <input type="number" className="w-full border p-2 rounded" placeholder="100" value={mark.maxScore} onChange={e => handleMarkChange(index, 'maxScore', e.target.value)} />
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <button onClick={() => handleRemoveMarkRow(index)} className="text-red-500 hover:text-red-700 p-2">
                          <Trash2 className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {marksData.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-gray-500">No marks added yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <button onClick={handleAddMarkRow} className="mt-4 flex items-center text-blue-600 hover:text-blue-800 font-medium">
                <Plus className="w-4 h-4 mr-1" /> Add Subject
              </button>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={closeMarksModal} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 font-medium">Cancel</button>
              <button onClick={saveMarks} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">Save Marks & Result</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
