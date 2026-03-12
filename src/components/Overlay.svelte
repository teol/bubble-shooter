<script lang="ts">
  import { onMount } from 'svelte';
  import { gameState, setGameStatus, gameEvents } from '../store/gameState';

  let isRestarting = false;

  const startGame = () => setGameStatus('playing');

  const restartGame = () => {
    isRestarting = true;
    gameState.set({ status: 'start', score: 0 }); // Emit start to trigger MainScene pause/reset readiness
  };

  onMount(() => {
    const handleSceneReady = () => {
      if (isRestarting) {
        isRestarting = false;
        setGameStatus('playing'); // Emit playing again to resume and reset Phaser properly
      }
    };
    const unsubscribe = gameEvents.on('scene-ready', handleSceneReady);
    return () => unsubscribe();
  });
</script>

<div class="overlay-container">
  {#if $gameState.status === 'start'}
    <div class="panel">
      <h1>Bubble Shooter</h1>
      <button on:click={startGame}>Start Game</button>
    </div>
  {:else if $gameState.status === 'playing'}
    <div class="hud">
      <div class="score">Score: {$gameState.score}</div>
    </div>
  {:else if $gameState.status === 'gameover'}
    <div class="panel">
      <h1>Game Over!</h1>
      <p>Final Score: {$gameState.score}</p>
      <button on:click={restartGame}>Play Again</button>
    </div>
  {:else if $gameState.status === 'victory'}
    <div class="panel">
      <h1>You Win!</h1>
      <p>Final Score: {$gameState.score}</p>
      <button on:click={restartGame}>Play Again</button>
    </div>
  {/if}
</div>

<style>
  .overlay-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 800px;
    height: 600px;
    pointer-events: none; /* Let clicks pass through if not a panel */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  .panel {
    background: rgba(30, 30, 30, 0.9);
    padding: 3rem;
    border-radius: 16px;
    text-align: center;
    pointer-events: auto; /* Catch clicks */
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
  }

  h1 {
    font-size: 3rem;
    margin-bottom: 2rem;
    line-height: 1.2;
    padding-bottom: 0.2em; /* Prevents descenders from clipping */
    background: linear-gradient(45deg, #00f2fe, #4facfe);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 800;
  }

  p {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    color: #eee;
  }

  button {
    background: linear-gradient(45deg, #00f2fe, #4facfe);
    color: white;
    border: none;
    padding: 1rem 2.5rem;
    font-size: 1.5rem;
    border-radius: 30px;
    cursor: pointer;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
    font-weight: bold;
    box-shadow: 0 4px 15px rgba(0, 242, 254, 0.4);
  }

  button:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 242, 254, 0.6);
  }

  .hud {
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .score {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    background: rgba(0, 0, 0, 0.6);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
</style>
