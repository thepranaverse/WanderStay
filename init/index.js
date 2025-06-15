const mongoose = require("mongoose");
const initdata = require("./data.js");
const listings = require("../Models/listing");
const { ObjectId } = require('mongodb'); // Add at the top

main()
  .then(() => {
    console.log("connected to DB");
    initDB();
    updateListing(); // Call the update function here
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async () => {
  await listings.deleteMany({});
  initdata.data = initdata.data.map((obj) => ({
    ...obj,
    owner: new mongoose.Types.ObjectId("684bd26da9706ed5260d6b02"), // Use mongoose's ObjectId
  }));
  await listings.insertMany(initdata.data);
  console.log("data was init");
};

const updateListing = async () => {
  await listings.updateOne(
    { title: "Cozy Beachfront Cottage" },
    {
      $set: {
        image: {
          filename: "listingimage",
          url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
        },
      },
    }
  );
  console.log("Listing updated");
};
