# Cyra

**AI-powered women's health companion** — PMOS awareness, symptom tracking, education, and doctor preparation.

## Overview

Cyra helps women understand and manage premenstrual and hormonal health patterns through intelligent symptom tracking, personalized education, and AI-assisted doctor visit preparation.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TailwindCSS, Recharts, Lucide React |
| Backend | Node.js, Express, Groq API |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| State | React Context API |
| PWA | Vite PWA Plugin, Workbox |

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in Supabase and Groq credentials

# Run database migrations (Supabase CLI)
supabase db push

# Start development servers
npm run dev
```

- **Client:** http://localhost:5173
- **API:** http://localhost:3001/api

## Project Structure

```
cyra/
├── client/          # React SPA (PWA)
├── server/          # Express API + Groq integration
├── supabase/        # Database migrations & RLS policies
└── docs/            # Architecture & design documentation
```

## Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Database Schema](./docs/DATABASE.md)
- [API Reference](./docs/API.md)
- [Security Model](./docs/SECURITY.md)
- [Component Hierarchy](./docs/COMPONENTS.md)

## Features

- **Symptom Tracking** — Daily logging with severity, triggers, and mood
- **Cycle Insights** — Visual trends and pattern detection via Recharts
- **PMOS Education** — Curated, evidence-based health content
- **AI Companion** — Groq-powered conversational support (not medical advice)
- **Doctor Prep** — Auto-generated visit summaries from tracked data
- **Accessibility** — WCAG AA compliant, keyboard navigable, screen reader friendly
- **Offline** — Service worker caching for core app shell and recent data

## License

Proprietary — All rights reserved.
