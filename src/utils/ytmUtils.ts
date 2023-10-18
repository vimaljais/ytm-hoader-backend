import LikedVideoSnapshot from "../models/LikedSnapshot";
import { ILikedTrack } from "../models/TrackModel";

const getArtistNames = (artists: { name: string; id: string }[]) => {
  return artists.map((artist) => artist.name).join(" & ");
};
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

const formatLikedSongs = (likedArray: ILikedTrack[]) => {
  const formattedSongs = [];
  for (const singleSong of likedArray) {
    const formattedSingle = {
      videoId: singleSong?.videoId,
      title: singleSong?.title,
      album: singleSong?.album?.name,
      thumbnails: singleSong?.thumbnails,
      isAvailable: singleSong?.isAvailable,
      isExplicit: singleSong?.isExplicit,
      videoType: singleSong?.videoType,
      duration: singleSong?.duration,
      duration_seconds: singleSong?.duration_seconds,
      artists: getArtistNames(singleSong?.artists),
      downloaded: singleSong?.downloaded,
      blacklist: singleSong?.blacklist
    };
    formattedSongs.push(formattedSingle);
  }
  return formattedSongs;
};

export { filterLikedFromSnapshot, formatLikedSongs };
