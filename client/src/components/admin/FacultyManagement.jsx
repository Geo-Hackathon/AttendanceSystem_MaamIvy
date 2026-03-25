import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Key, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({ schoolId: '', name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '', isTemporary: true });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await axios.get('/api/faculty');
      setFaculty(response.data);
    } catch (error) {
      console.error('Failed to fetch faculty:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFaculty) {
        await axios.put(`/api/faculty/${editingFaculty.id}`, {
          name: formData.name,
          email: formData.email
        });
        setMessage('Faculty updated successfully!');
      } else {
        const response = await axios.post('/api/faculty', formData);
        setTempPassword(response.data.tempPassword);
        setMessage(`Faculty created! Temporary password: ${response.data.tempPassword}`);
      }
      fetchFaculty();
      setShowModal(false);
      setEditingFaculty(null);
      setFormData({ schoolId: '', name: '', email: '' });
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;
    
    try {
      await axios.delete(`/api/faculty/${id}`);
      setMessage('Faculty deleted successfully!');
      fetchFaculty();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Delete failed');
    }
  };

  const handleResetPassword = async (id) => {
    if (!confirm('Generate random password for this faculty member?')) return;
    
    try {
      const response = await axios.post(`/api/faculty/${id}/reset-password`);
      setTempPassword(response.data.tempPassword);
      setMessage(`Password reset! New temporary password: ${response.data.tempPassword}`);
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Reset failed');
    }
  };

  const openPasswordModal = (facultyMember) => {
    setSelectedFaculty(facultyMember);
    setPasswordData({ newPassword: '', confirmPassword: '', isTemporary: true });
    setShowPassword(false);
    setShowPasswordModal(true);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters!');
      return;
    }

    try {
      await axios.post(`/api/faculty/${selectedFaculty.id}/change-password`, {
        newPassword: passwordData.newPassword,
        isTemporary: passwordData.isTemporary
      });
      setMessage(`Password changed successfully for ${selectedFaculty.name}!`);
      setShowPasswordModal(false);
      setSelectedFaculty(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Password change failed');
    }
  };

  const openEditModal = (facultyMember) => {
    setEditingFaculty(facultyMember);
    setFormData({
      schoolId: facultyMember.school_id,
      name: facultyMember.name,
      email: facultyMember.email || ''
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingFaculty(null);
    setFormData({ schoolId: '', name: '', email: '' });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Faculty Management</h2>
        <button onClick={openAddModal} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Faculty
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.includes('success') || message.includes('password') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`text-sm ${message.includes('success') || message.includes('password') ? 'text-green-800' : 'text-red-800'}`}>
            {message}
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {faculty.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No faculty members yet
                </td>
              </tr>
            ) : (
              faculty.map(member => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{member.school_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.email || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openPasswordModal(member)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Change Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(member.id)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                        title="Generate Random Password"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School ID
                </label>
                <input
                  type="text"
                  value={formData.schoolId}
                  onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                  className="input"
                  required
                  disabled={editingFaculty}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFaculty ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold">Change Password</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Set a new password for <strong>{selectedFaculty.name}</strong> ({selectedFaculty.school_id})
            </p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="input pr-10"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="input"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isTemporary"
                  checked={passwordData.isTemporary}
                  onChange={(e) => setPasswordData({ ...passwordData, isTemporary: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isTemporary" className="text-sm text-gray-700">
                  Require password change on next login
                </label>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedFaculty(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManagement;
