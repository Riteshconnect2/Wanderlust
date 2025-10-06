const axios = require("axios");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");  

async function geocodeLocation(locationQuery) {
  if (!locationQuery) return null;
  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { q: locationQuery, format: "json", limit: 1 },
      headers: { "User-Agent": "wanderlust-app (your-email@example.com)" }  
    });
    if (response.data && response.data[0]) {
      const lat = parseFloat(response.data[0].lat);
      const lon = parseFloat(response.data[0].lon);
      return { lat, lon };
    }
  } catch (err) {
    console.error("Nominatim error:", err.message);
  }
  return null;
}

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = async (req, res) => {
  res.render("listings/new.ejs");
};


module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let coords = null;
  if (listing.geometry && listing.geometry.coordinates.length === 2) {
    coords = [listing.geometry.coordinates[1], listing.geometry.coordinates[0]];
  }

  res.render("listings/show.ejs", { listing, coords });
};

module.exports.createListing = async (req, res, next) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "Send valid data for listing");
  }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    newListing.image = { url, filename };
  }

  const geo = await geocodeLocation(req.body.listing.location);
  if (geo) {
    newListing.geometry = { type: "Point", coordinates: [geo.lon, geo.lat] }; 
  }

  await newListing.save();
  req.flash("success", "New listing Created!");
  res.redirect(`/listings/${newListing._id}`);
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_250,w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "Send valid data for listing");
  }

  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  const geo = await geocodeLocation(req.body.listing.location);
  if (geo) {
    listing.geometry = { type: "Point", coordinates: [geo.lon, geo.lat] };
    await listing.save();
  }

  req.flash("success", "Updated successfully!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log("Deleted:", deletedListing);
  req.flash("success", "Deleted successfully!");
  res.redirect("/listings");
};
