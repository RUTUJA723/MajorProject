const express = require("express");
const router = express.Router({ mergeParams: true });
const bookingController = require("../controllers/booking");
const { isLoggedIn } = require("../middleware");
const Booking = require("../models/booking")

router.post("/:id/book", isLoggedIn, bookingController.createBooking);

router.get("/mybookings", isLoggedIn, bookingController.myBookings);

router.get("/success", bookingController.successPage);

// Cancel booking
router.delete("/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
  await Booking.findByIdAndDelete(id);
  req.flash("success", "Booking cancelled successfully!");
  res.redirect("/bookings/mybookings");
});

module.exports = router;