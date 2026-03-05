const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js"); 

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        //redirectUrl save
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async(req, res, next) => {
    const { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing.owner.equals(res.locals.currUser._id)){
    req.flash("error", "You are not the author of this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
        next();
};

module.exports.validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
        next();
};

module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if(!review.author.equals(res.locals.currUser._id)){
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isVerifiedOwner = (req, res, next) => {
    if(!req.user.isAdmin && !req.user.isVerified){
        req.flash("error", "You must be a verified villa owner to create listings.");
        return res.redirect("/listings");
    }
    next();
};

module.exports.isAdmin = (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
        req.flash("error", "Access denied.");
        return res.redirect("/listings");
    }
    next();
};