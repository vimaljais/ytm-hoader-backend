import express from "express";
import passport from "passport";
import { authRoutes } from "./routes/auth";
import { configurePassport } from "./config/authConfig";
import { oauthConfig } from "./config/oauth";
import cors from "cors";
import mongoose from "mongoose";
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
      if (!origin || allowedOrigins.includes(origin) || true) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true // Allow credentials (e.g., cookies) to be sent in the request
  })
);

app.use(cookieParser());
 
// Passport configuration
configurePassport(passport, oauthConfig);

// Initialize Passport and session middleware
app.use(passport.initialize());

// Routes
app.get("/", (req, res) => {
  res.send("Hello from the backend!"); 
});

// Authentication routes
app.use("/auth", authRoutes);
app.use("/ytm", ytmRoutes);

// Define the port to listen on (using PORT from the environment or default to 5000)
const port = Number(process.env.PORT) || 5000;

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("Connected to Distribution API Database - Initial Connection");

    // Start the server
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(`Initial Distribution API Database connection error occured -`, err);
  });

export default app;
