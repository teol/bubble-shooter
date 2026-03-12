<script lang="ts">
  import Game from './components/Game.svelte';
  import Overlay from './components/Overlay.svelte';
</script>

<main>
  <div class="layout">
    <Game />
    <Overlay />
  </div>
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #000;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      'Open Sans',
      'Helvetica Neue',
      sans-serif;
    margin: 0;
  }

  .layout {
    position: relative;
    width: 800px;
    height: 600px;
  }
</style>
