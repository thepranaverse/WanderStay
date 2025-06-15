// taking all functin calll from listings and paste here
const Listing = require("../Models/listing");
// map settings
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// index route : return all listings
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

// new & crate route
module.exports.newForm = (req, res) => {
  res.render("listings/new"); // or whatever the new listing page is
};
// create rout
module.exports.create = async (req, res) => {
  // map work
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  // form work
  if (!req.body.listing) {
    // check for err
    throw new ExpressError(400, "send valid data for listing");
  }
  // let { title, ..... , country } = req.body;
  console.log(req.body); // Check what's actually being received

  let listing = req.body.listing; // makng obj listing in which title & all save as key-val pair
  const newListing = new Listing(listing);
  newListing.owner = req.user._id;
  // map
  newListing.geometry = response.body.features[0].geometry;

  req.flash("success", "New Listing Created!");
  let savedListings = await newListing.save();
  res.redirect("/listings");
};

// show route
module.exports.show = async (req, res) => {
  const { id } = req.params;
  const list = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  console.log("Listing owner:", list.owner); // Should show user document
  console.log("Owner username:", list.owner?.username); // Should show username

  if (!list) {
    req.flash("error", "Listing you requested for does not Exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show", { list });
};

// update : Edit & update route
// 1.edit route
module.exports.edit = async (req, res) => {
  let { id } = req.params;
  const list = await Listing.findById(id);
  if (!list) {
    req.flash("error", "Listing you requested for dose not Exists!");
    res.redirect("/listings");
  }
  res.render("listings/edit", { list });
};
// 2.Update route
module.exports.update = async (req, res) => {
  const { id } = req.params;
  const listingData = req.body.listing;
  // Rebuild the nested image object
  if (listingData.image) {
    listingData.image = { url: listingData.image };
  }

  try {
    await Listing.findByIdAndUpdate(id, listingData);
    req.flash("success", "Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error("Update error:", err.message);
    req.flash("error", "Something went wrong while updating.");
    res.redirect(`/listings/${id}/edit`);
  }
};

// delete route
module.exports.delete = async (req, res) => {
  const { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
