# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
# Start the development server with turbopack
bun run dev

# Build the application for production
bun run build

# Start the production server
bun run start

# Run linting
bun run lint
```

## Project Architecture

### Overview

This is a Next.js application (version 15.3) using the App Router architecture. The project is a financial platform with two main sections:

1. **Trader Portal** (`/trader/*`) - For users/traders to manage transactions, deposits, payouts, etc.
2. **Admin Portal** (`/admin/*`) - For administrators to manage merchants, offers, transactions, etc.

### Authentication Flow

The app uses token-based authentication with different tokens for traders and admins:
- Trader authentication uses `x-trader-token`
- Admin authentication uses `x-admin-key`

Tokens are stored in:
- Cookies
- LocalStorage
- Zustand state store

The middleware (`src/middleware.ts`) handles route protection and redirects unauthenticated users.

### API Structure

- Base API client: `src/api/base.ts` uses Axios with interceptors for tokens and error handling
- API modules:
  - `user.ts` - Authentication and user management
  - `trader.ts` - Trader specific operations
  - `admin.ts` - Admin operations
  - `info.ts` - System information
  - `bankDetails.ts` - Banking information

### State Management

- Zustand for global state (auth tokens, etc.)
- React Query for server state management and data fetching

### UI Components

The application uses a custom UI component library based on:
- TailwindCSS v4
- Radix UI primitives
- shadcn/ui component patterns

### Error Handling

- Custom `APIError` class in `src/errors/APIError.ts`
- Centralized error handling in API interceptors

### Important Files

- `src/middleware.ts` - Route protection logic
- `src/store/useAuthStore.ts` - Auth token management
- `src/api/base.ts` - Base API client configuration
- `src/hooks/useTraderAuth.ts` & `src/hooks/useAdminAuth.ts` - Authentication hooks

## Development Notes

- The application uses Russian language in the UI and error messages
- The application is built with Next.js App Router and React 19
- TanStack Query (React Query) v5 is used for data fetching
- Error handling is standardized through the API interceptors
