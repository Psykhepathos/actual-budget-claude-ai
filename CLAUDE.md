# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

Actual is a local-first personal finance tool. It is 100% free and open-source, written in NodeJS. It's an envelope budgeting system with device synchronization functionality. The project allows managing accounts, transactions, budgets, and bank imports (OFX, CSV).

## Essential Commands

### Development Commands

- `yarn start` - Start browser application (parallel: frontend + backend)
- `yarn start:server` - Start sync server only
- `yarn start:server-dev` - Full development (server + client at localhost:5006)
- `yarn start:desktop` - Start desktop application (Electron)

### Builds

- `yarn build:browser` - Production build for web client
- `yarn build:desktop` - Desktop application build
- `yarn build:server` - Sync server build
- `yarn build:api` - API build

### Code Quality

- `yarn typecheck` - Run TypeScript type checking
- `yarn lint` - Check code with ESLint and Prettier
- `yarn lint:fix` - Automatically fix lint issues (preferred over `yarn lint`)

### Testing

- `yarn test` - Run all tests in parallel
- `yarn workspace <workspace-name> run test <test-path>` - Test specific workspace
- `yarn e2e` - End-to-end tests (except desktop)
- `yarn e2e:desktop` - Desktop E2E tests
- Always use `--watch=false` flag to avoid watch mode in tests

### AI and Docker Commands

- `yarn ai:dev` - Start Docker containers for AI features
- `yarn ai:dev:logs` - View AI container logs
- `yarn ai:dev:stop` - Stop AI containers
- `yarn ai:dev:restart` - Restart AI container

### Workspace-Specific Commands

- `yarn workspace <workspace-name> run <command>` - Run command in specific workspace
- `yarn workspace @actual-app/web start:browser` - Frontend only
- `yarn workspace @actual-app/sync-server start` - Server only
- `yarn workspace loot-core build:browser` - Core only

### Important

- Always run yarn commands in root directory, never in child workspaces
- Use Vitest as test runner with minimal mocks
- Use `--watch=false` flag to avoid watch mode in tests
- Node.js ≥20 and Yarn 4.9.1 are required

## Project Architecture

This is a Yarn monorepo with the following main packages:

### Core Packages

- **loot-core** - Core application that runs on any platform. Contains all business logic, state management, and works in both browser and desktop.
- **desktop-client** - User interface for web/browser (legacy name, but used in browser)
- **desktop-electron** - Electron wrapper for desktop application
- **sync-server** - Synchronization server for data between devices

### Support Packages

- **api** - Public API for external integration
- **crdt** - CRDT (Conflict-free Replicated Data Types) implementation for synchronization
- **component-library** - Reusable React components
- **ci-actions** - Custom CI/CD actions
- **eslint-plugin-actual** - Project-specific ESLint rules

### TypeScript Configuration

- Monorepo configuration with path mapping for imports
- Strict mode partially enabled (transition in progress)
- typescript-strict-plugin for additional strictness
- Important path aliases:
  - `loot-core/*` → `./packages/loot-core/src/*`
  - `@desktop-client/*` → `./packages/desktop-client/src/*`

### Main Technologies

- **Frontend**: React 19, Redux Toolkit, React Router, Emotion (CSS-in-JS)
- **Backend**: Node.js, Express, SQLite (better-sqlite3), bcrypt
- **Build**: Vite, TypeScript, Rollup
- **Tests**: Vitest, Playwright (E2E), Testing Library
- **Database**: SQLite with CRDT synchronization

### Data Structure

- Local-first system with optional synchronization
- Personal financial data (accounts, transactions, budgets)
- Bank import support (OFX, CSV)
- Schedules and automatic rules

### Code Conventions

- Use TypeScript for all new code
- Prefer interfaces over types
- Avoid enums; use objects or maps instead
- Avoid `any`/`unknown`; look for type definitions in the codebase
- Avoid type assertions with `as` or `!`; prefer `satisfies`
- Use `function` keyword for pure functions
- Declarative and minimal JSX
- Functional components, avoid classes
- Descriptive names with auxiliary verbs (isLoaded, hasError)
- Favor named exports for components and utilities
- Functional and declarative programming; avoid classes
- Each new component should have its own file

### Internationalization

- i18next system for multiple languages
- `yarn generate:i18n` - Generate translation files
- Contributions via Weblate

### Development Workflow

- Always run `yarn typecheck` before commits to validate TypeScript
- Run `yarn lint:fix` instead of just `yarn lint` to automatically fix issues
- Run tests with `--watch=false` to avoid watch mode
- For specific tests: `yarn workspace <workspace> run test <path>`

### Development Environment

- Node.js ≥20, Yarn 4.9.1
- Hot reload support in development
- Docker for optional components (AI features)
- Husky configuration for pre-commit hooks
- Prettier and ESLint configured for automatic formatting
