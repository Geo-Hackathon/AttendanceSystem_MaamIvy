import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Search, Filter } from 'lucide-react';

const AttendanceMonitoring = () => {
  const [attendance, setAttendance] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [filters, setFilters] = useState({
    facultyId: '',
    startDate: '',
    endDate: '',
    status: ''
  });

  useEffect(() => {
    fetchFaculty();
    fetchAttendance();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await axios.get('/api/faculty');
      setFaculty(response.data);
    } catch (error) {
      console.error('Failed to fetch faculty:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.facultyId) params.append('facultyId', filters.facultyId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);

      const response = await axios.get(`/api/attendance?${params.toString()}`);
      setAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    fetchAttendance();
  };

  const clearFilters = () => {
    setFilters({
      facultyId: '',
      startDate: '',
      endDate: '',
      status: ''
    });
    setTimeout(() => fetchAttendance(), 100);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Attendance Monitoring</h2>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Faculty
            </label>
            <select
              value={filters.facultyId}
              onChange={(e) => handleFilterChange('facultyId', e.target.value)}
              className="input"
            >
              <option value="">All Faculty</option>
              {faculty.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.school_id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input"
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={applyFilters}
            className="btn btn-primary flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {attendance.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No attendance records found
                </td>
              </tr>
            ) : (
              attendance.map(record => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium">{record.faculty_name}</div>
                      <div className="text-sm text-gray-500">{record.school_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {record.course_code ? (
                      <div>
                        <div className="font-medium">{record.course_code}</div>
                        <div className="text-sm text-gray-600">{record.course_name}</div>
                        {record.section && <div className="text-xs text-gray-500">Sec: {record.section}</div>}
                      </div>
                    ) : (
                      <span className="text-gray-400">No schedule</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {format(new Date(record.captured_at), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      record.status === 'present' 
                        ? 'bg-green-100 text-green-800' 
                        : record.status === 'late'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {record.image_path && record.status !== 'absent' ? (
                      <img
                        src={`/${record.image_path}`}
                        alt="Attendance"
                        className="w-16 h-16 object-cover rounded cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => window.open(`/${record.image_path}`, '_blank')}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-400">No photo</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {record.notes || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Showing {attendance.length} record{attendance.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default AttendanceMonitoring;
