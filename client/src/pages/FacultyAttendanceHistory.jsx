import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Printer, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const FacultyAttendanceHistory = () => {
  const { user } = useAuth();
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFaculties();
  }, []);

  useEffect(() => {
    if (selectedFaculty) {
      fetchAttendanceHistory();
    }
  }, [selectedFaculty, selectedSchedule, startDate, endDate]);

  const fetchFaculties = async () => {
    try {
      const response = await axios.get('/api/faculty');
      setFaculties(response.data);
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

  const fetchAttendanceHistory = async () => {
    if (!selectedFaculty) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSchedule) params.append('scheduleId', selectedSchedule);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await axios.get(
        `/api/attendance/faculty-history/${selectedFaculty}?${params.toString()}`
      );
      
      setAttendance(response.data.attendance);
      setSchedules(response.data.schedules);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    const badges = {
      present: 'bg-green-100 text-green-800',
      late: 'bg-yellow-100 text-yellow-800',
      absent: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const selectedFacultyData = faculties.find(f => f.id === parseInt(selectedFaculty));
  const selectedScheduleData = schedules.find(s => s.id === parseInt(selectedSchedule));

  return (
    <Layout userRole={user?.role}>
      <div className="p-6">
      <div className="mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-gray-900">Faculty Attendance History</h1>
        <p className="text-gray-600 mt-2">View and print faculty attendance records by class schedule</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Faculty
            </label>
            <select
              value={selectedFaculty}
              onChange={(e) => {
                setSelectedFaculty(e.target.value);
                setSelectedSchedule('');
                setAttendance([]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- Select Faculty --</option>
              {faculties.map(faculty => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name} ({faculty.school_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Schedule (Optional)
            </label>
            <select
              value={selectedSchedule}
              onChange={(e) => setSelectedSchedule(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              disabled={!selectedFaculty}
            >
              <option value="">-- All Schedules --</option>
              {schedules.map(schedule => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.course_code} - {schedule.day_of_week} {schedule.start_time}
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
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              disabled={!selectedFaculty}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              disabled={!selectedFaculty}
            />
          </div>
        </div>

        {selectedFaculty && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={handlePrint}
              className="btn btn-primary flex items-center gap-2"
              disabled={attendance.length === 0}
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </div>
        )}
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-6">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">Faculty Attendance History Report</h1>
          <p className="text-gray-600 mt-2">Generated on {format(new Date(), 'MMMM dd, yyyy')}</p>
        </div>
        {selectedFacultyData && (
          <div className="mb-4">
            <p><strong>Faculty:</strong> {selectedFacultyData.name} ({selectedFacultyData.school_id})</p>
            {selectedScheduleData && (
              <p><strong>Class:</strong> {selectedScheduleData.course_code} - {selectedScheduleData.course_name} ({selectedScheduleData.year_level} {selectedScheduleData.section})</p>
            )}
            {startDate && <p><strong>From:</strong> {format(new Date(startDate), 'MMMM dd, yyyy')}</p>}
            {endDate && <p><strong>To:</strong> {format(new Date(endDate), 'MMMM dd, yyyy')}</p>}
          </div>
        )}
      </div>

      {/* Attendance Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading attendance history...</p>
        </div>
      ) : selectedFaculty ? (
        attendance.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(record.captured_at), 'MMM dd, yyyy hh:mm a')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.day_of_week && (
                          <>
                            {record.day_of_week}<br />
                            {record.start_time} - {record.end_time}
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.course_code && (
                          <>
                            <div className="font-medium">{record.course_code}</div>
                            <div className="text-gray-500">{record.course_name}</div>
                            <div className="text-xs text-gray-400">
                              {record.year_level} {record.section} - {record.department}
                            </div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(record.status)}`}>
                          {record.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 print:hidden">
                        {record.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{attendance.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">On Time</p>
                  <p className="text-2xl font-bold text-green-600">
                    {attendance.filter(a => a.status === 'present').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {attendance.filter(a => a.status === 'late').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Records Found</h3>
            <p className="text-gray-600">
              No attendance records found for the selected filters. Try adjusting your search criteria.
            </p>
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Faculty</h3>
          <p className="text-gray-600">
            Please select a faculty member to view their attendance history.
          </p>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          table, table * {
            visibility: visible;
          }
          .bg-white {
            background-color: white !important;
          }
          .shadow-md {
            box-shadow: none !important;
          }
        }
      `}</style>
      </div>
    </Layout>
  );
};

export default FacultyAttendanceHistory;
