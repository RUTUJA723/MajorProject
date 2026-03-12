const Listing = require("../models/listing");
const User = require("../models/user");
const Booking = require("../models/booking");

module.exports.listings = async (req, res) => {
    const listings = await Listing.find({});
    res.render("admin/listings", { listings });
};

module.exports.dashboard = async (req, res) => {
  const requests = await User.find({
    hostRequest: true,
    hostStatus: "pending",
  });

  res.render("admin/dashboard", { requests });
};


module.exports.adminDashboard = async (req, res) => {
  try {

    const requests = []; // your existing host requests
    const bookings = await Booking.find({})
      .populate("user")
      .populate("listing");

    res.render("admin/dashboard", {
      requests,
      bookings
    });

  } catch (err) {
    console.log(err);
    req.flash("error", "Error loading dashboard");
    res.redirect("/");
  }
};


module.exports.approveHost = async (req, res) => {
  const user = await User.findById(req.params.id);

  user.isOwner = true;
  user.isVerified = true;
  user.hostStatus = "approved";

  await user.save();

  res.redirect("/admin/dashboard");
};

module.exports.rejectHost = async (req, res) => {
  const user = await User.findById(req.params.id);
 
  user.hostStatus = "rejected";
  user.hostRequest = false;

  await user.save();

  res.redirect("/admin/dashboard");
};

// Delete Listing
module.exports.deleteListing = async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);

  req.flash("success", "Listing deleted.");
  res.redirect("/admin/dashboard");
};