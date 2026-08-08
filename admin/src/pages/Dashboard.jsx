import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Target, Users, Wrench, FileText, Wallet, Hourglass, CreditCard, Ticket, TrendingDown } from 'lucide-react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import '../styles/Dashboard.css';
import '../styles/Payments.css';

const COLORS = ['#c9a227', '#2563eb', '#16a34a', '#dc2626', '#d97706', '#6b7280', '#9333ea'];
const MODULE_COLORS = { Invoice: '#2563eb', Booking: '#c9a227', EmployeePayment: '#dc2626' };
const MODULE_LABELS = { Invoice: 'Invoices', Booking: 'Bookings', EmployeePayment: 'Employee Payments' };
const MODULE_ICONS = { Invoice: FileText, Booking: Ticket, EmployeePayment: Users };

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/payments/analytics'),
        ]);
        setStats(statsRes.data.data);
        setAnalytics(analyticsRes.data.data);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <Loader fullScreen />;
  if (!stats) return <p>Could not load dashboard.</p>;

  const { totals, charts, recentActivity } = stats;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your business performance" />

      <div className="stats-grid">
        <StatCard label="Total Leads" value={totals.leads} icon={<Target size={20} />} />
        <StatCard label="Total Customers" value={totals.customers} icon={<Users size={20} />} />
        <StatCard label="Total Services" value={totals.services} icon={<Wrench size={20} />} />
        <StatCard label="Total Invoices" value={totals.invoices} icon={<FileText size={20} />} />
        <StatCard label="Revenue Collected" value={`₹${totals.revenue.toLocaleString('en-IN')}`} icon={<Wallet size={20} />} />
        <StatCard label="Pending Amount" value={`₹${totals.pendingAmount.toLocaleString('en-IN')}`} icon={<Hourglass size={20} />} />
        <StatCard label="Total Payments" value={totals.payments} icon={<CreditCard size={20} />} />
        <StatCard label="Paid Out (Employees)" value={`₹${totals.paidOut.toLocaleString('en-IN')}`} icon={<TrendingDown size={20} />} />
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

      {analytics && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '28px 0 12px' }}>
            <h3 style={{ margin: 0 }}>Payment Analytics</h3>
            <Button variant="secondary" onClick={() => navigate('/payments')}>View Full Analytics →</Button>
          </div>

          <div className="stats-grid" style={{ marginBottom: 'var(--space-4)' }}>
            <StatCard label="Total Collected" value={`₹${analytics.totalCollected.toLocaleString('en-IN')}`} icon={<Wallet size={20} />} />
            <StatCard label="This Month" value={`₹${analytics.thisMonthCollected.toLocaleString('en-IN')}`} icon={<CreditCard size={20} />} />
            <StatCard label="Total Paid Out" value={`₹${analytics.totalPaidOut.toLocaleString('en-IN')}`} icon={<TrendingDown size={20} />} />
            <StatCard label="Net Cash Flow" value={`₹${analytics.netCashFlow.toLocaleString('en-IN')}`} icon={<Wallet size={20} />} />
          </div>

          <div className="module-breakdown-grid">
            {['Invoice', 'Booking', 'EmployeePayment'].map((mod) => {
              const modStats = analytics.byModule[mod];
              const Icon = MODULE_ICONS[mod];
              return (
                <div key={mod} className="chart-card module-breakdown-card">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon size={18} color={MODULE_COLORS[mod]} /> {MODULE_LABELS[mod]}
                  </h3>
                  <div className="module-breakdown-stats">
                    <div><span>Total</span><strong>₹{modStats.total.toLocaleString('en-IN')}</strong></div>
                    <div><span>This Month</span><strong>₹{modStats.thisMonth.toLocaleString('en-IN')}</strong></div>
                    <div>
                      <span>vs Last Month</span>
                      <strong>{modStats.momChangePercent === null ? '—' : `${modStats.momChangePercent > 0 ? '+' : ''}${modStats.momChangePercent}%`}</strong>
                    </div>
                    <div><span>Transactions</span><strong>{modStats.count}</strong></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Money In vs Out — Last 6 Months</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={analytics.monthlyTrendByModule}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                  <Legend />
                  <Bar dataKey="Invoice" fill={MODULE_COLORS.Invoice} radius={[4, 4, 0, 0]} name="Invoices" />
                  <Bar dataKey="Booking" fill={MODULE_COLORS.Booking} radius={[4, 4, 0, 0]} name="Bookings" />
                  <Bar dataKey="EmployeePayment" fill={MODULE_COLORS.EmployeePayment} radius={[4, 4, 0, 0]} name="Employee Payments" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Collections by Payment Mode</h3>
              {analytics.modeBreakdown.length === 0 ? (
                <p className="empty-state">No payments recorded yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={analytics.modeBreakdown}
                      dataKey="total"
                      nameKey="mode"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label={(entry) => entry.mode}
                    >
                      {analytics.modeBreakdown.map((entry, index) => (
                        <Cell key={`mode-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}

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