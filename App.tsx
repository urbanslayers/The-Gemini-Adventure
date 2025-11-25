
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, GameStatus } from './types';
import { generateStoryAndChoices, generateImage, generateSpeech } from './services/geminiService';
import { playAudio } from './utils/audioUtils';
import Sidebar from './components/Sidebar';
import StoryDisplay from './components/StoryDisplay';
import ChoiceButtons from './components/ChoiceButtons';

const SAVE_KEY = 'GEMINI_ADVENTURE_SAVE';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.INIT,
    story: '',
    imageUrl: '',
    imagePrompt: '',
    choices: [],
    inventory: ['A rusty key', 'A piece of stale bread'],
    quest: 'Find your way out of the Whispering Dungeons.',
    error: null,
  });
  const [currentAudio, setCurrentAudio] = useState<AudioBufferSourceNode | null>(null);
  const [hasSaveFile, setHasSaveFile] = useState(false);

  useEffect(() => {
    // Check for existing save on mount
    const savedData = localStorage.getItem(SAVE_KEY);
    setHasSaveFile(!!savedData);
  }, []);

  const stopCurrentAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.stop();
      setCurrentAudio(null);
    }
  }, [currentAudio]);

  const handleSaveGame = useCallback(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
      setHasSaveFile(true);
      // Optional: Visual feedback could go here, but button state is enough for now
    } catch (error) {
      console.error("Failed to save game:", error);
      alert("Failed to save game. Storage might be full.");
    }
  }, [gameState]);

  const handleLoadGame = useCallback(() => {
    try {
      const savedData = localStorage.getItem(SAVE_KEY);
      if (savedData) {
        stopCurrentAudio();
        const loadedState = JSON.parse(savedData);
        setGameState(loadedState);
      }
    } catch (error) {
      console.error("Failed to load game:", error);
      alert("Failed to load save file.");
    }
  }, [stopCurrentAudio]);

  const handleNewAdventure = useCallback(async (prompt: string) => {
    stopCurrentAudio();
    setGameState(prev => ({ ...prev, status: GameStatus.LOADING, story: '', imageUrl: '', choices: [], error: null }));

    try {
      const storyResponse = await generateStoryAndChoices(prompt, gameState.inventory, gameState.quest);
      
      setGameState(prev => ({
        ...prev,
        status: GameStatus.PLAYING,
        story: storyResponse.story,
        choices: storyResponse.choices,
        inventory: storyResponse.updatedInventory,
        quest: storyResponse.updatedQuest,
        imagePrompt: storyResponse.imagePrompt,
      }));

      // Fire off image and audio generation in parallel
      generateImage(storyResponse.imagePrompt).then(newImageUrl => {
        setGameState(prev => ({...prev, imageUrl: newImageUrl }));
      }).catch(err => {
        console.error("Image generation failed:", err);
        setGameState(prev => ({ ...prev, error: 'Failed to generate image.' }));
      });
      
      generateSpeech(storyResponse.story).then(audioSource => {
        setCurrentAudio(audioSource);
        playAudio(audioSource);
      }).catch(err => {
        console.error("Speech generation failed:", err);
         setGameState(prev => ({ ...prev, error: 'Failed to generate audio narration.' }));
      });

    } catch (error) {
      console.error(error);
      setGameState(prev => ({
        ...prev,
        status: GameStatus.ERROR,
        error: 'A mysterious force has blocked your path. Please try again.',
      }));
    }
  }, [gameState.inventory, gameState.quest, stopCurrentAudio]);

  useEffect(() => {
    // Only start a new game if we are in INIT state and haven't loaded a game
    // This allows the initial load to work, but prevents overwriting a loaded game
    // We check if story is empty as a proxy for "fresh start"
    if (gameState.status === GameStatus.INIT && !gameState.story) {
        handleNewAdventure("You awaken in a cold, damp cell in the Whispering Dungeons. A rusty key and some stale bread are in your pocket. Your quest is to escape. Describe the scene and your immediate options.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChoiceSelected = (choice: string) => {
    const prompt = `My last action was: "${choice}". The story so far is: "${gameState.story}". My current inventory is [${gameState.inventory.join(', ')}] and my quest is "${gameState.quest}". Continue the story based on my choice.`;
    handleNewAdventure(prompt);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col lg:flex-row font-sans">
      <main className="w-full lg:w-2/3 p-4 md:p-8 flex flex-col">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 font-serif text-brand-secondary">Gemini Adventure Engine</h1>
        <div className="flex-grow flex flex-col bg-brand-surface rounded-lg shadow-2xl overflow-hidden">
          <StoryDisplay
            imageUrl={gameState.imageUrl}
            story={gameState.story}
            status={gameState.status}
          />
          <ChoiceButtons
            choices={gameState.choices}
            onChoice={onChoiceSelected}
            status={gameState.status}
          />
           {gameState.status === GameStatus.ERROR && (
            <div className="p-4 text-center text-red-400 bg-red-900/50">
              <p>{gameState.error}</p>
              <button
                onClick={() => handleNewAdventure("Let's try that again. Take me back to where I was, just before the error happened.")}
                className="mt-2 px-4 py-2 bg-brand-secondary text-white rounded-md hover:bg-opacity-80 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </main>
      <Sidebar
        inventory={gameState.inventory}
        quest={gameState.quest}
        className="w-full lg:w-1/3 p-4 md:p-8"
        onSave={handleSaveGame}
        onLoad={handleLoadGame}
        hasSave={hasSaveFile}
      />
    </div>
  );
};

export default App;
