import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { motion } from 'framer-motion';
import { Users, FileText, Image as ImageIcon, MessageSquare, Plus, Trash2, Edit2, Eye, X, BookOpen, Search, UserPlus } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('notices');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Marks Management State
  const [marksModalStudent, setMarksModalStudent] = useState(null);
  const [marksData, setMarksData] = useState([]);

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
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditingId(item._id);
    setNewItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setNewItem({});
  };

  const handleAcceptAdmission = async (admission) => {
    setActiveTab('students');
    setIsEditing(false);
    
    let photoFile = null;
    if (admission.photo) {
      try {
        const response = await fetch(`http://localhost:5001${admission.photo}`);
        const blob = await response.blob();
        const filename = admission.photo.split('/').pop();
        photoFile = new File([blob], filename, { type: blob.type });
      } catch (err) {
        console.error("Failed to load photo", err);
      }
    }

    setNewItem({
      name: admission.studentName,
      class: admission.classApplying,
      parentName: admission.parentName,
      phone: admission.phone,
      email: admission.email,
      address: admission.address,
      dateOfBirth: admission.dateOfBirth,
      photo: admission.photo,
      photoFile: photoFile,
      rollNumber: Math.floor(Math.random() * 10000) + 1,
      admissionDate: new Date().toISOString().split('T')[0]
    });
    
    setTimeout(() => {
      const fileInput = document.getElementById('studentPhotoInput');
      if (fileInput && photoFile) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(photoFile);
        fileInput.files = dataTransfer.files;
      }
    }, 100);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      fetchData(activeTab);
    } catch (error) {
      console.error(error);
    }
  };

  const openMarksModal = (student) => {
    setMarksModalStudent(student);
    setMarksData(student.marks && student.marks.length > 0 ? [...student.marks] : []);
  };

  const closeMarksModal = () => {
    setMarksModalStudent(null);
    setMarksData([]);
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

      await axios.put(`/students/${marksModalStudent._id}`, { 
        marks: marksData,
        result: resultStr 
      });
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
          <h1 className="text-3xl font-bold text-slate-800 capitalize">{activeTab} Management</h1>
        </div>

        {/* Add New Form (simplified for Notices, Teachers, Gallery, Students) */}
        {['notices', 'teachers', 'gallery', 'students'].includes(activeTab) && (
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

        {/* Data Table */}
        {activeTab === 'students' && (
          <div className="mb-6 space-y-4">
            <div className="flex items-center">
              <div className="relative w-full md:w-1/3">
                <input 
                  type="text" 
                  placeholder="Search student name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
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

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                            <img className="h-10 w-10 rounded-full object-cover border border-slate-200" src={`http://localhost:5001${item.photo || item.image}`} alt="Avatar" />
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
                        <button onClick={() => setViewItem(item)} className="text-emerald-600 hover:text-emerald-900 p-2 mr-2" title="View Details">
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
        </div>
      </div>

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
