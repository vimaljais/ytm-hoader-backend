import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  name: { type: String },
  email: { type: String },
  accessToken: { type: String, select: false },
  refreshToken: { type: String, select: false },
  photos: { type: Schema.Types.Mixed, select: false },
  json: { type: Schema.Types.Mixed, select: false },
  oauth2: {
    expires_in: { type: Number, select: false },
    access_token: { type: String, select: false },
    refresh_token: { type: String, select: false },
    token_type: { type: String, select: false },
    expires_at: { type: Number, select: false },
    filepath: { type: String, select: false },
    scope: { type: String, select: false }
  },
  createdAt: { type: Date, default: Date.now, select: false },
  updatedAt: { type: Date, default: Date.now, select: false }
});

// Define pre-save middleware to update updatedAt field
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
