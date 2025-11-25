
import React, { useState } from 'react';
import { GameStatus } from '../types';

interface ChoiceButtonsProps {
  choices: string[];
  onChoice: (choice: string) => void;
  status: GameStatus;
}

const ChoiceButtons: React.FC<ChoiceButtonsProps> = ({ choices, onChoice, status }) => {
  const [customInput, setCustomInput] = useState('');
  const isLoading = status === GameStatus.LOADING;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim() && !isLoading) {
      onChoice(customInput.trim());
      setCustomInput('');
    }
  };

  return (
    <div className="p-4 md:p-6 bg-brand-primary/50 border-t border-brand-primary">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => onChoice(choice)}
            disabled={isLoading}
            className="w-full text-left p-4 bg-brand-primary rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            <span className="font-semibold text-brand-text">{choice}</span>
          </button>
        ))}
      </div>
      
      {/* Custom Action Input */}
      <form onSubmit={handleCustomSubmit} className="mt-4 flex gap-2">
        <input 
            type="text" 
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Or try something else..." 
            disabled={isLoading}
            className="flex-grow p-3 rounded-lg bg-brand-bg border border-brand-primary text-brand-text focus:border-brand-secondary focus:outline-none transition-colors"
        />
        <button 
            type="submit" 
            disabled={isLoading || !customInput.trim()}
            className="px-6 py-3 bg-brand-primary hover:bg-brand-secondary text-brand-text font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Act
        </button>
      </form>
    </div>
  );
};

export default ChoiceButtons;