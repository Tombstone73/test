import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { CheckCircle, AlertTriangle, XCircle, Clock, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading dashboard: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of preflight processing activity</p>
      </div>

      {/* Folder Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Folder Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Pending"
            value={stats?.folders?.pending || 0}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Processing"
            value={stats?.folders?.processing || 0}
            icon={Loader2}
            color="blue"
          />
          <StatCard
            title="Approved"
            value={stats?.folders?.approved || 0}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Needs Revision"
            value={stats?.folders?.needs_revision || 0}
            icon={AlertTriangle}
            color="orange"
          />
        </div>
      </div>

      {/* Check Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preflight Checks</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Checks"
            value={stats?.checks?.total || 0}
            color="gray"
          />
          <StatCard
            title="Passed"
            value={stats?.checks?.passed || 0}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Warnings"
            value={stats?.checks?.warnings || 0}
            icon={AlertTriangle}
            color="yellow"
          />
          <StatCard
            title="Failed"
            value={stats?.checks?.failed || 0}
            icon={XCircle}
            color="red"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {stats?.recent_activity?.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recent_activity.map((activity, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(activity.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={activity.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusColors = {
    PASS: 'bg-green-100 text-green-800',
    WARNING: 'bg-yellow-100 text-yellow-800',
    FAIL: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {status}
    </span>
  );
};

export default Dashboard;
