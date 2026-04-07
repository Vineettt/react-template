# React Dashboard Template

A Next.js 16 dashboard boilerplate with RBAC/PBAC authentication, built with shadcn/ui components.

## Tech Stack

- **Framework**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Lucide icons
- **Authentication**: JWT-based auth
- **Tables**: TanStack React Table
- **Forms**: React Hook Form

## Project Structure

```
src/
├── app/
│   ├── auth/          # Login page
│   ├── dashboard/     # Main dashboard
│   ├── mapping/       # Role/Route mapping management
│   ├── account/       # User account settings
│   └── misc/          # Miscellaneous pages
├── components/
│   ├── auth/          # Auth components
│   ├── dialogs/       # Modal dialogs
│   ├── data-table/    # Reusable table components
│   └── app-sidebar.tsx
├── constants/
│   ├── permission.ts  # Permission constants
│   ├── route.ts       # Route definitions
│   └── storage.ts     # Storage keys
└── config/
    └── sidebar.json   # Sidebar navigation config
```

## Features

- JWT authentication with protected routes
- Role-based access control (RBAC)
- Permission-based access control (PBAC)
- Dynamic sidebar navigation
- Data tables with sorting/filtering
- Form dialogs for CRUD operations
- Dark/light theme support

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint check
