import { useEffect, useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import '../styles/Table.css';
import '../styles/Form.css';

const emptyForm = { name: '', email: '', password: '', role: 'staff' };

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users', form);
      setShowForm(false);
      setForm(emptyForm);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const toggleActive = async (user) => {
    await api.put(`/users/${user._id}`, { isActive: !user.isActive });
    fetchUsers();
  };

  return (
    <div>
      <PageHeader title="Admin Users" subtitle="Manage staff and admin accounts" action={<Button onClick={() => setShowForm(true)}>+ Add User</Button>} />

      {loading ? <Loader /> : (
        <div className="table-card">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                  <td><StatusBadge status={u.isActive ? 'Active' : 'Inactive'} /></td>
                  <td>
                    <button className="icon-btn" onClick={() => toggleActive(u)}>{u.isActive ? '🚫' : '✅'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title="Add Admin/Staff User" onClose={() => setShowForm(false)} width={420}>
          <form onSubmit={handleSubmit}>
            {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
            <div className="form-field">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-field" style={{ marginTop: 12 }}>
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-field" style={{ marginTop: 12 }}>
              <label>Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <div className="form-field" style={{ marginTop: 12 }}>
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
            <div className="form-actions">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">Create User</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Users;
