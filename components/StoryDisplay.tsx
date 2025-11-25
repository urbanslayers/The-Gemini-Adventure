
import React from 'react';
import { GameStatus, WeatherType } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { PlayIcon, PauseIcon, StopIcon } from './IconComponents';
import WeatherOverlay from './WeatherOverlay';

interface StoryDisplayProps {
  imageUrl: string;
  story: string;
  status: GameStatus;
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  hasAudio: boolean;
  weather: WeatherType;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ 
  imageUrl, 
  story, 
  status, 
  isPlaying, 
  onPlayPause, 
  onStop,
  hasAudio,
  weather
}) => {
  return (
    <div className="flex-grow p-4 md:p-6 overflow-y-auto">
      <div className="aspect-w-16 aspect-h-9 w-full bg-brand-primary rounded-lg mb-6 overflow-hidden flex items-center justify-center relative group shadow-inner border border-brand-primary/50">
        {status === GameStatus.LOADING && !imageUrl ? (
          <div className="text-center z-0">
            <LoadingSpinner />
            <p className="mt-2 text-brand-text-muted">Conjuring a vision...</p>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt="Adventure scene" className="w-full h-full object-cover transition-opacity duration-500 ease-in-out z-0" />
        ) : (
          <div className="w-full h-full bg-black/30 z-0"></div>
        )}

        {/* Weather Overlay (z-10) */}
        <WeatherOverlay weather={weather} />

        {/* Audio Controls Overlay (z-20) */}
        {hasAudio && (
            <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-sm p-2 rounded-lg flex space-x-2 border border-brand-primary/50 transition-opacity duration-300 opacity-80 hover:opacity-100">
                <button 
                    onClick={onPlayPause}
                    className="p-1.5 text-brand-text hover:text-brand-secondary transition-colors rounded hover:bg-white/10"
                    title={isPlaying ? "Pause Narration" : "Play Narration"}
                >
                    {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                </button>
                <button 
                    onClick={onStop}
                    className="p-1.5 text-brand-text hover:text-brand-secondary transition-colors rounded hover:bg-white/10"
                    title="Stop Narration"
                >
                    <StopIcon className="w-6 h-6" />
                </button>
            </div>
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
