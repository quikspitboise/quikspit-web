# QuikSpit Auto Detailing - Backend API

NestJS-based backend API for QuikSpit Auto Detailing car detailing service.

## 🔒 Security Features

✅ **Production-Ready Security** (Audit Completed: Nov 2025)
- Winston logging with automatic PII sanitization
- Class-validator input validation on all endpoints
- Stripe webhook-based payment verification
- Content Security Policy (CSP) headers
- HTTPS enforcement for production
- Rate limiting (global + endpoint-specific)
- CSRF protection support
- No default database credentials

📖 **Security Documentation:**
- [Security Audit Resolution](./SECURITY_AUDIT_RESOLUTION.md) - Full audit details
- [Quick Reference](./SECURITY_AUDIT_QUICK_REFERENCE.md) - Quick setup guide
- [Security Policy](./SECURITY.md) - Ongoing security practices

## 📋 Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Stripe account (for payments)
- SMTP server (for emails)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and configure:

```bash
# Required (no defaults)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_user
DB_PASSWORD=your_password
DB_NAME=quickspit_shine

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email
SMTP_PASS=your_password

# Security (production)
NODE_ENV=production
ENFORCE_HTTPS=true
LOG_LEVEL=info
```

### 3. Run Development Server
```bash
pnpm run start:dev
```

API available at: `http://localhost:3001/api`

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Health check endpoint

### Contact
- `POST /api/contact` - Submit contact form (with optional image)
  - Rate limit: 3 requests per 5 minutes

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
  - Rate limit: 5 requests per 10 minutes

### Webhooks
- `POST /api/webhooks/stripe` - Stripe payment webhook

### Gallery
- `GET /api/gallery/list` - Get gallery images

## 🔧 Project Setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

The Vercel project `quikspit-web-backend` deploys this package from the pnpm
workspace. In **Settings → Build and Deployment**, use:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Include source files outside of the Root Directory in the Build Step | Enabled |
| Framework Preset | Other |
| Node.js Version | `22.x` (subject to `package.json` engines) |

Keep the install command, build command, and output directory in `vercel.json`.
The lockfile and `pnpm-workspace.yaml` live at the repository root. If Vercel
reports `ERR_PNPM_NO_LOCKFILE`, confirm that those files are included in its
checkout before changing the install command. Keep `--frozen-lockfile` enabled.
See [Vercel's monorepo documentation](https://vercel.com/docs/monorepos/monorepo-faq).

Production requires verified database TLS (`DB_SSL=true` and
`DB_SSL_REJECT_UNAUTHORIZED=true`). With HTTPS enforcement enabled, set
`CANONICAL_API_ORIGIN=https://quikspit-web-backend.vercel.app` and
`TRUST_PROXY=127.0.0.1/8,::1/128` for Vercel's local ingress proxy. Keep
`ALLOWED_ORIGINS` configured for the frontend domains.

Apply pending database migrations before promoting a deployment. The runtime
state migration creates `request_limits` and `provider_cache`; production does
not synchronize the schema or run migrations automatically.

`api/serverless.js` is the single function entrypoint. The rewrites send `/`,
`/api`, and `/api/*` to the shared Nest handler. Do not add forwarding files
under `api/` for individual controllers: each file can create another function
containing the same application, dependencies, and local gallery resources.

Vercel's **Functions Storage** metric includes bundles from retained deployments
in each deployment region. Smaller bundles reduce storage for future deployments;
old deployments must expire or be deleted separately. Review the project's
**Settings → Security → Deployment Retention Policy**, preserving the production
deployment and the rollback history needed for recovery. Usage is measured from
daily storage maxima, so cleanup does not erase usage already recorded in the
billing period. See [Deployment Storage](https://vercel.com/docs/deployment-storage)
and [Deployment Retention](https://vercel.com/docs/deployment-retention).


## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
