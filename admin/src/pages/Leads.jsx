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

const STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
const SOURCE_OPTIONS = ['Website', 'Referral', 'Social Media', 'Cold Call', 'Advertisement', 'Other'];

const emptyForm = { name: '', email: '', phone: '', company: '', source: 'Website', serviceInterested: '', value: 0, notes: '' };

const Leads = () => {
  const [leads, setLeads] = useState([]);
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

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/leads', { params });
      setLeads(data.data);
      setPages(data.pages);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  };

  const openEdit = (lead) => {
    setEditing(lead);
    setForm({ ...emptyForm, ...lead });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/leads/${editing._id}`, form);
      } else {
        await api.post('/leads', form);
      }
      setShowForm(false);
      fetchLeads();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lead');
    }
  };

  const handleStatusChange = async (lead, status) => {
    await api.patch(`/leads/${lead._id}/status`, { status });
    fetchLeads();
  };

  const handleDelete = async () => {
    await api.delete(`/leads/${deleteTarget._id}`);
    setDeleteTarget(null);
    fetchLeads();
  };

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${total} total leads`}
        action={<Button onClick={openCreate}>+ Add Lead</Button>}
      />

      <SearchFilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
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
                <th>Source</th>
                <th>Value</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id}>
                  <td>
                    <strong>{lead.name}</strong>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.company}</div>
                  </td>
                  <td>
                    {lead.phone}
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.email}</div>
                  </td>
                  <td>{lead.source}</td>
                  <td>₹{Number(lead.value || 0).toLocaleString('en-IN')}</td>
                  <td>
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead, e.target.value)}
                      style={{ border: '1px solid var(--border-color)', borderRadius: 6, padding: '4px 6px', fontSize: 12.5 }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="table-actions">
                    <button className="icon-btn" onClick={() => openEdit(lead)}>✏️</button>
                    <button className="icon-btn" onClick={() => setDeleteTarget(lead)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan={6} className="empty-state">No leads found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />

      {showForm && (
        <Modal title={editing ? 'Edit Lead' : 'Add Lead'} onClose={() => setShowForm(false)} width={640}>
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
                <label>Source</label>
                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                  {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Service Interested</label>
                <input value={form.serviceInterested} onChange={(e) => setForm({ ...form, serviceInterested: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Estimated Value (₹)</label>
                <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              </div>
            </div>
            <div className="form-field" style={{ marginTop: 16 }}>
              <label>Notes</label>
              <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="form-actions">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">{editing ? 'Update Lead' : 'Create Lead'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete lead "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Leads;
