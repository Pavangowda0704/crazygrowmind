import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import SearchFilterBar from '../components/SearchFilterBar';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import '../styles/Table.css';

const EmployeePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/employee-payments', { params });
      setPayments(data.data);
      setPages(data.pages);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleDelete = async () => {
    await api.delete(`/employee-payments/${deleteTarget._id}`);
    setDeleteTarget(null);
    fetchPayments();
  };

  return (
    <div>
      <PageHeader
        title="Employee Payments"
        subtitle={`${total} payslips issued`}
        action={<Button onClick={() => navigate('/employee-payments/new')}>+ New Payslip</Button>}
      />

      <SearchFilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>
      </SearchFilterBar>

      {loading ? (
        <Loader />
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payslip #</th>
                <th>Employee</th>
                <th>Period</th>
                <th>Payment Date</th>
                <th>Net Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td><strong>{p.payslipNumber}</strong></td>
                  <td>{p.employee?.name || p.employeeSnapshot?.name}</td>
                  <td>{p.period}</td>
                  <td>{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
                  <td>₹{Number(p.netAmount).toLocaleString('en-IN')}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td className="table-actions">
                    <button className="icon-btn" onClick={() => navigate(`/employee-payments/${p._id}/view`)}>👁️</button>
                    <button className="icon-btn" onClick={() => navigate(`/employee-payments/${p._id}/edit`)}>✏️</button>
                    <button className="icon-btn" onClick={() => setDeleteTarget(p)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={7} className="empty-state">No employee payments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete payslip "${deleteTarget.payslipNumber}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default EmployeePayments;
