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

type EventCallback = () => void;

export const gameEvents = {
  listeners: {} as Record<string, EventCallback[]>,
  on(event: string, callback: EventCallback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  },
  off(event: string, callback: EventCallback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }
  },
  emit(event: string) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb());
    }
  },
};
