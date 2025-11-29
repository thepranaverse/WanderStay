if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user");

const listingRoutes = require("./routes/listings.js");
const reviewRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js");

const ExpressError = require("./utils/expressErrors");

const PORT = process.env.PORT || 8080;
const dbUrl = process.env.ATLASDB_URL;

//   DATABASE CONNECTION
mongoose
  .connect(dbUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("DB Connection Error:", err));

//   TEMPLATE & STATIC FILE SETUP
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// SECURITY HEADERS (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false, // required for Render (avoids CSP blocking)
  })
);

// SESSION SETUP
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SECRET },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("Session Store Error:", err);
});

const sessionConfig = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionConfig));
app.use(flash());

// PASSPORT (AUTHENTICATION)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//   FLASH + CURRENT USER
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

//   ROUTES - MINIMAL TEST
app.get("/test", (req, res) => {
  res.send("Test works!");
});

//   ROUTES
app.use("/listings", listingRoutes);
app.use("/listings", reviewRoutes);
app.use("/", userRoutes);

// 404 HANDLER
app.use((req, res) => {
  res.status(404).render("listings/error", {
    err: { statusCode: 404, message: "Page not found" },
  });
});

//ERROR HANDLER
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  res.status(statusCode).render("listings/error", { err });
});

//SERVER START
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
