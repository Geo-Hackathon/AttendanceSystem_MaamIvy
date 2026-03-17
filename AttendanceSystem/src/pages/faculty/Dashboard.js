import React, { useState, useEffect } from 'react';
import { getSchedules, getAttendance } from '../../firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import CameraModal from '../../components/CameraModal';

const FacultyDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { currentUser } = useAuth();

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = daysOfWeek[new Date().getDay()];

  useEffect(() => {
    fetchTodaySchedules();
    fetchTodayAttendance();
  }, []);

  const fetchTodaySchedules = async () => {
    try {
      const result = await getSchedules(currentUser.uid);
      if (result.success) {
        const todaySchedules = result.data.filter(schedule => schedule.dayOfWeek === today);
        setSchedules(todaySchedules);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const result = await getAttendance(currentUser.uid, today, tomorrow);
      if (result.success) {
        setAttendance(result.data);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleMarkAttendance = (schedule) => {
    setSelectedSchedule(schedule);
    setShowCamera(true);
  };

  const handleCameraCapture = async (photoUrl) => {
    try {
      const result = await getAttendance(currentUser.uid);
      if (result.success) {
        setAttendance(result.data);
      }
      
      setSuccessMessage('Attendance marked successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const hasMarkedAttendance = (scheduleId) => {
    return attendance.some(record => 
      record.scheduleId === scheduleId || 
      (scheduleId && record.scheduleId === scheduleId)
    );
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {successMessage && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Today's Schedule - {today}
        </h3>
        <p className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No classes scheduled for today.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-white shadow rounded-lg p-6">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  {schedule.courseName}
                </h4>
                <p className="text-sm text-gray-600">Room: {schedule.room}</p>
                <p className="text-sm text-gray-600">
                  {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                </p>
                {schedule.semester && (
                  <p className="text-sm text-gray-600">Semester: {schedule.semester}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  hasMarkedAttendance(schedule.id) 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                }`}>
                  {hasMarkedAttendance(schedule.id) ? '✓ Attendance Marked' : 'Pending'}
                </span>
                
                {!hasMarkedAttendance(schedule.id) && (
                  <button
                    onClick={() => handleMarkAttendance(schedule)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    Mark Attendance
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
        facultyId={currentUser.uid}
        scheduleId={selectedSchedule?.id}
      />
    </div>
  );
};

export default FacultyDashboard;
