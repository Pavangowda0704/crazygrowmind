import { useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Loader from '../components/Loader';
import '../styles/Table.css';
import '../styles/Reports.css';

const REPORT_TYPES = [
  { key: 'revenue', label: 'Revenue Report' },
  { key: 'leads', label: 'Leads Report' },
  { key: 'customers', label: 'Customers Report' },
  { key: 'services', label: 'Services Report' },
  { key: 'invoices', label: 'Invoices Report' },
  { key: 'payments', label: 'Payments Report' },
];

const Reports = () => {
  const [type, setType] = useState('revenue');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const runReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const { data } = await api.get(`/reports/${type}`, { params });
      setReport(data);
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => {
    if (!report) return null;
    const rows = report.data || [];

    if (type === 'revenue' || type === 'payments') {
      return (
        <table className="data-table">
          <thead><tr><th>Invoice #</th><th>Customer</th><th>Amount</th><th>Mode</th><th>Paid On</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p._id}>
                <td>{p.invoice?.invoiceNumber}</td>
                <td>{p.customer?.name}</td>
                <td>₹{Number(p.amount).toLocaleString('en-IN')}</td>
                <td>{p.mode}</td>
                <td>{new Date(p.paidOn).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (type === 'leads') {
      return (
        <table className="data-table">
          <thead><tr><th>Name</th><th>Phone</th><th>Status</th><th>Source</th><th>Value</th></tr></thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l._id}>
                <td>{l.name}</td><td>{l.phone}</td><td>{l.status}</td><td>{l.source}</td>
                <td>₹{Number(l.value || 0).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (type === 'customers') {
      return (
        <table className="data-table">
          <thead><tr><th>Name</th><th>Phone</th><th>Company</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c._id}><td>{c.name}</td><td>{c.phone}</td><td>{c.company}</td><td>{c.status}</td></tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (type === 'services') {
      return (
        <table className="data-table">
          <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s._id}><td>{s.name}</td><td>{s.category}</td><td>₹{Number(s.price).toLocaleString('en-IN')}</td><td>{s.status}</td></tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (type === 'invoices') {
      return (
        <table className="data-table">
          <thead><tr><th>Invoice #</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i._id}><td>{i.invoiceNumber}</td><td>{i.customer?.name}</td><td>₹{Number(i.total).toLocaleString('en-IN')}</td><td>{i.status}</td></tr>
            ))}
          </tbody>
        </table>
      );
    }
    return null;
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate business reports across all modules" />

      <div className="report-controls">
        <select value={type} onChange={(e) => { setType(e.target.value); setReport(null); }}>
          {REPORT_TYPES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button onClick={runReport}>Generate Report</Button>
      </div>

      {loading && <Loader />}

      {report && !loading && (
        <>
          <div className="report-summary">
            <div><span>Records</span><strong>{report.count ?? report.data?.length ?? 0}</strong></div>
            {report.total !== undefined && <div><span>Total Amount</span><strong>₹{Number(report.total).toLocaleString('en-IN')}</strong></div>}
            {report.totalValue !== undefined && <div><span>Total Value</span><strong>₹{Number(report.totalValue).toLocaleString('en-IN')}</strong></div>}
          </div>
          <div className="table-card">{renderTable()}</div>
        </>
      )}
    </div>
  );
};

export default Reports;
