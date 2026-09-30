import React from 'react';
import { PosterData } from '../types/poster';
import generatedRobinPoster from '../assets/generated_wanted_robin.png';

interface WantedPosterProps {
  data: PosterData;
  className?: string;
  enableParallax?: boolean;
}

export const WantedPoster: React.FC<WantedPosterProps> = ({
  data,
  className = '',
}) => {
  const imgSrc = data.fullPosterImageUrl || generatedRobinPoster;

  return (
    <div
      className={`relative select-none aspect-[3/4] w-full max-w-[460px] rounded-sm overflow-hidden shadow-2xl transition-shadow ${className}`}
    >
      <img
        src={imgSrc}
        alt={data.characterName || 'Wanted Poster'}
        crossOrigin="anonymous"
        className="w-full h-full object-cover pointer-events-none"
      />

      {/* Subtle paper vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 35px rgba(40, 20, 10, 0.35)',
        }}
      />
    </div>
  );
};
