const mongoose = require("mongoose");
const { schema, create } = require("./listing");
const { string } = require("joi");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  comment: {
    type: String,
    required: true, // Make sure comment is required
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  author: {
    type: Schema.Types.ObjectId,
    ref : "User"
  },
});

module.exports = mongoose.model("Review", reviewSchema);

// adding review is a 2 steps process
// we add reviews on show page because we gave review to the partiular page
// steps:
//1. setting up the review form (as we take reviews as a form)
//2. submitting the form (post req.)
