# Changelog

All notable changes to the PlacementPilot frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2026-07-19

### Added
- Actionable onboarding flow on the Welcome page (steps link to real pages)
- New signups route to the Welcome/onboarding screen before the dashboard
- `icon` and `secondaryAction` support on the shared `EmptyState` component

### Changed
- Sign-up now lands on `/welcome` to guide first-time users through setup
- Reused the shared `EmptyState` from `@/components/common/atoms` in Planner,
  DSA Tracker, and Analytics (removed duplicate local definitions)
- Documentation refreshed to reflect full backend integration (no mock data)

### Removed
- Dead duplicate navigation constants (`src/constants/index.js`)
- Unused `src/mock-data/` directory
- Stray `eslint-output.txt` lint artifact

## [Unreleased]

### Added
- Production-ready frontend audit complete
- Centralized navigation constants (`src/constants/navigation.js`)
- Refactored navigation across AppShell, MobileSidebar, MarketingShell, and CommandPalette
- Comprehensive documentation (README, PROJECT_STATUS, FRONTEND_CHECKLIST, CHANGELOG)

### Changed
- All navigation data now sourced from single constants file
- Button component supports polymorphic `as` prop for flexibility
- Command palette dynamically generates groups from navigation constants

### Fixed
- Eliminated duplicate navigation definitions across 4 components
- Improved maintainability with single source of truth for routes

## [1.0.0] - 2026-10-24

### Added
- Initial production-ready frontend release
- 30+ pages across marketing, auth, and app sections
- Complete design system with dark theme
- Responsive layouts (mobile, tablet, desktop)
- Command palette (⌘K)
- Form validation with React Hook Form + Zod
- Toast notifications with Sonner
- Page transitions with Framer Motion
- Skeleton loaders and empty states
- Accessibility features (ARIA, keyboard nav, focus management)
- Lazy loading for all routes
- Custom chart components (ReadinessDial, Heatmap, Spark, etc.)
- Mock data for demo purposes

### Infrastructure
- React 19 + Vite 5
- Tailwind CSS 3 with custom design tokens
- React Router v6
- TanStack Query for data fetching
- Recharts for data visualization
- cmdk for command palette

### Documentation
- README.md with architecture and setup
- PROJECT_STATUS.md with feature list
- FRONTEND_CHECKLIST.md with production checklist
- CHANGELOG.md (this file)

## [0.1.0] - 2026-10-01

### Added
- Project initialization
- Basic Vite + React setup
- Tailwind CSS configuration
- Design token system
- Core component library (Button, Card, Input, etc.)
- Layout shells (App, Auth, Marketing)
- Route structure

---

## Versioning Policy

- **Major**: Breaking changes to public API or design system
- **Minor**: New features, pages, or components
- **Patch**: Bug fixes, performance improvements, refactoring

## Migration Guides

### Upgrading from 0.x to 1.0
- No breaking changes for end users
- Internal refactoring: navigation now centralized
- All existing routes and components remain compatible

### Future Migrations
- Phase 6: Backend integration will introduce API service layer
- Phase 7: Authentication will add protected routes
- Phase 8: Mobile app will share component library