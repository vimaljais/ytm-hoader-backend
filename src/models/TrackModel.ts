import mongoose, { Document, Model, Types } from "mongoose";

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
  created_at: {
    type: Date,
    default: Date.now, // Set the default value to the current timestamp
    index: true, // Add an index on the "created_at" field
  },
  downloaded: {
    type: Boolean,
    default: false
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

// Define interfaces for nested schemas
interface IArtist {
  name: string;
  id: string;
}

interface IAlbum {
  name: string;
  id: string;
}

interface IThumbnail {
  url: string;
  width: number;
  height: number;
}

interface IFeedbackTokens {
  add: string;
  remove: string;
}

export interface ILikedTrack extends Document {
  user: Types.ObjectId;
  created_at: Date;
  downloaded: boolean;
  videoId: string;
  title: string;
  artists: IArtist[];
  album: IAlbum;
  likeStatus: string;
  thumbnails: IThumbnail[];
  isAvailable: boolean;
  isExplicit: boolean;
  videoType: string;
  duration: string;
  duration_seconds: number;
  feedbackTokens: IFeedbackTokens;
}

// Define the LikedTrack model type
type LikedTrackModel = Model<ILikedTrack>;

const LikedTrack: LikedTrackModel = mongoose.model<ILikedTrack, LikedTrackModel>("LikedTrack", trackSchema);

export default LikedTrack;