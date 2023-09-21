import { Router, Request, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

import User from "../models/UserModel";
import TokenModel from "../models/TokenModel";
import { initializeUser } from "../controllers/userController";

require("dotenv").config();

const authRoutes = Router();

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

authRoutes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/youtube"],
    accessType: "offline",
    prompt: "consent"
  })
);

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req: any, res: Response) => {
    console.log("callback");

    if (!req.isAuthenticated()) {
      return res.json({ error: "Unauthorized", status: 401 });
    }

    initializeUser(req.user.userDoc.id);

    const apiRes = {
      message: "Login successful",
      status: 200,
      token: req.user.token,
      refreshToken: req.user.refreshToken
    };
    console.log("🚀 ~ file: auth.ts:57 ~ apiRes:", apiRes);

    res.json(apiRes);
  }
);

authRoutes.get("/user", passport.authenticate("jwt", { session: false }), (req: any, res: Response) => {
  // Check if the user is authenticated by passport
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = req.user;
  return res.json(user);
});

authRoutes.post("/refresh", async (req: Request, res: Response) => {
  const refreshToken = req?.body?.refreshToken;

  if (!refreshToken) {
    return res.status(403).json({ error: "Access denied, token missing!" });
  } else {
    // Check if the token is in store
    try {
      const tokenDoc = await TokenModel.findOne({ refreshToken: refreshToken });
      console.log("🚀 ~ file: auth.ts:85 ~ authRoutes.post ~ tokenDoc:", tokenDoc);

      if (!tokenDoc) {
        return res.status(401).json({ error: "Token does not exist or has expired" });
      }

      // If the token exists, then create a new one and update it in the database
      const user = await User.findOne({ _id: tokenDoc._userId });
      console.log("🚀 ~ file: auth.ts:93 ~ authRoutes.post ~ user:", user)

      if (!user) {
        return res.status(401).json({ error: "Token does not exist or has expired" });
      }

      const payload = {
        id: user.id,
        name: user.name,
        googleId: user.googleId
      };

      const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
      const newRefreshToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "30d" });

      tokenDoc.refreshToken = newRefreshToken;
      await tokenDoc.save();

      console.log("🚀 ~ file: auth.ts:105 ~ authRoutes.post ~ { accessToken: newAccessToken, refreshToken: newRefreshToken }:", { accessToken: newAccessToken, refreshToken: newRefreshToken })
      return res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }
});

authRoutes.post("/logout", async (req: Request, res: Response) => {
  console.log("Logging OUT");
  const refreshToken = req?.body?.refreshToken;
  if (!refreshToken) {
    return res.status(403).json({ error: "Access denied, token missing!" });
  }
  try {
    const tokenDoc = await TokenModel.findOne({ refreshToken: refreshToken });
    if (!tokenDoc) {
      return res.status(401).json({ error: "Token does not exist or has expired" });
    } else {
      await tokenDoc.deleteOne();
    }
  } catch (err) {
    console.log("🚀 ~ file: auth.ts:128 ~ authRoutes.post ~ err:", err);
    return res.status(500).json({ error: err });
  }
  return res.status(200).json({ message: "Logout successful" });
});

export { authRoutes };
