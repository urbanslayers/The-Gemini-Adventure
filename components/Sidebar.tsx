
import React from 'react';
import { BackpackIcon, QuestIcon, SaveIcon, LoadIcon, SunIcon, RainIcon, StormIcon, WindIcon, CloudIcon } from './IconComponents';
import { WeatherType } from '../types';

interface SidebarProps {
  inventory: string[];
  quest: string;
  weather?: WeatherType;
  className?: string;
  onSave: () => void;
  onLoad: () => void;
  hasSave: boolean;
}

const WeatherDisplay: React.FC<{ weather: WeatherType }> = ({ weather }) => {
    let Icon = SunIcon;
    let text = "Clear Skies";
    let color = "text-yellow-400";

    switch (weather) {
        case 'RAIN':
            Icon = RainIcon;
            text = "Rainy";
            color = "text-blue-400";
            break;
        case 'STORM':
            Icon = StormIcon;
            text = "Stormy";
            color = "text-purple-400";
            break;
        case 'WINDY':
            Icon = WindIcon;
            text = "Windy";
            color = "text-gray-300";
            break;
        case 'FOG':
            Icon = CloudIcon;
            text = "Foggy";
            color = "text-gray-400";
            break;
        case 'CLEAR':
        default:
            Icon = SunIcon;
            text = "Clear";
            color = "text-yellow-400";
            break;
    }

    return (
        <div className="flex items-center space-x-3 text-brand-text-muted">
             <Icon className={`w-6 h-6 ${color}`} />
             <span className="font-medium">{text}</span>
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ inventory, quest, weather = 'CLEAR', className, onSave, onLoad, hasSave }) => {
  return (
    <aside className={`flex-shrink-0 ${className}`}>
      <div className="sticky top-8 bg-brand-surface rounded-lg shadow-2xl p-6 space-y-8">
        
        {/* Inventory */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center font-serif text-brand-secondary">
            <BackpackIcon className="w-6 h-6 mr-3" />
            Inventory
          </h2>
          <ul className="space-y-2 text-brand-text-muted">
            {inventory.length > 0 ? (
              inventory.map((item, index) => (
                <li key={index} className="pl-4 border-l-2 border-brand-primary">
                  {item}
                </li>
              ))
            ) : (
              <li className="pl-4 italic">Your pockets are empty.</li>
            )}
          </ul>
        </div>

        {/* Quest */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center font-serif text-brand-secondary">
            <QuestIcon className="w-6 h-6 mr-3" />
            Current Quest
          </h2>
          <p className="text-brand-text-muted pl-4 border-l-2 border-brand-primary">
            {quest}
          </p>
        </div>

        {/* Weather Conditions */}
        <div>
           <h2 className="text-2xl font-bold mb-4 flex items-center font-serif text-brand-secondary">
            Conditions
          </h2>
          <div className="pl-4 border-l-2 border-brand-primary">
            <WeatherDisplay weather={weather} />
          </div>
        </div>

        {/* Controls */}
        <div className="pt-6 border-t border-brand-primary/30">
          <h2 className="text-xl font-bold mb-4 flex items-center font-serif text-brand-secondary">
            Game Controls
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onSave}
              className="flex items-center justify-center py-2 px-3 bg-brand-primary hover:bg-brand-secondary text-brand-text rounded transition-colors duration-200"
              title="Save your current progress"
            >
              <SaveIcon className="w-5 h-5 mr-2" />
              Save
            </button>
            <button
              onClick={onLoad}
              disabled={!hasSave}
              className={`flex items-center justify-center py-2 px-3 rounded transition-colors duration-200 ${
                hasSave
                  ? 'bg-brand-primary hover:bg-brand-secondary text-brand-text'
                  : 'bg-brand-primary/30 text-brand-text-muted cursor-not-allowed'
              }`}
              title={hasSave ? "Load your last save" : "No save file found"}
            >
              <LoadIcon className="w-5 h-5 mr-2" />
              Load
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
