# Dividend Reinvestment Calculator

## Overview

This is a full-stack web application for calculating dividend reinvestment returns and comparing stock performance. The application features a React frontend with TypeScript, an Express.js backend, and uses Drizzle ORM for database operations. It's built as a Korean-language financial calculator focused on dividend investment strategies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL (configured for Neon Database)
- **Build Tool**: Vite for frontend, ESBuild for backend
- **Session Storage**: PostgreSQL sessions with connect-pg-simple

### Project Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
└── migrations/      # Database migrations
```

## Key Components

### Frontend Components
1. **Calculator Form**: Main dividend calculation interface with form validation
2. **Comparison Form**: Stock comparison functionality
3. **Results Charts**: Data visualization using Recharts
4. **Results Table**: Tabular display of yearly calculations
5. **Navigation**: Mobile-responsive navigation with sheet components

### Backend Components
1. **Storage Layer**: Abstracted storage interface with in-memory implementation
2. **Routes**: RESTful API endpoints for calculations and stock data
3. **Validation**: Zod schemas for request validation

### Database Schema
- **users**: User authentication data
- **stock_data**: Stock information with dividend metrics
- **calculation_inputs**: Saved calculation parameters
- **calculation_results**: Historical calculation results

## Data Flow

1. **User Input**: Forms collect investment parameters (initial investment, monthly contributions, dividend yields)
2. **Validation**: Client-side validation with Zod schemas
3. **API Requests**: TanStack Query manages server communication
4. **Calculations**: Backend performs dividend reinvestment calculations
5. **Storage**: Results optionally saved to database
6. **Visualization**: Charts and tables display results to user

### Calculation Logic
- Supports dividend reinvestment (DRIP) calculations
- Handles compound growth with configurable dividend growth rates
- Supports multiple currencies (USD/KRW)
- Provides year-over-year breakdown of returns

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessibility
- **Charting**: Recharts for financial data visualization
- **Forms**: React Hook Form + Hookform Resolvers
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL
- **Validation**: Zod with zod-validation-error
- **Sessions**: connect-pg-simple for PostgreSQL session storage

### Development Tools
- **Build**: Vite with React plugin
- **Database**: Drizzle Kit for migrations
- **Runtime**: tsx for TypeScript execution
- **Linting**: TypeScript strict mode

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx with file watching
- **Database**: Drizzle push for schema updates

### Production
- **Frontend**: Static build served by Express
- **Backend**: ESBuild compilation to single JavaScript file
- **Database**: PostgreSQL with connection pooling
- **Environment**: Node.js with environment variables

### Build Process
1. Frontend built with Vite to `dist/public`
2. Backend compiled with ESBuild to `dist/index.js`
3. Shared schemas and types available to both environments
4. Database schema managed through Drizzle migrations

### Configuration
- Environment variables for database connection
- Tailwind configuration for design system
- TypeScript path mapping for clean imports
- Vite aliases for frontend module resolution

The application is designed for deployment on platforms like Replit, with specific optimizations for the Replit environment including development banner integration and Cartographer plugin support.