import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Plus, UserPlus, UserMinus, Search, CheckSquare, Upload, Download, ChevronDown, ChevronRight, Users } from 'lucide-react';

const MyClass = () => {
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  const [expandedClass, setExpandedClass] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    yearLevel: '1st Year',
    department: 'CIT',
    major: '',
    section: ''
  });
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  useEffect(() => {
    fetchSchedules();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedSchedule) {
      fetchEnrolledStudents(selectedSchedule);
    }
  }, [selectedSchedule]);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('/api/schedules/my-schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchEnrolledStudents = async (scheduleId) => {
    try {
      const response = await axios.get(`/api/students/schedule/${scheduleId}`);
      setEnrolledStudents(response.data);
      setAttendanceRecords(response.data.map(s => ({
        studentId: s.id,
        status: 'present',
        notes: ''
      })));
    } catch (error) {
      console.error('Failed to fetch enrolled students:', error);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/students', formData);
      setMessage('Student added successfully!');
      setShowAddModal(false);
      fetchStudents();
      resetForm();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add student');
    }
  };

  const handleEnrollStudent = async (studentId) => {
    if (!selectedSchedule) {
      setMessage('Please select a class first');
      return;
    }

    try {
      await axios.post('/api/students/enroll', {
        studentId,
        scheduleId: selectedSchedule
      });
      setMessage('Student enrolled successfully!');
      fetchEnrolledStudents(selectedSchedule);
      setShowEnrollModal(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to enroll student');
    }
  };

  const handleDropStudent = async (studentId) => {
    if (!confirm('Drop this student from the class?')) return;

    try {
      await axios.post('/api/students/drop', {
        studentId,
        scheduleId: selectedSchedule
      });
      setMessage('Student dropped successfully!');
      fetchEnrolledStudents(selectedSchedule);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to drop student');
    }
  };

  const handleRecordAttendance = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/student-attendance/record', {
        scheduleId: selectedSchedule,
        attendanceRecords
      });
      setMessage(`Attendance recorded for ${attendanceRecords.length} students!`);
      setShowAttendanceModal(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to record attendance');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setMessage('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const response = await axios.post('/api/students/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUploadResults(response.data.results);
      setMessage(response.data.message);
      fetchStudents();
      setUploadFile(null);
      
      if (response.data.results.failed === 0) {
        setTimeout(() => {
          setShowBulkUploadModal(false);
          setUploadResults(null);
        }, 3000);
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to upload file');
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Student ID,First Name,Last Name,Email,Year Level,Department,Major,Section
2021-001,Juan,Dela Cruz,juan.delacruz@example.com,1st Year,CIT,Information Technology,A
2021-002,Maria,Santos,maria.santos@example.com,2nd Year,CBA,Business Administration,B
2021-003,Pedro,Reyes,pedro.reyes@example.com,3rd Year,CTE,Education,C`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student-upload-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const updateAttendanceStatus = (studentId, status) => {
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.studentId === studentId ? { ...record, status } : record
      )
    );
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      firstName: '',
      lastName: '',
      email: '',
      yearLevel: '1st Year',
      department: 'CIT',
      major: '',
      section: ''
    });
  };

  const filteredStudents = students.filter(s => {
    const isEnrolled = enrolledStudents.find(es => es.id === s.id);
    return !isEnrolled;
  }).filter(s =>
    s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleClassExpand = (scheduleId) => {
    if (expandedClass === scheduleId) {
      setExpandedClass(null);
      setSelectedSchedule(null);
      setEnrolledStudents([]);
    } else {
      setExpandedClass(scheduleId);
      setSelectedSchedule(scheduleId);
    }
  };

  // Group schedules by course code, time, and room
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const key = `${schedule.subject_id}-${schedule.start_time}-${schedule.end_time}-${schedule.room || 'none'}`;
    
    if (!acc[key]) {
      acc[key] = {
        ...schedule,
        days: [schedule.day_of_week],
        scheduleIds: [schedule.id],
        // Use the first schedule's ID as the group ID
        groupId: schedule.id
      };
    } else {
      acc[key].days.push(schedule.day_of_week);
      acc[key].scheduleIds.push(schedule.id);
    }
    
    return acc;
  }, {});

  const groupedScheduleArray = Object.values(groupedSchedules);

  // Sort days in proper order
  const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7 };
  groupedScheduleArray.forEach(group => {
    group.days.sort((a, b) => dayOrder[a] - dayOrder[b]);
  });

  return (
    <Layout userRole="faculty">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
            <p className="text-gray-600 mt-1">Manage your classes and enrolled students</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkUploadModal(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Bulk Upload
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Student
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('success') || message.includes('recorded') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm ${message.includes('success') || message.includes('recorded') ? 'text-green-800' : 'text-red-800'}`}>
              {message}
            </p>
          </div>
        )}

        {/* Classes List */}
        <div className="space-y-4">
          {groupedScheduleArray.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">No classes assigned yet</p>
            </div>
          ) : (
            groupedScheduleArray.map(group => (
              <div key={group.groupId} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Class Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleClassExpand(group.groupId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedClass === group.groupId ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {group.course_code} - {group.course_name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 flex-wrap">
                          <div className="flex gap-1">
                            {group.days.map(day => (
                              <span
                                key={day}
                                className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded"
                              >
                                {day.substring(0, 3)}
                              </span>
                            ))}
                          </div>
                          <span>•</span>
                          <span>{group.start_time} - {group.end_time}</span>
                          <span>•</span>
                          <span>{group.year_level}</span>
                          {group.section && (
                            <>
                              <span>•</span>
                              <span>Section {group.section}</span>
                            </>
                          )}
                          {group.room && (
                            <>
                              <span>•</span>
                              <span>Room {group.room}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {enrolledStudents.length > 0 && selectedSchedule === group.groupId
                          ? enrolledStudents.length
                          : '...'} students
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Class Content */}
                {expandedClass === group.groupId && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEnrollModal(true);
                        }}
                        className="btn btn-primary btn-sm flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Enroll Student
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAttendanceModal(true);
                        }}
                        className="btn btn-secondary btn-sm flex items-center gap-2"
                        disabled={enrolledStudents.length === 0}
                      >
                        <CheckSquare className="w-4 h-4" />
                        Take Attendance
                      </button>
                    </div>

                    {/* Enrolled Students List */}
                    {enrolledStudents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No students enrolled yet</p>
                        <p className="text-sm mt-1">Click "Enroll Student" to add students to this class</p>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year Level</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {enrolledStudents.map(student => (
                              <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm">{student.student_id}</td>
                                <td className="px-4 py-3">
                                  <div className="font-medium">{student.first_name} {student.last_name}</div>
                                  {student.email && <div className="text-xs text-gray-500">{student.email}</div>}
                                </td>
                                <td className="px-4 py-3 text-sm">{student.year_level}</td>
                                <td className="px-4 py-3 text-sm">{student.section || 'N/A'}</td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDropStudent(student.id);
                                    }}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                  >
                                    Drop
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Student Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Add New Student</h3>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student ID *</label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year Level *</label>
                    <select
                      value={formData.yearLevel}
                      onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })}
                      className="input"
                      required
                    >
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="input"
                      required
                    >
                      <option>CIT</option>
                      <option>CBA</option>
                      <option>CTE</option>
                      <option>CLAPA</option>
                      <option>THEO</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Major</label>
                    <input
                      type="text"
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                    <input
                      type="text"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enroll Student Modal */}
        {showEnrollModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Enroll Student</h3>
              
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No students available to enroll</p>
                ) : (
                  filteredStudents.map(student => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{student.first_name} {student.last_name}</p>
                        <p className="text-sm text-gray-600">
                          {student.student_id} • {student.year_level} {student.section && `- ${student.section}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleEnrollStudent(student.id)}
                        className="btn btn-primary btn-sm"
                      >
                        Enroll
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end pt-4 mt-4 border-t">
                <button
                  onClick={() => {
                    setShowEnrollModal(false);
                    setSearchTerm('');
                  }}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Modal */}
        {showAttendanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Take Attendance</h3>
              <form onSubmit={handleRecordAttendance}>
                <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                  {enrolledStudents.map(student => {
                    const record = attendanceRecords.find(r => r.studentId === student.id);
                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium">{student.first_name} {student.last_name}</p>
                          <p className="text-sm text-gray-600">{student.student_id}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => updateAttendanceStatus(student.id, 'present')}
                            className={`px-3 py-1.5 text-sm font-medium rounded ${
                              record?.status === 'present'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => updateAttendanceStatus(student.id, 'late')}
                            className={`px-3 py-1.5 text-sm font-medium rounded ${
                              record?.status === 'late'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => updateAttendanceStatus(student.id, 'absent')}
                            className={`px-3 py-1.5 text-sm font-medium rounded ${
                              record?.status === 'absent'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => updateAttendanceStatus(student.id, 'excused')}
                            className={`px-3 py-1.5 text-sm font-medium rounded ${
                              record?.status === 'excused'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAttendanceModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Attendance
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Upload Modal */}
        {showBulkUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Bulk Upload Students</h3>
              
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Instructions:</strong>
                </p>
                <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                  <li>Download the template file below</li>
                  <li>Fill in student information (Excel or CSV format)</li>
                  <li>Required fields: Student ID, First Name, Last Name, Year Level, Department</li>
                  <li>Valid Year Levels: 1st Year, 2nd Year, 3rd Year, 4th Year</li>
                  <li>Valid Departments: CTE, CBA, CLAPA, CIT, THEO</li>
                  <li>Upload the completed file</li>
                </ul>
              </div>

              <button
                onClick={downloadTemplate}
                className="btn btn-secondary flex items-center gap-2 mb-4"
              >
                <Download className="w-5 h-5" />
                Download Template
              </button>

              <form onSubmit={handleBulkUpload}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File (Excel or CSV)
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {uploadFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {uploadFile.name}
                    </p>
                  )}
                </div>

                {uploadResults && (
                  <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold mb-2">Upload Results:</h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-green-600 font-semibold">✓ Success: {uploadResults.success}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-red-600 font-semibold">✗ Failed: {uploadResults.failed}</span>
                      </p>
                      
                      {uploadResults.errors.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-semibold mb-2">Errors:</p>
                          <div className="max-h-40 overflow-y-auto space-y-2">
                            {uploadResults.errors.map((error, index) => (
                              <div key={index} className="text-xs bg-red-50 p-2 rounded">
                                <p className="font-semibold text-red-800">Row {error.row}: {error.error}</p>
                                {error.data && (
                                  <p className="text-red-600 mt-1">
                                    Data: {JSON.stringify(error.data)}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkUploadModal(false);
                      setUploadFile(null);
                      setUploadResults(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Close
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!uploadFile}
                  >
                    Upload Students
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyClass;
