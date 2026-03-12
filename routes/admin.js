const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const { isAdmin } = require("../middleware");

// Dashboard
router.get("/dashboard", isAdmin, adminController.adminDashboard);

// Host Requests page
router.get("/hosts", isAdmin,adminController.dashboard); 
// (for now we can reuse same controller)

// Listings page
router.get("/listings",isAdmin, adminController.listings);

//All Bookings
// router.get("/bookings",isAdmin, adminController.getAllBookings);

// Approve
router.post("/approve/:id", isAdmin, adminController.approveHost);

// Reject
router.post("/reject/:id", isAdmin, adminController.rejectHost);

module.exports = router;