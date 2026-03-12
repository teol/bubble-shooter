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
    border: 2px solid #555;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
</style>
