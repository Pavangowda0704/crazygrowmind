import { useEffect, useState, useCallback } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Wallet, CalendarDays, TrendingUp, TrendingDown, Hourglass, AlertTriangle, Receipt, BarChart3, FileText, Ticket, Users } from 'lucide-react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import SearchFilterBar from '../components/SearchFilterBar';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import '../styles/Table.css';
import '../styles/Payments.css';
import '../styles/Dashboard.css';

const COLORS = ['#c9a227', '#2563eb', '#16a34a', '#dc2626', '#d97706', '#6b7280'];
const MODULE_COLORS = { Invoice: '#2563eb', Booking: '#c9a227', EmployeePayment: '#dc2626' };
const MODULE_LABELS = { Invoice: 'Invoices', Booking: 'Bookings', EmployeePayment: 'Employee Payments' };
const MODULE_ICONS = { Invoice: FileText, Booking: Ticket, EmployeePayment: Users };

const Payments = () => {
  const [tab, setTab] = useState('history'); // history | pending | analytics
  const [payments, setPayments] = useState([]);
  const [pending, setPending] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modeFilter, setModeFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (modeFilter) params.mode = modeFilter;
      if (moduleFilter) params.module = moduleFilter;
      const { data } = await api.get('/payments', { params });
      setPayments(data.data);
      setPages(data.pages);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, modeFilter, moduleFilter]);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/payments/pending');
      setPending(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/payments/analytics');
      setAnalytics(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'history') fetchHistory();
    else if (tab === 'pending') fetchPending();
    else fetchAnalytics();
  }, [tab, fetchHistory, fetchPending, fetchAnalytics]);

  return (
    <div>
      <PageHeader title="Payments" subtitle="Track collections and outstanding dues" />

      <div className="payments-tabs">
        <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>Payment History</button>
        <button className={tab === 'pending' ? 'active' : ''} onClick={() => setTab('pending')}>Pending Payments</button>
        <button className={tab === 'analytics' ? 'active' : ''} onClick={() => setTab('analytics')}>Analytics</button>
      </div>

      {tab === 'analytics' && (
        loading || !analytics ? <Loader /> : (
          <>
            <div className="stats-grid">
              <StatCard label="Total Collected" value={`₹${analytics.totalCollected.toLocaleString('en-IN')}`} icon={<Wallet size={20} />} />
              <StatCard label="This Month" value={`₹${analytics.thisMonthCollected.toLocaleString('en-IN')}`} icon={<CalendarDays size={20} />} />
              <StatCard
                label="vs Last Month"
                value={analytics.momChangePercent === null ? '—' : `${analytics.momChangePercent > 0 ? '+' : ''}${analytics.momChangePercent}%`}
                icon={analytics.momChangePercent >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              />
              <StatCard label="Pending Amount" value={`₹${analytics.totalPending.toLocaleString('en-IN')}`} icon={<Hourglass size={20} />} />
              <StatCard label="Overdue Invoices" value={analytics.overdueCount} icon={<AlertTriangle size={20} />} />
              <StatCard label="Total Transactions" value={analytics.transactionCount} icon={<Receipt size={20} />} />
              <StatCard label="Avg. Payment" value={`₹${analytics.avgPaymentAmount.toLocaleString('en-IN')}`} icon={<BarChart3 size={20} />} />
              <StatCard label="Paid Out (Employees)" value={`₹${analytics.totalPaidOut.toLocaleString('en-IN')}`} icon={<TrendingDown size={20} />} />
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3>Collections — Last 6 Months</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={analytics.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                    <Bar dataKey="total" fill="#c9a227" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>Collections by Payment Mode</h3>
                {analytics.modeBreakdown.length === 0 ? (
                  <p className="empty-state">No payments recorded yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={analytics.modeBreakdown}
                        dataKey="total"
                        nameKey="mode"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={(entry) => entry.mode}
                      >
                        {analytics.modeBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <h3 style={{ margin: '28px 0 12px' }}>By Activity Type</h3>
            <div className="charts-grid" style={{ marginBottom: 8 }}>
              <div className="chart-card">
                <h3>Money In vs Out — Last 6 Months</h3>
                <ResponsiveContainer width="100%" height={280}>
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
                <h3>Invoice Status Breakdown</h3>
                {analytics.invoiceStatusBreakdown.length === 0 ? (
                  <p className="empty-state">No invoices yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={analytics.invoiceStatusBreakdown}
                        dataKey="total"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={(entry) => `${entry.status} (${entry.count})`}
                      >
                        {analytics.invoiceStatusBreakdown.map((entry, index) => (
                          <Cell key={`status-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="module-breakdown-grid">
              {['Invoice', 'Booking', 'EmployeePayment'].map((mod) => {
                const stats = analytics.byModule[mod];
                const Icon = MODULE_ICONS[mod];
                return (
                  <div key={mod} className="chart-card module-breakdown-card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={18} color={MODULE_COLORS[mod]} /> {MODULE_LABELS[mod]}
                    </h3>
                    <div className="module-breakdown-stats">
                      <div><span>Total</span><strong>₹{stats.total.toLocaleString('en-IN')}</strong></div>
                      <div><span>This Month</span><strong>₹{stats.thisMonth.toLocaleString('en-IN')}</strong></div>
                      <div>
                        <span>vs Last Month</span>
                        <strong>{stats.momChangePercent === null ? '—' : `${stats.momChangePercent > 0 ? '+' : ''}${stats.momChangePercent}%`}</strong>
                      </div>
                      <div><span>Transactions</span><strong>{stats.count}</strong></div>
                      <div><span>Avg. Amount</span><strong>₹{stats.avgAmount.toLocaleString('en-IN')}</strong></div>
                    </div>
                    {stats.byMode.length > 0 && (
                      <>
                        <h4 style={{ margin: '12px 0 6px', fontSize: 13, color: 'var(--text-muted, #666)' }}>By Payment Mode</h4>
                        <ul className="module-breakdown-modes">
                          {stats.byMode.map((m) => (
                            <li key={m.mode}>
                              <span>{m.mode}</span>
                              <span>₹{m.total.toLocaleString('en-IN')} ({m.count})</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )
      )}

      {tab === 'history' && (
        <>
          <SearchFilterBar search="" onSearchChange={() => {}}>
            <select value={moduleFilter} onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}>
              <option value="">All Activities</option>
              <option value="Invoice">Invoices</option>
              <option value="Booking">Bookings</option>
              <option value="EmployeePayment">Employee Payments</option>
            </select>
            <select value={modeFilter} onChange={(e) => { setModeFilter(e.target.value); setPage(1); }}>
              <option value="">All Modes</option>
              {['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card', 'Other'].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </SearchFilterBar>

          {loading ? <Loader /> : (
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Reference</th>
                    <th>Party</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Txn Ref</th>
                    <th>Paid On</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td>{p.module === 'Booking' ? 'Booking' : p.module === 'EmployeePayment' ? 'Employee Payment' : 'Invoice'}</td>
                      <td>{p.reference || p.invoice?.invoiceNumber || p.booking?.couponId || p.employeePayment?.payslipNumber}</td>
                      <td>{p.partyName || p.customer?.name || p.employee?.name}</td>
                      <td style={{ color: p.direction === 'out' ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                        {p.direction === 'out' ? '-' : '+'}₹{Number(p.amount).toLocaleString('en-IN')}
                      </td>
                      <td>{p.mode}</td>
                      <td>{p.referenceNo || '—'}</td>
                      <td>{new Date(p.paidOn).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                  {payments.length === 0 && <tr><td colSpan={7} className="empty-state">No payments recorded</td></tr>}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}

      {tab === 'pending' && (
        loading ? <Loader /> : (
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Due Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Pending</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <tr key={p._id}>
                    <td>{p.invoiceNumber}</td>
                    <td>{p.customer?.name}</td>
                    <td>{new Date(p.dueDate).toLocaleDateString('en-IN')}</td>
                    <td>₹{Number(p.total).toLocaleString('en-IN')}</td>
                    <td>₹{Number(p.amountPaid).toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--danger)', fontWeight: 700 }}>₹{Number(p.pendingAmount).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                {pending.length === 0 && <tr><td colSpan={6} className="empty-state">No pending payments 🎉</td></tr>}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default Payments;