# Project Structure

## Root Directory Organization

```
├── app/                    # Next.js App Router pages
├── amplify/               # AWS Amplify Gen 2 backend
├── components/            # React components
├── lib/                   # Utility libraries
├── types/                 # TypeScript type definitions
├── utils/                 # Helper functions
├── theme/                 # Theme configuration
└── public/                # Static assets
```

## Key Directories

### `/app` - Next.js App Router
- `layout.tsx` - Root layout with Auth wrapper
- `page.tsx` - Home page
- `add-room/` - Add room functionality
- `ai-room/` - AI chat room page
- `globals.css` - Global styles with Tailwind

### `/amplify` - Backend Configuration
- `backend.ts` - Main backend definition with custom AppSync Events
- `auth/resource.ts` - Cognito authentication setup
- `data/resource.ts` - GraphQL schema with AI conversation model
- `auth/pre-signup/` - Pre-signup Lambda trigger

### `/components` - React Components
- `MessengerApp.tsx` - Main chat application
- `Auth.tsx` - Authentication wrapper
- `ChatArea.tsx` - Chat interface
- `RoomList.tsx` - Room selection sidebar
- `Message.tsx` - Individual message component
- `ui/` - shadcn/ui components (button, card, input, etc.)

### `/types` - TypeScript Definitions
- `types.ts` - Shared type definitions for rooms, messages, props

### `/utils` - Helper Functions
- `client-utils.ts` - Client-side utilities
- `server-utils.ts` - Server-side utilities  
- `shared-utils.ts` - Shared utilities

## File Naming Conventions

- **Components**: PascalCase (e.g., `MessengerApp.tsx`)
- **Pages**: lowercase with hyphens (e.g., `add-room/`)
- **Utilities**: kebab-case (e.g., `client-utils.ts`)
- **Types**: lowercase (e.g., `types.ts`)

## Import Patterns

- Use `@/` path alias for root-level imports
- Components import from `@/components`
- Utils import from `@/lib/utils` or specific util files
- Types import from `@/types/types`

## Architecture Patterns

- **Client Components**: Use `"use client"` directive for interactive components
- **Server Actions**: Leverage Next.js 15 server actions for backend operations
- **Authentication**: Wrap app in `<Auth>` component from Amplify UI
- **Real-time**: Use AppSync Events for live messaging
- **AI Integration**: Use Amplify AI Kit conversation model