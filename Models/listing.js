const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews");
const reviews = require("./reviews");
const { required } = require("joi");

const listingSchema = new Schema({
  title: {
    type: String,
    requires: true,
  },
  description: String,
  image: {
    filename: String,
    url: {
      type: String,
      default:
        "https://img.freepik.com/free-photo/beautiful-view-sunset-sea_23-2148019892.jpg?size=626&ext=jpg",
      set: (v) =>
        v === ""
          ? "https://img.freepik.com/free-photo/beautiful-view-sunset-sea_23-2148019892.jpg?size=626&ext=jpg"
          : v,
    },
  },
  price: Number,
  location: String,
  country: String,
  // taking reviews as a array
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    requires: true,
  },
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

// post mongoose to delete the reviews after delete the post
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing && listing.reviews.length) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema); // "Listing" is the model name
module.exports = Listing; // corrected from module.export
