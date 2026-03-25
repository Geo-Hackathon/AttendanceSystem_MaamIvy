import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Lock } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600">
              Faculty Attendance System
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
              <div className="text-sm">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-gray-600">{user?.school_id} ({user?.role})</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/change-password')}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>

            <button
              onClick={handleLogout}
              className="btn btn-danger flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
