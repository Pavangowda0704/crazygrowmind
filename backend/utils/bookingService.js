const Booking = require('../models/Booking');
const Settings = require('../models/Settings');

function pad(n, len) {
  return String(n).padStart(len, '0');
}

// Coupon IDs look like CGM-BKG-260804-001 (prefix + YYMMDD + a sequence
// that resets every day), matching the reference coupon design. Shared so
// both direct booking creation and invoice-to-booking conversion number
// coupons identically.
async function getNextCouponId() {
  const settings = (await Settings.findOne()) || (await Settings.create({}));
  const now = new Date();
  const datePart = `${pad(now.getFullYear() % 100, 2)}${pad(now.getMonth() + 1, 2)}${pad(now.getDate(), 2)}`;
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  const countToday = await Booking.countDocuments({ bookingDate: { $gte: startOfDay, $lt: endOfDay } });
  const seq = pad(countToday + 1, 3);
  return { couponId: `${settings.bookingPrefix || 'CGM-BKG-'}${datePart}-${seq}`, settings };
}

module.exports = { getNextCouponId };
