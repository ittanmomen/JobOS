# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # TypeScript compilation + Vite production build
npm run preview  # Preview production build locally
npm run deploy   # Deploy to GitHub Pages (gh-pages branch)
```

No test framework is configured.

## Architecture

JobOS is a single-page React application for job search tracking with three pipeline systems.

### Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS for styling
- Lucide React for icons
- Supabase (optional) for cloud sync, localStorage for offline/demo mode

### Code Structure
The application is contained in a single monolithic component (`src/App.tsx`, ~3500 lines) that includes:

- **DataService class** (lines ~50-300): Abstraction layer for all CRUD operations, handles both localStorage and Supabase backends
- **Type definitions** (lines ~10-50): Profile, Company, Opportunity, Contact, Task, LogEntry interfaces
- **Inner components**: LoginScreen, KanbanCard, KanbanColumn, TaskList, OnboardingWizard
- **Main App component**: Manages all state and renders views (Dashboard, Companies, Tasks, Pipeline1/2/3, Review, Analysis, Settings)

### Pipeline System
Three concurrent pipelines for different job search activities:
1. **Discovery**: OPPORTUNITY_FOUND → QUALIFIED → ARCHIVED
2. **Application**: ACCEPTED → CV_TAILORED → SUBMITTED → FOLLOWED_UP → INTERVIEWING → OFFER/REJECTED
3. **Networking**: PERSON_IDENTIFIED → CONTACTED → CONVERSATION_STARTED → REFERRAL_OR_LEAD → CONVERTED_TO_OPP → CLOSED

### Data Flow
- DataService determines storage mode on initialization (Supabase if configured, localStorage otherwise)
- All data operations go through DataService methods which abstract the storage backend
- Supabase client is loaded via CDN in `index.html`

### Build Configuration
- `vite.config.ts`: Base path set to `/JobOS/` for GitHub Pages
- `tsconfig.json`: Strict mode enabled, ES2020 target
