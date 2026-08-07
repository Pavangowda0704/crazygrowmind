import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import '../styles/Form.css';

const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card', 'Other'];

const BookingForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', gstin: '' });

  const [serviceType, setServiceType] = useState('');
  const [shootDate, setShootDate] = useState(new Date().toISOString().slice(0, 10));
  const [shootLocation, setShootLocation] = useState('');
  const [bookingAmount, setBookingAmount] = useState(0);
  const [initialPaid, setInitialPaid] = useState(0); // only used on create
  const [existingPaid, setExistingPaid] = useState(0); // read-only, shown on edit
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [authorizedBy, setAuthorizedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/customers', { params: { limit: 500 } }).then(({ data }) => setCustomers(data.data));
  }, []);

  useEffect(() => {
    if (isEdit) {
      api.get(`/bookings/${id}`).then(({ data }) => {
        const b = data.data;
        setCustomerId(b.customer?._id || b.customer);
        setServiceType(b.serviceType);
        setShootDate(new Date(b.shootDate).toISOString().slice(0, 10));
        setShootLocation(b.shootLocation || '');
        setBookingAmount(b.bookingAmount);
        setExistingPaid(b.amountPaid);
        setPaymentMode(b.paymentMode || 'UPI');
        setTransactionRef(b.transactionRef || '');
        setAuthorizedBy(b.authorizedBy || '');
        setNotes(b.notes || '');
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
  };

  const setNewCustomerField = (field, value) => setNewCustomer({ ...newCustomer, [field]: value });

  const paidSoFar = isEdit ? existingPaid : Number(initialPaid) || 0;
  const balance = +(Number(bookingAmount) - paidSoFar).toFixed(2);
  const status = Number(bookingAmount) > 0 && paidSoFar >= Number(bookingAmount)
    ? 'Fully Paid'
    : paidSoFar > 0 ? 'Partially Paid' : 'Unpaid';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        customer: isNewCustomer ? newCustomer : customerId,
        serviceType, shootDate, shootLocation,
        bookingAmount, paymentMode, transactionRef, authorizedBy, notes,
      };
      if (isEdit) {
        await api.put(`/bookings/${id}`, payload);
        navigate(`/bookings/${id}/view`);
      } else {
        const { data } = await api.post('/bookings', { ...payload, amountPaid: initialPaid });
        navigate(`/bookings/${data.data._id}/view`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save booking');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Booking' : 'New Booking'} subtitle="Create a booking & payment coupon" />

      <form onSubmit={handleSubmit} className="invoice-form">
        {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}

        <div className="form-grid">
          <div className="form-field">
            <label>Client *</label>
            <select value={isNewCustomer ? '__new__' : customerId} onChange={(e) => handleCustomerChange(e.target.value)} required={!isNewCustomer}>
              <option value="">Select client</option>
              {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              <option value="__new__">+ Add New Client</option>
            </select>
          </div>
        </div>

        {isNewCustomer && (
          <>
            <p className="form-hint" style={{ marginTop: -4, marginBottom: 10 }}>
              GSTIN is optional — leave it blank for friends / non-GST clients. This client is added to Customers automatically.
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
            </div>
          </>
        )}

        <div className="form-grid" style={{ marginTop: 16 }}>
          <div className="form-field">
            <label>Service / Shoot Type *</label>
            <input value={serviceType} onChange={(e) => setServiceType(e.target.value)} placeholder="e.g. Brand Shoot" required />
          </div>
          <div className="form-field">
            <label>Shoot Date *</label>
            <input type="date" value={shootDate} onChange={(e) => setShootDate(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Shoot Location</label>
            <input value={shootLocation} onChange={(e) => setShootLocation(e.target.value)} placeholder="e.g. Bangalore" />
          </div>
          <div className="form-field">
            <label>Booking Amount (₹) *</label>
            <input type="number" value={bookingAmount} onChange={(e) => setBookingAmount(e.target.value)} required min={0} />
          </div>

          {isEdit ? (
            <div className="form-field">
              <label>Amount Paid So Far (₹)</label>
              <input type="number" value={existingPaid} disabled />
              <p className="form-hint">Use "Record Payment" on the booking page to add further payments.</p>
            </div>
          ) : (
            <div className="form-field">
              <label>Initial Payment Collected (₹)</label>
              <input type="number" value={initialPaid} onChange={(e) => setInitialPaid(e.target.value)} min={0} max={bookingAmount} />
              <p className="form-hint">Leave 0 if nothing has been collected yet — you can record payments later.</p>
            </div>
          )}

          <div className="form-field">
            <label>Payment Mode</label>
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
              {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Transaction / Reference No.</label>
            <input value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Authorized By</label>
            <input value={authorizedBy} onChange={(e) => setAuthorizedBy(e.target.value)} placeholder="Name shown on the signature line" />
          </div>
        </div>

        <div className="invoice-totals">
          <div><span>Balance Amount</span><strong>₹{balance.toLocaleString('en-IN')}</strong></div>
          <div className="total-row"><span>Payment Status</span><strong>{status}</strong></div>
        </div>

        <div className="form-field" style={{ marginTop: 16 }}>
          <label>Notes</label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="form-actions">
          <Button variant="secondary" onClick={() => navigate('/bookings')}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update Booking' : 'Create Booking'}</Button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
