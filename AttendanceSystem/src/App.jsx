import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import DashboardRedirect from './pages/DashboardRedirect';

// Faculty Pages
import FacultyDashboard from './pages/faculty/Dashboard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import FacultyManagement from './pages/admin/FacultyManagement';
import ScheduleManagement from './pages/admin/ScheduleManagement';
import Analytics from './pages/admin/Analytics';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
            
            {/* Faculty Routes */}
            <Route
              path="/faculty/dashboard"
              element={
                <ProtectedRoute requiredRole="faculty">
                  <Layout title="Faculty Dashboard">
                    <FacultyDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout title="Admin Dashboard">
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/faculty"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout title="Faculty Management">
                    <FacultyManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/schedules"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout title="Schedule Management">
                    <ScheduleManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout title="Attendance Analytics">
                    <Analytics />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Default redirect */}
            <Route path="/" element={<DashboardRedirect />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
