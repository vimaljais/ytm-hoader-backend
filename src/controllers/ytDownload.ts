import LikedTrack from "../models/TrackModel";

const handleUserDownloadStatus = async (user: any, video_id: string) => {
  try {
    // Check if the user is authenticated
    if (!user) {
      return false;
    }
    const trackToUpdate = await LikedTrack.findOne({ videoId: video_id, user: user });

    if (!trackToUpdate) {
      return false;
    }

    trackToUpdate.downloaded = true;

    await trackToUpdate.save();
    return true;
  } catch (error) {
    console.error("Error in handleUserDownloadStatus:", error);
    return false;
  }
};
export { handleUserDownloadStatus };
