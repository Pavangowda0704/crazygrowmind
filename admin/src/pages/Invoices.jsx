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

const STATUS_OPTIONS = ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'];

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/invoices', { params });
      setInvoices(data.data);
      setPages(data.pages);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDelete = async () => {
    await api.delete(`/invoices/${deleteTarget._id}`);
    setDeleteTarget(null);
    fetchInvoices();
  };

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={`${total} total invoices`}
        action={<Button onClick={() => navigate('/invoices/new')}>+ New Invoice</Button>}
      />

      <SearchFilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </SearchFilterBar>

      {loading ? (
        <Loader />
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Invoice Date</th>
                <th>Due Date</th>
                <th>Total</th>
                <th>Payable</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id}>
                  <td><strong>{inv.invoiceNumber}</strong></td>
                  <td>{inv.customer?.name || inv.customerSnapshot?.name}</td>
                  <td>{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                  <td>{new Date(inv.dueDate).toLocaleDateString('en-IN')}</td>
                  <td>₹{Number(inv.total).toLocaleString('en-IN')}</td>
                  <td>₹{Number(inv.amountPayable).toLocaleString('en-IN')}</td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td className="table-actions">
                    <button className="icon-btn" onClick={() => navigate(`/invoices/${inv._id}/view`)}>👁️</button>
                    <button className="icon-btn" onClick={() => navigate(`/invoices/${inv._id}/edit`)}>✏️</button>
                    <button className="icon-btn" onClick={() => setDeleteTarget(inv)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr><td colSpan={8} className="empty-state">No invoices found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete invoice "${deleteTarget.invoiceNumber}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Invoices;
