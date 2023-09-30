const mongoose = require("mongoose");

const userSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // Reference to the User model (assuming you have a User model)
    required: true
  },
  syncFrequency: {
    type: String,
    enum: ["daily", "weekly", "manual"], // Define the allowed values
    default: "weekly" // Set a default value if needed
  },
  downloadQuality: {
    type: Number,
    enum: [0, 1, 2], // Define the allowed values
    default: 1 // Set a default value if needed
  }
});

// Create the UserSettings model
const UserSettings = mongoose.model("UserSettings", userSettingsSchema);

export default UserSettings;
