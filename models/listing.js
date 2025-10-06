const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    description: String,
    image: {
         url: String,
         filename: String,
    },
    price: { type: Number, required: true },
    location: String,
    country: String,
    reviews: [
         {
            type: Schema.Types.ObjectId,
            ref: "Review",
         },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    
    },
    coordinates: {
      // [lng, lat]
      type: [Number]
       
    }
  },
});

listingSchema.post("findOneAndDelete", async(listing) =>{
    if(listing) {
        await review.deleteMany({_id: { $in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports  = Listing;