# Bubble Shooter

A Bubble Shooter game built with TypeScript using the following stack:

- **Logic**: TypeScript (strict grid management)
- **Rendering**: Phaser 3 (60 FPS textures/collisions)
- **UI**: Svelte (lightweight and CSS transitions)
- **Tooling**: Vite + Bun (instant build and hot-reload)

## Prerequisites

- [Bun](https://bun.sh/) (Runtime & Package Manager)

## Local Installation

1. Install project dependencies:

   ```bash
   bun install
   ```

2. Start the development server:
   ```bash
   bun run dev
   ```
   The project will be accessible at `http://localhost:5173/` (or the port specified by Vite).

## Testing

The project is fully tested using Vitest for game logic, and Svelte Testing Library for UI components.

1. Run the test suite:
   ```bash
   bun run test
   ```
2. Verify formatting and type safety:
   ```bash
   bun run format:check
   bun run check
   ```

## Production Deployment

1. Build the project for production:

   ```bash
   bun run build
   ```

2. The build will output a `dist/` directory containing the optimized static files. You can host the contents of this folder on any static hosting service (Vercel, Netlify, GitHub Pages, Nginx, etc.).

   For instance, to test the build locally:

   ```bash
   bun run preview
   ```
