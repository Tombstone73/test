import React, { useState, useEffect } from 'react';
import { foldersAPI, preflightAPI } from '../services/api';
import { Loader2, RefreshCw, PlayCircle, FolderOpen } from 'lucide-react';

const Folders = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const response = await foldersAPI.getFolders();
      setFolders(response.data);
    } catch (err) {
      console.error('Failed to load folders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    try {
      setScanning(true);
      await foldersAPI.scanFolders();
      await loadFolders();
    } catch (err) {
      console.error('Failed to scan folders:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleReprocess = async (folderId) => {
    try {
      setProcessing({ ...processing, [folderId]: true });
      await preflightAPI.reprocess(folderId);
      await loadFolders();
    } catch (err) {
      console.error('Failed to reprocess folder:', err);
    } finally {
      setProcessing({ ...processing, [folderId]: false });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Folder Monitor</h1>
          <p className="text-gray-600 mt-2">Track and manage order folders</p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {scanning ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5 mr-2" />
          )}
          {scanning ? 'Scanning...' : 'Scan Folders'}
        </button>
      </div>

      {/* Folder List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : folders.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {folders.map((folder) => (
                <tr key={folder.folder_path} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {folder.order_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {folder.customer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <FolderStatusBadge status={folder.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(folder.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(folder.updated_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleReprocess(folder.folder_path)}
                      disabled={processing[folder.folder_path]}
                      className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {processing[folder.folder_path] ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <PlayCircle className="w-4 h-4 mr-1" />
                      )}
                      Reprocess
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No folders found</p>
            <button
              onClick={handleScan}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Scan for Folders
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const FolderStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-gray-100 text-gray-800', label: 'Pending' },
    processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
    approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
    'needs-revision': { color: 'bg-orange-100 text-orange-800', label: 'Needs Revision' },
    error: { color: 'bg-red-100 text-red-800', label: 'Error' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

export default Folders;
