import { writable } from 'svelte/store';

export type GameStatus = 'start' | 'playing' | 'gameover' | 'victory';

export const gameState = writable({
  status: 'start' as GameStatus,
  score: 0,
});

export const updateScore = (points: number) => {
  gameState.update((state) => ({ ...state, score: state.score + points }));
};

export const setGameStatus = (status: GameStatus) => {
  gameState.update((state) => ({ ...state, status }));
};
