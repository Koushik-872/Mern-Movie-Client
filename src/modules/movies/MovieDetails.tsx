import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/global/Navbar";
import { Sidebar } from "@/components/global/Sidebar";
import { moviesApi } from "../Home/api/movies";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Share2, Play } from "lucide-react";
import type { Movie } from "@/types";

export const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [interactionTracked, setInteractionTracked] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await moviesApi.getMovieById(id);
        setMovie(response.data);

        // Track view interaction
        if (isAuthenticated && !interactionTracked) {
          try {
            await moviesApi.trackInteraction(id, "view");
            setInteractionTracked(true);
          } catch (error) {
            console.error("Error tracking view:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching movie:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id, isAuthenticated, interactionTracked]);

  // Track scroll depth
  useEffect(() => {
    if (!movie || !isAuthenticated) return;

    const handleScroll = () => {
      if (detailsRef.current) {
        const scrollDepth = Math.min(
          (window.scrollY / detailsRef.current.scrollHeight) * 100,
          100,
        );

        if (scrollDepth > 50 && !interactionTracked) {
          moviesApi
            .trackInteraction(movie._id, "view", {
              scrollDepth: Math.round(scrollDepth),
              deviceType: navigator.userAgent,
            })
            .catch(console.error);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [movie, isAuthenticated, interactionTracked]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert("Please login to like movies");
      return;
    }

    if (!movie) return;

    try {
      await moviesApi.trackInteraction(movie._id, "like");
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error tracking like:", error);
    }
  };

  const handleShare = async () => {
    if (!movie) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: movie.description,
          url: window.location.href,
        });
        if (isAuthenticated) {
          await moviesApi.trackInteraction(movie._id, "share");
        }
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
      if (isAuthenticated) {
        await moviesApi.trackInteraction(movie._id, "share");
      }
    }
  };

  const handleSearch = (query: string) => {
    navigate(`/movies?search=${encodeURIComponent(query)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar onSearch={handleSearch} />
        <Sidebar />
        <main className="ml-64 pt-20 p-8">
          <div className="text-center py-12">Loading...</div>
        </main>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar onSearch={handleSearch} />
        <Sidebar />
        <main className="ml-64 pt-20 p-8">
          <div className="text-center py-12 text-white/60">Movie not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar onSearch={handleSearch} />
      <Sidebar />

      <main className="ml-0 md:ml-64 pt-20 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Gallery Section */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-6">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Main poster as large image */}
              <div className="col-span-2 md:col-span-2 md:row-span-2 aspect-[2/3] md:aspect-auto">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/800x1200/1a1a1a/ffffff?text=" +
                      movie.title;
                  }}
                />
              </div>

              {/* Additional images - placeholder for now */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-lg overflow-hidden bg-black/40"
                >
                  <img
                    src={movie.posterUrl}
                    alt={`${movie.title} - Image ${i}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/400x600/1a1a1a/ffffff?text=" +
                        movie.title;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Movie Details */}
          <div ref={detailsRef} className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-5xl font-bold">{movie.title}</h1>
                <div className="flex gap-3">
                  <button
                    onClick={handleLike}
                    className={`p-3 rounded-full transition-colors ${
                      isLiked
                        ? "bg-red-500 text-white"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                    title="Like"
                  >
                    <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    title="Share"
                  >
                    <Share2 size={24} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mb-6 text-white/80">
                <span>{movie.releaseDate?.split("T")[0]}</span>
                <span>•</span>
                <span>
                  {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                </span>
                <span>•</span>
                <span>⭐ {movie.rating.toFixed(1)}</span>
              </div>

              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genre.map((g) => (
                    <span
                      key={g}
                      onClick={() =>
                        navigate(`/movies?genre=${encodeURIComponent(g)}`)
                      }
                      className="px-3 py-1 bg-white/10 rounded-full text-sm cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                <p className="text-lg text-white/90 leading-relaxed mb-6">
                  {movie.description}
                </p>

                <div className="space-y-4">
                  <div>
                    <span className="text-white/60">Director: </span>
                    <span className="text-white">{movie.director}</span>
                  </div>

                  {movie.cast && movie.cast.length > 0 && (
                    <div>
                      <span className="text-white/60">Cast: </span>
                      <span className="text-white">
                        {movie.cast.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="sticky top-24">
                <div className="aspect-[2/3] rounded-lg overflow-hidden mb-4">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=" +
                        movie.title;
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
