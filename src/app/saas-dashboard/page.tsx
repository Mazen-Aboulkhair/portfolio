'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FaUsers, FaChartLine, FaMoneyBillWave, FaUserPlus, FaDownload } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface User {
  _id: string;
  name: string;
  email: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  joinedAt: string;
  lastLogin: string;
}

interface Analytics {
  date: string;
  activeUsers: number;
  newUsers: number;
  revenue: number;
  subscriptions: {
    basic: number;
    pro: number;
    enterprise: number;
  };
  metrics: {
    pageViews: number;
    uniqueVisitors: number;
    averageSessionDuration: number;
  };
}

interface AnalyticsSummary {
  totalRevenue: number;
  totalUsers: number;
  averageActiveUsers: number;
  subscriptionBreakdown: {
    basic: number;
    pro: number;
    enterprise: number;
  };
}

export default function SaaSDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('7d');
  const [seeding, setSeeding] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsRes, usersRes, summaryRes] = await Promise.all([
        fetch(`/api/saas/analytics?period=${period}`),
        fetch('/api/saas/users'),
        fetch(`/api/saas/summary?period=${period}`)
      ]);

      if (!analyticsRes.ok || !usersRes.ok || !summaryRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [analyticsData, usersData, summaryData] = await Promise.all([
        analyticsRes.json(),
        usersRes.json(),
        summaryRes.json()
      ]);

      setAnalytics(analyticsData);
      setUsers(usersData);
      setSummary(summaryData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [period, fetchData]);

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      const response = await fetch('/api/saas/seed', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to seed data');
      }

      await fetchData(); // Refresh the dashboard data
      alert('Database seeded successfully!');
    } catch (err) {
      console.error('Error seeding data:', err);
      alert('Failed to seed database. Please try again.');
    } finally {
      setSeeding(false);
    }
  };

  const exportToCSV = () => {
    try {
      // Prepare analytics data
      const analyticsCSV = [
        // Headers
        ['Date', 'Active Users', 'New Users', 'Revenue', 'Basic Subscriptions', 'Pro Subscriptions', 'Enterprise Subscriptions', 'Page Views', 'Unique Visitors', 'Avg Session Duration'].join(','),
        // Data rows
        ...analytics.map(a => [
          new Date(a.date).toLocaleDateString(),
          a.activeUsers,
          a.newUsers,
          a.revenue,
          a.subscriptions.basic,
          a.subscriptions.pro,
          a.subscriptions.enterprise,
          a.metrics.pageViews,
          a.metrics.uniqueVisitors,
          a.metrics.averageSessionDuration
        ].join(','))
      ].join('\n');

      // Prepare users data
      const usersCSV = [
        // Headers
        ['Name', 'Email', 'Plan', 'Status', 'Joined Date', 'Last Login'].join(','),
        // Data rows
        ...users.map(u => [
          `"${u.name}"`,
          `"${u.email}"`,
          u.plan,
          u.status,
          new Date(u.joinedAt).toLocaleDateString(),
          new Date(u.lastLogin).toLocaleDateString()
        ].join(','))
      ].join('\n');

      // Create summary data
      const summaryCSV = [
        // Headers
        ['Metric', 'Value'].join(','),
        // Data rows
        ['Total Revenue', `$${summary?.totalRevenue.toLocaleString()}`].join(','),
        ['Total Users', summary?.totalUsers].join(','),
        ['Average Active Users', Math.round(summary?.averageActiveUsers || 0)].join(','),
        ['Basic Subscriptions', summary?.subscriptionBreakdown.basic].join(','),
        ['Pro Subscriptions', summary?.subscriptionBreakdown.pro].join(','),
        ['Enterprise Subscriptions', summary?.subscriptionBreakdown.enterprise].join(','),
      ].join('\n');

      // Combine all data
      const fullReport = [
        '=== Analytics Data ===',
        analyticsCSV,
        '\n=== Users Data ===',
        usersCSV,
        '\n=== Summary Data ===',
        summaryCSV
      ].join('\n');

      // Create and download the file
      const blob = new Blob([fullReport], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `saas-dashboard-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting report:', err);
      alert('Failed to export report. Please try again.');
    }
  };

  const revenueData = {
    labels: analytics.map(a => new Date(a.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Revenue',
        data: analytics.map(a => a.revenue),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const subscriptionData = {
    labels: ['Basic', 'Pro', 'Enterprise'],
    datasets: [
      {
        data: summary ? [
          summary.subscriptionBreakdown.basic,
          summary.subscriptionBreakdown.pro,
          summary.subscriptionBreakdown.enterprise,
        ] : [0, 0, 0],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800">
            ← Back to Home
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SaaS Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, Admin</p>
          </div>
          <div className="flex gap-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className={`bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition ${
                seeding ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {seeding ? 'Seeding...' : 'Seed Test Data'}
            </button>
            <button
              onClick={exportToCSV}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <FaDownload className="text-sm" />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
              <FaMoneyBillWave className="text-indigo-600 text-xl" />
            </div>
            <p className="text-3xl font-bold">${summary?.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-1">All time</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">Active Users</h3>
              <FaUsers className="text-green-600 text-xl" />
            </div>
            <p className="text-3xl font-bold">{Math.round(summary?.averageActiveUsers || 0)}</p>
            <p className="text-sm text-gray-600 mt-1">Average daily</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">New Users</h3>
              <FaUserPlus className="text-blue-600 text-xl" />
            </div>
            <p className="text-3xl font-bold">{summary?.totalUsers}</p>
            <p className="text-sm text-gray-600 mt-1">This period</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">Growth</h3>
              <FaChartLine className="text-purple-600 text-xl" />
            </div>
            <p className="text-3xl font-bold">+{Math.round((summary?.totalUsers || 0) / 7)}%</p>
            <p className="text-sm text-gray-600 mt-1">Weekly</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
            <div className="h-80">
              <Line
                data={revenueData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `$${value}`,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Subscription Distribution</h3>
            <div className="h-80">
              <Doughnut
                data={subscriptionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Recent Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                        user.plan === 'pro' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 