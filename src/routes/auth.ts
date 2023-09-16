import { Router, Request, Response } from "express";
import passport from "passport";

const authRoutes = Router();

authRoutes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/youtube"],
    accessType: "offline",
    prompt: "consent",
  })
);
authRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req: any, res: Response) => {
    // Check if the user is authenticated by passport
    if (!req.isAuthenticated()) {
      return res.redirect("/");
    }

    // Save the user ID in the session
    req.session.userId = req.user.id;

    // Redirect to the frontend or success page after successful login
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?message=Login%20successful`);
  }
);
authRoutes.get("/user", async (req: Request, res: Response) => {
  // Check if the user is authenticated by passport
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // The user object is attached by the Passport middleware
    const user = req.user;
    // Return the user details as JSON response
    return res.json(user);
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

export { authRoutes };
