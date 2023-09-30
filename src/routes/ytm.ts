import { Router, Request, Response } from "express";
import User from "../models/UserModel";
import { runPythonScript } from "../controllers/pyHandle";
import moduleFuncs from "../config/ytmFuncs";
import { filterLikedFromSnapshot, formatLikedSongs } from "../utils/ytmUtils";
import passport from "passport";

const ytmRoutes = Router();

ytmRoutes.get("/liked", passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const user: any = req.user;
    const googleId = user.googleId;
    const userData = await User.findOne({ googleId: googleId }, { oauth2: 1 });

    if (!userData) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    console.log("🚀 ~ file: ytm.ts:19 ~ ytmRoutes.get ~ userData:", userData.id);

    const likedRes = await runPythonScript(userData?.oauth2!, moduleFuncs.get_liked_songs);
    if (likedRes.result === "error") {
      return res.status(401).json({ error: "Error getting data from the user. Reauthenticate" });
    }

    let likedTracks = JSON.parse(likedRes.data)?.tracks;
    likedTracks = await filterLikedFromSnapshot(likedTracks, userData?.id);
    likedTracks = formatLikedSongs(likedTracks);

    console.log("liked res length", { status: "success", data: likedTracks.length });
    return res.json({ status: "success", data: likedTracks });
  } catch (error) {
    console.log("🚀 ~ file: ytm.ts:19 ~ ytmRoutes.get ~ error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

ytmRoutes.get("/history", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    // The user object is attached by the Passport middleware
    const user: any = req.user;
    const googleId = user.googleId;
    const oauth2Data = await User.findOne({ googleId: googleId }, { oauth2: 1, _id: 0 });

    const historyRes = await runPythonScript(oauth2Data?.oauth2!, moduleFuncs.get_history);
    if (historyRes.result === "error") {
      return res.status(401).json({ error: "Error getting data from the user. Reauthenticate" });
    }

    const historyDataJSON = JSON.parse(historyRes.data);

    return res.json({ status: "success", data: historyDataJSON });
  } catch (error) {
    console.log("🚀 ~ file: ytm.ts:19 ~ ytmRoutes.get ~ error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

ytmRoutes.get("/library", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    // The user object is attached by the Passport middleware
    const user: any = req.user;
    const googleId = user.googleId;
    const oauth2Data = await User.findOne({ googleId: googleId }, { oauth2: 1, _id: 0 });

    const libraryRes = await runPythonScript(oauth2Data?.oauth2!, moduleFuncs.get_library_songs);
    if (libraryRes.result === "error") {
      return res.status(401).json({ error: "Error getting data from the user. Reauthenticate" });
    }
    const libraryDataJSON = JSON.parse(libraryRes.data);

    return res.json({ status: "success", data: libraryDataJSON });
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

ytmRoutes.get("/playlists", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    // The user object is attached by the Passport middleware
    const user: any = req.user;
    const googleId = user.googleId;
    const oauth2Data = await User.findOne({ googleId: googleId }, { oauth2: 1, _id: 0 });

    const playlistsRes = await runPythonScript(oauth2Data?.oauth2!, moduleFuncs.get_user_playlists);
    if (playlistsRes.result === "error") {
      return res.status(401).json({ error: "Error getting data from the user. Reauthenticate" });
    }

    const playlistsDataJSON = JSON.parse(playlistsRes.data);

    return res.json({ status: "success", data: playlistsDataJSON });
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

export { ytmRoutes };
