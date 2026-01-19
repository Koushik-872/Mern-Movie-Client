import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/global/Navbar';
import { Sidebar } from '@/components/global/Sidebar';
import { MovieCard } from '@/components/ui/MovieCard';
import { moviesApi } from '../Home/api/movies';
import type { Movie } from '@/types';

export const Latest: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setLoading(true);
        const response = await moviesApi.getMovies(1, 50);
        const sortedMovies = [...(response.data || [])].sort(
          (a, b) =>
            new Date(b.releaseDate).getTime() -
            new Date(a.releaseDate).getTime()
        );
        setMovies(sortedMovies);
      } catch (error) {
        console.error('Error fetching latest movies:', error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  const handleSearch = (query: string) => {
    navigate(`/movies?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar onSearch={handleSearch} />
      <Sidebar />

      {/* ✅ FIX HERE */}
      <main className="pt-20 p-4 md:p-8 ml-0 md:ml-64">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Latest Movies
        </h1>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : movies.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            No movies found
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
