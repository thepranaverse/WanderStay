const express = require("express");
const router = express.Router({ mergeParams: true }); // IMPORTANT ❗
const Listing = require("../Models/listing");
const Review = require("../Models/reviews");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, validateReviews } = require("../middleware.js");
const reviewController = require("../controllers/review.js");

// CREATE review
router.post(
  "/:id/reviews",
  isLoggedIn,
  validateReviews,
  wrapAsync(reviewController.createReview)
);

// DELETE review
router.delete(
  "/:id/reviews/:reviewId",
  isLoggedIn,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;
