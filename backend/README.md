# PlacementPilot Backend

Production-ready Node.js backend for PlacementPilot - a placement preparation platform.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **Morgan** - HTTP logging
- **Compression** - Response compression
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting
- **Cookie Parser** - Cookie parsing
- **Zod** - Validation
- **Multer** - File uploads
- **UUID** - Unique identifiers
- **dotenv** - Environment variables
- **Nodemailer** - Email service
- **Winston** - Structured logging

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── env.js              # Environment configuration
│   ├── controllers/            # Route controllers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── company.controller.js
│   │   ├── application.controller.js
│   │   ├── interview.controller.js
│   │   ├── dsa.controller.js
│   │   ├── goal.controller.js
│   │   ├── achievement.controller.js
│   │   ├── notification.controller.js
│   │   ├── planner.controller.js
│   │   ├── analytics.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── settings.controller.js
│   │   ├── profile.controller.js
│   │   └── waitlist.controller.js
│   ├── services/               # Business logic
│   │   ├── auth.service.js
│   │   ├── email.service.js
│   │   ├── application.service.js
│   │   ├── company.service.js
│   │   ├── interview.service.js
│   │   ├── dsa.service.js
│   │   ├── goal.service.js
│   │   ├── achievement.service.js
│   │   ├── notification.service.js
│   │   ├── planner.service.js
│   │   ├── profile.service.js
│   │   ├── settings.service.js
│   │   └── analytics.service.js
│   ├── repositories/           # Database operations
│   │   ├── user.repository.js
│   │   ├── company.repository.js
│   │   ├── application.repository.js
│   │   ├── interview.repository.js
│   │   ├── dsa.repository.js
│   │   ├── goal.repository.js
│   │   ├── achievement.repository.js
│   │   ├── notification.repository.js
│   │   ├── planner.repository.js
│   │   ├── recruiter.repository.js
│   │   ├── resource.repository.js
│   │   ├── hiring-info.repository.js
│   │   └── waitlist.repository.js
│   ├── models/                 # Mongoose models
│   │   ├── user.model.js
│   │   ├── company.model.js
│   │   ├── application.model.js
│   │   ├── interview.model.js
│   │   ├── dsa.model.js
│   │   ├── goal.model.js
│   │   ├── achievement.model.js
│   │   ├── notification.model.js
│   │   ├── planner.model.js
│   │   ├── document.model.js
│   │   ├── skill.model.js
│   │   ├── recruiter.model.js
│   │   ├── resource.model.js
│   │   ├── hiring-info.model.js
│   │   └── waitlist.model.js
│   ├── routes/                 # API routes
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── company.routes.js
│   │   ├── application.routes.js
│   │   ├── interview.routes.js
│   │   ├── dsa.routes.js
│   │   ├── goal.routes.js
│   │   ├── achievement.routes.js
│   │   ├── notification.routes.js
│   │   ├── planner.routes.js
│   │   ├── analytics.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── settings.routes.js
│   │   ├── profile.routes.js
│   │   └── waitlist.routes.js
│   ├── middlewares/            # Custom middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── requestLogger.js
│   │   └── validate.js
│   ├── validators/             # Zod schemas
│   │   ├── auth.validator.js
│   │   ├── company.validator.js
│   │   ├── application.validator.js
│   │   ├── interview.validator.js
│   │   ├── dsa.validator.js
│   │   ├── goal.validator.js
│   │   ├── planner.validator.js
│   │   ├── profile.validator.js
│   │   ├── settings.validator.js
│   │   └── waitlist.validator.js
│   ├── lib/
│   │   └── logger.js           # Winston logger
│   ├── seed/                   # Seed data
│   └── docs/                   # Documentation
├── app.js                      # Express app
├── server.js                   # Server entry point
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/verify` - Verify email
- `POST /api/v1/auth/forgot` - Request password reset
- `POST /api/v1/auth/reset` - Reset password
- `POST /api/v1/auth/refresh` - Refresh tokens
- `POST /api/v1/auth/logout` - Logout user

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile
- `PUT /api/v1/users/notifications` - Update notification preferences
- `PUT /api/v1/users/theme` - Update theme
- `DELETE /api/v1/users` - Delete account

### Applications
- `GET /api/v1/applications` - Get all applications
- `GET /api/v1/applications/:id` - Get single application
- `POST /api/v1/applications` - Create application
- `PUT /api/v1/applications/:id` - Update application
- `DELETE /api/v1/applications/:id` - Delete application
- `POST /api/v1/applications/:id/notes` - Add note
- `POST /api/v1/applications/:id/interviews` - Log interview round

### Companies
- `GET /api/v1/companies` - Get all companies
- `GET /api/v1/companies/:id` - Get single company
- `POST /api/v1/companies` - Add company
- `PUT /api/v1/companies/:id` - Update company
- `DELETE /api/v1/companies/:id` - Delete company

### Interviews
- `GET /api/v1/interviews` - Get all interviews
- `GET /api/v1/interviews/upcoming` - Get upcoming interviews
- `GET /api/v1/interviews/past` - Get past interviews
- `POST /api/v1/interviews` - Log interview
- `PUT /api/v1/interviews/:id` - Update interview
- `DELETE /api/v1/interviews/:id` - Delete interview

### DSA
- `GET /api/v1/dsa/topics` - Get all topics
- `GET /api/v1/dsa/topics/:id` - Get single topic
- `POST /api/v1/dsa/topics` - Create topic
- `PUT /api/v1/dsa/topics/:id` - Update topic
- `DELETE /api/v1/dsa/topics/:id` - Delete topic
- `POST /api/v1/dsa/problems` - Log problem
- `GET /api/v1/dsa/stats` - Get stats

### Goals
- `GET /api/v1/goals` - Get all goals
- `GET /api/v1/goals/:id` - Get single goal
- `POST /api/v1/goals` - Create goal
- `PUT /api/v1/goals/:id` - Update goal
- `DELETE /api/v1/goals/:id` - Delete goal
- `POST /api/v1/goals/:id/complete` - Mark complete

### Achievements
- `GET /api/v1/achievements` - Get all achievements
- `GET /api/v1/achievements/:id` - Get single achievement
- `POST /api/v1/achievements` - Create achievement
- `DELETE /api/v1/achievements/:id` - Delete achievement

### Notifications
- `GET /api/v1/notifications` - Get all notifications
- `GET /api/v1/notifications/unread` - Get unread notifications
- `PATCH /api/v1/notifications/:id/read` - Mark as read
- `PATCH /api/v1/notifications/read-all` - Mark all as read
- `DELETE /api/v1/notifications/:id` - Delete notification

### Planner
- `GET /api/v1/planner/week` - Get week tasks
- `GET /api/v1/planner/today` - Get today tasks
- `POST /api/v1/planner` - Create task
- `PUT /api/v1/planner/:id` - Update task
- `DELETE /api/v1/planner/:id` - Delete task
- `POST /api/v1/planner/:id/complete` - Mark complete
- `GET /api/v1/planner/target` - Get weekly target

### Analytics
- `GET /api/v1/analytics/readiness` - Get readiness score
- `GET /api/v1/analytics/applications` - Get application stats
- `GET /api/v1/analytics/trend` - Get weekly trend
- `GET /api/v1/analytics/heatmap` - Get heatmap data
- `GET /api/v1/analytics/streak` - Get streak

### Dashboard
- `GET /api/v1/dashboard` - Get dashboard data

### Settings
- `GET /api/v1/settings` - Get settings
- `PUT /api/v1/settings` - Update settings
- `POST /api/v1/settings/export` - Export data

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "meta": {}
}
```

## Error Response

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

## Testing

```bash
npm test
```

## Health Check

- `GET /health` - Health check endpoint
- `GET /readiness` - Readiness check endpoint