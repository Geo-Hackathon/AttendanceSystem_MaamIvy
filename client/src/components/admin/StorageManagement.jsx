import { useState, useEffect } from 'react';
import axios from 'axios';
import { HardDrive, Trash2, RefreshCw } from 'lucide-react';

const StorageManagement = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [cleanupDays, setCleanupDays] = useState(90);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/storage/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch storage stats:', error);
    }
  };

  const handleCleanup = async () => {
    if (!confirm(`Delete all attendance images older than ${cleanupDays} days?`)) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/storage/cleanup', { daysToKeep: cleanupDays });
      setMessage(`✅ ${response.data.message}: ${response.data.deletedCount} images deleted`);
      fetchStats();
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage('❌ Cleanup failed: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupOrphaned = async () => {
    if (!confirm('Remove orphaned images (files not linked to database records)?')) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/storage/cleanup-orphaned');
      setMessage(`✅ ${response.data.message}: ${response.data.deletedCount} files removed`);
      fetchStats();
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage('❌ Cleanup failed: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getUsageColor = (percent) => {
    if (percent < 50) return 'bg-green-500';
    if (percent < 75) return 'bg-yellow-500';
    if (percent < 90) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Storage Management</h2>
          <p className="text-sm text-gray-600 mt-1">Monitor and optimize storage usage</p>
        </div>
        <button 
          onClick={fetchStats} 
          className="btn btn-secondary flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`text-sm ${message.includes('✅') ? 'text-green-800' : 'text-red-800'}`}>
            {message}
          </p>
        </div>
      )}

      {stats && (
        <div className="space-y-6">
          {/* Storage Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <HardDrive className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold">Storage Overview</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFiles.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSizeMB} MB</p>
                <p className="text-xs text-gray-500">({stats.totalSizeGB} GB)</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Average File Size</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgSizeKB} KB</p>
              </div>
            </div>

            {/* Storage Usage Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">Storage Usage (5GB Limit)</p>
                <p className="text-sm font-semibold text-gray-900">{stats.storageUsagePercent}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all ${getUsageColor(parseFloat(stats.storageUsagePercent))}`}
                  style={{ width: `${Math.min(parseFloat(stats.storageUsagePercent), 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>{stats.totalSizeGB} GB used</span>
                <span>{(5 - parseFloat(stats.totalSizeGB)).toFixed(3)} GB remaining</span>
              </div>
            </div>

            {parseFloat(stats.storageUsagePercent) > 75 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Storage usage is high. Consider running cleanup to free up space.
                </p>
              </div>
            )}
          </div>

          {/* Cleanup Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold">Cleanup Tools</h3>
            </div>

            <div className="space-y-4">
              {/* Old Images Cleanup */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Delete Old Attendance Images</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Remove attendance images older than a specified number of days to free up storage space.
                </p>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keep images from last (days)
                    </label>
                    <input
                      type="number"
                      value={cleanupDays}
                      onChange={(e) => setCleanupDays(parseInt(e.target.value))}
                      min="30"
                      max="365"
                      className="input"
                    />
                  </div>
                  <button
                    onClick={handleCleanup}
                    disabled={loading}
                    className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Run Cleanup
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Recommended: Keep 60-90 days for audit purposes
                </p>
              </div>

              {/* Orphaned Files Cleanup */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Remove Orphaned Files</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Delete image files that are not linked to any database records (corrupted or incomplete uploads).
                </p>
                <button
                  onClick={handleCleanupOrphaned}
                  disabled={loading}
                  className="btn bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clean Orphaned Files
                </button>
              </div>
            </div>
          </div>

          {/* Optimization Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">💡 Storage Optimization Tips</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Images are automatically compressed to ~50-100KB each</li>
              <li>• Automatic cleanup runs daily at 2 AM (keeps 90 days)</li>
              <li>• Run manual cleanup during low-usage periods</li>
              <li>• Monitor storage weekly to prevent reaching the 5GB limit</li>
              <li>• Consider exporting old reports to PDF before cleanup</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageManagement;
