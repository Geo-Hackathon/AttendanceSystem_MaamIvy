import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardRedirect = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (userProfile?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (userProfile?.role === 'faculty') {
    return <Navigate to="/faculty/dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default DashboardRedirect;
