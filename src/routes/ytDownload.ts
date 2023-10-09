import express, { Router, Request, Response } from "express";
import User from "../models/UserModel";
import ytdl from "ytdl-core";
import jwt from "jsonwebtoken";
import passport from "passport";
import https from "https";
import urlLib from "url";

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

    let video;
    try {
      video = ytdl(`http://www.youtube.com/watch?v=${musicId}`, { filter: "audioonly" });
    } catch (error) {
      return res.status(500).send({ error: "Error getting the video" });
    }

    video.on("response", (response) => {
      let size = response.headers["content-length"];
      res.setHeader("Content-Length", size);
    });

    video.on("error", (error) => {
      console.log("🚀 ~ file: ytDownload.ts:43 ~ video.on ~ error:", error);
      return res.status(500).send({ error: "Error streaming the video" });
    });

    video.pipe(res).on("error", (error) => {
      console.log("🚀 ~ file: ytDownload.ts:47 ~ video.pipe ~ error:", error);
      return res.status(500).send({ error: "Error writing the video to response" });
    });
  }
);

export default ytDownload;
