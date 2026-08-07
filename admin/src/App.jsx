import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Customers from './pages/Customers';
import Services from './pages/Services';
import Invoices from './pages/Invoices';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceView from './pages/InvoiceView';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Bookings from './pages/Bookings';
import BookingForm from './pages/BookingForm';
import BookingView from './pages/BookingView';
import Employees from './pages/Employees';
import EmployeePayments from './pages/EmployeePayments';
import EmployeePaymentForm from './pages/EmployeePaymentForm';
import EmployeePaymentView from './pages/EmployeePaymentView';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="customers" element={<Customers />} />
        <Route path="services" element={<Services />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/new" element={<InvoiceForm />} />
        <Route path="invoices/:id/edit" element={<InvoiceForm />} />
        <Route path="invoices/:id/view" element={<InvoiceView />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="bookings/new" element={<BookingForm />} />
        <Route path="bookings/:id/edit" element={<BookingForm />} />
        <Route path="bookings/:id/view" element={<BookingView />} />
        <Route path="employees" element={<Employees />} />
        <Route path="employee-payments" element={<EmployeePayments />} />
        <Route path="employee-payments/new" element={<EmployeePaymentForm />} />
        <Route path="employee-payments/:id/edit" element={<EmployeePaymentForm />} />
        <Route path="employee-payments/:id/view" element={<EmployeePaymentView />} />
        <Route
          path="users"
          element={
            <ProtectedRoute roles={['superadmin']}>
              <Users />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
