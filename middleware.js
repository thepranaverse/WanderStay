const Listing = require("./Models/listing");
const Review = require("./Models/reviews");
const ExpressError = require("./utils/expressErrors.js");
const { listingSchema, reviewSchema } = require("./schema.js");


module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create New listing");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    // Don't delete it yet - we need it after Passport middleware
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  // for Authorization
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing... ");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  // for Authorization
  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the Author of this Review ");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

// validations for schema
module.exports.validateListing = (req, res, next) => {
  // Check if data is nested under 'listing'
  const dataToValidate = req.body.listing || req.body;

  let { error } = listingSchema.validate(dataToValidate);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    // Attach validated data to req for consistency
    req.validatedListing = dataToValidate;
    next();
  }
};

// validations for schema
module.exports.validateReviews = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};
