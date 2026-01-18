import api from '@/utils/api';
import type { MoviesResponse, MovieResponse, Movie } from '@/types';

export const moviesApi = {
  getMovies: async (page = 1, limit = 10): Promise<MoviesResponse> => {
    const response = await api.get(`/movies?page=${page}&limit=${limit}`);
    return response.data;
  },

  getTrending: async (limit = 20): Promise<MoviesResponse> => {
    const response = await api.get(`/movies/trending?limit=${limit}`);
    return response.data;
  },

  getFeed: async (limit = 20): Promise<MoviesResponse> => {
    const response = await api.get(`/movies/feed?limit=${limit}`);
    return response.data;
  },

  searchMovies: async (query: string): Promise<MoviesResponse> => {
    const response = await api.get(`/movies/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getMovieById: async (id: string): Promise<MovieResponse> => {
    const response = await api.get(`/movies/${id}`);
    return response.data;
  },

  getSortedMovies: async (sortBy = 'rating', order: 'asc' | 'desc' = 'desc', page = 1, limit = 10): Promise<MoviesResponse> => {
    const response = await api.get(`/movies/sorted?sortBy=${sortBy}&order=${order}&page=${page}&limit=${limit}`);
    return response.data;
  },

  getMoviesByGenre: async (genre: string): Promise<MoviesResponse> => {
    // Fetch all movies and filter by genre on client side since backend doesn't have genre filter
    const response = await api.get(`/movies?page=1&limit=1000`);
    const allMovies = response.data.data || [];
    const filteredMovies = allMovies.filter((movie: any) => 
      movie.genre && movie.genre.some((g: string) => 
        g.toLowerCase().includes(genre.toLowerCase()) || 
        genre.toLowerCase().includes(g.toLowerCase())
      )
    );
    return {
      ...response.data,
      data: filteredMovies,
      count: filteredMovies.length
    };
  },

  trackInteraction: async (movieId: string, interactionType: 'view' | 'like' | 'share' | 'click', metadata?: any): Promise<any> => {
    const response = await api.post(`/movies/${movieId}/interaction`, {
      interactionType,
      metadata,
    });
    return response.data;
  },

  // Admin endpoints
  createMovie: async (movieData: Partial<Movie>): Promise<MovieResponse> => {
    const response = await api.post('/movies', movieData);
    return response.data;
  },

  updateMovie: async (id: string, movieData: Partial<Movie>): Promise<MovieResponse> => {
    const response = await api.put(`/movies/${id}`, movieData);
    return response.data;
  },

  deleteMovie: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/movies/${id}`);
    return response.data;
  },

  createMoviesBatch: async (movies: Partial<Movie>[]): Promise<any> => {
    const response = await api.post('/movies/batch', { movies });
    return response.data;
  },
};