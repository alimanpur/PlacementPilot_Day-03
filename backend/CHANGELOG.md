# Changelog

All notable changes to the PlacementPilot backend will be documented in this file.

## [1.0.4] - 2026-07-19

### Changed
- Documentation refreshed: project structure, API reference, and README now
  reflect the full controller/service/repository/validator layout.

### Removed
- Empty placeholder directories (analytics, database, emails, events, jobs,
  socket, tests, utils, constants) that contained no source.
- Stray `prefix.js` (abandoned copy of the analytics service) and the
  one-off `drop-stale-indexes.js` migration script.

## [1.0.0] - 2026-07-06

### Added
- Initial backend implementation
- Complete authentication system with JWT and refresh tokens
- Email verification and password reset flows
- User management endpoints
- Application tracking (companies) CRUD operations
- Interview management with status tracking
- DSA topic and problem tracking
- Goal management with progress tracking
- Achievement system
- Notification system with read/unread status
- Planner for weekly task management
- Analytics service for readiness scores and trends
- Dashboard aggregation endpoint
- Settings management
- Comprehensive validation with Zod
- Security middleware (Helmet, CORS, Rate limiting)
- Structured logging with Winston
- Health and readiness check endpoints
- Seed data for development