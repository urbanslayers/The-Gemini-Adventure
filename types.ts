
export enum GameStatus {
  INIT = 'INIT',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  ERROR = 'ERROR',
}

export interface GameState {
  status: GameStatus;
  story: string;
  imageUrl: string;
  imagePrompt: string;
  choices: string[];
  inventory: string[];
  quest: string;
  error: string | null;
}

export interface StoryResponse {
  story: string;
  imagePrompt: string;
  choices: string[];
  updatedInventory: string[];
  updatedQuest: string;
}
