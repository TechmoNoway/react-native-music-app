import { useEffect, useState } from "react";

interface Artist {
  _id: string;
  name: string;
  imageUrl?: string;
  bio?: string;
  genres?: string[];
}

export const useArtistsApi = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching artists from API...");
      const response = await fetch(
        "https://nodejs-music-app-backend.vercel.app/api/artists"
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const artistsArray = data.data?.artists || [];
      setArtists(artistsArray);
    } catch (err) {
      console.error("Error fetching artists:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  return {
    artists,
    loading,
    error,
    refetch: fetchArtists,
  };
};
