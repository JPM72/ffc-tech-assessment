# Todo List Application

A full-stack todo list web application built with Next.js, TypeScript, TailwindCSS, Clerk authentication, and MySQL with Prisma ORM.

## Features

- 🔐 **User Authentication** - Secure user registration and login with Clerk
- 📝 **List Management** - Create, edit, delete, and rename todo lists
- ✅ **Task Management** - Full CRUD operations for tasks with descriptions
- 🔍 **Search Functionality** - Search across lists and tasks
- 🗂️ **Sorting & Filtering** - Sort by created date, name, or task count
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- ⚡ **Real-time Updates** - Instant UI updates with optimistic rendering

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: TailwindCSS
- **Authentication**: Clerk
- **Database**: MySQL
- **ORM**: Prisma
- **Deployment**: Vercel-ready

## Prerequisites

Before you begin, ensure you have installed:
- Node.js 18+ and npm
- MySQL database (local or remote)
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ffc-tech-assessment
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication Keys (get from https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database Connection
DATABASE_URL="mysql://username:password@localhost:3306/todoapp"
```

### 4. Database Setup

1. Create a MySQL database named `todoapp` (or your preferred name)
2. Update the `DATABASE_URL` in `.env.local` with your database credentials
3. Run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

For local development:

```bash
dotenv -e .env.local -- npx prisma migrate dev --name init
```

4. Generate Prisma client:

```bash
npx prisma generate
```

### 5. Clerk Setup

1. Sign up for a free account at [Clerk.com](https://clerk.com)
2. Create a new application
3. Copy your publishable key and secret key to `.env.local`
4. Configure the sign-in and sign-up URLs in your Clerk dashboard:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── lists/         # Lists CRUD operations
│   │   └── tasks/         # Tasks CRUD operations
│   ├── dashboard/         # Protected dashboard page
│   ├── sign-in/          # Authentication pages
│   ├── sign-up/
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout with Clerk provider
│   └── page.tsx          # Homepage
├── components/            # Reusable React components
│   ├── ui/               # Base UI components
│   ├── lists/            # List-related components
│   └── tasks/            # Task-related components
└── lib/                  # Utility functions and configurations
    ├── prisma.ts         # Prisma client setup
    └── user.ts           # User synchronization utilities
```

## Database Schema

The application uses three main models:

- **User**: Stores user information synced from Clerk
- **List**: Todo lists belonging to users
- **Task**: Individual tasks within lists

## API Endpoints

### Lists
- `GET /api/lists` - Get all lists for authenticated user
- `POST /api/lists` - Create a new list
- `PUT /api/lists/[id]` - Update a list
- `DELETE /api/lists/[id]` - Delete a list

### Tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/[id]` - Update a task
- `DELETE /api/tasks/[id]` - Delete a task

## Building for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Database Deployment

For production, consider using:
- **PlanetScale** - Serverless MySQL platform
- **Railway** - Simple MySQL hosting
- **AWS RDS** - Managed MySQL service

Update your `DATABASE_URL` in production environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint