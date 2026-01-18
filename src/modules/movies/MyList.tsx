import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/global/Navbar';
import { Sidebar } from '@/components/global/Sidebar';
import { MovieCard } from '@/components/ui/MovieCard';
import { moviesApi } from '../Home/api/movies';
import type { Movie } from '@/types';

export const MyList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyList = async () => {
      try {
        setLoading(true);
        // Get personalized feed as "My List"
        const response = await moviesApi.getFeed(50);
        setMovies(response.data || []);
      } catch (error) {
        console.error('Error fetching my list:', error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyList();
  }, []);

  const handleSearch = (query: string) => {
    navigate(`/movies?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar onSearch={handleSearch} />
      <Sidebar />
      
      <main className="ml-64 pt-20 p-8">
        <h1 className="text-3xl font-bold mb-6">My List</h1>
        
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : movies.length === 0 ? (
          <div className="text-center py-12 text-white/60">Your list is empty</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};