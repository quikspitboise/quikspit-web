# Security Improvements Documentation

This document outlines the security enhancements implemented to address the audit findings.

## ✅ Issues Resolved

### 1. CORS Configuration (CRITICAL - Fixed)

**Issue**: Production backend allowed `http://localhost:3000` origin hardcoded in `main.ts`

**Solution**:
- Implemented environment-based CORS configuration using `ALLOWED_ORIGINS` environment variable
- Added dynamic origin validation function that checks against allowed list
- Removed hardcoded localhost from production
- Added console warnings for blocked origins

**Configuration** (`backend/src/main.ts`):
```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000']; // Default for development only
```

**Environment Variable** (`.env.example`):
```bash
# For production, set only your production URLs:
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# For development:
ALLOWED_ORIGINS=http://localhost:3000
```

---

### 2. Rate Limiting (CRITICAL - Fixed)

**Issue**: No throttling on contact form or booking endpoints, vulnerable to spam/DDoS

**Solution**:
- Installed and configured `@nestjs/throttler` package
- Applied global throttling: 10 requests per minute per IP
- Applied stricter limits on specific endpoints:
  - **Contact form**: 3 submissions per 5 minutes per IP
  - **Bookings**: 5 bookings per 10 minutes per IP

**Implementation**:
- Global configuration in `backend/src/app.module.ts`
- Endpoint-specific limits using `@Throttle` decorator:
  ```typescript
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 per 5 minutes
  @Post()
  async submitContactForm() { ... }
  ```

**Files Modified**:
- `backend/src/app.module.ts` - Global throttler configuration
- `backend/src/contact/contact.controller.ts` - Contact form rate limit
- `backend/src/booking/booking.controller.ts` - Booking rate limit

---

### 3. CSRF protection and API authentication

`src/common/csrf-protection.ts` configures `csrf-csrf` through bootstrap.
Set `ENABLE_CSRF=true` and a random, deployment-managed `CSRF_SECRET` in
production. Startup fails when enabled protection has no secret. Production
also requires explicit `ALLOWED_ORIGINS`; wildcard origins are not supported.

Unsafe methods use double-submit token validation by default. Three narrowly
scoped request types have independent protection:

- `POST /api/webhooks/stripe` verifies the Stripe signature over the raw request
  body in its controller. Stripe does not send browser CSRF tokens.
- The enumerated invoice, gallery-admin, and booking-settings mutations accept
  an explicit `Authorization: Bearer ...` header. Both Clerk token verification
  and the administrator allowlist still run. Cookies cannot authenticate these
  routes. The Next.js admin proxy separately rejects cross-origin mutations
  before forwarding its server-obtained bearer token.
- Anonymous `POST /api/contact` and `POST /api/bookings` browser submissions
  require an Origin exactly matching `ALLOWED_ORIGINS` to use the token-free
  path. These endpoints do not use cookie identity. Missing, null, or untrusted
  origins must supply a valid CSRF cookie and token instead. Rate limiting and
  input/upload validation remain necessary for public endpoint abuse.

For other mutations, obtain a token from `GET /api/csrf-token`, retain the
returned `_csrf` cookie, and send the returned token in the `X-CSRF-Token`
header. Body fields are not accepted as tokens. The cookie is HTTP-only,
SameSite Strict, and Secure in production; clients using cookies must account
for same-site deployment and browser credentials settings.

Keep the bearer-route list aligned with controller guards. A new route is
token-protected by default; converting an exempt route to cookie authentication
requires removing its exemption. HTTP regression tests in
`src/common/csrf-protection.spec.ts` exercise signed/altered webhooks, public
multipart submissions, real administrator guards, and the default token flow.

---

### 4. File Upload Validation (CRITICAL - Fixed)

**Issue**: Only extension checking, no magic byte validation, 5MB limit not enforced on frontend

**Solution**:
- Installed `file-type` package for magic byte (file signature) validation
- Created `FileValidationService` utility class
- Validates files using buffer content, not just extension
- Checks MIME type against allowed list: `image/jpeg`, `image/png`, `image/gif`
- Enforces 5MB size limit on both frontend and backend
- Sanitizes filenames to prevent path traversal attacks

**Implementation** (`backend/src/common/file-validation.service.ts`):
```typescript
static async validateImageFile(file: Express.Multer.File) {
  // Check file size
  // Validate magic bytes
  // Check MIME type
}

static sanitizeFilename(filename: string) {
  // Remove path separators and dangerous characters
}
```

**Changed Multer Storage**:
- Switched from `diskStorage` to `memoryStorage` to access file buffer
- Validates file before saving to disk
- Only saves validated files

**Files Modified**:
- `backend/src/contact/contact.controller.ts` - Enhanced validation
- `backend/src/common/file-validation.service.ts` - New validation utility
- Frontend already had size/type validation (no changes needed)

---

### 5. HTTP Security Headers - Helmet.js (CRITICAL - Fixed)

**Issue**: No HTTP security headers configured (XSS, clickjacking, MIME-sniffing protections missing)

**Solution**:
- Installed and configured `helmet` package
- Applied comprehensive security headers:
  - **X-Content-Type-Options**: Prevents MIME-sniffing
  - **X-Frame-Options**: Prevents clickjacking
  - **X-XSS-Protection**: Browser XSS filter
  - **Strict-Transport-Security**: Forces HTTPS
  - **Content-Security-Policy**: Controls resource loading
  - And more...

**Configuration** (`backend/src/main.ts`):
```typescript
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
```

This applies secure defaults for all security headers automatically.

---

## 📋 Outstanding Security Recommendations

### 6. File Upload - Virus Scanning (Recommended)

**Current State**: Files are validated for type and size but not scanned for malware

**Recommendations**:
1. **Use ClamAV** for virus scanning:
   ```bash
   npm install clamscan
   ```
   
2. **Integrate AWS S3 with Macie** for automatic malware detection

3. **Short-term**: Store files in isolated `./uploads` directory with no execute permissions

4. **Long-term**: Migrate to AWS S3 with:
   - Private bucket access
   - CloudFront for serving with signed URLs
   - AWS Macie for malware scanning
   - Lifecycle policies for automatic cleanup

---

## 🔐 Security Best Practices Checklist

- [x] CORS configured with environment variables (no hardcoded localhost)
- [x] Rate limiting implemented globally and on sensitive endpoints
- [x] CSRF protection available (enable in production)
- [x] File upload validation with magic byte checking
- [x] Filename sanitization to prevent path traversal
- [x] HTTP security headers with Helmet.js
- [x] Environment variables documented in `.env.example`
- [ ] Virus scanning on uploaded files (future enhancement)
- [ ] Migration to S3 for file storage (future enhancement)
- [ ] Input validation and sanitization on all endpoints
- [ ] SQL injection prevention (using TypeORM parameterized queries)
- [ ] Regular security dependency updates

---

## 🚀 Deployment Checklist

Before deploying to production:

1. **Set Environment Variables**:
   ```bash
   NODE_ENV=production
   ALLOWED_ORIGINS=https://yourdomain.com
   ENABLE_CSRF=true
   ```

2. **Enable HTTPS**: Ensure SSL/TLS certificates are configured

3. **Test Rate Limits**: Verify throttling works as expected

4. **Review CORS Origins**: Remove any development URLs

5. **Monitor Logs**: Watch for blocked requests and adjust limits if needed

6. **Configure File Storage**: Consider S3 migration for production scale

7. **Set Up WAF**: Consider AWS WAF or Cloudflare for additional DDoS protection

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/helmet)
- [CSRF Protection Guide](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [File Upload Security](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

---

## 🛠️ Testing Security Features

### Test Rate Limiting:
```bash
# Send multiple requests rapidly
for i in {1..15}; do
  curl -X POST http://localhost:3001/api/contact \
    -F "name=Test" -F "email=test@example.com" -F "message=Test"
done
```

### Test File Validation:
```bash
# Try uploading a text file renamed as .jpg
echo "malicious content" > fake.jpg
curl -X POST http://localhost:3001/api/contact \
  -F "name=Test" -F "email=test@example.com" -F "message=Test" \
  -F "image=@fake.jpg"
# Should reject: "Unable to determine file type"
```

### Test CSRF (when enabled):
```bash
# Without CSRF token (should fail)
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'
```

---

Last Updated: November 5, 2025
