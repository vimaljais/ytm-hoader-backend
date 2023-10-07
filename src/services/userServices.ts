import LikedTrack from "../models/TrackModel";
import UserSettings from "../models/UserSettingsModel";

const getTrackLastUpdated = async (user: string) => {
  try {
    console.log("getting updatedTracks of user ", user);
    const track = await UserSettings.findOne({ user: user }, { trackLastUpdated: 1, _id: 0 });
    return track?.trackLastUpdated;
  } catch (error) {
    console.error("Error in getTrackLastUpdated:", error);
    throw error; // Rethrow the error to be handled at a higher level
  }
};

const updateTrackLastUpdated = async (user: string) => {
  try {
    // Find the UserSettings document by the user field
    const userSettings = await UserSettings.findOne({ user: user });

    if (!userSettings) {
      return null;
    }

    // Update the trackLastUpdated field
    userSettings.trackLastUpdated = new Date();

    // Save the document with the updated field
    await userSettings.save();

    return userSettings.trackLastUpdated;
  } catch (error) {
    console.error("Error in updateTrackLastUpdated:", error);
    throw error; // Rethrow the error to be handled at a higher level
  }
};

const getTrackList = async (id: string) => {
  try {
    const userTracks = await LikedTrack.find({ user: id }).sort({ created_at: -1 });
    return userTracks;
  } catch (error) {
    console.error("Error in getTrackList:", error);
    throw error; // Rethrow the error to be handled at a higher level
  }
};

export { getTrackLastUpdated, updateTrackLastUpdated, getTrackList };
