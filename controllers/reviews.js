const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async(req, res) => {
   let listing = await Listing.findById(req.params.id);
   let newReview = new Review(req.body.review);
   newReview.author = req.user._id;
   // console.log(newReview);
   listing.reviews.push(newReview);

   await newReview.save();
   await listing.save();
   req.flash("success", "New Review Created!");
   
   res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async(req, res) => {
    let {id, reviewId} = req.params;
    const listing = await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    if(!listing.owner.equals(res.locals.currUser._id)){
    req.flash("error", "You are not the author of this listing");
    return res.redirect(`/listings/${id}`);
  }
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");

    res.redirect(`/listings/${id}`);
}