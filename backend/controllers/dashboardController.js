const asyncHandler = require('express-async-handler');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const ActivityLog = require('../models/ActivityLog');

// @desc Dashboard summary + chart data
// @route GET /api/dashboard
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [totalLeads, totalCustomers, totalServices, totalInvoices, invoices, payments, recentActivity] =
    await Promise.all([
      Lead.countDocuments(),
      Customer.countDocuments(),
      Service.countDocuments(),
      Invoice.countDocuments(),
      Invoice.find(),
      Payment.find(),
      ActivityLog.find().populate('user', 'name').sort('-createdAt').limit(10),
    ]);

  const totalRevenue = +invoices.reduce((s, inv) => s + inv.amountPaid, 0).toFixed(2);
  const totalPending = +invoices.reduce((s, inv) => s + Math.max(0, inv.amountPayable - inv.amountPaid), 0).toFixed(2);
  const totalPayments = payments.length;

  // Leads by status (for pie/bar chart)
  const leadStatusAgg = await Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

  // Revenue by month (last 6 months) for line/bar chart
  const now = new Date();
  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthPayments = payments.filter((p) => p.paidOn >= start && p.paidOn < end);
    const revenue = +monthPayments.reduce((s, p) => s + p.amount, 0).toFixed(2);
    monthlyRevenue.push({
      month: start.toLocaleString('default', { month: 'short', year: '2-digit' }),
      revenue,
    });
  }

  // Invoice status breakdown
  const invoiceStatusAgg = await Invoice.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

  res.json({
    success: true,
    data: {
      totals: {
        leads: totalLeads,
        customers: totalCustomers,
        services: totalServices,
        invoices: totalInvoices,
        revenue: totalRevenue,
        pendingAmount: totalPending,
        payments: totalPayments,
      },
      charts: {
        leadsByStatus: leadStatusAgg.map((x) => ({ status: x._id, count: x.count })),
        invoicesByStatus: invoiceStatusAgg.map((x) => ({ status: x._id, count: x.count })),
        monthlyRevenue,
      },
      recentActivity,
    },
  });
});
