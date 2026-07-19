# PlacementPilot Frontend

Production-ready React frontend for PlacementPilot — the operating system for placement preparation.

## Architecture

```
frontend/
├── src/
│   ├── components/
│   │   ├── charts/          # Custom chart components (ReadinessDial, Heatmap, etc.)
│   │   ├── common/          # Shared UI atoms (Button, Card, Logo, etc.)
│   │   └── forms/           # Form field components
│   ├── constants/           # Navigation configs, design tokens
│   ├── hooks/               # Custom React hooks (data fetching + mutations)
│   ├── layouts/             # Shell layouts (App, Auth, Marketing)
│   ├── lib/                 # Utilities (cn, etc.)
│   ├── pages/               # Route-level page components
│   │   ├── app/             # Authenticated app pages
│   │   ├── auth/            # Authentication pages
│   │   └── marketing/       # Public marketing pages
│   ├── routes/              # Route definitions with lazy loading
│   ├── services/            # API service layer
│   └── styles/              # Global CSS and design tokens
```

## Tech Stack

- **React 19** with React Router v6
- **Vite 5** for build tooling
- **Tailwind CSS 3** for styling
- **Framer Motion** for animations
- **React Hook Form + Zod** for form validation
- **TanStack Query** for data fetching
- **Recharts** for charts
- **Sonner** for toast notifications
- **cmdk** for command palette

## Design System

- **Dark theme only** — aviator technical aesthetic
- **Typography**: Inter (body), Instrument Sans (display), JetBrains Mono (code/eyebrow)
- **Colors**: Base/surface/ink hierarchy with brand (emerald) and accent (amber)
- **Spacing**: Consistent 4px grid system
- **Radius**: 0.625rem base radius

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Scripts

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint

## Routes

### Marketing
- `/` — Landing page
- `/features` — Product capabilities
- `/story` — Preparation journey
- `/pricing` — Pricing tiers
- `/about` — Manifesto
- `/contact` — Contact form
- `/faq` — Frequently asked questions
- `/privacy` — Privacy policy
- `/terms` — Terms of service

### Authentication
- `/sign-in` — Sign in
- `/sign-up` — Create account
- `/forgot` — Password reset request
- `/reset` — Set new password
- `/welcome` — Onboarding

### App (Authenticated)
- `/app` — Dashboard
- `/app/applications` — Application pipeline
- `/app/applications/:id` — Application detail
- `/app/dsa` — DSA tracker
- `/app/interviews` — Interview log
- `/app/planner` — Weekly planner
- `/app/analytics` — Analytics dashboard
- `/app/companies` — Target companies
- `/app/goals` — Mission goals
- `/app/achievements` — Achievements
- `/app/notifications` — Notifications
- `/app/profile` — Candidate profile
- `/app/settings` — Settings
- `/app/help` — Help center

## Features

### Completed
- ✅ All 30+ pages implemented
- ✅ Responsive layouts (mobile, tablet, desktop)
- ✅ Dark theme with design tokens
- ✅ Command palette (⌘K)
- ✅ Lazy loading with Suspense
- ✅ Form validation with Zod
- ✅ Toast notifications
- ✅ Page transitions
- ✅ Skeleton loaders
- ✅ Educative empty states
- ✅ Guided onboarding checklist
- ✅ Accessibility (ARIA, keyboard nav, focus management)
- ✅ Production build (zero errors)
- ✅ Backend-integrated via REST API service layer

### Next Phase
- WebSocket for real-time updates
- Advanced analytics
- Mobile native app

## License

Proprietary — PlacementPilot