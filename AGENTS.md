# QuikSpit Agent Guidelines

Guidelines for AI agents and maintainers working on the QuikSpit codebase.

## Project Overview

QuikSpit is a full-stack web application for auto detailing services:
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Package Manager**: pnpm

## Key Integrations

| Integration | Documentation | Purpose |
|-------------|---------------|---------|
| Cloudinary | [docs/CLOUDINARY.md](docs/CLOUDINARY.md) | Image/video hosting |
| Cal.com | [docs/CAL_COM.md](docs/CAL_COM.md) | Appointment scheduling |
| Stripe | Via Cal.com | Payment processing |

## Code Conventions

### Frontend (`/frontend`)
- Use TypeScript for all files
- Components in `src/components/`
- Pages in `src/app/` (App Router)
- Use existing UI components: `GlassCard`, `MagneticButton`, `AnimatedSection`
- Follow dark theme with red accents (`--brand-primary: #ef4444`)

### Backend (`/backend`)
- NestJS modules in `src/` 
- Services follow dependency injection pattern
- Use DTOs for validation

## Commands

```bash
pnpm install        # Install dependencies
pnpm dev            # Run both frontend + backend
pnpm build          # Production build
pnpm dev:frontend   # Frontend only
pnpm dev:backend    # Backend only
```

## Environment Files

- `frontend/.env.local` - Frontend env vars (NEXT_PUBLIC_* prefix)
- `backend/.env` - Backend env vars

## Important Files

- `frontend/src/components/cal-embed.tsx` - Cal.com booking integration
- `frontend/src/components/pricing-calculator.tsx` - Interactive pricing
- `backend/src/cloudinary/` - Image upload service
