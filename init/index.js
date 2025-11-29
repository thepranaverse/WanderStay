// index.js (updated)

const mongoose = require("mongoose");
const initdata = require("./data.js");
const listings = require("../Models/listing");
require("dotenv").config({ path: "../.env" });

// Mapbox Geocoding
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

async function main() {
  await mongoose.connect(process.env.ATLASDB_URL);
  console.log("Connected to DB");
  await initDB();
}

main().catch((err) => console.log(err));

const initDB = async () => {
  try {
    await listings.deleteMany({});
    console.log("Old data deleted!");

    for (let item of initdata.data) {
      // Geocode each listing (location)
      const geoData = await geocodingClient
        .forwardGeocode({
          query: item.location,
          limit: 1,
        })
        .send();

      // Create new listing with geometry
      const listing = new listings({
        ...item,
        owner: new mongoose.Types.ObjectId("684bd26da9706ed5260d6b02"),
        geometry: geoData.body.features[0].geometry, // << FIXED
      });

      await listing.save();
      console.log(`Inserted: ${item.title}`);
    }

    console.log("Database initialized with geocoded listings!");
  } catch (error) {
    console.log("Error while initializing DB:", error);
  }
};
