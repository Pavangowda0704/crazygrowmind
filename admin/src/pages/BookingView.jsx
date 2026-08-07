import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const BookingView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfBlob, setPdfBlob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentRef, setPaymentRef] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  const [sharing, setSharing] = useState(false);
  const iframeRef = useRef(null);

  const loadBooking = async () => {
    const { data } = await api.get(`/bookings/${id}`);
    setBooking(data.data);
  };

  const loadPdf = async () => {
    const response = await api.get(`/bookings/${id}/pdf`, { responseType: 'blob' });
    setPdfBlob(response.data);
    const url = URL.createObjectURL(response.data);
    setPdfUrl(url);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadBooking(), loadPdf()]);
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
    link.download = `${booking.couponId}.pdf`;
    link.click();
  };

  const handleShare = async () => {
    setSharing(true);
    setShareStatus('');
    try {
      const result = await sharePdfDocument({
        kind: 'booking',
        id,
        filename: `${booking.couponId}.pdf`,
        pdfBlob,
        whatsappText: `Booking coupon ${booking.couponId} from CrazyGrowMind Studio`,
      });
      if (result.method === 'native') setShareStatus('Shared.');
      else if (result.method === 'link') setShareStatus(result.copied ? 'Share link copied to clipboard.' : 'Share link opened.');
    } catch (err) {
      setShareStatus('Could not share this coupon. Try downloading instead.');
    } finally {
      setSharing(false);
      setTimeout(() => setShareStatus(''), 4000);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    await api.post('/payments', {
      booking: id,
      amount: paymentAmount,
      mode: paymentMode,
      referenceNo: paymentRef,
    });
    setShowPaymentModal(false);
    setPaymentAmount('');
    setPaymentRef('');
    await loadBooking();
    await loadPdf();
  };

  if (loading || !booking) return <Loader fullScreen />;

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/bookings')}>
        <ArrowLeft size={15} /> Back to Bookings
      </button>
      <PageHeader
        title={`Booking ${booking.couponId}`}
        subtitle={<StatusBadge status={booking.paymentStatus} />}
        action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={() => navigate(`/bookings/${id}/edit`)}>Edit</Button>
            <Button variant="secondary" onClick={handlePrint}>Print</Button>
            <Button variant="secondary" onClick={handleDownload}>Download PDF</Button>
            <Button variant="secondary" onClick={handleShare} disabled={sharing}>{sharing ? 'Sharing...' : 'Share'}</Button>
            {booking.balanceAmount > 0 && (
              <Button onClick={() => { setPaymentAmount(booking.balanceAmount); setShowPaymentModal(true); }}>Record Payment</Button>
            )}
          </div>
        }
      />
      {shareStatus && <p className="form-hint" style={{ margin: '-6px 0 12px' }}>{shareStatus}</p>}

      <div className="invoice-view-grid">
        <div className="pdf-frame-wrap">
          {pdfUrl && (
            <iframe ref={iframeRef} src={pdfUrl} title="Booking Coupon PDF" className="pdf-frame" />
          )}
        </div>
        <div className="invoice-summary-card">
          <h4>Summary</h4>
          <div className="summary-row"><span>Client</span><strong>{booking.clientName}</strong></div>
          <div className="summary-row"><span>Service</span><strong>{booking.serviceType}</strong></div>
          <div className="summary-row"><span>Shoot Date</span><strong>{new Date(booking.shootDate).toLocaleDateString('en-IN')}</strong></div>
          <div className="summary-row"><span>Booking Amount</span><strong>₹{booking.bookingAmount.toLocaleString('en-IN')}</strong></div>
          <div className="summary-row"><span>Amount Paid</span><strong>₹{booking.amountPaid.toLocaleString('en-IN')}</strong></div>
          <div className="summary-row pending"><span>Balance</span><strong>₹{booking.balanceAmount.toLocaleString('en-IN')}</strong></div>
        </div>
      </div>

      {showPaymentModal && (
        <Modal title="Record Payment" onClose={() => setShowPaymentModal(false)} width={420}>
          <form onSubmit={handleRecordPayment}>
            <div className="form-field">
              <label>Amount (₹)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
                max={booking.balanceAmount}
                min={0}
              />
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

export default BookingView;
