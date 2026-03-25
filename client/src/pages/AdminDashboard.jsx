import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import FacultyManagement from '../components/admin/FacultyManagement';
import SubjectManagement from '../components/admin/SubjectManagement';
import ScheduleManagement from '../components/admin/ScheduleManagement';
import AttendanceMonitoring from '../components/admin/AttendanceMonitoring';
import Analytics from '../components/admin/Analytics';
import StorageManagement from '../components/admin/StorageManagement';
import { Users, BookOpen, Calendar, BarChart3, ClipboardList, HardDrive } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('faculty');

  const tabs = [
    { id: 'faculty', label: 'Faculty Management', icon: Users },
    { id: 'subjects', label: 'Subjects & Sections', icon: BookOpen },
    { id: 'schedules', label: 'Class Schedules', icon: Calendar },
    { id: 'attendance', label: 'Attendance Monitoring', icon: ClipboardList },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'storage', label: 'Storage Management', icon: HardDrive },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage faculty, schedules, and monitor attendance</p>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'faculty' && <FacultyManagement />}
            {activeTab === 'subjects' && <SubjectManagement />}
            {activeTab === 'schedules' && <ScheduleManagement />}
            {activeTab === 'attendance' && <AttendanceMonitoring />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'storage' && <StorageManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
