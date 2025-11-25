
export enum GameStatus {
  INIT = 'INIT',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  ERROR = 'ERROR',
}

export type AmbianceType = 'DUNGEON' | 'NATURE' | 'BATTLE' | 'TOWN' | 'MYSTICAL';

export type WeatherType = 'CLEAR' | 'RAIN' | 'STORM' | 'WINDY' | 'FOG';

export interface GameState {
  status: GameStatus;
  story: string;
  imageUrl: string;
  imagePrompt: string;
  choices: string[];
  inventory: string[];
  quest: string;
  error: string | null;
  ambiance: AmbianceType;
  weather: WeatherType;
}

export interface StoryResponse {
  story: string;
  imagePrompt: string;
  choices: string[];
  updatedInventory: string[];
  updatedQuest: string;
  ambiance: AmbianceType;
  weather: WeatherType;
}
