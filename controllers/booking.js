const Booking = require("../models/booking");
const Listing = require("../models/listing");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports.createBooking = async (req, res) => {
   const checkIn = new Date(req.body.booking.checkIn);
   const checkOut = new Date(req.body.booking.checkOut);
   const listingId = req.body.booking.listing;

   // Check conflict (block even pending)
   const existingBooking = await Booking.findOne({
      listing: listingId,
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn }
   });

   if (existingBooking) {
      req.flash("error", "These dates are already booked!");
      return res.redirect(`/listings/${listingId}`);
   }

   const listing = await Listing.findById(listingId);

   const days = Math.ceil(
  (checkOut - checkIn) / (1000 * 60 * 60 * 24)
);

if (days <= 0) {
  req.flash("error", "Check-out must be after check-in");
  return res.redirect(`/listings/${listingId}`);
}

// Convert price to number (VERY IMPORTANT)
const pricePerDay = Number(listing.price);

const totalPrice = days * pricePerDay;

if (!totalPrice || totalPrice <= 0) {
  req.flash("error", "Invalid booking amount");
  return res.redirect(`/listings/${listingId}`);
}



   const booking = new Booking({
      checkIn,
      checkOut,
      listing: listingId,
      user: req.user._id,
      totalPrice,
      paymentStatus: "pending"
   });

   await booking.save();

   // Stripe session
   const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  mode: "payment",
  line_items: [
    {
      price_data: {
        currency: "inr", // change if needed
        product_data: {
          name: listing.title,
          description: `Booking from ${checkIn.toDateString()} to ${checkOut.toDateString()}`,
        },
        unit_amount: Math.round(Number(totalPrice) * 100), // Stripe needs paise (₹ × 100)
      },
      quantity: 1,
    },
  ],
  success_url: `http://localhost:8080/bookings/success?bookingId=${booking._id}`,
  cancel_url: `http://localhost:8080/listings/${listingId}`,
});

// Redirect user to Stripe payment page
res.redirect(session.url);
};


module.exports.successPage = async (req, res) => {
    const { bookingId } = req.query;
    console.log("query : " , bookingId);

    if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, 
            { paymentStatus: "paid" },
            { new: true }
        );
    }

    res.render("bookings/success");
};


module.exports.myBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate("listing")
        .populate("user")
        .sort({ createdAt: -1 });
    res.render("bookings/myBookings", { bookings });
};