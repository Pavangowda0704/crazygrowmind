import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import '../styles/Dashboard.css';

const COLORS = ['#c9a227', '#2563eb', '#16a34a', '#dc2626', '#d97706', '#6b7280', '#9333ea'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data.data);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader fullScreen />;
  if (!stats) return <p>Could not load dashboard.</p>;

  const { totals, charts, recentActivity } = stats;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your business performance" />

      <div className="stats-grid">
        <StatCard label="Total Leads" value={totals.leads} icon="🎯" />
        <StatCard label="Total Customers" value={totals.customers} icon="👥" />
        <StatCard label="Total Services" value={totals.services} icon="🛠️" />
        <StatCard label="Total Invoices" value={totals.invoices} icon="🧾" />
        <StatCard label="Revenue Collected" value={`₹${totals.revenue.toLocaleString('en-IN')}`} icon="💰" />
        <StatCard label="Pending Amount" value={`₹${totals.pendingAmount.toLocaleString('en-IN')}`} icon="⏳" />
        <StatCard label="Total Payments" value={totals.payments} icon="💳" />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Monthly Revenue (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#c9a227" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Leads by Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={charts.leadsByStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {charts.leadsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="activity-card">
        <h3>Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <p className="empty-state">No recent activity</p>
        ) : (
          <ul className="activity-list">
            {recentActivity.map((log) => (
              <li key={log._id}>
                <div>
                  <StatusBadge status={log.action} />
                  <span className="activity-desc">{log.description}</span>
                </div>
                <span className="activity-meta">
                  {log.user?.name || 'System'} • {new Date(log.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
