# QuickSpit Shine

A full-stack web application for QuickSpit Shine services, built with Next.js frontend and NestJS backend in a monorepo structure.

## Project Structure

```
quickspit-shine/
├── frontend/          # Next.js frontend application
├── backend/           # NestJS backend application
├── package.json       # Root package.json with workspace scripts
├── .gitignore         # Git ignore file
└── README.md          # This file
```

## Technology Stack

### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **React** for UI components

### Backend
- **NestJS** with TypeScript
- **TypeORM** for database management
- **PostgreSQL** as the database
- **Multer** for file uploads
- **Stripe** for payment processing
- **Nodemailer** for email functionality

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm (v8 or higher)
- PostgreSQL database (for production)

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Install root dependencies and all workspace dependencies
npm run install:all
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
npm run dev
```

#### Option 3: Run Frontend and Backend Separately

**Frontend:**
```bash
npm run dev:frontend
```

**Backend:**
```bash
npm run dev:backend
```

## Available Scripts

### Root Level Scripts
- `npm run dev` - Run both frontend and backend concurrently
- `npm run dev:frontend` - Run only the frontend
- `npm run dev:backend` - Run only the backend
- `npm run build` - Build both frontend and backend
- `npm run build:frontend` - Build only the frontend
- `npm run build:backend` - Build only the backend
- `npm run install:all` - Install dependencies for root and all workspaces
- `npm run clean` - Remove all node_modules directories

### Frontend Scripts (cd frontend)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend Scripts (cd backend)
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server

## Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## API Endpoints

### Contact Module
- `POST /api/contact` - Submit contact form with image upload

### Booking Module
- `GET /api/bookings` - Get bookings
- `POST /api/bookings` - Create new booking

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint rules
- Use Prettier for code formatting

### File Structure
- Keep components in appropriate directories
- Use descriptive names for files and variables
- Follow Next.js and NestJS conventions

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000 and 3001 are available
2. **Database connection**: Verify PostgreSQL is running and credentials are correct
3. **Dependencies**: Run `npm run install:all` if you encounter missing module errors

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
