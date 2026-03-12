/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, beforeEach } from 'vitest';
import Overlay from './Overlay.svelte';
import { gameState } from '../store/gameState';
import { get } from 'svelte/store';

describe('Overlay Component', () => {
  beforeEach(() => {
    // Reset state before each test
    gameState.set({ status: 'start', score: 0 });
  });

  it('shows Start Game button initially', () => {
    render(Overlay);
    const btn = screen.getByText('Start Game');
    expect(btn).toBeInTheDocument();
  });

  it('changes state to playing when Start Game is clicked', async () => {
    render(Overlay);
    const btn = screen.getByText('Start Game');
    await fireEvent.click(btn);

    expect(get(gameState).status).toBe('playing');
    expect(screen.queryByText('Start Game')).not.toBeInTheDocument();
    expect(screen.getByText('Score: 0')).toBeInTheDocument();
  });

  it('shows Game Over screen with correct score', () => {
    gameState.set({ status: 'gameover', score: 150 });
    render(Overlay);

    expect(screen.getByText('Game Over!')).toBeInTheDocument();
    expect(screen.getByText('Final Score: 150')).toBeInTheDocument();
    expect(screen.getByText('Play Again')).toBeInTheDocument();
  });

  it('restarts game when Play Again is clicked', async () => {
    gameState.set({ status: 'gameover', score: 150 });
    render(Overlay);

    const btn = screen.getByText('Play Again');
    await fireEvent.click(btn);

    // Play again goes back to 'start' to prepare for reset
    expect(get(gameState).status).toBe('start');
    expect(get(gameState).score).toBe(0);

    // Simulate Phaser scene being ready
    window.dispatchEvent(new CustomEvent('phaser-scene-ready'));

    expect(get(gameState).status).toBe('playing');
  });
});
