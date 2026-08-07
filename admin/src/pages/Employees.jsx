import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Modal from '../components/Modal';
import SearchFilterBar from '../components/SearchFilterBar';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import Loader from '../components/Loader';
import '../styles/Table.css';
import '../styles/Form.css';

const emptyForm = {
  name: '', phone: '', email: '', designation: '', department: '',
  monthlySalary: 0, status: 'Active',
  bankDetails: { accountHolder: '', accountNumber: '', ifscCode: '', bankName: '' },
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/employees', { params });
      setEmployees(data.data);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const openNew = () => { setEditingId(null); setForm(emptyForm); setError(''); setShowForm(true); };
  const openEdit = (emp) => {
    setEditingId(emp._id);
    setForm({
      name: emp.name, phone: emp.phone, email: emp.email || '',
      designation: emp.designation || '', department: emp.department || '',
      monthlySalary: emp.monthlySalary || 0, status: emp.status,
      bankDetails: emp.bankDetails || emptyForm.bankDetails,
    });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, form);
      } else {
        await api.post('/employees', form);
      }
      setShowForm(false);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee');
    }
  };

  const handleDelete = async () => {
    await api.delete(`/employees/${deleteTarget._id}`);
    setDeleteTarget(null);
    fetchEmployees();
  };

  const setBank = (field, value) => setForm({ ...form, bankDetails: { ...form.bankDetails, [field]: value } });

  return (
    <div>
      <PageHeader title="Employees" subtitle={`${employees.length} employees`} action={<Button onClick={openNew}>+ Add Employee</Button>} />

      <SearchFilterBar search={search} onSearchChange={setSearch}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </SearchFilterBar>

      {loading ? <Loader /> : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Designation</th><th>Phone</th><th>Monthly Salary</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td><strong>{emp.name}</strong></td>
                  <td>{emp.designation || '-'}</td>
                  <td>{emp.phone}</td>
                  <td>₹{Number(emp.monthlySalary).toLocaleString('en-IN')}</td>
                  <td><StatusBadge status={emp.status} /></td>
                  <td className="table-actions">
                    <button className="icon-btn" onClick={() => navigate(`/employee-payments/new?employee=${emp._id}`)}>💵</button>
                    <button className="icon-btn" onClick={() => openEdit(emp)}>✏️</button>
                    <button className="icon-btn" onClick={() => setDeleteTarget(emp)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan={6} className="empty-state">No employees found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title={editingId ? 'Edit Employee' : 'Add Employee'} onClose={() => setShowForm(false)} width={520}>
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
                <label>Designation</label>
                <input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Department</label>
                <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Monthly Salary (₹)</label>
                <input type="number" value={form.monthlySalary} onChange={(e) => setForm({ ...form, monthlySalary: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <h4 style={{ margin: '16px 0 8px' }}>Bank Details (for payslip)</h4>
            <div className="form-grid">
              <div className="form-field">
                <label>Account Holder</label>
                <input value={form.bankDetails.accountHolder} onChange={(e) => setBank('accountHolder', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Account Number</label>
                <input value={form.bankDetails.accountNumber} onChange={(e) => setBank('accountNumber', e.target.value)} />
              </div>
              <div className="form-field">
                <label>IFSC Code</label>
                <input value={form.bankDetails.ifscCode} onChange={(e) => setBank('ifscCode', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Bank Name</label>
                <input value={form.bankDetails.bankName} onChange={(e) => setBank('bankName', e.target.value)} />
              </div>
            </div>

            <div className="form-actions">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">{editingId ? 'Update Employee' : 'Add Employee'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete employee "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Employees;
