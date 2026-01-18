import React from 'react';
import { useNavigate } from 'react-router-dom';

interface GenreCardProps {
  genre: string;
  imageUrl: string;
  count?: number;
}

const genreLabels: Record<string, string> = {
  'Action & Adventure': 'Action & Adventure',
  'Anime': 'Anime',
  'Thriller': 'Thriller',
  'Sci-Fi & Fantasy': 'Sci-Fi & Fantasy',
  'Dramas': 'Dramas',
  'Crime': 'Crime',
  'Horror': 'Horror',
  'History': 'History',
};

export const GenreCard: React.FC<GenreCardProps> = ({ genre, imageUrl, count }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movies?genre=${encodeURIComponent(genre)}`);
  };

  return (
    <div
      onClick={handleClick}
      className="relative w-48 h-72 rounded-lg overflow-hidden cursor-pointer group transition-transform hover:scale-105 hover:z-10"
    >
      <img
        src={imageUrl}
        alt={genre}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=' + genre;
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white text-lg font-semibold uppercase tracking-wide">
          {genreLabels[genre] || genre}
        </h3>
        {count !== undefined && (
          <p className="text-white/70 text-sm mt-1">{count} movies</p>
        )}
      </div>
    </div>
  );
};