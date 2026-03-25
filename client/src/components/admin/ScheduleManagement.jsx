import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    facultyId: '',
    subjectId: '',
    daysOfWeek: [],
    startTime: '',
    endTime: '',
    room: ''
  });
  const [message, setMessage] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchSchedules();
    fetchFaculty();
    fetchSubjects();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('/api/schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await axios.get('/api/faculty');
      setFaculty(response.data);
    } catch (error) {
      console.error('Failed to fetch faculty:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/api/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingSchedule && formData.daysOfWeek.length === 0) {
      setMessage('Please select at least one day');
      return;
    }
    
    try {
      if (editingSchedule) {
        await axios.put(`/api/schedules/${editingSchedule.id}`, {
          subjectId: formData.subjectId,
          dayOfWeek: formData.daysOfWeek[0],
          startTime: formData.startTime,
          endTime: formData.endTime,
          room: formData.room
        });
        setMessage('Schedule updated successfully!');
      } else {
        await axios.post('/api/schedules', formData);
        setMessage(`Schedule created for ${formData.daysOfWeek.length} day(s) successfully!`);
      }
      fetchSchedules();
      setShowModal(false);
      setEditingSchedule(null);
      resetForm();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      await axios.delete(`/api/schedules/${id}`);
      setMessage('Schedule deleted successfully!');
      fetchSchedules();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Delete failed');
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const resetForm = () => {
    setFormData({
      facultyId: '',
      subjectId: '',
      daysOfWeek: [],
      startTime: '',
      endTime: '',
      room: ''
    });
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  const openEditModal = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      facultyId: schedule.faculty_id,
      subjectId: schedule.subject_id,
      daysOfWeek: [schedule.day_of_week],
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      room: schedule.room || ''
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingSchedule(null);
    resetForm();
    setShowModal(true);
  };

  // Group schedules by faculty, subject, time, room, and section
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const key = `${schedule.faculty_id}-${schedule.subject_id}-${schedule.start_time}-${schedule.end_time}-${schedule.room || 'none'}-${schedule.section || 'none'}`;
    
    if (!acc[key]) {
      acc[key] = {
        ...schedule,
        days: [schedule.day_of_week],
        scheduleIds: [schedule.id]
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Class Schedules</h2>
        <button onClick={openAddModal} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Schedule
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`text-sm ${message.includes('success') ? 'text-green-800' : 'text-red-800'}`}>
            {message}
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year/Section</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {groupedScheduleArray.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No schedules yet
                </td>
              </tr>
            ) : (
              groupedScheduleArray.map((group, index) => (
                <tr key={`group-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium">{group.faculty_name}</div>
                      <div className="text-sm text-gray-500">{group.school_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{group.course_code}</div>
                      <div className="text-sm text-gray-600">{group.course_name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">{group.department}</span>
                        {group.major && <span className="ml-1 text-gray-600">• {group.major}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{group.year_level}</div>
                    {group.section && <div className="text-xs text-gray-500">Sec: {group.section}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {group.days.map(day => (
                        <span
                          key={day}
                          className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded"
                        >
                          {day.substring(0, 3)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatTime(group.start_time)} - {formatTime(group.end_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{group.room || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(group)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete all ${group.days.length} schedule(s) for this class?`)) return;
                          try {
                            await Promise.all(group.scheduleIds.map(id => axios.delete(`/api/schedules/${id}`)));
                            setMessage('Schedule(s) deleted successfully!');
                            fetchSchedules();
                            setTimeout(() => setMessage(''), 3000);
                          } catch (error) {
                            setMessage('Delete failed');
                          }
                        }}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faculty
                </label>
                <select
                  value={formData.facultyId}
                  onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Faculty</option>
                  {faculty.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.school_id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.course_code} - {subject.course_name} 
                      ({subject.year_level}, {subject.department}
                      {subject.section ? `, Sec ${subject.section}` : ''})
                    </option>
                  ))}
                </select>
                {subjects.length === 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    No subjects available. Please add subjects first in the "Subjects & Sections" tab.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days of Week {!editingSchedule && <span className="text-xs text-gray-500">(Select multiple)</span>}
                </label>
                {editingSchedule ? (
                  <select
                    value={formData.daysOfWeek[0] || ''}
                    onChange={(e) => setFormData({ ...formData, daysOfWeek: [e.target.value] })}
                    className="input"
                    required
                  >
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 gap-2 p-3 border border-gray-300 rounded-lg">
                    {daysOfWeek.map(day => (
                      <label key={day} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={formData.daysOfWeek.includes(day)}
                          onChange={() => toggleDay(day)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                )}
                {!editingSchedule && formData.daysOfWeek.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">Please select at least one day</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room (Optional)
                </label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="input"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSchedule ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;
