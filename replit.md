# Product Ops Triage

## Overview

Product Ops Triage is a client-side customer feedback analysis tool built with React + Vite. Users paste customer feedback (one item per line), and the app classifies, clusters, and prioritizes feedback into actionable themes with sentiment analysis, severity scoring, category classification, and recommended actions. It generates a summary dashboard, enhanced themes table, recommended actions section, and top 3 PRD tickets with export options (CSV, JSON, Notion markdown). No external APIs or databases are needed - all analysis runs in the browser.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Feb 2026**: Enhanced analysis engine with sentiment analysis (positive/negative/neutral), category classification (Bug Report, Feature Request, UX/Usability, Performance, Security/Compliance, Data/Export), severity scoring (critical/high/medium/low), source detection, recommended actions per theme, frequency percentages
- **Feb 2026**: Added summary dashboard with 6 stat cards + 3 breakdown charts (sentiment, categories, severity)
- **Feb 2026**: Added JSON export, enhanced CSV/Notion exports with new fields
- **Feb 2026**: Initial build - cosine similarity clustering, themes table, PRD ticket cards, CSV export, Notion markdown copy

## Project Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with React plugin
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Key Files
- `client/src/lib/analysis.ts` - Core analysis engine (tokenization, stopwords, cosine similarity clustering, sentiment analysis, category classification, severity scoring, source detection, impact/effort scoring, priority mapping, recommended actions, PRD ticket generation)
- `client/src/lib/export.ts` - CSV export, JSON export, and Notion markdown clipboard copy utilities
- `client/src/pages/home.tsx` - Main page with dashboard, recommended actions, themes table, PRD accordion cards
- `client/src/App.tsx` - Router setup

### Analysis Logic (client-side, no APIs)
- Tokenizes feedback lines, removes stopwords, lowercases
- Sentiment: keyword-based (negative/neutral/positive word lists)
- Classification: category keyword matching (Bug, Feature Request, UX, Performance, Security, Data)
- Severity: critical/high/medium/low based on severity keyword matching
- Source detection: channel keywords (Support Ticket, Sales Call, Slack, Email, Survey)
- Builds term-frequency vectors and computes cosine similarity
- Greedily clusters with similarity threshold (0.15)
- Impact score: cluster size + severity keyword frequency
- Effort score: complexity keyword frequency
- Priority: P0 (high impact, low effort), P1, P2, P3 (singletons)
- Recommended actions: generated per theme based on category + severity
- Frequency: percentage of total feedback in each theme

### Backend
- **Framework**: Express (serves frontend only, no data API routes needed)
- **Storage**: Not used - all logic is client-side

### Key NPM Packages
- **wouter** - Client-side routing
- **@tanstack/react-query** - Async state management (available but not needed for this app)
- **shadcn/ui** + **Radix UI** - Component library
- **lucide-react** - Icons
