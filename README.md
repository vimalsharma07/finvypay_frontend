# FinvyPay Frontend

## Getting Started

This is the frontend application for FinvyPay.

### Prerequisites

- Node.js 16.x or higher
- Npm or Yarn
- Tailwind CSS 4.x
- React 19.x
- Next.js 15.3.x
- PostgreSQL 17.4.x

## Components

This application uses React components built with Tailwind CSS.

### Installation

To set up the project dependencies, including those required for React 19, use the `--force` flag to resolve any dependency conflicts:

```bash
npm install --force
```

### Database Deployment

This will create the necessary tables in database for user authorization and user management apps :

```bash
npx prisma db push
```

Once your schema is deployed, you need to generate the Prisma Client:

```bash
npx prisma generate
```

### Development

Start the development server:

```bash
npm run dev
```

### Setting Up the Layout

The application uses `Demo1Layout` as the main layout. You can modify the layout in `app/(protected)/layout.tsx`.

### Reporting Issues

If you encounter any issues or have suggestions for improvement, please create an issue in the repository.
