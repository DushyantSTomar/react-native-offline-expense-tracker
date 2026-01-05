# Architecture Documentation

## Overview
The application follows a **feature-based** and **layered** architecture to ensure scalability and testability.

## Layers

### 1. Presentation Layer (UI)
- **Screens**: `HomeScreen`, `AddExpenseScreen`, `StatsScreen`.
- **Components**: Reusable UI elements.
- **Responsibility**: Render UI based on Redux state; dispatch actions.

### 2. State Management Layer (Redux)
- **Slices**: `expenseSlice` manages the list of expenses and loading states.
- **Thunks**: Handle asynchronous logic (DB calls). All DB interactions happen inside Thunks to keep components pure.
- **Store**: Centralized state type definition.

### 3. Data Layer (Persistence)
- **SQLite**: The single source of truth for data.
- **Service**: `src/db/Database.ts` provides a clean API (`insertExpense`, `getExpenses`) hiding raw SQL queries from the rest of the app.

## Offline Strategy
- The app loads data from SQLite immediately upon startup via `useEffect` in `HomeScreen`.
- All modifications (Add/Delete) are effectively "optimistic" but strictly sequential: we write to DB first, then reload/update Redux state.
- This ensures that what the user sees is always persisted.

## Scalability
- **New Features**: Can be added as new Redux slices and Screens.
- **Database**: New tables can be added in `createTables`. Migrations would be handled by version checks in `Database.ts`.
