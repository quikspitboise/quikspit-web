# CSRF Migration: csurf → csrf-csrf

## Summary
Successfully migrated from the deprecated `csurf` package to the modern `csrf-csrf` library.

## Changes Made

### 1. Package Updates
- **Removed**: `csurf@1.11.0` and `@types/csurf@1.11.5` (deprecated)
- **Added**: `csrf-csrf@4.0.3` (actively maintained)

### 2. Backend Code Changes

#### [main.ts](backend/src/main.ts)
- Updated import: `import { doubleCsrf } from 'csrf-csrf';`
- Configured `csrf-csrf` with proper options:
  - Session identifier for tracking
  - Cookie options (httpOnly, secure, sameSite)
  - Ignored methods (GET, HEAD, OPTIONS)
  - CSRF secret from environment variable

#### [app.controller.ts](backend/src/app.controller.ts)
- Updated `/api/csrf-token` endpoint to use new `generateCsrfToken` function
- Token generation now uses `generateCsrfToken(req, res)` instead of `req.csrfToken()`

#### [.env.example](backend/.env.example)
- Added `CSRF_SECRET` environment variable for production use

### 3. Configuration

#### Required Environment Variables
```bash
ENABLE_CSRF=false # Set to 'true' in production
CSRF_SECRET=your-secret-csrf-key-change-in-production-min-32-chars
```

### 4. How It Works

1. **Token Generation**: 
   - Frontend calls `GET /api/csrf-token` to get a token
   - Token is stored in a cookie (`_csrf`)
   - Token value is returned in the response

2. **Token Validation**:
   - Frontend includes token in request header: `x-csrf-token`
   - Middleware validates the token against the cookie
   - Invalid tokens are rejected with 403 Forbidden

3. **Ignored Methods**:
   - GET, HEAD, OPTIONS requests don't require CSRF tokens
   - POST, PUT, PATCH, DELETE require valid tokens (when enabled)

### 5. Frontend Integration (When CSRF is Enabled)

```typescript
// 1. Get CSRF token
const response = await fetch('/api/csrf-token');
const { csrfToken } = await response.json();

// 2. Include token in subsequent requests
await fetch('/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
  },
  body: JSON.stringify(data),
});
```

### 6. Advantages of csrf-csrf

- ✅ **Actively maintained** (csurf is deprecated)
- ✅ **Modern double-submit cookie pattern**
- ✅ **TypeScript support**
- ✅ **Compatible with Express/NestJS**
- ✅ **Session-aware**
- ✅ **Configurable error handling**

### 7. Additional Updates

#### Stripe API Version
- Updated from `2023-10-16` to `2025-12-15.clover` (latest)

## Testing Checklist

- [ ] Backend builds successfully (`pnpm build`)
- [ ] GET /api/csrf-token returns a token
- [ ] POST requests work with CSRF disabled (ENABLE_CSRF=false)
- [ ] POST requests require valid token when CSRF enabled (ENABLE_CSRF=true)
- [ ] Invalid tokens are rejected with 403

## Production Deployment

Before deploying to production:

1. Generate a strong CSRF secret:
   ```bash
   openssl rand -base64 48
   ```

2. Set environment variables:
   ```bash
   ENABLE_CSRF=true
   CSRF_SECRET=<your-generated-secret>
   ```

3. Update frontend to fetch and include CSRF tokens in requests

## Rollback Plan

If issues arise, you can temporarily:
1. Keep CSRF disabled (`ENABLE_CSRF=false`)
2. Investigate and fix issues
3. Re-enable once resolved

No need to rollback to `csurf` as it's deprecated and unsupported.
