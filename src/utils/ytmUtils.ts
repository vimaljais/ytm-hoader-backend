import LikedVideoSnapshot from "../models/LikedSnapshot";

const filterLikedFromSnapshot = async (likedArray: any, userId: string): Promise<any> => {
  try {
    // Find the liked snapshot for the user by userId
    const likedSnapshot = await LikedVideoSnapshot.findOne({ userId: userId });

    // If no liked snapshot exists for the user, return the original likedArray
    if (!likedSnapshot) {
      return likedArray;
    }
    // Create a Set of videoIds from the snapshot tracks
    const snapshotVideoIds = new Set(likedSnapshot.tracks.map((track: any) => track.videoId));

    // Filter the likedArray to keep only new tracks
    const newLikedArray = likedArray.filter((track: any) => !snapshotVideoIds.has(track.videoId));
    return newLikedArray;
  } catch (error) {
    console.error("Error filtering liked tracks from snapshot:", error);
    return likedArray;
  }
};

export { filterLikedFromSnapshot };
