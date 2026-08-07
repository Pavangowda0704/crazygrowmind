import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import '../styles/Form.css';
import '../styles/InvoiceForm.css';

const emptyItem = { item: '', rate: 0, qty: 1, taxPercent: 0 };

const InvoiceForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);

  const [customerId, setCustomerId] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '', phone: '', email: '', gstin: '', company: '',
    billingAddress: { line1: '', city: '', state: '', pincode: '' },
  });
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [placeOfSupply, setPlaceOfSupply] = useState('');
  const [tdsPercent, setTdsPercent] = useState(2);
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/customers', { params: { limit: 200 } }).then(({ data }) => setCustomers(data.data));
    api.get('/services', { params: { limit: 200 } }).then(({ data }) => setServices(data.data));
    api.get('/settings').then(({ data }) => {
      setSettings(data.data);
      setTdsPercent(data.data.defaultTdsPercent ?? 2);
    });
  }, []);

  useEffect(() => {
    if (isEdit) {
      api.get(`/invoices/${id}`).then(({ data }) => {
        const inv = data.data;
        setCustomerId(inv.customer?._id || inv.customer);
        setInvoiceDate(new Date(inv.invoiceDate).toISOString().slice(0, 10));
        setDueDate(new Date(inv.dueDate).toISOString().slice(0, 10));
        setPlaceOfSupply(inv.placeOfSupply || '');
        setTdsPercent(inv.tdsPercent);
        setItems(inv.items.map((i) => ({ item: i.item, rate: i.rate, qty: i.qty, taxPercent: i.taxPercent })));
        setNotes(inv.notes || '');
      });
    }
  }, [id, isEdit]);

  const handleCustomerChange = (custId) => {
    if (custId === '__new__') {
      setIsNewCustomer(true);
      setCustomerId('');
      return;
    }
    setIsNewCustomer(false);
    setCustomerId(custId);
    const cust = customers.find((c) => c._id === custId);
    if (cust) setPlaceOfSupply(cust.placeOfSupply || '');
  };

  const setNewCustomerField = (field, value) => setNewCustomer({ ...newCustomer, [field]: value });
  const setNewCustomerAddress = (field, value) =>
    setNewCustomer({ ...newCustomer, billingAddress: { ...newCustomer.billingAddress, [field]: value } });

  const updateItem = (idx, field, value) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };

  const handleServiceSelect = (idx, serviceId) => {
    const service = services.find((s) => s._id === serviceId);
    if (service) {
      const updated = [...items];
      updated[idx] = { ...updated[idx], item: service.name, rate: service.price, taxPercent: service.taxPercent };
      setItems(updated);
    }
  };

  const addItem = () => setItems([...items, { ...emptyItem }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  // Live totals calculation (mirrors backend logic)
  const computed = items.map((it) => {
    const rate = Number(it.rate) || 0;
    const qty = Number(it.qty) || 1;
    const taxableValue = rate * qty;
    const taxPercent = Number(it.taxPercent) || 0;
    const taxAmount = +(taxableValue * (taxPercent / 100)).toFixed(2);
    const amount = +(taxableValue + taxAmount).toFixed(2);
    return { ...it, taxableValue, taxAmount, amount };
  });
  const taxableAmount = +computed.reduce((s, i) => s + i.taxableValue, 0).toFixed(2);
  const totalTax = +computed.reduce((s, i) => s + i.taxAmount, 0).toFixed(2);
  const total = +(taxableAmount + totalTax).toFixed(2);
  const tdsAmount = +(taxableAmount * (Number(tdsPercent) / 100)).toFixed(2);
  const amountPayable = +(total - tdsAmount).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        customer: isNewCustomer ? newCustomer : customerId,
        invoiceDate,
        dueDate,
        placeOfSupply,
        tdsPercent,
        items: items.map(({ item, rate, qty, taxPercent }) => ({ item, rate, qty, taxPercent })),
        notes,
      };
      if (isEdit) {
        await api.put(`/invoices/${id}`, payload);
        navigate(`/invoices/${id}/view`);
      } else {
        const { data } = await api.post('/invoices', payload);
        navigate(`/invoices/${data.data._id}/view`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Invoice' : 'New Invoice'} subtitle="Create a GST-compliant tax invoice" />

      <form onSubmit={handleSubmit} className="invoice-form">
        {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}

        <div className="form-grid">
          <div className="form-field">
            <label>Customer *</label>
            <select value={isNewCustomer ? '__new__' : customerId} onChange={(e) => handleCustomerChange(e.target.value)} required={!isNewCustomer}>
              <option value="">Select customer</option>
              {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              <option value="__new__">+ Add New Client</option>
            </select>
          </div>
          <div className="form-field">
            <label>Place of Supply</label>
            <input value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)} placeholder="e.g. 29-KARNATAKA" />
          </div>
          <div className="form-field">
            <label>Invoice Date *</label>
            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Due Date *</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>TDS % under GST</label>
            <input type="number" value={tdsPercent} onChange={(e) => setTdsPercent(e.target.value)} />
          </div>
        </div>

        {isNewCustomer && (
          <>
            <h4 style={{ margin: '18px 0 10px' }}>New Client Details</h4>
            <p className="form-hint" style={{ marginTop: -6, marginBottom: 10 }}>
              GSTIN is optional — leave it blank for clients who don't need a GST invoice (e.g. friends, informal work).
              This client is added to Customers automatically when you save.
            </p>
            <div className="form-grid">
              <div className="form-field">
                <label>Name *</label>
                <input value={newCustomer.name} onChange={(e) => setNewCustomerField('name', e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Phone *</label>
                <input value={newCustomer.phone} onChange={(e) => setNewCustomerField('phone', e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input type="email" value={newCustomer.email} onChange={(e) => setNewCustomerField('email', e.target.value)} />
              </div>
              <div className="form-field">
                <label>GSTIN (optional)</label>
                <input value={newCustomer.gstin} onChange={(e) => setNewCustomerField('gstin', e.target.value)} placeholder="Leave blank if not applicable" />
              </div>
              <div className="form-field">
                <label>Company</label>
                <input value={newCustomer.company} onChange={(e) => setNewCustomerField('company', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Address</label>
                <input value={newCustomer.billingAddress.line1} onChange={(e) => setNewCustomerAddress('line1', e.target.value)} />
              </div>
              <div className="form-field">
                <label>City</label>
                <input value={newCustomer.billingAddress.city} onChange={(e) => setNewCustomerAddress('city', e.target.value)} />
              </div>
              <div className="form-field">
                <label>State</label>
                <input value={newCustomer.billingAddress.state} onChange={(e) => setNewCustomerAddress('state', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Pincode</label>
                <input value={newCustomer.billingAddress.pincode} onChange={(e) => setNewCustomerAddress('pincode', e.target.value)} />
              </div>
            </div>
          </>
        )}

        <h4 style={{ margin: '22px 0 10px' }}>Line Items</h4>
        <div className="items-table-wrap">
          <table className="items-table">
            <thead>
              <tr>
                <th>Item / Service</th>
                <th>Rate</th>
                <th>Qty</th>
                <th>Tax %</th>
                <th>Taxable Value</th>
                <th>Tax Amt</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {computed.map((it, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      list="service-list"
                      value={it.item}
                      onChange={(e) => updateItem(idx, 'item', e.target.value)}
                      onBlur={(e) => {
                        const svc = services.find((s) => s.name === e.target.value);
                        if (svc) handleServiceSelect(idx, svc._id);
                      }}
                      placeholder="Type or select a service"
                      required
                    />
                  </td>
                  <td><input type="number" value={it.rate} onChange={(e) => updateItem(idx, 'rate', e.target.value)} /></td>
                  <td><input type="number" value={it.qty} onChange={(e) => updateItem(idx, 'qty', e.target.value)} /></td>
                  <td><input type="number" value={it.taxPercent} onChange={(e) => updateItem(idx, 'taxPercent', e.target.value)} /></td>
                  <td>₹{it.taxableValue.toLocaleString('en-IN')}</td>
                  <td>₹{it.taxAmount.toLocaleString('en-IN')}</td>
                  <td>₹{it.amount.toLocaleString('en-IN')}</td>
                  <td>
                    {items.length > 1 && (
                      <button type="button" className="icon-btn" onClick={() => removeItem(idx)}>🗑️</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <datalist id="service-list">
            {services.map((s) => <option key={s._id} value={s.name} />)}
          </datalist>
        </div>
        <Button variant="secondary" onClick={addItem}>+ Add Item</Button>

        <div className="invoice-totals">
          <div><span>Taxable Amount</span><strong>₹{taxableAmount.toLocaleString('en-IN')}</strong></div>
          <div><span>Total Tax</span><strong>₹{totalTax.toLocaleString('en-IN')}</strong></div>
          <div className="total-row"><span>Total</span><strong>₹{total.toLocaleString('en-IN')}</strong></div>
          <div><span>TDS @ {tdsPercent}%</span><strong>₹{tdsAmount.toLocaleString('en-IN')}</strong></div>
          <div className="total-row"><span>Amount Payable</span><strong>₹{amountPayable.toLocaleString('en-IN')}</strong></div>
        </div>

        <div className="form-field" style={{ marginTop: 16 }}>
          <label>Notes</label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="form-actions">
          <Button variant="secondary" onClick={() => navigate('/invoices')}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update Invoice' : 'Create Invoice'}</Button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
