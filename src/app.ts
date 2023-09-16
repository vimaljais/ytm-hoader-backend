import express from "express";
import session from "express-session";
import passport from "passport";
import { authRoutes } from "./routes/auth";
import { configurePassport } from "./config/authConfig";
import { oauthConfig } from "./config/oauth";
import cors from "cors";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser"; // Import the cookie-parser middleware
import { ytmRoutes } from "./routes/ytm";

// Load environment variables from .env file
require("dotenv").config();

const app = express();
//cors
const allowedOrigins = ["http://localhost:3000"];
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("🚀 ~ file: app.ts:21 ~ origin:", origin);
      // Allow same-origin requests and requests from allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true // Allow credentials (e.g., cookies) to be sent in the request
  })
);

app.use(cookieParser());

app.use(
  session({
    secret: "your session secret",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      touchAfter: 1 * 3600 // time period in seconds
    }),
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if you are using HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
    }
  })
);

app.use((req, res, next) => {
  req.session.save(); // This will "touch" the session, updating the expiry.
  next();
});

// Passport configuration
configurePassport(passport, oauthConfig);

// Initialize Passport and session middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

// Authentication routes
app.use("/auth", authRoutes);
app.use("/ytm", ytmRoutes);

// Define the port to listen on (using PORT from the environment or default to 5000)
const port = process.env.PORT || 5000;

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("Connected to Distribution API Database - Initial Connection");

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(`Initial Distribution API Database connection error occured -`, err);
  });

export default app;
