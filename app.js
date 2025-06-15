if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const helmet = require("helmet");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./Models/listing");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressErrors.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user.js");
const PORT = process.env.PORT || 8080; // Render provides PORT

// using express routes to give structture to the code
const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Add SECURITY MIDDLEWARE (right after express() initialization)
app.use(helmet());
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  if (req.headers['x-forwarded-proto'] === 'http' && process.env.NODE_ENV === 'production') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// connectig mongo
const dbUrl = process.env.ATLASDB_URL;
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(dbUrl);
}

// connecting ejs
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// using Sessions
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error in Mongo-Session Store" ,err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days in milisecond from curr date
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax",
  },
};

app.use(session(sessionOptions));
app.use(flash());
// as we need a session info because we login him only once
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // auth. method as we plugin(google this line of code)
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // middleware to send flash
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// // demoUser to check passport
// app.get("/demoUser", async (req, res) => {
//   let fakeuser = new User({
//     email: "abc@123",
//     username: "abc",
//   });
//   let registedUser = await User.register(fakeuser, "abc456"); // to save fake user ,2nd parameter is password
//   res.send(registedUser);
// });

// to run express routes
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// error handling middleware

// if user send any random route req
// app.all("*", (req, res, next) => {
//   next(new ExpressError(404, "page not found"));
// })

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went Wrong!" } = err;
  res.status(statusCode).render("listings/error", { err });
  // res.status(statusCode).send(message);
});
app.listen(port, () => {
  console.log(`app is listning at ${port}`);
});

// so after express router all the routers stuff we put in another files & require them here
// so because of that in app.js we just perform main work like :-
// 1. connect with DB
// 2. strting server (get route of port 8080)
// 3. Error Handling
// 4.
