// Shared by bookingController and paymentController so a booking's
// balance/status is always computed the same way, whatever changed
// (bookingAmount edited, or a payment recorded/reversed).
function computeBookingStatus(bookingAmount, amountPaid) {
  const amount = Math.max(0, Number(bookingAmount) || 0);
  const paid = Math.max(0, Number(amountPaid) || 0);
  // Clamp: an overpayment or a bookingAmount edited down after payment
  // should never produce a negative balance.
  const balance = +Math.max(0, amount - paid).toFixed(2);
  let status = 'Unpaid';
  if (amount > 0 && paid >= amount) status = 'Fully Paid';
  else if (paid > 0) status = 'Partially Paid';
  return { balance, status };
}

module.exports = { computeBookingStatus };
