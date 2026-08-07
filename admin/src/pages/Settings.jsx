import { useEffect, useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Loader from '../components/Loader';
import '../styles/Form.css';

const Settings = () => {
  const [form, setForm] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/settings').then(({ data }) => setForm(data.data));
  }, []);

  if (!form) return <Loader fullScreen />;

  const set = (field, value) => setForm({ ...form, [field]: value });
  const setBank = (field, value) => setForm({ ...form, bankDetails: { ...form.bankDetails, [field]: value } });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/settings', form);
      if (logoFile) {
        const fd = new FormData();
        fd.append('logo', logoFile);
        await api.put('/settings/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      if (signatureFile) {
        const fd = new FormData();
        fd.append('signature', signatureFile);
        await api.put('/settings/signature', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setMessage('Settings saved successfully');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Company details, GST, invoicing, and email configuration" />

      {message && <div className="auth-success" style={{ marginBottom: 16 }}>{message}</div>}

      <form onSubmit={handleSave} className="invoice-form" style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
        <h4>Company Details</h4>
        <div className="form-grid">
          <div className="form-field">
            <label>Company Name</label>
            <input value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />
          </div>
          <div className="form-field">
            <label>GSTIN</label>
            <input value={form.gstin} onChange={(e) => set('gstin', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Address Line 1</label>
            <input value={form.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Address Line 2</label>
            <input value={form.addressLine2} onChange={(e) => set('addressLine2', e.target.value)} />
          </div>
          <div className="form-field">
            <label>City</label>
            <input value={form.city} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div className="form-field">
            <label>State</label>
            <input value={form.state} onChange={(e) => set('state', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Pincode</label>
            <input value={form.pincode} onChange={(e) => set('pincode', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Mobile</label>
            <input value={form.mobile} onChange={(e) => set('mobile', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Company Logo</label>
            <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
            {(logoFile || form.logo?.url) && (
              <img
                src={logoFile ? URL.createObjectURL(logoFile) : form.logo.url}
                alt="Logo preview"
                className="settings-image-preview"
              />
            )}
          </div>
          <div className="form-field">
            <label>Authorized Signatory Signature</label>
            <input type="file" accept="image/*" onChange={(e) => setSignatureFile(e.target.files[0])} />
            <p className="form-hint">
              Use a transparent-background PNG of the handwritten signature — it's placed above
              "Authorized Signatory" on the invoice PDF, exactly like the reference template.
            </p>
            {(signatureFile || form.signature?.url) && (
              <img
                src={signatureFile ? URL.createObjectURL(signatureFile) : form.signature.url}
                alt="Signature preview"
                className="settings-image-preview signature-preview"
              />
            )}
          </div>
        </div>

        <h4 style={{ marginTop: 24 }}>Invoice Settings</h4>
        <div className="form-grid">
          <div className="form-field">
            <label>Invoice Prefix</label>
            <input value={form.invoicePrefix} onChange={(e) => set('invoicePrefix', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Invoice Start Number</label>
            <input type="number" value={form.invoiceStartNumber} onChange={(e) => set('invoiceStartNumber', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Default TDS %</label>
            <input type="number" value={form.defaultTdsPercent} onChange={(e) => set('defaultTdsPercent', e.target.value)} />
          </div>
        </div>

        <h4 style={{ marginTop: 24 }}>Booking Coupon Settings</h4>
        <div className="form-grid">
          <div className="form-field">
            <label>Booking Coupon Prefix</label>
            <input value={form.bookingPrefix} onChange={(e) => set('bookingPrefix', e.target.value)} placeholder="e.g. CGM-BKG-" />
            <p className="form-hint">Coupon IDs look like {form.bookingPrefix}260804-001 (prefix + date + a daily sequence).</p>
          </div>
          <div className="form-field">
            <label>Website URL (used for the QR verify link)</label>
            <input value={form.websiteUrl} onChange={(e) => set('websiteUrl', e.target.value)} placeholder="https://crazygrowmindstudio.com" />
          </div>
        </div>

        <h4 style={{ marginTop: 24 }}>Employee Payslip Settings</h4>
        <div className="form-grid">
          <div className="form-field">
            <label>Payslip Prefix</label>
            <input value={form.payslipPrefix} onChange={(e) => set('payslipPrefix', e.target.value)} placeholder="e.g. CGM-EMP-" />
          </div>
          <div className="form-field">
            <label>Payslip Start Number</label>
            <input type="number" value={form.payslipStartNumber} onChange={(e) => set('payslipStartNumber', e.target.value)} />
          </div>
        </div>

        <h4 style={{ marginTop: 24 }}>Bank Details</h4>
        <div className="form-grid">
          <div className="form-field">
            <label>Bank Name</label>
            <input value={form.bankDetails.bankName} onChange={(e) => setBank('bankName', e.target.value)} />
          </div>
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
            <label>Branch</label>
            <input value={form.bankDetails.branch} onChange={(e) => setBank('branch', e.target.value)} />
          </div>
        </div>

        <div className="form-actions">
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
