import mongoose, { Document, Model } from "mongoose";

// Define the schema
const userSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // Reference to the User model (assuming you have a User model)
    required: true,
  },
  syncFrequency: {
    type: String,
    enum: ["daily", "weekly", "manual"], // Define the allowed values
    default: "weekly", // Set a default value if needed
  },
  downloadQuality: {
    type: Number,
    enum: [0, 1, 2], // Define the allowed values
    default: 1, // Set a default value if needed
  },
  trackLastUpdated: {
    type: Date, // Use Date type to store the last update timestamp
    default: null, // Initialize as null initially
  },
});

// Define the UserSettings document interface
interface IUserSettings extends Document {
  user: mongoose.Types.ObjectId;
  syncFrequency: "daily" | "weekly" | "manual";
  downloadQuality: 0 | 1 | 2;
  trackLastUpdated: Date | null;
}

// Create the UserSettings model
const UserSettings: Model<IUserSettings> = mongoose.model<IUserSettings>(
  "UserSettings",
  userSettingsSchema
);

export default UserSettings;
