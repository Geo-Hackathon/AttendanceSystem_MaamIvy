import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    yearLevel: '1st Year',
    major: '',
    department: 'CTE',
    section: ''
  });
  const [message, setMessage] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  const departments = [
    { code: 'CTE', name: 'College of Teacher Education' },
    { code: 'CBA', name: 'College of Business and Accountancy' },
    { code: 'CLAPA', name: 'College of Liberal Arts and Public Administration' },
    { code: 'CIT', name: 'College of Information Technology' },
    { code: 'THEO', name: 'College of Theology' }
  ];

  const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  useEffect(() => {
    fetchSubjects();
  }, [filterDepartment]);

  const fetchSubjects = async () => {
    try {
      const params = filterDepartment ? `?department=${filterDepartment}` : '';
      const response = await axios.get(`/api/subjects${params}`);
      setSubjects(response.data);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await axios.put(`/api/subjects/${editingSubject.id}`, formData);
        setMessage('Subject updated successfully!');
      } else {
        await axios.post('/api/subjects', formData);
        setMessage('Subject created successfully!');
      }
      fetchSubjects();
      setShowModal(false);
      setEditingSubject(null);
      resetForm();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      await axios.delete(`/api/subjects/${id}`);
      setMessage('Subject deleted successfully!');
      fetchSubjects();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      courseCode: '',
      courseName: '',
      yearLevel: '1st Year',
      major: '',
      department: 'CTE',
      section: ''
    });
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setFormData({
      courseCode: subject.course_code,
      courseName: subject.course_name,
      yearLevel: subject.year_level,
      major: subject.major || '',
      department: subject.department,
      section: subject.section || ''
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingSubject(null);
    resetForm();
    setShowModal(true);
  };

  const getDepartmentName = (code) => {
    return departments.find(d => d.code === code)?.name || code;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Subject & Section Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage courses, sections, and departments</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Subject
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`text-sm ${message.includes('success') ? 'text-green-800' : 'text-red-800'}`}>
            {message}
          </p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Department
        </label>
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="input max-w-md"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept.code} value={dept.code}>{dept.name}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Major</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subjects.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No subjects yet
                </td>
              </tr>
            ) : (
              subjects.map(subject => (
                <tr key={subject.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-primary-600">
                    {subject.course_code}
                  </td>
                  <td className="px-6 py-4">{subject.course_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{subject.year_level}</td>
                  <td className="px-6 py-4">{subject.major || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {subject.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{subject.section || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(subject)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-primary-600" />
              <h3 className="text-xl font-bold">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    className="input"
                    placeholder="e.g., CS101"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="input"
                    required
                  >
                    {departments.map(dept => (
                      <option key={dept.code} value={dept.code}>{dept.code} - {dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name *
                </label>
                <input
                  type="text"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  className="input"
                  placeholder="e.g., Introduction to Computer Science"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year Level *
                  </label>
                  <select
                    value={formData.yearLevel}
                    onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })}
                    className="input"
                    required
                  >
                    {yearLevels.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section
                  </label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="input"
                    placeholder="e.g., A, B, 1-A"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Major/Specialization
                </label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  className="input"
                  placeholder="e.g., Computer Science, Mathematics"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSubject ? 'Update Subject' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;
