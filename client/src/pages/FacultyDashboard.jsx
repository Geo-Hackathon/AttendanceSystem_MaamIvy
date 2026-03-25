import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import CameraCapture from '../components/CameraCapture';
import { Camera, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const FacultyDashboard = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSchedules();
    fetchAttendance();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('/api/schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await axios.get('/api/attendance');
      setAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  const handleCaptureComplete = async (imageBlob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', imageBlob, 'attendance.jpg');
      if (selectedSchedule) {
        formData.append('scheduleId', selectedSchedule.id);
      }

      await axios.post('/api/attendance/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('Attendance submitted successfully!');
      setShowCamera(false);
      setSelectedSchedule(null);
      fetchAttendance();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to submit attendance');
    } finally {
      setLoading(false);
    }
  };

  const getTodaySchedules = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return schedules.filter(s => s.day_of_week === today);
  };

  const todaySchedules = getTodaySchedules();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm ${message.includes('success') ? 'text-green-800' : 'text-red-800'}`}>
              {message}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Attendance</p>
                <p className="text-2xl font-bold">{attendance.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Classes Today</p>
                <p className="text-2xl font-bold">{todaySchedules.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold">
                  {attendance.filter(a => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(a.captured_at) > weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Submit Attendance</h2>
              <button
                onClick={() => setShowCamera(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Capture Photo
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Today's Schedule</h3>
              {todaySchedules.length === 0 ? (
                <p className="text-gray-500">No classes scheduled for today</p>
              ) : (
                <div className="space-y-2">
                  {todaySchedules.map(schedule => (
                    <div
                      key={schedule.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setShowCamera(true);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{schedule.subject}</p>
                          <p className="text-sm text-gray-600">
                            {schedule.start_time} - {schedule.end_time}
                          </p>
                          {schedule.room && (
                            <p className="text-sm text-gray-600">Room: {schedule.room}</p>
                          )}
                        </div>
                        <Camera className="w-5 h-5 text-primary-600" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-6">My Schedule</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {schedules.length === 0 ? (
                <p className="text-gray-500">No schedules assigned</p>
              ) : (
                schedules.map(schedule => (
                  <div key={schedule.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{schedule.subject}</p>
                        <p className="text-sm text-gray-600">{schedule.day_of_week}</p>
                        <p className="text-sm text-gray-600">
                          {schedule.start_time} - {schedule.end_time}
                        </p>
                        {schedule.room && (
                          <p className="text-sm text-gray-600">Room: {schedule.room}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="card mt-6">
          <h2 className="text-xl font-bold mb-6">Attendance History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No attendance records yet
                    </td>
                  </tr>
                ) : (
                  attendance.slice(0, 10).map(record => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {format(new Date(record.captured_at), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 text-sm">{record.subject || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'present' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <img
                          src={`/${record.image_path}`}
                          alt="Attendance"
                          className="w-16 h-16 object-cover rounded cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => window.open(`/${record.image_path}`, '_blank')}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleCaptureComplete}
          onCancel={() => {
            setShowCamera(false);
            setSelectedSchedule(null);
          }}
        />
      )}
    </div>
  );
};

export default FacultyDashboard;
