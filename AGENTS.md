# Agents Guidelines

This document serves as a high-level reference for AI agents interacting with this workspace.

## Core Rules

- **Build System**: Use `bun` for all package management and scripting (`bun run dev`, `bun run build`).
- **Stack**: Maintain separation between game rendering (Phaser 3) and UI (Svelte).
- **Types**: Adhere to strict TypeScript standards for all logic, particularly grid management.
- **Verification & Finishing Tasks**: Before finalizing any task, you must run the following checks to ensure everything is correct:
  1. `bun run format` (auto-format code)
  2. `bun run check` (verify Svelte & TypeScript diagnostics)
  3. `bun run test` (run all tests)
  4. `bun run build` (verify production build succeeds)
