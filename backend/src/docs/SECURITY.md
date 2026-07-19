# Security Documentation

## Overview

PlacementPilot backend implements comprehensive security measures to protect user data and prevent common vulnerabilities.

## Security Measures

### Authentication

- **JWT Access Tokens**: Short-lived (15 minutes) tokens for API access
- **Refresh Token Rotation**: Long-lived (7 days) refresh tokens with rotation on use
- **HTTP-Only Cookies**: Secure cookie storage for tokens
- **Password Hashing**: bcrypt with 12 salt rounds

### Authorization

- **Role-Based Access**: User and admin roles
- **Email Verification**: Required before account activation
- **Protected Routes**: All sensitive endpoints require authentication

### HTTP Security Headers

Implemented via Helmet middleware:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (in production)
- `Content-Security-Policy`

### Rate Limiting

- **Window**: 15 minutes (900,000 ms)
- **Max Requests**: 100 per window per IP
- **Standard Headers**: Returns rate limit info in headers

### CORS

- **Origin**: Configurable via `CORS_ORIGIN` environment variable
- **Credentials**: Enabled for cookie support
- **Methods**: Standard REST methods

### Input Validation

All requests are validated using Zod schemas:
- Request body validation
- Query parameter validation
- URL parameter validation
- Automatic 400 response on validation failure

### Cookie Security

- **HTTP-Only**: Prevents XSS access to cookies
- **Secure**: Only sent over HTTPS in production
- **Same-Site**: Strict mode to prevent CSRF
- **Max-Age**: Appropriate expiration times

### Error Handling

- **Sanitized Errors**: No stack traces in production
- **Generic Messages**: No internal details exposed
- **Security Logging**: All security events logged

## Environment Variables

All sensitive configuration is stored in environment variables:
- `JWT_SECRET` - Minimum 32 characters
- `JWT_REFRESH_SECRET` - Minimum 32 characters
- `MONGODB_URI` - Database connection string
- `EMAIL_USER` / `EMAIL_PASS` - Email credentials

## Data Protection

### Soft Deletes

All models support soft deletes to prevent accidental data loss while maintaining referential integrity.

### Password Security

- Passwords are hashed before storage
- Passwords are never returned in API responses
- Reset tokens expire after 1 hour

### Token Security

- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Invalid tokens are rejected immediately

## Best Practices

1. Always use HTTPS in production
2. Keep JWT secrets secure and rotate periodically
3. Monitor rate limit logs for abuse
4. Review security logs regularly
5. Keep dependencies updated
6. Use strong passwords (enforced via validation)

## Security Checklist

- [x] Helmet security headers
- [x] Rate limiting
- [x] CORS configuration
- [x] JWT authentication
- [x] Password hashing
- [x] HTTP-only cookies
- [x] Input validation
- [x] Error sanitization
- [x] Security logging
- [x] Soft deletes
- [x] Environment validation