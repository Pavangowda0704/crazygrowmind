import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { sharePdfDocument } from '../utils/share';
import '../styles/InvoiceView.css';
import '../styles/Form.css';

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfBlob, setPdfBlob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailing, setEmailing] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  const [sharing, setSharing] = useState(false);

  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertServiceType, setConvertServiceType] = useState('');
  const [convertShootDate, setConvertShootDate] = useState('');
  const [convertShootLocation, setConvertShootLocation] = useState('');
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState('');

  const iframeRef = useRef(null);

  const loadInvoice = async () => {
    const { data } = await api.get(`/invoices/${id}`);
    setInvoice(data.data);
    setEmailTo(data.data.customerSnapshot?.email || '');
    setConvertServiceType(data.data.items?.[0]?.item || '');
  };

  const loadPdf = async () => {
    const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
    setPdfBlob(response.data);
    const url = URL.createObjectURL(response.data);
    setPdfUrl(url);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadInvoice(), loadPdf()]);
      setLoading(false);
    };
    init();
    // eslint-disable-next-line
  }, [id]);

  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${invoice.invoiceNumber}.pdf`;
    link.click();
  };

  const handleEmail = async () => {
    setEmailing(true);
    try {
      await api.post(`/invoices/${id}/email`, { email: emailTo });
      setShowEmailModal(false);
      loadInvoice();
    } finally {
      setEmailing(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    await api.post('/payments', {
      invoice: id,
      amount: paymentAmount,
      mode: paymentMode,
      referenceNo: paymentRef,
    });
    setShowPaymentModal(false);
    setPaymentAmount('');
    setPaymentRef('');
    await loadInvoice();
    await loadPdf();
  };

  const handleShare = async () => {
    setSharing(true);
    setShareStatus('');
    try {
      const result = await sharePdfDocument({
        kind: 'invoice',
        id,
        filename: `${invoice.invoiceNumber}.pdf`,
        pdfBlob,
        whatsappText: `Invoice ${invoice.invoiceNumber} from ${invoice.customerSnapshot?.name ? '' : ''}CrazyGrowMind Studio`,
      });
      if (result.method === 'native') setShareStatus('Shared.');
      else if (result.method === 'link') setShareStatus(result.copied ? 'Share link copied to clipboard.' : 'Share link opened.');
    } catch (err) {
      setShareStatus('Could not share this invoice. Try downloading instead.');
    } finally {
      setSharing(false);
      setTimeout(() => setShareStatus(''), 4000);
    }
  };

  if (loading || !invoice) return <Loader fullScreen />;

  const pending = +(invoice.amountPayable - invoice.amountPaid).toFixed(2);
  const canConvertToBooking = invoice.status === 'Draft' && !invoice.sourceBooking;

  const handleConvertToBooking = async (e) => {
    e.preventDefault();
    setConvertError('');
    setConverting(true);
    try {
      const { data } = await api.post(`/invoices/${id}/convert-to-booking`, {
        serviceType: convertServiceType,
        shootDate: convertShootDate,
        shootLocation: convertShootLocation,
      });
      navigate(`/bookings/${data.data._id}/view`);
    } catch (err) {
      setConvertError(err.response?.data?.message || 'Failed to convert this invoice');
    } finally {
      setConverting(false);
    }
  };

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/invoices')}>
        <ArrowLeft size={15} /> Back to Invoices
      </button>
      <PageHeader
        title={`Invoice ${invoice.invoiceNumber}`}
        subtitle={<StatusBadge status={invoice.status} />}
        action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={() => navigate(`/invoices/${id}/edit`)}>Edit</Button>
            <Button variant="secondary" onClick={handlePrint}>Print</Button>
            <Button variant="secondary" onClick={handleDownload}>Download PDF</Button>
            <Button variant="secondary" onClick={handleShare} disabled={sharing}>{sharing ? 'Sharing...' : 'Share'}</Button>
            <Button variant="secondary" onClick={() => setShowEmailModal(true)}>Email Invoice</Button>
            {pending > 0 && <Button onClick={() => { setPaymentAmount(pending); setShowPaymentModal(true); }}>Record Payment</Button>}
            {canConvertToBooking && (
              <Button variant="secondary" onClick={() => setShowConvertModal(true)}>Convert to Booking Coupon</Button>
            )}
          </div>
        }
      />
      {shareStatus && <p className="form-hint" style={{ margin: '-6px 0 12px' }}>{shareStatus}</p>}

      {invoice.sourceBooking && (
        <div className="form-error" style={{ background: 'var(--info-bg, #e8f0fe)', color: 'var(--info, #1a56db)', marginBottom: 16 }}>
          This invoice was created by converting a booking coupon.
        </div>
      )}
      {invoice.convertedToBooking && (
        <div className="form-error" style={{ background: 'var(--success-bg, #e6f4ea)', color: 'var(--success, #1b7a3d)', marginBottom: 16 }}>
          This invoice was converted to a booking coupon — <Link to={`/bookings/${invoice.convertedToBooking}/view`}>view booking</Link>.
        </div>
      )}

      <div className="invoice-view-grid">
        <div className="pdf-frame-wrap">
          {pdfUrl && (
            <iframe ref={iframeRef} src={pdfUrl} title="Invoice PDF" className="pdf-frame" />
          )}
        </div>
        <div className="invoice-summary-card">
          <h4>Summary</h4>
          <div className="summary-row"><span>Customer</span><strong>{invoice.customerSnapshot?.name}</strong></div>
          <div className="summary-row"><span>Invoice Date</span><strong>{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</strong></div>
          <div className="summary-row"><span>Due Date</span><strong>{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</strong></div>
          <div className="summary-row"><span>Total</span><strong>₹{invoice.total.toLocaleString('en-IN')}</strong></div>
          <div className="summary-row"><span>TDS ({invoice.tdsPercent}%)</span><strong>₹{invoice.tdsAmount.toLocaleString('en-IN')}</strong></div>
          <div className="summary-row"><span>Amount Payable</span><strong>₹{invoice.amountPayable.toLocaleString('en-IN')}</strong></div>
          <div className="summary-row"><span>Amount Paid</span><strong>₹{invoice.amountPaid.toLocaleString('en-IN')}</strong></div>
          <div className="summary-row pending"><span>Pending</span><strong>₹{pending.toLocaleString('en-IN')}</strong></div>
          {invoice.emailedAt && (
            <p className="emailed-note">Last emailed on {new Date(invoice.emailedAt).toLocaleString()}</p>
          )}
        </div>
      </div>

      {showEmailModal && (
        <Modal title="Email Invoice" onClose={() => setShowEmailModal(false)} width={420}>
          <div className="form-field">
            <label>Recipient Email</label>
            <input type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} required />
          </div>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setShowEmailModal(false)}>Cancel</Button>
            <Button onClick={handleEmail} disabled={emailing}>{emailing ? 'Sending...' : 'Send Email'}</Button>
          </div>
        </Modal>
      )}

      {showPaymentModal && (
        <Modal title="Record Payment" onClose={() => setShowPaymentModal(false)} width={420}>
          <form onSubmit={handleRecordPayment}>
            <div className="form-field">
              <label>Amount (₹)</label>
              <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required max={pending} min={0} />
            </div>
            <div className="form-field" style={{ marginTop: 12 }}>
              <label>Payment Mode</label>
              <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                {['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card', 'Other'].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-field" style={{ marginTop: 12 }}>
              <label>Reference No.</label>
              <input value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} />
            </div>
            <div className="form-actions">
              <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
              <Button type="submit">Save Payment</Button>
            </div>
          </form>
        </Modal>
      )}

      {showConvertModal && (
        <Modal title="Convert to Booking Coupon" onClose={() => setShowConvertModal(false)} width={460}>
          <form onSubmit={handleConvertToBooking}>
            <p className="form-hint" style={{ marginTop: -4, marginBottom: 12 }}>
              Cancels this draft invoice and creates a simple booking coupon for {invoice.customerSnapshot?.name} instead
              (amount ₹{invoice.amountPayable.toLocaleString('en-IN')}). Any payment already recorded moves to the
              booking automatically.
            </p>
            {convertError && <div className="form-error" style={{ marginBottom: 12 }}>{convertError}</div>}
            <div className="form-field">
              <label>Service / Shoot Type</label>
              <input value={convertServiceType} onChange={(e) => setConvertServiceType(e.target.value)} required />
            </div>
            <div className="form-field" style={{ marginTop: 12 }}>
              <label>Shoot Date *</label>
              <input type="date" value={convertShootDate} onChange={(e) => setConvertShootDate(e.target.value)} required />
            </div>
            <div className="form-field" style={{ marginTop: 12 }}>
              <label>Shoot Location</label>
              <input value={convertShootLocation} onChange={(e) => setConvertShootLocation(e.target.value)} />
            </div>
            <div className="form-actions">
              <Button variant="secondary" onClick={() => setShowConvertModal(false)}>Cancel</Button>
              <Button type="submit" disabled={converting}>{converting ? 'Converting...' : 'Create Booking Coupon'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default InvoiceView;
