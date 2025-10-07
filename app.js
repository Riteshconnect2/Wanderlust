if(process.env.NODE_ENV != "production"){
   require('dotenv').config()
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema} = require("./schema.js");
const  Review = require("./models/review.js");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingsRouter = require("./routes/listing.js");
const reviewsRouter  = require("./routes/review.js");
const userRouter = require("./routes/user.js");
 

const review = require("./models/review.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main()
.then(() =>{
    console.log("connected to db");
})
.catch((err)=> {
    console.log(err);
});

async function main() {
    mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
const axios = require('axios');

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter: 24*3600,
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized:true,
  cookie:{
    expires: Date.now()*7*24*60*60*1000,
    maxAge :7*24*60*60*1000,
    httpOnly:true,
  },
};

 

async function geocodeLocation(location) {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: location,
        format: 'json',
        limit: 1
      }
    });
    if (response.data.length) {
      const { lat, lon } = response.data[0];
      return { lat: parseFloat(lat), lon: parseFloat(lon) };
    }
    return null;
  } catch (e) {
    console.error('Geocoding error:', e);
    return null;
  }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})
 

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews" ,reviewsRouter);
app.use("/", userRouter);
 

async function geocodeLocation(locationQuery) {
  if (!locationQuery) return null;
  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { q: locationQuery, format: "json", limit: 1 },
      headers: { "User-Agent": "wanderlust-app (your-email@example.com)" },
    });
    if (response.data && response.data[0]) {
      const lat = parseFloat(response.data[0].lat);
      const lon = parseFloat(response.data[0].lon);
      return { lat, lon };
    }
  } catch (err) {
    console.error("Geocoding error:", err.message);
  }
  return null;
}

app.get("/destinations", async (req, res) => {
  const city = req.query.city; 
  let coords = [19.4178, 72.8225];  
  let location = city || '';

  if (city) {
    const geo = await geocodeLocation(city);
    if (geo) {
      coords = [geo.lat, geo.lon];
    }
  }
  res.render("listings/destination.ejs", { coords, listing: { location } });
});

app.get('/features/trending', async (req, res) => {
  res.render('features/trending');
});

app.get('/features/farm', async (req, res) => {
  res.render('features/farm.ejs');
});

app.get('/features/room', async (req, res) => {
  res.render('features/room.ejs');
});

app.get('/features/city', async (req, res) => {
  res.render('features/city.ejs');
});

app.get('/features/mountain', async (req, res) => {
  res.render('features/mountain.ejs');
});
app.get('/features/pool', async (req, res) => {
  res.render('features/pool.ejs');
});


app.get("/listings", wrapAsync(async (req,res) => {
  const allListings = await Listing.find({ price: { $exists: true } });
  res.render("listings/index.ejs", { allListings });
}));

app.get("/", (req, res) => {
  res.redirect("/listings");  
});

// 404 Middleware for Page Not Found
app.use((req, res, next) => {
  const err = new ExpressError(404, "Page Not Found");
  next(err);
});

 
app.use((err, req, res, next ) => {
    let { statusCode = 500, message = "Something went wrong!"} = err;
    res.render("listings/error.ejs", {message});
});

app.listen(8080,() => {
    console.log("server is listening to port 8080");
});