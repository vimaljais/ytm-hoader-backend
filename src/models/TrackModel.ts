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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model (replace 'User' with your actual user model name)
    required: true
  },
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

const LikedTrack = mongoose.model("LikedTrack", trackSchema);

export default LikedTrack;
