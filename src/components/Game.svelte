<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { initGame } from '../game/config';
  import Phaser from 'phaser';

  let container: HTMLDivElement;
  let game: Phaser.Game;

  onMount(() => {
    game = initGame(container);
  });

  onDestroy(() => {
    if (game) {
      game.destroy(true);
    }
  });
</script>

<div bind:this={container} class="game-container"></div>

<style>
  .game-container {
    width: 800px;
    height: 600px;
    margin: 0 auto;
    position: relative;
    border: 12px solid #2c3e50;
    border-radius: 16px;
    overflow: hidden;
    box-shadow:
      0 0 0 4px #1a252c,
      0 20px 50px rgba(0, 0, 0, 0.8),
      inset 0 0 30px rgba(0, 0, 0, 0.6);
    background-color: #000;
  }
</style>
