
import React from 'react';
import { GameStatus } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface StoryDisplayProps {
  imageUrl: string;
  story: string;
  status: GameStatus;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ imageUrl, story, status }) => {
  return (
    <div className="flex-grow p-4 md:p-6 overflow-y-auto">
      <div className="aspect-w-16 aspect-h-9 w-full bg-brand-primary rounded-lg mb-6 overflow-hidden flex items-center justify-center">
        {status === GameStatus.LOADING && !imageUrl ? (
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-brand-text-muted">Conjuring a vision...</p>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt="Adventure scene" className="w-full h-full object-cover transition-opacity duration-500 ease-in-out" />
        ) : (
          <div className="w-full h-full bg-black/30"></div>
        )}
      </div>
      
      {status === GameStatus.LOADING && !story ? (
        <div className="space-y-4 animate-pulse-slow">
          <div className="h-4 bg-brand-primary rounded w-full"></div>
          <div className="h-4 bg-brand-primary rounded w-5/6"></div>
          <div className="h-4 bg-brand-primary rounded w-full"></div>
          <div className="h-4 bg-brand-primary rounded w-3/4"></div>
        </div>
      ) : (
        <p className="text-brand-text leading-relaxed whitespace-pre-wrap">{story}</p>
      )}
    </div>
  );
};

export default StoryDisplay;
