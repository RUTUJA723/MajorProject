const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const User = require("../models/user");
const { isLoggedIn, isOwner, validateListing , isVerifiedOwner} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });


//New Route
router.get("/new",isLoggedIn, isVerifiedOwner, listingController.renderNewForm);

router
.route("/")
.get(wrapAsync(listingController.index))
.post( 
    isLoggedIn,
    upload.single("image"), 
    validateListing,
    wrapAsync(listingController.createListing)
);

router.get("/search", wrapAsync(listingController.searchListing));

router.get("/category/:type", async (req, res) => {
    const { type } = req.params;
    const listings = await Listing.find({ category: type });
    res.render("listings/index", { allListings: listings });
});

//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));

router.get("/about", (req, res) => {
    res.render("listings/about");
});

router.get("/privacyterms", (req, res) => {
  res.render("listings/privacyterms");
});

router
.route("/:id")
.put(isLoggedIn, isOwner, 
    upload.single("image"), 
    validateListing, 
    wrapAsync(listingController.updateListing)
)
.get( wrapAsync(listingController.showListing))
.delete(isLoggedIn,isOwner, wrapAsync(listingController.destroyListing));


//Wishlist Route
router.post("/:id/toggleWishlist", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    if (user.wishlist.includes(id)) {
        // Remove
        user.wishlist.pull(id);
    } else {
        // Add
        user.wishlist.push(id);
    }

    await user.save();
    res.redirect(`/listings/${id}`);
});


module.exports = router;