const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema({
  name: String,
  id: String
});

const albumSchema = new mongoose.Schema({
  name: String,
  id: String
});

const thumbnailSchema = new mongoose.Schema({
  url: String,
  width: Number,
  height: Number
});

const trackSchema = new mongoose.Schema({
  videoId: String,
  title: String,
  artists: [artistSchema],
  album: albumSchema,
  likeStatus: String,
  thumbnails: [thumbnailSchema],
  isAvailable: Boolean,
  isExplicit: Boolean,
  videoType: String,
  duration: String,
  duration_seconds: Number,
  feedbackTokens: {
    add: String,
    remove: String
  }
});

const likedVideoSnapshotSchema = new mongoose.Schema({
  id: String,
  userId: String,
  googleId: String,
  privacy: String,
  title: String,
  trackCount: Number,
  tracks: [trackSchema]
});

const LikedVideoSnapshot = mongoose.model("LikedVideoSnapshot", likedVideoSnapshotSchema);

export default LikedVideoSnapshot