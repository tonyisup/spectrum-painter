# ADHD Spectrum Chart Application

## Overview

This is a full-stack web application for creating and managing interactive radial charts to visualize ADHD spectrum traits. The application allows users to create personalized charts by selecting colors for different trait categories arranged in a circular, ring-based layout. Users can save, load, and export their charts for personal tracking or sharing purposes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Radix UI components with shadcn/ui design system for accessible, customizable components
- **Styling**: Tailwind CSS with custom CSS variables for consistent theming and responsive design
- **State Management**: TanStack React Query for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript for full-stack type safety
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **API Design**: RESTful endpoints for CRUD operations on chart data
- **Validation**: Zod schemas for runtime type validation and data integrity

### Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL with migration support
- **Schema**: Simple chart table structure with JSON data storage for flexible chart configurations
- **Connection**: Neon Database serverless PostgreSQL for production deployment

### Development Tools
- **Monorepo Structure**: Shared TypeScript types and schemas between client and server
- **Development Server**: Vite dev server with Express API proxy for seamless full-stack development
- **Type Safety**: Shared schema definitions using Drizzle Zod integration
- **Hot Reload**: Both client and server support hot reloading during development

### Component Architecture
- **Radial Chart Component**: Custom SVG-based interactive chart with hover states and click handlers
- **Color Picker**: Multi-format color selection with preset palettes and custom input
- **Toast System**: User feedback for save/load operations and error handling
- **Responsive Design**: Mobile-first approach with adaptive layouts

## External Dependencies

### Core Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing solution
- **@radix-ui/react-***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional CSS class utilities

### Backend Dependencies
- **express**: Web framework for Node.js
- **drizzle-orm**: Type-safe SQL ORM
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **zod**: Schema validation library
- **drizzle-zod**: Integration between Drizzle and Zod

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **@vitejs/plugin-react**: React support for Vite
- **drizzle-kit**: Database migration and schema management
- **esbuild**: Fast JavaScript bundler for production builds

### Database Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **DATABASE_URL**: Environment variable for database connection string

### Build and Deployment
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **ESBuild**: Production bundling for server-side code
- **PostCSS**: CSS processing with Tailwind and Autoprefixer