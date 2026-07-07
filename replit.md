# ISKCON Juhu Donation System

## Overview
The ISKCON Juhu Donation System is a comprehensive platform for managing online donations to the ISKCON Juhu temple. It facilitates secure online payments, manages temple content (banners, events, blogs, videos, galleries, quotes), and provides an administrative panel for temple management. The system is built with Node.js, Express, React, and PostgreSQL, aiming to streamline donation processes and content dissemination for the temple.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with Vite
- **Styling**: Tailwind CSS, Radix UI components with shadcn/ui
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation

### Backend
- **Framework**: Express.js with TypeScript
- **ORM**: Drizzle ORM
- **Session Management**: Express Session
- **File Uploads**: Multer for image handling
- **API Design**: RESTful APIs

### Data Storage
- **Primary Database**: PostgreSQL (Neon cloud database)
- **File Storage**: Local filesystem for uploads

### Key Features
- **Payment System**: Live integration with PayU (cards, net banking, wallets, UPI), direct UPI support, automated PDF receipt generation, and email notifications.
- **Content Management**: Dynamic banners, event management, image galleries, video integration, blog system, and daily spiritual quotes.
- **Donation Categories**: Supports various donation types like Temple Renovation, Food for All, Education Support, Festival Sponsorship, and General Donations.
- **Admin Panel**: Dashboard with analytics, user management, content administration, real-time donation tracking, and contact form submission handling.
- **Policies Page CMS**: Dynamic management of "Policies of Usage" page content.
- **Donation Export**: Excel export of donations based on date ranges and applied filters.

### Deployment Strategy
- **Production**: Node.js 20+, PostgreSQL (Neon or local), PM2 for process management, Nginx with SSL (Let's Encrypt), VPS deployment.
- **Authentication**: Session-based with secure cookies, role-based access (user/admin), hashed passwords.

## External Dependencies

### Payment Gateways
- **PayU**: Primary payment processor.
- **UPI**: Direct UPI for mobile payments.

### Communication Services
- **Email**: Nodemailer for PDF receipt delivery.

### Third-Party Libraries
- **PDF Generation**: PDFKit for receipts.
- **Image Processing**: Sharp for image optimization.
- **Date Handling**: date-fns.
- **Validation**: Zod for type-safe validation.