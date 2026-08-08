import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import '../styles/Form.css';
import '../styles/InvoiceForm.css';

const emptyItem = { description: 'Basic Salary', amount: 0 };
const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Other'];

const EmployeePaymentForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState(searchParams.get('employee') || '');
  const [period, setPeriod] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [referenceNo, setReferenceNo] = useState('');
  const [status, setStatus] = useState('Paid');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/employees', { params: { limit: 200 } }).then(({ data }) => setEmployees(data.data));
  }, []);

  useEffect(() => {
    if (isEdit) {
      api.get(`/employee-payments/${id}`).then(({ data }) => {
        const p = data.data;
        setEmployeeId(p.employee?._id || p.employee);
        setPeriod(p.period);
        setPaymentDate(new Date(p.paymentDate).toISOString().slice(0, 10));
        setItems(p.items.map((i) => ({ description: i.description, amount: i.amount })));
        setPaymentMode(p.paymentMode);
        setReferenceNo(p.referenceNo || '');
        setStatus(p.status);
        setNotes(p.notes || '');
      });
    }
  }, [id, isEdit]);

  // Pre-fill the first line item with the selected employee's salary
  useEffect(() => {
    if (!isEdit && employeeId) {
      const emp = employees.find((e) => e._id === employeeId);
      if (emp) setItems([{ description: 'Basic Salary', amount: emp.monthlySalary || 0 }]);
    }
    // eslint-disable-next-line
  }, [employeeId, employees]);

  const updateItem = (idx, field, value) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };
  const addItem = () => setItems([...items, { description: '', amount: 0 }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const rawNet = +items.reduce((s, i) => s + (Number(i.amount) || 0), 0).toFixed(2);
  const netAmount = Math.max(0, rawNet);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        employee: employeeId,
        period,
        paymentDate,
        items: items.map(({ description, amount }) => ({ description, amount })),
        paymentMode,
        referenceNo,
        status,
        notes,
      };
      if (isEdit) {
        await api.put(`/employee-payments/${id}`, payload);
        navigate(`/employee-payments/${id}/view`);
      } else {
        const { data } = await api.post('/employee-payments', payload);
        navigate(`/employee-payments/${data.data._id}/view`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Employee Payment' : 'New Employee Payment'} subtitle="Create a separate payment invoice (payslip) for an employee" />

      <form onSubmit={handleSubmit} className="invoice-form">
        {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}

        <div className="form-grid">
          <div className="form-field">
            <label>Employee *</label>
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required disabled={isEdit}>
              <option value="">Select employee</option>
              {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
            </select>
            {isEdit && <p className="form-hint">Employee can't be changed after a payslip is created — delete and recreate it instead.</p>}
          </div>
          <div className="form-field">
            <label>Pay Period *</label>
            <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="e.g. August 2026" required />
          </div>
          <div className="form-field">
            <label>Payment Date *</label>
            <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Payment Mode</label>
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
              {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Reference No.</label>
            <input value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
            {status === 'Pending' ? (
              <p className="form-hint">
                Pending payslips don't count as money paid out yet — this won't appear on the Payments or
                Analytics pages until you mark it Paid.
              </p>
            ) : (
              <p className="form-hint">Marked Paid — this will show up on the Payments and Analytics pages immediately.</p>
            )}
          </div>
        </div>

        <h4 style={{ margin: '22px 0 10px' }}>Salary Components</h4>
        <p className="form-hint" style={{ marginTop: -6, marginBottom: 10 }}>
          Add earnings as positive amounts and deductions as negative amounts (e.g. "Advance Deduction", -2000).
        </p>
        <div className="items-table-wrap">
          <table className="items-table">
            <thead>
              <tr><th>Description</th><th>Amount</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      value={it.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      placeholder="e.g. Basic Salary, Bonus, Advance Deduction"
                      required
                    />
                  </td>
                  <td><input type="number" value={it.amount} onChange={(e) => updateItem(idx, 'amount', e.target.value)} /></td>
                  <td>
                    {items.length > 1 && (
                      <button type="button" className="icon-btn" onClick={() => removeItem(idx)}>🗑️</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button variant="secondary" onClick={addItem}>+ Add Line</Button>

        <div className="invoice-totals">
          <div className="total-row"><span>Net Amount Payable</span><strong>₹{netAmount.toLocaleString('en-IN')}</strong></div>
        </div>
        {rawNet < 0 && (
          <p className="form-hint" style={{ color: 'var(--danger)' }}>
            Deductions exceed earnings — net amount payable is floored at ₹0, it won't go negative.
          </p>
        )}

        <div className="form-field" style={{ marginTop: 16 }}>
          <label>Notes</label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="form-actions">
          <Button variant="secondary" onClick={() => navigate('/employee-payments')}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update Payment' : 'Create Payment'}</Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeePaymentForm;
