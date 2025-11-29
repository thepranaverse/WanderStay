const Review = require("../Models/reviews");
const Listing = require("../Models/listing");
// Reviews route (post)

module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  const { rating, comment } = req.body.review;

  const newReview = new Review({
    rating,
    comment,
    author: req.user._id,
  });

  await newReview.save();

  // Use findByIdAndUpdate to avoid full validation
  await Listing.findByIdAndUpdate(
    req.params.id,
    { $push: { reviews: newReview._id } },
    { new: true, runValidators: false } // Skip validation
  );

  req.flash("success", "Review Submitted!");
  res.redirect(`/listings/${listing._id}`);
};

// review delete route
module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // delete from DB array
  await Review.findByIdAndDelete(reviewId); // delete from website
  req.flash("success", "Review is Deleted!");

  res.redirect(`/listings/${id}`);
};
