# Agents Guidelines

This document serves as a high-level reference for AI agents interacting with this workspace.

## Core Rules

- **Build System**: Use `bun` for all package management and scripting (`bun run dev`, `bun run build`).
- **Stack**: Maintain separation between game rendering (Phaser 3) and UI (Svelte).
- **Types**: Adhere to strict TypeScript standards for all logic, particularly grid management.
- **Verification**: Ensure the project successfully builds via `bun run build` after making structural changes.
