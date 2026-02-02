# QuikSpit Auto Detailing

A full-stack web application for QuikSpit Auto Detailing services, featuring appointment booking, pricing calculator, gallery, and invoice management.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion |
| **Backend** | NestJS 11, TypeScript, TypeORM, PostgreSQL |
| **Integrations** | Cloudinary, Cal.com, Stripe, Nodemailer, Twilio |
| **Security** | Helmet, Throttler, class-validator, magic-byte file validation |

---

## Project Structure

```
quickspit/
├── frontend/          # Next.js application
├── backend/           # NestJS API server
├── docs/              # Integration guides
│   ├── CLOUDINARY.md
│   ├── CAL_COM.md
│   └── STRIPE_INVOICING.md
├── pnpm-workspace.yaml
└── AGENTS.md          # AI agent guidelines
```

---

## Integrations

| Service | Purpose | Docs |
|---------|---------|------|
| **Cloudinary** | Image/video hosting & optimization | [docs/CLOUDINARY.md](docs/CLOUDINARY.md) |
| **Cal.com** | Appointment booking with deposits | [docs/CAL_COM.md](docs/CAL_COM.md) |
| **Stripe** | Invoicing & payment processing | [docs/STRIPE_INVOICING.md](docs/STRIPE_INVOICING.md) |

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8
- PostgreSQL (for production)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

**Frontend** — `frontend/.env.local`
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CAL_USERNAME=your-calcom-username
NEXT_PUBLIC_ENV=development
```

**Backend** — `backend/.env`
```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Cloudinary (image/video hosting)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe (payments & invoicing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
EMAIL_SERVICE_HOST=smtp.example.com
EMAIL_SERVICE_USER=user
EMAIL_SERVICE_PASS=pass

# Twilio (optional - for SMS invoice delivery)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Run Development Servers

```bash
pnpm dev              # Both frontend + backend
pnpm dev:frontend     # Frontend only (port 3000)
pnpm dev:backend      # Backend only (port 3001)
```

Or use platform-specific scripts: `./start-dev.sh` (Linux/Mac) or `start-dev.bat` (Windows)

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run frontend + backend concurrently |
| `pnpm dev:frontend` | Start Next.js dev server |
| `pnpm dev:backend` | Start NestJS with hot reload |
| `pnpm build` | Build both for production |
| `pnpm clean` | Remove all `node_modules` |

---

## API Reference

**Base URL:** `http://localhost:3001/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check & uptime |
| `POST` | `/contact` | Submit contact form (with optional image) |
| `GET` | `/bookings` | List all bookings |
| `POST` | `/bookings` | Create a booking |
| `GET` | `/gallery` | Get gallery images |
| `POST` | `/invoices` | Create invoice (draft or immediate) |
| `POST` | `/invoices/:id/send` | Send a draft invoice |
| `GET` | `/invoices/:id` | Get invoice details |

---

## Development

### Code Standards
- TypeScript everywhere
- ESLint + Prettier formatting
- Follow Next.js App Router and NestJS module conventions

### Theming
Dark theme with red accents — see [`.github/copilot-instructions.md`](.github/copilot-instructions.md)
- Background: `brand-charcoal` (#1a1a1a)
- Accent: `brand-red` (#ef4444)

### Security
- Rate limiting: 10 req/min default (stricter on contact/booking)
- Helmet security headers
- File uploads validated via magic bytes
- Input sanitization with `class-validator`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port conflict | Ensure 3000 and 3001 are free |
| Database errors | Check PostgreSQL is running and `DATABASE_URL` is correct |
| Missing modules | Run `pnpm install` |
| Environment issues | Verify `.env` files exist with correct values |

---

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit a pull request
