# QuikSpit Auto Detailing

A full-stack web application for QuikSpit Auto Detailing services, built with Next.js frontend and NestJS backend in a monorepo structure. The project now uses **pnpm** for dependency management and workspace scripts.

## Project Structure

```
quickspit/
├── frontend/          # Next.js frontend application
├── backend/           # NestJS backend application
├── package.json       # Root package.json with workspace scripts
├── pnpm-workspace.yaml # pnpm workspace configuration
├── .gitignore         # Git ignore file
└── README.md          # This file
```

## Technology Stack

### Frontend
- **Next.js 15** with TypeScript
- **Tailwind CSS** for styling
- **React 19** for UI components
- **Framer Motion** for animations
- **Custom comparison slider, Instagram/TikTok embeds, and profile card components**

### Backend
- **NestJS 10** with TypeScript
- **TypeORM** for database management
- **PostgreSQL** as the database
- **Multer** for file uploads
- **Stripe** for payment processing
- **Nodemailer** for email functionality
- **Modular structure:** Contact, Booking, Gallery modules

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- pnpm (v8 or higher)
- PostgreSQL database (for production)

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Install all dependencies in the monorepo
pnpm install
```

### 2. Environment Setup

#### Frontend Environment
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your configuration
```

#### Backend Environment
```bash
cd backend
cp .env.example .env
# Edit .env with your database and service configurations
```

### 3. Database Setup

Make sure PostgreSQL is running and create a database for the application. Update the database configuration in `backend/.env`.

### 4. Run the Application

#### Option 1: Use the Start Scripts (Recommended)

**On Windows:**
```bash
# Double-click start-dev.bat or run in terminal:
start-dev.bat
```

**On Linux/Mac:**
```bash
# Make executable and run:
chmod +x start-dev.sh
./start-dev.sh
```

#### Option 2: Run Both Frontend and Backend Together
```bash
# From the root directory
pnpm dev
```

#### Option 3: Run Frontend and Backend Separately

**Frontend:**
```bash
pnpm dev:frontend
```

**Backend:**
```bash
pnpm dev:backend
```

## Available Scripts

### Root Level Scripts
- `pnpm dev` - Run both frontend and backend concurrently
- `pnpm dev:frontend` - Run only the frontend
- `pnpm dev:backend` - Run only the backend
- `pnpm build` - Build both frontend and backend
- `pnpm build:frontend` - Build only the frontend
- `pnpm build:backend` - Build only the backend
- `pnpm clean` - Remove all node_modules directories

### Frontend Scripts (cd frontend)
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Backend Scripts (cd backend)
- `pnpm start:dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start:prod` - Start production server

## Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## API Endpoints

### Contact Module
- `POST /api/contact` - Submit contact form with image upload

### Booking Module
- `GET /api/bookings` - Get bookings
- `POST /api/bookings` - Create new booking

### Gallery Module
- `GET /api/gallery` - Get gallery images

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint rules
- Use Prettier for code formatting

### File Structure
- Keep components in appropriate directories
- Use descriptive names for files and variables
- Follow Next.js and NestJS conventions

### Accessibility & Theming
- Follows QuikSpit Auto Detailing dark theme guidelines (see `.github/copilot-instructions.md`)
- Custom Tailwind configuration for brand colors

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000 and 3001 are available
2. **Database connection**: Verify PostgreSQL is running and credentials are correct
3. **Dependencies**: Run `pnpm install` if you encounter missing module errors

### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that required services (database) are running

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is private and proprietary.
