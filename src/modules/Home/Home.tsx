import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/global/Navbar";
import { Sidebar } from "@/components/global/Sidebar";
import { GenreCard } from "./components/GenreCard";
import { MovieCard } from "@/components/ui/MovieCard";
import { moviesApi } from "./api/movies";
import type { Movie } from "@/types";

const genres = [
  "Action & Adventure",
  "Anime",
  "Thriller",
  "Sci-Fi & Fantasy",
  "Dramas",
  "Crime",
  "Horror",
  "History",
];

// Placeholder images for genres - these would ideally come from backend
const genreImages: Record<string, string> = {
  "Action & Adventure":
    "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
  Anime:
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop",
  Thriller:
    "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=600&fit=crop",
  "Sci-Fi & Fantasy":
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop",
  Dramas:
    "https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=400&h=600&fit=crop",
  Crime:
    "https://images.unsplash.com/photo-1512070679279-8988d32161be?w=400&h=600&fit=crop",
  Horror:
    "https://images.unsplash.com/photo-1468657988500-aca2be09f4c6?w=400&h=600&fit=crop",
  History:
    "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?w=400&h=600&fit=crop",
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [genreCounts, setGenreCounts] = useState<Record<string, number>>({});
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchGenreCounts = async () => {
      try {
        const counts: Record<string, number> = {};

        // Fetch movies for each genre to get counts
        // Set initial counts to avoid waiting
        genres.forEach((genre) => {
          counts[genre] = 0;
        });
        setGenreCounts(counts);

        // Then fetch actual counts in background
        for (const genre of genres) {
          try {
            const response = await moviesApi.getMoviesByGenre(genre);
            counts[genre] = response.data?.length || 0;
          } catch {
            counts[genre] = 0;
          }
          setGenreCounts({ ...counts });
        }
      } catch (error) {
        console.error("Error fetching genre counts:", error);
        // Set empty counts on error to still show UI
        const emptyCounts: Record<string, number> = {};
        genres.forEach((genre) => {
          emptyCounts[genre] = 0;
        });
        setGenreCounts(emptyCounts);
      }
    };

    fetchGenreCounts();

    // Fetch trending movies
    const fetchTrending = async () => {
      try {
        const response = await moviesApi.getTrending(10);
        setTrendingMovies(response.data || []);
      } catch (error) {
        console.error("Error fetching trending movies:", error);
        setTrendingMovies([]);
      }
    };

    fetchTrending();
  }, []);

  const handleSearch = (query: string) => {
    // Navigate to search results
    navigate(`/movies?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar onSearch={handleSearch} />
      <Sidebar />

      <main className="ml-0 md:ml-64 pt-20 p-8 space-y-12">
        {/* Trending Movies Section */}
        {trendingMovies.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-red-600">Trending Now</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {trendingMovies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Genre Cards Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-red-600">Browse By Genre</h2>
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
            {genres.map((genre, index) => (
              <div
                key={genre}
                style={{ transform: `translateX(${index * -20}px)` }}
                className="shrink-0"
              >
                <GenreCard
                  genre={genre}
                  imageUrl={genreImages[genre]}
                  count={genreCounts[genre]}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
