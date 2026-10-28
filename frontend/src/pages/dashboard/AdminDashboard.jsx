import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { assetUrl } from '../../config/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Calendar, Mail, MapPin, Phone, Users, FileText, Image as ImageIcon, MessageSquare, Plus, Trash2, Edit2, Eye, X, BookOpen, Search, UserPlus, Printer, Save, Check } from 'lucide-react';
import AdmitCard from '../../components/AdmitCard';
import ReportCard, { getDefaultReportCard } from '../../components/ReportCard';
import { printElement } from '../../utils/printHelper';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('notices');
  const [data, setData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);
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

  // Admit Card Filter & Print State
  const [admitCardFilterClass, setAdmitCardFilterClass] = useState('All');
  const [admitCardSearch, setAdmitCardSearch] = useState('');
  const [previewAdmitCardStudent, setPreviewAdmitCardStudent] = useState(null);
  const [activeAdmitCardSubtab, setActiveAdmitCardSubtab] = useState('students');
  const batchContainerRef = useRef(null);

  // Report Card State
  const [reportCardFilterClass, setReportCardFilterClass] = useState('All');
  const [reportCardSearch, setReportCardSearch] = useState('');
  const [reportCardSelectedExam, setReportCardSelectedExam] = useState('Half Yearly Examination');
  const [editingReportCardStudent, setEditingReportCardStudent] = useState(null);
  const [previewReportCardStudent, setPreviewReportCardStudent] = useState(null);
  const [previewReportCardData, setPreviewReportCardData] = useState(null);
  const [reportCardDraft, setReportCardDraft] = useState(null);
  const [isSavingReportCard, setIsSavingReportCard] = useState(false);
  const batchReportCardRef = useRef(null);

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
    'Play Group': ['play group', 'playgroup', 'play', 'pg', 'p.g.', 'p.g'],
    'Nursery': ['nursery', 'nur', 'nursury'],
    'LKG': ['lkg', 'l.k.g.'],
    'UKG': ['ukg', 'u.k.g.'],
    'Class I': ['1', 'i', 'class i', 'class 1', 'std 1', 'std i'],
    'Class II': ['2', 'ii', 'class ii', 'class 2', 'std 2', 'std ii'],
    'Class III': ['3', 'iii', 'class iii', 'class 3', 'std 3', 'std iii'],
    'Class IV': ['4', 'iv', 'class iv', 'class 4', 'std 4', 'std iv'],
    'Class V': ['5', 'v', 'class v', 'class 5', 'std 5', 'std v'],
    'Class VI': ['6', 'vi', 'class vi', 'class 6', 'std 6', 'std vi'],
    'Class VII': ['7', 'vii', 'class vii', 'class 7', 'std 7', 'std vii'],
    'Class VIII': ['8', 'viii', 'class viii', 'class 8', 'std 8', 'std viii']
  };

  const isClassMatch = (itemClass, filter) => {
    if (!filter || filter === 'All') return true;
    if (!itemClass) return false;

    const itemClean = String(itemClass).trim().toLowerCase();
    const filterClean = String(filter).trim().toLowerCase();

    if (itemClean === filterClean) return true;

    for (const [key, aliases] of Object.entries(classGroups)) {
      const keyClean = key.toLowerCase();
      const allVariants = [keyClean, ...aliases.map(a => a.toLowerCase())];
      
      const filterMatches = allVariants.includes(filterClean);
      const itemMatches = allVariants.includes(itemClean);

      if (filterMatches && itemMatches) {
        return true;
      }
    }

    return itemClean.includes(filterClean) || filterClean.includes(itemClean);
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

  const getStudentRoutine = (student) => {
    if (!student || !activeRoutines || activeRoutines.length === 0) return null;
    return activeRoutines.find(r => isClassMatch(student.class, r.class)) || null;
  };

  const getAdmitCardStudents = () => {
    if (!Array.isArray(data)) return [];
    return data.filter(student => {
      const classMatch = isClassMatch(student.class, admitCardFilterClass);
      const searchMatch = admitCardSearch 
        ? (student.name || '').toLowerCase().includes(admitCardSearch.toLowerCase()) ||
          (student.rollNumber || '').toLowerCase().includes(admitCardSearch.toLowerCase())
        : true;
      return classMatch && searchMatch;
    });
  };

  const handlePrintAll = async () => {
    const studentsToPrint = getAdmitCardStudents();
    if (studentsToPrint.length === 0) {
      alert('No students found for this class filter.');
      return;
    }

    const container = batchContainerRef.current;
    if (!container) {
      alert('Print container not ready. Please try again.');
      return;
    }

    const safeClass = admitCardFilterClass === 'All' ? 'All_Classes' : admitCardFilterClass.replace(/\s+/g, '_');
    setActionMessage(`Opening Print / Save as PDF for ${studentsToPrint.length} students...`);
    
    try {
      await printElement(container, `HNP_Admit_Cards_${safeClass}`);
    } catch (err) {
      console.error('Print error:', err);
      setActionMessage('Failed to open print dialog.');
    } finally {
      setActionMessage('');
    }
  };

  const handlePrintSingle = async (student) => {
    if (!student) return;
    const cardEl = document.getElementById(`admit-card-staging-${student._id}`) ||
                   document.getElementById('admit-card-preview-modal-card');

    if (!cardEl) {
      alert('Admit card element not found.');
      return;
    }

    const safeName = (student.name || 'Student').replace(/\s+/g, '_');
    const safeRoll = student.rollNumber || 'Roll';
    setActionMessage(`Opening Print for ${student.name}...`);

    try {
      await printElement(cardEl, `Admit_Card_${safeRoll}_${safeName}`);
    } catch (err) {
      console.error('Print error:', err);
      setActionMessage('Failed to open print dialog.');
    } finally {
      setActionMessage('');
    }
  };

  const openReportCardEditor = (student, examName = reportCardSelectedExam) => {
    setEditingReportCardStudent(student);
    setReportCardDraft(getDefaultReportCard(student, examName));
  };

  const openReportCardPreview = (student, examName = reportCardSelectedExam) => {
    setPreviewReportCardStudent(student);
    setPreviewReportCardData(getDefaultReportCard(student, examName));
  };

  const closeReportCardEditor = () => {
    setEditingReportCardStudent(null);
    setReportCardDraft(null);
  };

  const saveReportCard = async () => {
    if (!editingReportCardStudent || !reportCardDraft) return;
    setIsSavingReportCard(true);
    try {
      const res = await axios.put(`/students/${editingReportCardStudent._id}`, {
        reportCard: reportCardDraft
      });
      setData(prev => (prev || []).map(s => s._id === res.data._id ? res.data : s));
      if (selectedStudent && selectedStudent._id === res.data._id) {
        setSelectedStudent(res.data);
      }
      setActionMessage(`Report card saved successfully for ${res.data.name}!`);
      setTimeout(() => setActionMessage(''), 4000);
      closeReportCardEditor();
    } catch (err) {
      console.error('Error saving report card:', err);
      setActionMessage('Failed to save report card. Please try again.');
    } finally {
      setIsSavingReportCard(false);
    }
  };

  const getReportCardStudents = () => {
    return (data || []).filter((student) => {
      const classMatch = reportCardFilterClass === 'All' ? true : isClassMatch(student.class, reportCardFilterClass);
      const searchMatch = reportCardSearch
        ? (student.name || '').toLowerCase().includes(reportCardSearch.toLowerCase()) ||
          (student.rollNumber || '').toLowerCase().includes(reportCardSearch.toLowerCase())
        : true;
      return classMatch && searchMatch;
    });
  };

  const handlePrintSingleReportCard = async (student, examName = reportCardSelectedExam) => {
    if (!student) return;
    const cardEl = document.getElementById('report-card-editor-card') ||
                   document.getElementById('report-card-preview-modal-card') ||
                   document.getElementById(`report-card-staging-${student._id}`);

    if (!cardEl) {
      alert('Report card element not found.');
      return;
    }

    const safeName = (student.name || 'Student').replace(/\s+/g, '_');
    const safeRoll = student.rollNumber || 'Roll';
    const safeExam = (examName || reportCardSelectedExam || 'Report_Card').replace(/\s+/g, '_');
    setActionMessage(`Opening Print / Save as PDF for ${student.name} (${examName || reportCardSelectedExam})...`);

    try {
      await printElement(cardEl, `Report_Card_${safeExam}_${safeRoll}_${safeName}`);
    } catch (err) {
      console.error('Print error:', err);
      setActionMessage('Failed to open print dialog.');
    } finally {
      setActionMessage('');
    }
  };

  const handlePrintAllReportCards = async () => {
    const studentsToPrint = getReportCardStudents();
    if (studentsToPrint.length === 0) {
      alert('No students found for this class filter.');
      return;
    }

    const container = batchReportCardRef.current;
    if (!container) {
      alert('Print container not ready. Please try again.');
      return;
    }

    const safeClass = reportCardFilterClass === 'All' ? 'All_Classes' : reportCardFilterClass.replace(/\s+/g, '_');
    const safeExam = (reportCardSelectedExam || 'Examination').replace(/\s+/g, '_');
    setActionMessage(`Opening Print / Save as PDF for ${studentsToPrint.length} ${reportCardSelectedExam} Report Cards...`);

    try {
      await printElement(container, `HNP_${safeExam}_Report_Cards_${safeClass}`);
    } catch (err) {
      console.error('Print error:', err);
      setActionMessage('Failed to open print dialog.');
    } finally {
      setActionMessage('');
    }
  };

  const fetchData = async (endpoint) => {
    if (endpoint === 'students') return fetchStudents();
    if (endpoint === 'admitcard') return fetchStudents(); // Need student list for admit cards
    if (endpoint === 'reportcards') return fetchStudents(); // Need student list for report cards
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
            { id: 'reportcards', icon: Award, label: 'Report Cards' },
          ].map(tab => (
            <button
              key={tab.id}
              id={`admin-tab-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full flex items-center px-6 py-4 text-left transition-colors cursor-pointer ${activeTab === tab.id ? 'bg-blue-600 border-l-4 border-white' : 'hover:bg-slate-800'}`}
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
                  <select 
                    required 
                    className="border p-2 rounded bg-white text-slate-800" 
                    onChange={e => setNewItem({...newItem, class: e.target.value})} 
                    value={newItem.class || ''}
                  >
                    <option value="">Select Class</option>
                    {['Play Group', 'Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII'].map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
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
              <select 
                required 
                className="border p-2 rounded bg-white text-slate-800" 
                onChange={e => setNewItem({...newItem, class: e.target.value})} 
                value={newItem.class || ''}
              >
                <option value="">Select Class</option>
                {['Play Group', 'Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII'].map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
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
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdmitCardFilterClass(selectedClassFilter);
                    setActiveTab('admitcard');
                  }}
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  <Printer className="w-4 h-4 mr-2" /> Admit Cards (Print / Save)
                </button>
                <button
                  type="button"
                  onClick={openStudentForm}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" /> ADD NEW
                </button>
              </div>
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

        {!selectedStudent && !['admitcard', 'reportcards'].includes(activeTab) && <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                      {activeTab === 'students' && (
                        <button 
                          onClick={() => setPreviewAdmitCardStudent(item)} 
                          className="text-indigo-600 hover:text-indigo-900 p-2 mr-2" 
                          title="Print / Save Admit Card"
                        >
                          <Printer className="w-5 h-5 inline" />
                        </button>
                      )}
                      {activeTab === 'students' && (
                        <button 
                          onClick={() => openReportCardEditor(item)} 
                          className="text-amber-600 hover:text-amber-900 p-2 mr-2" 
                          title="Edit / View Report Card"
                        >
                          <Award className="w-5 h-5 inline" />
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
            {/* Hero Card for 1-Click Print / Save Admit Cards */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-3">
                    <Printer className="w-3.5 h-3.5" /> Examination Hub
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Print / Save All Student Admit Cards
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
                    Print or save official school admit cards as PDF for all students in one click. 
                    Includes student profile, roll number, class routine schedule, instructions, and official signatures formatted cleanly for A4 printing.
                  </p>

                  {/* Summary Badges */}
                  <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-blue-200">Total Students:</span>
                      <span className="font-bold text-white">{data.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      <span className="text-blue-200">Active Routines:</span>
                      <span className="font-bold text-white">{activeRoutines.length} Classes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span className="text-blue-200">Selected for Print / Save:</span>
                      <span className="font-bold text-emerald-300">{getAdmitCardStudents().length} Cards</span>
                    </div>
                  </div>
                </div>

                {/* Main 1-Click Action Button: Print / Save All as PDF */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={handlePrintAll}
                    disabled={getAdmitCardStudents().length === 0}
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 transition-all text-white font-extrabold shadow-lg shadow-emerald-500/30 text-base disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                  >
                    <Printer className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="leading-tight">Print / Save All as PDF</div>
                      <div className="text-[11px] font-normal text-emerald-100">
                        1-Click Ready • {getAdmitCardStudents().length} Student Cards
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-Tab Navigation: Student Admit Cards vs Routine Builder */}
            <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
              <button
                onClick={() => setActiveAdmitCardSubtab('students')}
                className={`flex items-center gap-2 py-3 px-5 border-b-2 font-bold text-sm transition-colors cursor-pointer ${
                  activeAdmitCardSubtab === 'students'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-4 h-4" /> Student Admit Cards ({getAdmitCardStudents().length})
              </button>
              <button
                onClick={() => setActiveAdmitCardSubtab('routine')}
                className={`flex items-center gap-2 py-3 px-5 border-b-2 font-bold text-sm transition-colors cursor-pointer ${
                  activeAdmitCardSubtab === 'routine'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4" /> Exam Routine Builder ({activeRoutines.length})
              </button>
            </div>

            {/* Subtab 1: Student Admit Cards */}
            {activeAdmitCardSubtab === 'students' && (
              <div className="space-y-6">
                {/* Filters Bar */}
                <div className="bg-white p-6 rounded-b-xl rounded-t-none shadow-sm border border-slate-200 -mt-6">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
                    <div className="relative w-full md:max-w-md">
                      <input
                        type="text"
                        placeholder="Search student name or roll number..."
                        value={admitCardSearch}
                        onChange={(e) => setAdmitCardSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50/50"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <span>Quick Filter:</span>
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                        {admitCardFilterClass === 'All' ? 'All Classes' : admitCardFilterClass} ({getAdmitCardStudents().length})
                      </span>
                    </div>
                  </div>

                  {/* Class Pills */}
                  <div className="flex flex-wrap gap-1.5 items-center pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-600 mr-2">Filter Class:</span>
                    {['All', 'Play Group', 'Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII'].map((cls) => {
                      const count = (data || []).filter(s => cls === 'All' ? true : isClassMatch(s.class, cls)).length;
                      return (
                        <button
                          key={cls}
                          onClick={() => setAdmitCardFilterClass(cls)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            admitCardFilterClass === cls
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {cls === 'All' ? 'All Classes' : cls} <span className="opacity-75 font-normal">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-600" />
                      Eligible Students for Admit Cards ({getAdmitCardStudents().length})
                    </h3>
                    <button
                      onClick={handlePrintAll}
                      disabled={getAdmitCardStudents().length === 0}
                      className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" /> Print / Save All ({getAdmitCardStudents().length})
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Class &amp; Roll</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Schedule</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {getAdmitCardStudents().map((student) => {
                          const routine = getStudentRoutine(student);
                          return (
                            <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden mr-3">
                                    {student.photo ? (
                                      <img src={assetUrl(student.photo)} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
                                    ) : (
                                      <span className="font-bold text-slate-500 text-xs">{student.name?.charAt(0) || 'S'}</span>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-slate-900">{student.name}</div>
                                    <div className="text-xs text-slate-500">Father: {student.parentName || '--'}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-slate-900">{student.class}</div>
                                <div className="text-xs font-mono text-slate-500 font-semibold">{student.rollNumber}</div>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                {routine ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                                    {routine.examName} ({routine.routine?.length || 0} subjects)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                                    Routine Pending
                                  </span>
                                )}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => setPreviewAdmitCardStudent(student)}
                                  className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold mr-2 transition-colors inline-flex items-center cursor-pointer"
                                  title="Preview Admit Card"
                                >
                                  <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                                </button>
                                <button
                                  onClick={() => handlePrintSingle(student)}
                                  className="text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center cursor-pointer"
                                  title="Print / Save as PDF"
                                >
                                  <Printer className="w-3.5 h-3.5 mr-1" /> Print / Save
                                </button>
                              </td>
                            </tr>
                          );
                        })}

                        {getAdmitCardStudents().length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                              No students found for this class filter or search query.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Subtab 2: Exam Routine Builder & Active Routines */}
            {activeAdmitCardSubtab === 'routine' && (
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
                            className="text-red-500 hover:text-red-700 p-2 cursor-pointer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={addRoutineRow}
                      className="mt-4 inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Subject
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                    <button 
                      onClick={saveExamRoutine}
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-bold flex items-center shadow-sm cursor-pointer"
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
                                  className="text-red-600 hover:text-red-900 font-bold ml-4 cursor-pointer"
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
        )}

        {/* Report Cards Tab */}
        {!selectedStudent && activeTab === 'reportcards' && (
          <div className="space-y-6">
            {/* Hero Card for 1-Click Print / Save Report Cards */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-amber-500/30">
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-3">
                    <Award className="w-3.5 h-3.5" /> Official Academic Evaluation
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Student Report Cards Management
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
                    View, edit, and print official Half Yearly &amp; Annual Examination Report Cards. 
                    Includes authentic Navy &amp; Gold Laurel border design, student profile, subject-wise marks, co-scholastic grading, teacher's remarks, and official school seal.
                  </p>

                  {/* Summary Badges */}
                  <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span className="text-slate-300">Exam:</span>
                      <span className="font-extrabold text-amber-300">{reportCardSelectedExam}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-slate-300">Total Students:</span>
                      <span className="font-bold text-white">{data.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      <span className="text-slate-300">Selected Class:</span>
                      <span className="font-bold text-white">{reportCardFilterClass === 'All' ? 'All Classes' : reportCardFilterClass}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      <span className="text-slate-300">Ready to Print:</span>
                      <span className="font-bold text-emerald-300">{getReportCardStudents().length} Cards</span>
                    </div>
                  </div>
                </div>

                {/* Main 1-Click Action Button: Print / Save All Report Cards as PDF */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={handlePrintAllReportCards}
                    disabled={getReportCardStudents().length === 0}
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 transition-all text-slate-950 font-black shadow-lg shadow-amber-500/30 text-base disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                  >
                    <Printer className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="leading-tight">Print / Save All as PDF</div>
                      <div className="text-[11px] font-semibold text-slate-900">
                        1-Click Ready • {getReportCardStudents().length} {reportCardSelectedExam} Cards
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Exam Selector Bar */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Active Examination</span>
                  <h3 className="text-base font-black text-slate-900">{reportCardSelectedExam}</h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 mr-1">Switch Exam Term:</span>
                {['Half Yearly Examination', 'Annual Examination', 'Periodic Test 1', 'Periodic Test 2'].map((examName) => (
                  <button
                    key={examName}
                    onClick={() => setReportCardSelectedExam(examName)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      reportCardSelectedExam === examName
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm ring-2 ring-amber-400'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {examName}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
                <div className="relative w-full md:max-w-md">
                  <input
                    type="text"
                    placeholder="Search student name or roll number..."
                    value={reportCardSearch}
                    onChange={(e) => setReportCardSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50/50"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <span>Class:</span>
                  <span className="bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                    {reportCardFilterClass === 'All' ? 'All Classes' : reportCardFilterClass} ({getReportCardStudents().length})
                  </span>
                </div>
              </div>

              {/* Class Pills */}
              <div className="flex flex-wrap gap-1.5 items-center pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-600 mr-2">Filter Class:</span>
                {['All', 'Play Group', 'Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII'].map((cls) => {
                  const count = (data || []).filter(s => cls === 'All' ? true : isClassMatch(s.class, cls)).length;
                  return (
                    <button
                      key={cls}
                      onClick={() => setReportCardFilterClass(cls)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        reportCardFilterClass === cls
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {cls === 'All' ? 'All Classes' : cls} <span className="opacity-75 font-normal">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Students Report Cards Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-sm flex items-center">
                  <Award className="w-4 h-4 mr-2 text-amber-600" />
                  Students Report Cards - {reportCardSelectedExam} ({getReportCardStudents().length})
                </h3>
                <button
                  onClick={handlePrintAllReportCards}
                  disabled={getReportCardStudents().length === 0}
                  className="inline-flex items-center text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" /> Print / Save All ({getReportCardStudents().length})
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Class &amp; Roll</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Session &amp; Exam</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {getReportCardStudents().map((student) => {
                      const studentExamRC = getDefaultReportCard(student, reportCardSelectedExam);
                      const totalObt = studentExamRC.totalObtained;
                      const totalMax = studentExamRC.totalMaxMarks || 640;
                      const percentage = studentExamRC.percentage;
                      const grade = studentExamRC.overallGrade;
                      const hasMarks = totalObt !== '' && totalObt !== null && totalObt !== undefined;

                      return (
                        <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden mr-3">
                                {student.photo ? (
                                  <img src={assetUrl(student.photo)} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
                                ) : (
                                  <span className="font-bold text-slate-500 text-xs">{student.name?.charAt(0) || 'S'}</span>
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-900">{student.name}</div>
                                <div className="text-xs text-slate-500">Father: {student.parentName || '--'}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-slate-900">{student.class}</div>
                            <div className="text-xs font-mono text-slate-500 font-semibold">{student.rollNumber}</div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs font-bold text-slate-800">{reportCardSelectedExam}</div>
                            <div className="text-[11px] text-amber-700 font-medium">Session: {studentExamRC.session || '2026-2027'}</div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {hasMarks ? (
                              <div>
                                <div className="text-xs font-bold text-slate-900">{totalObt} / {totalMax} <span className="text-emerald-700 font-extrabold ml-1">({percentage})</span></div>
                                <div className="text-[11px] font-semibold text-blue-700">Grade: {grade} • {studentExamRC.finalResult || 'PASS'}</div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                Ready to Fill (Click Edit)
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => openReportCardEditor(student, reportCardSelectedExam)}
                              className="text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg text-xs font-bold mr-2 transition-colors inline-flex items-center cursor-pointer"
                              title={`Edit ${reportCardSelectedExam} Report Card`}
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                            </button>
                            <button
                              onClick={() => openReportCardPreview(student, reportCardSelectedExam)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold mr-2 transition-colors inline-flex items-center cursor-pointer"
                              title={`Preview ${reportCardSelectedExam} Report Card`}
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                            </button>
                            <button
                              onClick={() => handlePrintSingleReportCard(student, reportCardSelectedExam)}
                              className="text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center cursor-pointer"
                              title="Print / Save as PDF"
                            >
                              <Printer className="w-3.5 h-3.5 mr-1" /> Print / Save
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {getReportCardStudents().length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                          No students found for this class filter or search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Off-screen Staging Container for Print / Save as PDF */}
      <div
        ref={batchContainerRef}
        id="admit-cards-batch-container"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '800px',
          height: 0,
          overflow: 'hidden',
          zIndex: -100,
          pointerEvents: 'none',
          opacity: 0
        }}
      >
        {getAdmitCardStudents().map((student) => {
          const routine = getStudentRoutine(student);
          return (
            <div 
              key={student._id} 
              className="admit-card-page-wrapper mb-8"
              id={`admit-card-wrapper-${student._id}`}
            >
              <AdmitCard
                id={`admit-card-staging-${student._id}`}
                student={student}
                examRoutine={routine}
              />
            </div>
          );
        })}
      </div>

      {/* Single Admit Card Preview Modal */}
      {previewAdmitCardStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[95vh] my-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Admit Card Preview</h3>
                <p className="text-xs text-slate-500">
                  {previewAdmitCardStudent.name} • Class: {previewAdmitCardStudent.class} • Roll: {previewAdmitCardStudent.rollNumber}
                </p>
              </div>
              <button 
                onClick={() => setPreviewAdmitCardStudent(null)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Rendered Admit Card */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
              <div id="admit-card-preview-modal-content">
                <AdmitCard
                  id="admit-card-preview-modal-card"
                  student={previewAdmitCardStudent}
                  examRoutine={getStudentRoutine(previewAdmitCardStudent)}
                />
              </div>
            </div>

            {/* Modal Footer: Print / Save as PDF */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-3">
              <button
                onClick={() => setPreviewAdmitCardStudent(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors text-sm cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handlePrintSingle(previewAdmitCardStudent)}
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 mr-2" /> Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Off-screen Staging Container for Batch Report Cards Print */}
      <div
        ref={batchReportCardRef}
        id="report-cards-batch-container"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '800px',
          height: 0,
          overflow: 'hidden',
          zIndex: -100,
          pointerEvents: 'none',
          opacity: 0
        }}
      >
        {getReportCardStudents().map((student) => {
          const examRc = getDefaultReportCard(student, reportCardSelectedExam);
          return (
            <div 
              key={`${student._id}-${reportCardSelectedExam}`} 
              className="report-card-page-wrapper mb-8"
              id={`report-card-wrapper-${student._id}`}
            >
              <ReportCard
                id={`report-card-staging-${student._id}`}
                student={student}
                reportCardData={examRc}
                isEditable={false}
              />
            </div>
          );
        })}
      </div>

      {/* Report Card Live Interactive Editor Modal */}
      {editingReportCardStudent && reportCardDraft && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[96vh] my-auto">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-800">Edit Student Report Card</h3>
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Interactive Live Editor
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingReportCardStudent.name} • Class: {editingReportCardStudent.class} • Roll: {editingReportCardStudent.rollNumber}
                </p>
              </div>
              <button 
                onClick={closeReportCardEditor} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Helper Banner with Exam Term Selector */}
            <div className="bg-blue-50 border-b border-blue-100 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <span className="font-bold">Exam Term:</span>
                <select
                  value={reportCardDraft.examType || reportCardSelectedExam}
                  onChange={(e) => {
                    const newExam = e.target.value;
                    const existingForExam = getDefaultReportCard(editingReportCardStudent, newExam);
                    setReportCardDraft({
                      ...existingForExam,
                      examType: newExam,
                      examTitle: newExam.toUpperCase().includes('REPORT') ? newExam.toUpperCase() : `${newExam.toUpperCase()} REPORT CARD`
                    });
                  }}
                  className="px-2.5 py-1 bg-white border border-blue-300 rounded-md font-bold text-xs text-blue-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Half Yearly Examination">Half Yearly Examination</option>
                  <option value="Annual Examination">Annual Examination</option>
                  <option value="Periodic Test 1">Periodic Test 1</option>
                  <option value="Periodic Test 2">Periodic Test 2</option>
                </select>
                <span className="text-[11px] text-blue-700 italic ml-2 hidden sm:inline">
                  (Auto-calculates totals &amp; percentages in real time)
                </span>
              </div>
              <span className="font-bold text-blue-900">
                {reportCardDraft.percentage ? `Score: ${reportCardDraft.percentage}` : ''}
              </span>
            </div>

            {/* Modal Body: Interactive ReportCard Component */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
              <ReportCard
                student={editingReportCardStudent}
                reportCardData={reportCardDraft}
                isEditable={true}
                onChange={setReportCardDraft}
                id="report-card-editor-card"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
              <button
                type="button"
                onClick={closeReportCardEditor}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePrintSingleReportCard(editingReportCardStudent, reportCardDraft.examType || reportCardDraft.examTitle || reportCardSelectedExam)}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 mr-2" /> Print / Save as PDF
                </button>
                <button
                  type="button"
                  disabled={isSavingReportCard}
                  onClick={saveReportCard}
                  className="inline-flex items-center px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingReportCard ? (
                    <>Saving Report Card...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Report Card
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Card Preview Modal */}
      {previewReportCardStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[96vh] my-auto">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  {previewReportCardData?.examType || reportCardSelectedExam} Report Card Preview
                </h3>
                <p className="text-xs text-slate-500">
                  {previewReportCardStudent.name} • Class: {previewReportCardStudent.class} • Roll: {previewReportCardStudent.rollNumber}
                </p>
              </div>
              <button 
                onClick={() => {
                  setPreviewReportCardStudent(null);
                  setPreviewReportCardData(null);
                }} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
              <ReportCard
                student={previewReportCardStudent}
                reportCardData={previewReportCardData || getDefaultReportCard(previewReportCardStudent, reportCardSelectedExam)}
                isEditable={false}
                id="report-card-preview-modal-card"
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-3">
              <button
                onClick={() => {
                  setPreviewReportCardStudent(null);
                  setPreviewReportCardData(null);
                }} 
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors text-sm cursor-pointer"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const st = previewReportCardStudent;
                    const ex = previewReportCardData?.examType || reportCardSelectedExam;
                    setPreviewReportCardStudent(null);
                    setPreviewReportCardData(null);
                    openReportCardEditor(st, ex);
                  }}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Report Card
                </button>
                <button
                  onClick={() => handlePrintSingleReportCard(previewReportCardStudent, previewReportCardData?.examType || reportCardSelectedExam)}
                  className="inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 mr-2" /> Print / Save as PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


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
