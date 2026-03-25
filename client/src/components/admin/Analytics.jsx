import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, TrendingUp } from 'lucide-react';

const Analytics = () => {
  const [period, setPeriod] = useState('weekly');
  const [analytics, setAnalytics] = useState({ facultyStats: [], dailyStats: [] });
  const [absenceStats, setAbsenceStats] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [loading, setLoading] = useState(false);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  useEffect(() => {
    fetchFaculty();
    fetchAnalytics();
    fetchAbsenceStats();
  }, [period, selectedFaculty]);

  const fetchFaculty = async () => {
    try {
      const response = await axios.get('/api/faculty');
      setFaculty(response.data);
    } catch (error) {
      console.error('Failed to fetch faculty:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams({ period });
      if (selectedFaculty) params.append('facultyId', selectedFaculty);
      
      const response = await axios.get(`/api/attendance/analytics?${params.toString()}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchAbsenceStats = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedFaculty) params.append('facultyId', selectedFaculty);
      
      const response = await axios.get(`/api/absences/stats?${params.toString()}`);
      setAbsenceStats(response.data);
    } catch (error) {
      console.error('Failed to fetch absence stats:', error);
    }
  };

  const downloadCSV = () => {
    setLoading(true);
    try {
      // Prepare CSV data
      let csvContent = 'Faculty Attendance Report\n';
      csvContent += `Generated: ${new Date().toLocaleString()}\n`;
      csvContent += `Period: ${period === 'weekly' ? 'Last 7 Days' : 'Last 30 Days'}\n\n`;
      
      // Faculty Attendance Summary
      csvContent += 'Faculty Attendance Summary\n';
      csvContent += 'Faculty Name,School ID,Total Classes,Total Attendance,On Time,Late,Attendance Rate\n';
      
      analytics.facultyStats.forEach(stat => {
        const rate = calculateAttendanceRate(stat);
        csvContent += `"${stat.name}",${stat.school_id},${stat.total_schedules},${stat.total_attendance},${stat.on_time},${stat.late},${rate}%\n`;
      });
      
      csvContent += '\n\nAbsence Report\n';
      csvContent += 'Faculty Name,School ID,Present,Late,Absent,Total Records,Attendance Rate\n';
      
      absenceStats.forEach(stat => {
        const attendanceRate = stat.total_records > 0 
          ? Math.round(((stat.present + stat.late) / stat.total_records) * 100) 
          : 0;
        csvContent += `"${stat.faculty_name}",${stat.school_id},${stat.present},${stat.late},${stat.absences},${stat.total_records},${attendanceRate}%\n`;
      });
      
      // Create and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download CSV:', error);
      alert('Failed to generate CSV report');
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendanceRate = (stats) => {
    if (!stats.total_schedules || stats.total_schedules === 0) return 0;
    return ((stats.total_attendance / stats.total_schedules) * 100).toFixed(1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Analytics & Reports</h2>
        <button
          onClick={downloadCSV}
          disabled={loading}
          className="btn btn-primary flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          {loading ? 'Generating...' : 'Download CSV Report'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Period
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input"
          >
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Faculty Filter
          </label>
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Faculty</p>
              <p className="text-3xl font-bold text-blue-700">
                {analytics.facultyStats.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Present</p>
              <p className="text-3xl font-bold text-green-700">
                {absenceStats.reduce((sum, s) => sum + s.present, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Late</p>
              <p className="text-3xl font-bold text-yellow-700">
                {absenceStats.reduce((sum, s) => sum + s.late, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500 rounded-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Absent</p>
              <p className="text-3xl font-bold text-red-700">
                {absenceStats.reduce((sum, s) => sum + s.absences, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Statistics Summary */}
      <div className="card mb-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="text-lg font-bold mb-4">Overall Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-700">
              {analytics.facultyStats.reduce((sum, s) => sum + (s.total_schedules || 0), 0)}
            </p>
            <p className="text-xs text-gray-600 mt-1">Total Scheduled Classes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-700">
              {analytics.facultyStats.reduce((sum, s) => sum + (s.total_attendance || 0), 0)}
            </p>
            <p className="text-xs text-gray-600 mt-1">Total Attendance Submitted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-700">
              {analytics.facultyStats.reduce((sum, s) => sum + (s.on_time || 0), 0)}
            </p>
            <p className="text-xs text-gray-600 mt-1">Present Records</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-700">
              {(() => {
                const totalSchedules = analytics.facultyStats.reduce((sum, s) => sum + (s.total_schedules || 0), 0);
                const totalAttendance = analytics.facultyStats.reduce((sum, s) => sum + (s.total_attendance || 0), 0);
                return totalSchedules > 0 ? ((totalAttendance / totalSchedules) * 100).toFixed(1) : 0;
              })()}%
            </p>
            <p className="text-xs text-gray-600 mt-1">Overall Attendance Rate</p>
          </div>
        </div>
      </div>

      {analytics.dailyStats.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-4">Daily Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="on_time" fill="#10b981" name="On Time" />
              <Bar dataKey="late" fill="#f59e0b" name="Late" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        <h3 className="text-xl font-bold mb-4">Faculty Attendance Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Classes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule Days</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attendance</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Present</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Late</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.facultyStats.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No data available for selected period
                  </td>
                </tr>
              ) : (
                analytics.facultyStats.map(stat => {
                  // Parse schedule breakdown (format: "Monday:3|Tuesday:2|Wednesday:1")
                  const scheduleBreakdown = stat.schedule_breakdown 
                    ? stat.schedule_breakdown.split('|').map(item => {
                        const [day, count] = item.split(':');
                        return { day, count: parseInt(count) };
                      })
                    : [];
                  
                  return (
                    <tr key={stat.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">{stat.name}</div>
                          <div className="text-sm text-gray-500">{stat.school_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2 py-1 text-sm font-semibold rounded bg-purple-100 text-purple-800">
                          {stat.total_schedules || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {scheduleBreakdown.length > 0 ? (
                          <div className="space-y-1">
                            {scheduleBreakdown.map(({ day, count }) => (
                              <div key={day} className="text-sm">
                                <span className="font-medium text-gray-700">{day}:</span>{' '}
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                  count >= 3 ? 'bg-orange-100 text-orange-800' :
                                  count >= 2 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {count} {count === 1 ? 'Class' : 'Classes'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No schedule</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-semibold">{stat.total_attendance || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {stat.on_time || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {stat.late || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${calculateAttendanceRate(stat)}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold">
                            {calculateAttendanceRate(stat)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Absence Statistics */}
      <div className="card mt-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-red-600">⚠️</span> Absence Report
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Records</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {absenceStats.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No absence data available
                  </td>
                </tr>
              ) : (
                absenceStats.map(stat => {
                  const attendanceRate = stat.total_records > 0 
                    ? Math.round(((stat.present + stat.late) / stat.total_records) * 100) 
                    : 0;
                  
                  return (
                    <tr key={stat.faculty_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">{stat.faculty_name}</div>
                          <div className="text-sm text-gray-500">{stat.school_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {stat.present}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {stat.late}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          {stat.absences}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">
                        {stat.total_records}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                attendanceRate >= 90 ? 'bg-green-500' :
                                attendanceRate >= 75 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${attendanceRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold">
                            {attendanceRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
