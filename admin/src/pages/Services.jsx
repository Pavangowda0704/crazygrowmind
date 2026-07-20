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
import '../styles/Services.css';

const emptyForm = { name: '', category: '', description: '', price: '', taxPercent: 0, unit: 'Service', status: 'Active' };

const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      const { data } = await api.get('/services', { params });
      setServices(data.data);
      setPages(data.pages);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    api.get('/services/categories').then(({ data }) => setCategories(data.data));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (service) => {
    setEditing(service);
    setForm({ ...emptyForm, ...service });
    setImageFile(null);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      if (editing) {
        await api.put(`/services/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/services', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowForm(false);
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save service');
    }
  };

  const handleDelete = async () => {
    await api.delete(`/services/${deleteTarget._id}`);
    setDeleteTarget(null);
    fetchServices();
  };

  return (
    <div>
      <PageHeader
        title="Services"
        subtitle={`${total} total services`}
        action={<Button onClick={openCreate}>+ Add Service</Button>}
      />

      <SearchFilterBar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </SearchFilterBar>

      {loading ? (
        <Loader />
      ) : (
        <div className="services-grid">
          {services.map((s) => (
            <div className="service-card" key={s._id}>
              <div className="service-image">
                {s.image?.url ? <img src={s.image.url} alt={s.name} /> : <div className="service-placeholder">🛠️</div>}
              </div>
              <div className="service-body">
                <div className="service-top">
                  <h4>{s.name}</h4>
                  <StatusBadge status={s.status} />
                </div>
                <p className="service-category">{s.category}</p>
                <p className="service-desc">{s.description}</p>
                <div className="service-price">₹{Number(s.price).toLocaleString('en-IN')} / {s.unit}</div>
                <div className="table-actions" style={{ marginTop: 10 }}>
                  <button className="icon-btn" onClick={() => openEdit(s)}>✏️</button>
                  <button className="icon-btn" onClick={() => setDeleteTarget(s)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
          {services.length === 0 && <p className="empty-state">No services found</p>}
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />

      {showForm && (
        <Modal title={editing ? 'Edit Service' : 'Add Service'} onClose={() => setShowForm(false)} width={640}>
          <form onSubmit={handleSubmit}>
            {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
            <div className="form-grid">
              <div className="form-field">
                <label>Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Category *</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required list="category-list" />
                <datalist id="category-list">
                  {categories.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="form-field">
                <label>Price (₹) *</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Tax %</label>
                <input type="number" value={form.taxPercent} onChange={(e) => setForm({ ...form, taxPercent: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Unit</label>
                <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-field" style={{ marginTop: 16 }}>
              <label>Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-field" style={{ marginTop: 16 }}>
              <label>Service Image</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
            </div>
            <div className="form-actions">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">{editing ? 'Update Service' : 'Create Service'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete service "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Services;
