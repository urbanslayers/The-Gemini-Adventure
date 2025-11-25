
import React from 'react';
import { GameStatus } from '../types';

interface ChoiceButtonsProps {
  choices: string[];
  onChoice: (choice: string) => void;
  status: GameStatus;
}

const ChoiceButtons: React.FC<ChoiceButtonsProps> = ({ choices, onChoice, status }) => {
  const isLoading = status === GameStatus.LOADING;
  return (
    <div className="p-4 md:p-6 bg-brand-primary/50 border-t border-brand-primary">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
};

export default ChoiceButtons;
