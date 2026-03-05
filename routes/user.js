const express = require("express");
const router = express.Router();
const multer  = require('multer');
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");

const userController = require("../controllers/users.js");

const fs = require("fs");

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.route("/signup")
.get(userController.renderSingupForm)
.post(wrapAsync(userController.signUp));

router.route("/login")
.get(userController.renderloginForm)
.post(
    saveRedirectUrl,
    passport.authenticate("local", { 
    failureRedirect: "/login", 
    failureFlash: true 
}), userController.login);

router.post("/request-host", isLoggedIn, async (req, res) => {
    req.user.isOwner = true;
    req.user.isVerified = false;
    await req.user.save();

    req.flash("success", "Host request sent to admin.");
    res.redirect("/listings");
});

router.get("/become-host", isLoggedIn, userController.renderBecomeHostForm);
router.post(
    "/become-host",
    isLoggedIn,
    upload.single("document"),
    userController.sendHostRequest
);

router.get("/wishlist", isLoggedIn, async (req, res) => {
   const user = await User.findById(req.user._id)
      .populate("wishlist");

   res.render("users/wishlist", { wishlist: user.wishlist });
});

const Listing = require("../models/listing");

router.get("/logout", userController.logout);

module.exports = router;