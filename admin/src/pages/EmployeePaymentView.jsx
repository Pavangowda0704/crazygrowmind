import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import '../styles/InvoiceView.css';
import '../styles/Form.css';

const EmployeePaymentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);

  const loadPayment = async () => {
    const { data } = await api.get(`/employee-payments/${id}`);
    setPayment(data.data);
  };

  const loadPdf = async () => {
    const response = await api.get(`/employee-payments/${id}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(response.data);
    setPdfUrl(url);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadPayment(), loadPdf()]);
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
    link.download = `${payment.payslipNumber}.pdf`;
    link.click();
  };

  if (loading || !payment) return <Loader fullScreen />;

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/employee-payments')}>
        <ArrowLeft size={15} /> Back to Employee Payments
      </button>
      <PageHeader
        title={`Payslip ${payment.payslipNumber}`}
        subtitle={<StatusBadge status={payment.status} />}
        action={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={() => navigate(`/employee-payments/${id}/edit`)}>Edit</Button>
            <Button variant="secondary" onClick={handlePrint}>Print</Button>
            <Button variant="secondary" onClick={handleDownload}>Download PDF</Button>
          </div>
        }
      />

      <div className="invoice-view-grid">
        <div className="pdf-frame-wrap">
          {pdfUrl && (
            <iframe ref={iframeRef} src={pdfUrl} title="Employee Payment PDF" className="pdf-frame" />
          )}
        </div>
        <div className="invoice-summary-card">
          <h4>Summary</h4>
          <div className="summary-row"><span>Employee</span><strong>{payment.employee?.name || payment.employeeSnapshot?.name}</strong></div>
          <div className="summary-row"><span>Period</span><strong>{payment.period}</strong></div>
          <div className="summary-row"><span>Payment Date</span><strong>{new Date(payment.paymentDate).toLocaleDateString('en-IN')}</strong></div>
          <div className="summary-row"><span>Payment Mode</span><strong>{payment.paymentMode}</strong></div>
          <div className="summary-row"><span>Net Amount</span><strong>₹{payment.netAmount.toLocaleString('en-IN')}</strong></div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePaymentView;
