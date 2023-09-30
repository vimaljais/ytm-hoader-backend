import express, { Router, Request, Response } from "express";
import User from "../models/UserModel";
import ytdl from 'ytdl-core';
import jwt from 'jsonwebtoken';
import passport from "passport";

const ytDownload = Router();

ytDownload.get('/download/:id', passport.authenticate("jwt", { session: false }), async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // try {
  //   jwt.verify(token, process.env.JWT_SECRET!); // replace with your secret key
  // } catch (error) {
  //   return res.status(403).send({ error: 'Failed to authenticate token' });
  // }

  // Get music ID from parameters
  const musicId = req.params.id;
  console.log("🚀 ~ file: ytDownload.ts:22 ~ ytDownload.get ~ musicId:", musicId)
  if (!musicId) {
    return res.status(400).send({ error: 'No music ID provided' });
  }

  // Set header for audio download
  res.header('Content-Disposition', `attachment; filename=${musicId}.mp3`);

  // Create audio stream using ytdl-core
  ytdl(`http://www.youtube.com/watch?v=${musicId}`, { filter: 'audioonly' }).pipe(res);
});

export default ytDownload;