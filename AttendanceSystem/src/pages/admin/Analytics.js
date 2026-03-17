import React, { useState, useEffect } from 'react';
import { getUsers, getSchedules, getAttendance } from '../../firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFaculty();
    // Set default date range to current week
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    setStartDate(startOfWeek.toISOString().split('T')[0]);
    setEndDate(endOfWeek.toISOString().split('T')[0]);
  }, []);

  const fetchFaculty = async () => {
    try {
      const result = await getUsers('faculty');
      if (result.success) {
        setFaculty(result.data);
        if (result.data.length > 0) {
          setSelectedFaculty(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const generateAnalytics = async () => {
    if (!selectedFaculty || !startDate || !endDate) {
      setError('Please select faculty and date range');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [attendanceResult, schedulesResult] = await Promise.all([
        getAttendance(selectedFaculty, new Date(startDate), new Date(endDate)),
        getSchedules(selectedFaculty)
      ]);

      if (!attendanceResult.success || !schedulesResult.success) {
        setError('Failed to fetch data');
        return;
      }

      const attendance = attendanceResult.data;
      const schedules = schedulesResult.data;

      // Generate daily analytics
      const dailyData = generateDailyAnalytics(attendance, schedules, startDate, endDate);
      
      // Generate summary statistics
      const summary = generateSummary(attendance, schedules);

      setAnalyticsData({
        daily: dailyData,
        summary: summary,
        attendance: attendance,
        schedules: schedules
      });
    } catch (error) {
      console.error('Error generating analytics:', error);
      setError('Failed to generate analytics');
    } finally {
      setLoading(false);
    }
  };

  const generateDailyAnalytics = (attendance, schedules, startDate, endDate) => {
    const dailyData = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
      
      // Get schedules for this day
      const daySchedules = schedules.filter(schedule => schedule.dayOfWeek === dayOfWeek);
      
      // Get attendance for this date
      const dayAttendance = attendance.filter(record => {
        const recordDate = record.timestamp?.toDate?.();
        return recordDate && recordDate.toISOString().split('T')[0] === dateStr;
      });

      // Calculate attendance for each schedule
      let attended = 0;
      let missed = 0;

      daySchedules.forEach(schedule => {
        const hasAttendance = dayAttendance.some(record => 
          record.scheduleId === schedule.id || 
          isAttendanceWithinTimeWindow(record, schedule)
        );
        
        if (hasAttendance) {
          attended++;
        } else {
          // Only count as missed if the class time has passed
          const scheduleEndTime = new Date(dateStr + 'T' + schedule.endTime);
          if (new Date() > scheduleEndTime) {
            missed++;
          }
        }
      });

      dailyData.push({
        date: date.toLocaleDateString(),
        day: dayOfWeek,
        total: daySchedules.length,
        attended: attended,
        missed: missed,
        percentage: daySchedules.length > 0 ? Math.round((attended / daySchedules.length) * 100) : 0
      });
    }

    return dailyData;
  };

  const isAttendanceWithinTimeWindow = (attendanceRecord, schedule, toleranceMinutes = 15) => {
    const attendanceTime = attendanceRecord.timestamp?.toDate?.();
    if (!attendanceTime) return false;

    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);

    const scheduleStart = new Date(attendanceTime);
    scheduleStart.setHours(startHour, startMinute, 0, 0);

    const scheduleEnd = new Date(attendanceTime);
    scheduleEnd.setHours(endHour, endMinute, 0, 0);

    // Allow attendance within tolerance minutes before start time
    const allowedStart = new Date(scheduleStart.getTime() - toleranceMinutes * 60 * 1000);

    return attendanceTime >= allowedStart && attendanceTime <= scheduleEnd;
  };

  const generateSummary = (attendance, schedules) => {
    const totalClasses = schedules.length;
    const totalAttended = attendance.length;
    const attendanceRate = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

    return {
      totalClasses,
      totalAttended,
      attendanceRate,
      uniqueDays: new Set(attendance.map(a => a.timestamp?.toDate?.()?.toDateString())).size
    };
  };

  useEffect(() => {
    if (selectedFaculty && startDate && endDate) {
      generateAnalytics();
    }
  }, [selectedFaculty]);

  const getFacultyName = (facultyId) => {
    const facultyMember = faculty.find(f => f.id === facultyId);
    return facultyMember ? facultyMember.name : 'Unknown';
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Attendance Analytics
        </h3>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="faculty" className="block text-sm font-medium text-gray-700 mb-2">
                Select Faculty
              </label>
              <select
                id="faculty"
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {faculty.map((facultyMember) => (
                  <option key={facultyMember.id} value={facultyMember.id}>
                    {facultyMember.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={generateAnalytics}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {analyticsData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-500">Total Classes</h4>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalClasses}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-500">Classes Attended</h4>
              <p className="text-2xl font-bold text-green-600">{analyticsData.summary.totalAttended}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-500">Attendance Rate</h4>
              <p className="text-2xl font-bold text-blue-600">{analyticsData.summary.attendanceRate}%</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-500">Active Days</h4>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.uniqueDays}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Daily Attendance Chart</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attended" fill="#10b981" name="Attended" />
                <Bar dataKey="missed" fill="#ef4444" name="Missed" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-medium text-gray-900">
                Detailed Attendance Report - {getFacultyName(selectedFaculty)}
              </h4>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Classes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attended
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Missed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.daily.map((day, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {day.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {day.day}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {day.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {day.attended}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {day.missed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        day.percentage >= 80 ? 'bg-green-100 text-green-800' :
                        day.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {day.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
