import { Router, Request, Response } from "express";
import passport from "passport";
import { initializeUser } from "../controllers/userController";
import User from "../models/UserModel";
require("dotenv").config();
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

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
    console.log("🚀 ~ file: auth.ts:57 ~ apiRes:", apiRes)

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

export { authRoutes };
