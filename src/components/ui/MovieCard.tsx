import React, { useState } from 'react';
import { Heart, Share2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { moviesApi } from '@/modules/Home/api/movies';
import type { Movie } from '@/types';

interface MovieCardProps {
  movie: Movie;
  onInteraction?: () => void;
  showActions?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onInteraction,
  showActions = true,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    navigate(`/movies/${movie._id}`);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please login to like movies');
      return;
    }

    setIsLoading(true);
    try {
      await moviesApi.trackInteraction(movie._id, 'like');
      setIsLiked(!isLiked);
      onInteraction?.();
    } catch (error) {
      console.error('Error tracking like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/movies/${movie._id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: movie.title,
          text: movie.description,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }

      if (isAuthenticated) {
        await moviesApi.trackInteraction(movie._id, 'share');
        onInteraction?.();
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthenticated) {
      moviesApi.trackInteraction(movie._id, 'click', {
        deviceType: navigator.userAgent,
      });
    }
    handleClick();
  };

  return (
    <div
      className="group relative cursor-pointer"
      onClick={handleClick}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2 transition-transform duration-300 md:group-hover:scale-105 md:group-hover:z-10">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=' +
              movie.title;
          }}
        />

        {/* Overlay */}
        <div className="
          absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent
          opacity-100 md:opacity-0 md:group-hover:opacity-100
          transition-opacity duration-300 flex items-center justify-center
        ">
          {showActions && (
            <div className="flex gap-4 transform md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handlePlayClick}
                className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                title="View Details"
              >
                <Play className="text-black ml-1" size={24} fill="black" />
              </button>
            </div>
          )}
        </div>

        {/* Rating */}
        {movie.rating > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
            <span>⭐</span>
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-white font-semibold truncate text-sm sm:text-base group-hover:text-red-500 transition-colors">
          {movie.title}
        </h3>
        <p className="text-white/60 text-xs sm:text-sm">
          {new Date(movie.releaseDate).getFullYear()} •{' '}
          {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
        </p>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="
          flex gap-2 mt-2
          opacity-100 md:opacity-0 md:group-hover:opacity-100
          transition-opacity duration-300
        ">
          <button
            onClick={handleLike}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors ${
              isLiked
                ? 'bg-red-500 text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Like"
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            title="Share"
          >
            <Share2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
