# Environment Configuration

## Required Variables

| Variable | Description | Default | Validation |
|----------|-------------|---------|------------|
| `MONGODB_URI` | MongoDB connection string | - | Required, non-empty |
| `JWT_SECRET` | Secret for signing access tokens | - | Required, min 32 chars |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | - | Required, min 32 chars |

## Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `JWT_EXPIRES_IN` | Access token expiration | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `EMAIL_HOST` | SMTP host | `smtp.ethereal.email` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | - |
| `EMAIL_PASS` | SMTP password | - |
| `EMAIL_FROM` | From address for emails | `PlacementPilot <noreply@placementpilot.com>` |

## Development Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Generate secure secrets:
   ```bash
   # Generate a secure JWT secret (32+ chars)
   openssl rand -base64 32
   ```

3. Update values in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/placementpilot
   JWT_SECRET=<your-generated-secret>
   JWT_REFRESH_SECRET=<your-generated-refresh-secret>
   ```

## Production Setup

For production, ensure:
- `NODE_ENV=production`
- Strong, unique JWT secrets
- MongoDB Atlas connection string
- Valid email credentials
- HTTPS enabled (handled by reverse proxy)

## Validation

Environment variables are validated on startup using Zod. The application will fail to start if required variables are missing or invalid.

## Security Notes

- Never commit `.env` to version control
- Use different secrets for each environment
- Rotate secrets periodically
- Use MongoDB Atlas for production databases