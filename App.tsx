import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GameStatus, WeatherType } from './types';
import { generateStoryAndChoices, generateImage, generateSpeech } from './services/geminiService';
import { decodeAudioData } from './utils/audioUtils';
import { ambianceService } from './services/ambianceService';
import Sidebar from './components/Sidebar';
import StoryDisplay from './components/StoryDisplay';
import ChoiceButtons from './components/ChoiceButtons';

const SAVE_KEY = 'GEMINI_ADVENTURE_SAVE';
const WEATHER_TYPES: WeatherType[] = ['CLEAR', 'RAIN', 'STORM', 'WINDY', 'FOG'];

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
    ambiance: 'DUNGEON',
    weather: 'CLEAR',
  });
  
  // Audio State
  const narratorContext = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasSaveFile, setHasSaveFile] = useState(false);

  useEffect(() => {
    // Initialize AudioContext singleton for narrator
    narratorContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Check for existing save on mount
    const savedData = localStorage.getItem(SAVE_KEY);
    setHasSaveFile(!!savedData);

    return () => {
        if (narratorContext.current) narratorContext.current.close();
    };
  }, []);

  // Sync ambiance with game state
  useEffect(() => {
    if (gameState.status === GameStatus.PLAYING) {
        ambianceService.setAmbiance(gameState.ambiance, gameState.weather);
    }
  }, [gameState.ambiance, gameState.weather, gameState.status]);

  const stopCurrentAudio = useCallback(() => {
    if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch(e) {}
        audioSourceRef.current = null;
    }
    setIsPlaying(false);
    // Do not clear buffer here, so user can restart it
  }, []);

  const playSpeechBuffer = useCallback(async (buffer: AudioBuffer) => {
    if (!narratorContext.current) return;
    
    // Resume context if suspended
    if (narratorContext.current.state === 'suspended') {
        await narratorContext.current.resume();
    }

    stopCurrentAudio(); // Stop any existing source

    const source = narratorContext.current.createBufferSource();
    source.buffer = buffer;
    source.connect(narratorContext.current.destination);
    source.onended = () => setIsPlaying(false);
    source.start();
    
    audioSourceRef.current = source;
    setIsPlaying(true);
  }, [stopCurrentAudio]);

  const handlePlayPause = useCallback(async () => {
    if (!narratorContext.current) return;

    if (isPlaying) {
        // Pause by suspending context
        await narratorContext.current.suspend();
        setIsPlaying(false);
    } else {
        // Resume or Start
        if (narratorContext.current.state === 'suspended') {
            await narratorContext.current.resume();
            setIsPlaying(true);
        } else if (audioBuffer) {
            // If stopped (not suspended), we need to recreate source
            playSpeechBuffer(audioBuffer);
        }
    }
  }, [isPlaying, audioBuffer, playSpeechBuffer]);

  const handleStop = useCallback(() => {
     stopCurrentAudio();
     // If we stop, we might want to reset the context time or just rely on recreating the source
     // Recreating the source (via playSpeechBuffer logic in handlePlayPause) handles the "restart" behavior
  }, [stopCurrentAudio]);

  const handleSaveGame = useCallback(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
      setHasSaveFile(true);
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
        setAudioBuffer(null); // Clear audio on load
        const loadedState = JSON.parse(savedData);
        if (!loadedState.ambiance) loadedState.ambiance = 'DUNGEON';
        if (!loadedState.weather) loadedState.weather = 'CLEAR';
        setGameState(loadedState);
      }
    } catch (error) {
      console.error("Failed to load game:", error);
      alert("Failed to load save file.");
    }
  }, [stopCurrentAudio]);

  const handleNewAdventure = useCallback(async (prompt: string) => {
    stopCurrentAudio();
    setAudioBuffer(null);
    setGameState(prev => ({ ...prev, status: GameStatus.LOADING, story: '', imageUrl: '', choices: [], error: null }));

    try {
      const storyResponse = await generateStoryAndChoices(prompt, gameState.inventory, gameState.quest, gameState.weather);
      
      setGameState(prev => ({
        ...prev,
        status: GameStatus.PLAYING,
        story: storyResponse.story,
        choices: storyResponse.choices,
        inventory: storyResponse.updatedInventory,
        quest: storyResponse.updatedQuest,
        imagePrompt: storyResponse.imagePrompt,
        ambiance: storyResponse.ambiance || 'DUNGEON',
        weather: storyResponse.weather || 'CLEAR',
      }));

      // Fire off image and audio generation in parallel
      generateImage(storyResponse.imagePrompt).then(newImageUrl => {
        setGameState(prev => ({...prev, imageUrl: newImageUrl }));
      }).catch(err => {
        console.error("Image generation failed:", err);
        setGameState(prev => ({ ...prev, error: 'Failed to generate image.' }));
      });
      
      generateSpeech(storyResponse.story).then(async (rawAudioData) => {
         if (narratorContext.current) {
            const buffer = await decodeAudioData(rawAudioData, narratorContext.current, 24000, 1);
            setAudioBuffer(buffer);
            playSpeechBuffer(buffer);
         }
      }).catch(err => {
        console.error("Speech generation failed:", err);
        // Silent fail for audio is okay
      });

    } catch (error) {
      console.error(error);
      setGameState(prev => ({
        ...prev,
        status: GameStatus.ERROR,
        error: 'A mysterious force has blocked your path. Please try again.',
      }));
    }
  }, [gameState.inventory, gameState.quest, gameState.weather, stopCurrentAudio, playSpeechBuffer]);

  useEffect(() => {
    if (gameState.status === GameStatus.INIT && !gameState.story) {
        handleNewAdventure("You awaken in a cold, damp cell in the Whispering Dungeons. A rusty key and some stale bread are in your pocket. Your quest is to escape. Describe the scene and your immediate options.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChoiceSelected = (choice: string) => {
    ambianceService.playSFX('SELECT');
    
    let weatherChangePrompt = "";
    // 10% chance to change weather dynamically
    if (Math.random() < 0.1) {
      const possibleWeathers = WEATHER_TYPES.filter(w => w !== gameState.weather);
      const newWeather = possibleWeathers[Math.floor(Math.random() * possibleWeathers.length)];
      weatherChangePrompt = ` Suddenly, the weather conditions shift drastically to ${newWeather}. Describe how this change in weather affects the immediate environment.`;
    }

    const prompt = `My last action was: "${choice}". The story so far is: "${gameState.story}". My current inventory is [${gameState.inventory.join(', ')}]. My quest is "${gameState.quest}". The weather is currently "${gameState.weather}".${weatherChangePrompt} Continue the story based on my choice.`;
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
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onStop={handleStop}
            hasAudio={!!audioBuffer}
            weather={gameState.weather}
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
        weather={gameState.weather}
        className="w-full lg:w-1/3 p-4 md:p-8"
        onSave={handleSaveGame}
        onLoad={handleLoadGame}
        hasSave={hasSaveFile}
      />
    </div>
  );
};

export default App;