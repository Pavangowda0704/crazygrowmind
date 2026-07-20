import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import SearchFilterBar from '../components/SearchFilterBar';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import '../styles/Table.css';
import '../styles/Form.css';

const emptyForm = {
  name: '', email: '', phone: '', company: '', gstin: '', placeOfSupply: '', status: 'Active',
  billingAddress: { line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' },
  notes: '',
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/customers', { params });
      setCustomers(data.data);
      setPages(data.pages);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  };

  const openEdit = (customer) => {
    setEditing(customer);
    setForm({ ...emptyForm, ...customer, billingAddress: { ...emptyForm.billingAddress, ...customer.billingAddress } });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/customers/${editing._id}`, form);
      } else {
        await api.post('/customers', form);
      }
      setShowForm(false);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleDelete = async () => {
    await api.delete(`/customers/${deleteTarget._id}`);
    setDeleteTarget(null);
    fetchCustomers();
  };

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${total} total customers`}
        action={<Button onClick={openCreate}>+ Add Customer</Button>}
      />

      <SearchFilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </SearchFilterBar>

      {loading ? (
        <Loader />
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>GSTIN</th>
                <th>Place of Supply</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id}>
                  <td>
                    <strong>{c.name}</strong>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.company}</div>
                  </td>
                  <td>
                    {c.phone}
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.email}</div>
                  </td>
                  <td>{c.gstin || '—'}</td>
                  <td>{c.placeOfSupply || '—'}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className="table-actions">
                    <button className="icon-btn" onClick={() => openEdit(c)}>✏️</button>
                    <button className="icon-btn" onClick={() => setDeleteTarget(c)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={6} className="empty-state">No customers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />

      {showForm && (
        <Modal title={editing ? 'Edit Customer' : 'Add Customer'} onClose={() => setShowForm(false)} width={680}>
          <form onSubmit={handleSubmit}>
            {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
            <div className="form-grid">
              <div className="form-field">
                <label>Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Phone *</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Company</label>
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div className="form-field">
                <label>GSTIN</label>
                <input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Place of Supply</label>
                <input placeholder="e.g. 29-KARNATAKA" value={form.placeOfSupply} onChange={(e) => setForm({ ...form, placeOfSupply: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <h4 style={{ marginTop: 20, marginBottom: 10, fontSize: 14 }}>Billing Address</h4>
            <div className="form-grid">
              <div className="form-field">
                <label>Address Line 1</label>
                <input value={form.billingAddress.line1} onChange={(e) => setForm({ ...form, billingAddress: { ...form.billingAddress, line1: e.target.value } })} />
              </div>
              <div className="form-field">
                <label>Address Line 2</label>
                <input value={form.billingAddress.line2} onChange={(e) => setForm({ ...form, billingAddress: { ...form.billingAddress, line2: e.target.value } })} />
              </div>
              <div className="form-field">
                <label>City</label>
                <input value={form.billingAddress.city} onChange={(e) => setForm({ ...form, billingAddress: { ...form.billingAddress, city: e.target.value } })} />
              </div>
              <div className="form-field">
                <label>State</label>
                <input value={form.billingAddress.state} onChange={(e) => setForm({ ...form, billingAddress: { ...form.billingAddress, state: e.target.value } })} />
              </div>
              <div className="form-field">
                <label>Pincode</label>
                <input value={form.billingAddress.pincode} onChange={(e) => setForm({ ...form, billingAddress: { ...form.billingAddress, pincode: e.target.value } })} />
              </div>
            </div>

            <div className="form-field" style={{ marginTop: 16 }}>
              <label>Notes</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="form-actions">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">{editing ? 'Update Customer' : 'Create Customer'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete customer "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Customers;
