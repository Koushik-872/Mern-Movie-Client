import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/global/Navbar';
import { Sidebar } from '@/components/global/Sidebar';
import { MovieCard } from '@/components/ui/MovieCard';
import { moviesApi } from '../Home/api/movies';
import type { Movie } from '@/types';
import { ArrowUpDown, Filter } from 'lucide-react';

export const Movies: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'rating' | 'title' | 'releaseDate' | 'duration'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const genre = searchParams.get('genre');
  const search = searchParams.get('search');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        let response;
        
        if (search) {
          response = await moviesApi.searchMovies(search);
        } else if (genre) {
          response = await moviesApi.getMoviesByGenre(genre);
        } else {
          response = await moviesApi.getSortedMovies(sortBy, sortOrder, page, 50);
        }
        
        setMovies(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [genre, search, sortBy, sortOrder, page]);

  const handleSearch = (query: string) => {
    navigate(`/movies?search=${encodeURIComponent(query)}`);
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar onSearch={handleSearch} />
      <Sidebar />

      {/* MAIN CONTENT */}
      <main
        className="pt-20 p-4 sm:p-8 space-y-6
                   md:ml-64" // only add left margin on medium+ screens
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">
            {search ? `Search Results: "${search}"` : genre ? `Genre: ${genre}` : 'All Movies'}
          </h1>

          {!search && !genre && (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <Filter size={18} />
                <span className="text-sm">Sort by:</span>
                <div className="flex gap-2 flex-wrap">
                  {(['rating', 'title', 'releaseDate'] as const).map((field) => (
                    <button
                      key={field}
                      onClick={() => handleSortChange(field)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        sortBy === field
                          ? 'bg-red-600 text-white'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {field.charAt(0).toUpperCase() + field.slice(1).replace('Date', ' Date')}
                      {sortBy === field && (
                        <ArrowUpDown size={12} className="inline-block ml-1" />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="ml-2 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
                  title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-12 text-white/60">No movies found</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>

            {!search && !genre && totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-white/60">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
