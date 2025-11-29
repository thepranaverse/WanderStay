const express = require("express");
const router = express.Router();
const Listing = require("../Models/listing");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressErrors.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

// cotroller
const listingController = require("../controllers/listing.js");

// reformating rotes with Router.route
router
  .route("/") // index & create route
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn, validateListing, wrapAsync(listingController.create));

// new & crate route
router.get("/new", isLoggedIn, listingController.newForm);

// show ,Update & delete route
router
  .route("/:id")
  .get(wrapAsync(listingController.show))
  .put(
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(listingController.update))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.delete));

// update : Edit & update route
// 1.edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.edit));

module.exports = router;
