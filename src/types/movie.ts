export interface Movie {
  _id: string;
  title: string;
  description: string;
  releaseDate: string;
  duration: number;
  rating: number;
  genre: string[];
  director: string;
  cast: string[];
  posterUrl: string;
  imdbId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MoviesResponse {
  success: boolean;
  count: number;
  pagination?: {
    page: number;
    pages: number;
    total: number;
  };
  data: Movie[];
}

export interface MovieResponse {
  success: boolean;
  data: Movie;
}

export interface User {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  role?: 'user' | 'admin';
}

export interface InteractionRequest {
  interactionType: 'view' | 'like' | 'share' | 'click';
  metadata?: {
    watchTime?: number;
    scrollDepth?: number;
    deviceType?: string;
  };
}