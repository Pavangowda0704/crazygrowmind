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

const STATUS_OPTIONS = ['Unpaid', 'Partially Paid', 'Fully Paid'];

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.paymentStatus = statusFilter;
      const { data } = await api.get('/bookings', { params });
      setBookings(data.data);
      setPages(data.pages);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleDelete = async () => {
    await api.delete(`/bookings/${deleteTarget._id}`);
    setDeleteTarget(null);
    fetchBookings();
  };

  return (
    <div>
      <PageHeader
        title="Bookings"
        subtitle={`${total} total booking coupons`}
        action={<Button onClick={() => navigate('/bookings/new')}>+ New Booking</Button>}
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
                <th>Coupon ID</th>
                <th>Client</th>
                <th>Service</th>
                <th>Shoot Date</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td><strong>{b.couponId}</strong></td>
                  <td>{b.clientName}</td>
                  <td>{b.serviceType}</td>
                  <td>{new Date(b.shootDate).toLocaleDateString('en-IN')}</td>
                  <td>₹{Number(b.bookingAmount).toLocaleString('en-IN')}</td>
                  <td>₹{Number(b.balanceAmount).toLocaleString('en-IN')}</td>
                  <td><StatusBadge status={b.paymentStatus} /></td>
                  <td className="table-actions">
                    <button className="icon-btn" onClick={() => navigate(`/bookings/${b._id}/view`)}>👁️</button>
                    <button className="icon-btn" onClick={() => navigate(`/bookings/${b._id}/edit`)}>✏️</button>
                    <button className="icon-btn" onClick={() => setDeleteTarget(b)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={8} className="empty-state">No bookings found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete booking coupon "${deleteTarget.couponId}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Bookings;
