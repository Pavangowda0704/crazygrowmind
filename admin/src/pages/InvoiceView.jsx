import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import '../styles/InvoiceView.css';
import '../styles/Form.css';

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [emailing, setEmailing] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const iframeRef = useRef(null);

  const loadInvoice = async () => {
    const { data } = await api.get(`/invoices/${id}`);
    setInvoice(data.data);
    setEmailTo(data.data.customerSnapshot?.email || '');
  };

  const loadPdf = async () => {
    const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
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

  if (loading || !invoice) return <Loader fullScreen />;

  const pending = +(invoice.amountPayable - invoice.amountPaid).toFixed(2);

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
            <Button variant="secondary" onClick={() => setShowEmailModal(true)}>Email Invoice</Button>
            {pending > 0 && <Button onClick={() => { setPaymentAmount(pending); setShowPaymentModal(true); }}>Record Payment</Button>}
          </div>
        }
      />

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
    </div>
  );
};

export default InvoiceView;
