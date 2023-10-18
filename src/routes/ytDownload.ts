import { Router, Request, Response } from "express";
import ytdl from "ytdl-core";
import passport from "passport";
import { blackListSong, handleUserDownloadStatus } from "../controllers/ytDownload";

const ytDownload = Router();

ytDownload.get(
  "/download/:id",
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get music ID from parameters
    const musicId = req.params.id;
    console.log("🚀 ~ file: ytDownload.ts:22 ~ ytDownload.get ~ musicId:", musicId);
    if (!musicId) {
      return res.status(400).send({ error: "No music ID provided" });
    }

    res.header("Content-Disposition", `attachment; filename=${musicId}.mp3`);

    console.log("🚀 ~ file: ytDownload.ts:25 ~ musicId:", musicId);
    let video;
    try {
      video = ytdl(`http://www.youtube.com/watch?v=${musicId}`, { filter: "audioonly" });
    } catch (error) {
      return res.status(500).send({ error: "Error getting the video" });
    }
    let contentLengthSet = false;

    video.on("response", (response) => {
      if (!contentLengthSet) {
        let size = response.headers["content-length"];
        res.setHeader("Content-Length", size);
        contentLengthSet = true;
      }
    });

    video.on("error", async (error) => {
      console.log("🚀 ~ file: ytDownload.ts:43 ~ video.on ~ error:", error.message);
      if (error.message.includes("ETIMEDOUT")) {
        try {
          const updateBlackListRes = await blackListSong(req.user, musicId);
          if (updateBlackListRes) {
            console.log("Song added to blacklist: ", musicId);
            return res.status(408).json({ error: "Song added to blacklist" });
          }
          console.log("Song failed to add to blacklist: ", musicId);
          return res.status(408).json({ error: "Song added to blacklist" });
        } catch (error) {
          console.log("🚀 ~ file: ytDownload.ts:47 ~ video.pipe ~ error:", error);
          return res.status(500).send({ error: "Error getting the video." });
        }
      }
      return res.status(500).send({ error: "Error streaming the video" });
    });

    video.pipe(res).on("error", (error) => {
      console.log("🚀 ~ file: ytDownload.ts:47 ~ video.pipe ~ error:", error);
      return res.status(500).send({ error: "Error writing the video to response" });
    });
  }
);

ytDownload.post(
  "/downloadstatus",
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { video_id } = req.body;
      const user = req.user;
      if (!video_id) {
        return res.status(400).send({ error: "No music ID provided" });
      }

      const handleDowloadStatusRes = await handleUserDownloadStatus(user, video_id);
      console.log("🚀 ~ file: ytDownload.ts:65 ~ handleDowloadStatusRes:", handleDowloadStatusRes);
      if (handleDowloadStatusRes) {
        return res.status(200).send({ status: "success" });
      }

      return res.status(500).send({ error: "could not update status" });
    } catch (error) {
      console.log("🚀 ~ file: ytDownload.ts:47 ~ video.pipe ~ error:", error);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }
);

export default ytDownload;
