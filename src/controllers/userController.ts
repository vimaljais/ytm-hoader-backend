import moduleFuncs from "../config/ytmFuncs";
import LikedVideoSnapshot from "../models/LikedSnapshot";
import User from "../models/UserModel";
import UserSettings from "../models/UserSettingsModel";
import { runPythonScript } from "./pyHandle";

const getLiked = async (id: string) => {
  try {
    const oauth2Data = await User.findById(id, { oauth2: 1, _id: 0 });
    if (!oauth2Data) {
      throw new Error("No oauth2 data found");
    }

    const likedRes = await runPythonScript(oauth2Data?.oauth2!, moduleFuncs.get_liked_songs);
    if (likedRes.result === "error") {
      return { result: "error", data: null };
    }
    const likedJSONData = JSON.parse(likedRes.data);
    return { result: "success", data: likedJSONData };
  } catch (error) {
    console.error("An error occurred:", error);
    return { result: "error", data: null };
  }
};

const setupUserSettings = async (id: string) => {
  try {
    const existingSettings = await UserSettings.findOne({ user: id });

    if (!existingSettings) {
      // If user settings do not exist, create a new document with default values
      const defaultSettings = new UserSettings({
        user: id,
        syncFrequency: "weekly", // Set your default sync frequency here
        downloadQuality: 1 // Set your default download quality here
      });

      await defaultSettings.save();

      return { result: "success", data: defaultSettings };
    }

    // User settings already exist, no need to create defaults
    return { result: "success", data: existingSettings };
  } catch (error) {
    console.error("Error setting up user settings:", error);
    return { result: "error", data: null };
  }
};

const initializeUser = async (id: string) => {
  try {
    //check if already exists
    const snapshotExists = await LikedVideoSnapshot.exists({ userId: id });
    await setupUserSettings(id);

    if (snapshotExists) {
      console.log("Snapshot already exists.");
      return { result: "exists", data: "snapshot already exists" };
    }

    console.log("Initializing User: ", id);

    const likedSnapshot = await getLiked(id);
    const UserData = await User.findById(id);

    if (likedSnapshot.result === "error") {
      throw new Error("Error getting likedSnapshot from the user.");
    }

    const likedData = likedSnapshot?.data;

    if (!likedData) {
      return { result: "error", error: "No liked songs found" };
    }

    likedData["userId"] = id;
    likedData["googleId"] = UserData?.googleId;

    const snapshot = new LikedVideoSnapshot(likedData);
    await snapshot.save();

    console.log("Saved liked video snapshot at: ", snapshot._id);
    return { result: "success", data: "User Intialized" };
  } catch (error) {
    console.error("[initializeUser] An error occurred:", error);
    return { result: "error", error: error };
  }
};

export { getLiked, initializeUser };
