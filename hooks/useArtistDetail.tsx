import { Track } from "@/types/audio";
import { useEffect, useState } from "react";

interface ApiArtist {
  _id: string;
  name: string;
  imageUrl?: string;
  bio?: string;
  genres?: string[];
}

export const useArtistDetail = (artistId: string) => {
  const [artist, setArtist] = useState<ApiArtist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapApiTrackToTrack = (apiTrack: any): Track => {
    const artistData = apiTrack.artist;

    return {
      _id: apiTrack._id,
      title: apiTrack.title || "Unknown Title",
      artist: {
        _id: artistData?._id || "",
        name:
          typeof artistData === "string"
            ? artistData
            : artistData?.name || "Unknown Artist",
        imageUrl: artistData?.imageUrl || "",
      },
      duration: apiTrack.duration || 0,
      genre: apiTrack.genre || "Unknown",
      fileUrl: apiTrack.audioUrl || apiTrack.fileUrl || apiTrack.url || "",
      thumbnailUrl:
        apiTrack.thumbnailUrl || apiTrack.imageUrl || artistData?.imageUrl || "",
      isPublic: apiTrack.isPublic ?? true,
      likedBy: apiTrack.likedBy || [],
      likesCount: apiTrack.likesCount || 0,
      playCount: apiTrack.playCount || 0,
      createdAt: apiTrack.createdAt || new Date().toISOString(),
      updatedAt: apiTrack.updatedAt || new Date().toISOString(),
    };
  };

  const fetchArtistDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const artistsResponse = await fetch(
        "https://nodejs-music-app-backend.vercel.app/api/artists"
      );

      if (!artistsResponse.ok) {
        throw new Error(`Artists endpoint error: ${artistsResponse.status}`);
      }

      const artistsData = await artistsResponse.json();
      const artistsArray = artistsData.data?.artists || [];

      const foundArtist = artistsArray.find((a: ApiArtist) => a._id === artistId);

      if (!foundArtist) {
        throw new Error(`Artist with ID "${artistId}" not found`);
      }

      setArtist(foundArtist);

      const allSongsResponse = await fetch(
        "https://nodejs-music-app-backend.vercel.app/api/songs"
      );

      if (allSongsResponse.ok) {
        const allSongsData = await allSongsResponse.json();
        const allSongs = allSongsData.data?.songs || allSongsData || [];
        const artistTracks = allSongs.filter((track: any) => {
          const trackArtist = track.artist;
          const trackArtistName =
            typeof trackArtist === "string" ? trackArtist : trackArtist?.name;
          const trackArtistId = typeof trackArtist === "object" ? trackArtist?._id : null;

          return (
            trackArtistName?.toLowerCase() === foundArtist.name.toLowerCase() ||
            trackArtistId === foundArtist._id
          );
        });

        const mappedTracks = artistTracks.map(mapApiTrackToTrack);
        setTracks(mappedTracks);
      } else {
        console.log("Songs endpoint failed, showing artist with empty tracks");
        setTracks([]);
      }
    } catch (err) {
      console.error("Error fetching artist detail:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (artistId) {
      fetchArtistDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistId]);

  return {
    artist,
    tracks,
    loading,
    error,
    refetch: fetchArtistDetail,
  };
};
