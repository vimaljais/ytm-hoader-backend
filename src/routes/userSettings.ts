import { Router, Request, Response } from "express";
import passport from "passport";
import UserSettings from "../models/UserSettingsModel";

const userSettings = Router();

// Update user configuration settings
userSettings.post("/update", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {
  try {
    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Extract the authenticated user's ID
    const user = req.user;

    const { syncFrequency, downloadQuality } = req.body;

    let userSettings = await UserSettings.findOne({ user: user });

    if (!userSettings) {
      userSettings = new userSettings({ user: user });
    }

    userSettings.syncFrequency = syncFrequency;
    userSettings.downloadQuality = downloadQuality;

    await userSettings.save();
    console.log("Configuration Settings updated of user: ", user);

    res.status(200).json({ message: "User settings updated successfully" });
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

userSettings.get("/", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {
  try {
    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Extract the authenticated user's ID
    const user = req.user;

    // Find the user settings for the authenticated user
    const userSettingsDoc = await UserSettings.findOne({ user: user });

    const { syncFrequency, downloadQuality } = userSettingsDoc;

    if (!userSettingsDoc) {
      return res.status(404).json({ error: "User settings not found" });
    }

    res.status(200).json({ status: "success", syncFrequency, downloadQuality });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default userSettings;
