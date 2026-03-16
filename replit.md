# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Directorio de Cartago - a business directory web app for the city of Cartago, Colombia.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/directorio-cartago)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT (bcryptjs + jsonwebtoken), token stored in localStorage
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080, routes at /api)
│   └── directorio-cartago/ # React + Vite frontend (port 25788, serves at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks (custom-fetch.ts injects JWT)
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Application Features

### User Roles
- **visitor**: Browse directory, subscribe for premium info
- **business_owner**: Register/manage businesses, plus visitor features
- **admin**: Full access - approve/reject businesses, manage users, subscription plans

### Seed Credentials
- Admin: `admin@directoriocartago.co` / `admin123`
- Business Owner: `juan@ejemplo.co` / `owner123`

### Business Info Access
- **Free**: Photo, name, address, Instagram
- **Premium** (subscription required): Phone, WhatsApp, Facebook, website, Google Maps

### Key API Routes
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login (returns JWT)
- `GET /api/auth/me` - Current user
- `GET /api/businesses` - List businesses (search + category filter)
- `POST /api/businesses` - Create business (requires auth)
- `POST /api/businesses/:id/approve` - Admin approve
- `GET /api/subscriptions/plans` - Subscription plans
- `POST /api/subscriptions/subscribe` - Subscribe to plan
- `GET /api/admin/stats` - Admin statistics

### Pages
- `/` - Home with hero, category grid, featured businesses
- `/businesses` - Full directory with search/filter
- `/businesses/:id` - Business detail (premium gating)
- `/login`, `/register` - Auth
- `/profile` - Edit profile
- `/my-businesses` - Owner's business management
- `/businesses/new`, `/businesses/:id/edit` - Business form
- `/admin` - Admin panel (stats, users, businesses, categories, subscriptions)
- `/plans` - Subscription plans (COP pricing)
- `/privacidad` - Colombia Ley 1581 privacy policy

## DB Schema
- `users` - id, name, email, password_hash, role (visitor/business_owner/admin), phone
- `categories` - id, name, icon, description
- `businesses` - id, name, description, address, phone, whatsapp, instagram, facebook, website, googleMapsUrl, schedule, categoryId, ownerId, status (pending/approved/rejected), rejectionReason
- `business_images` - id, businessId, url, isPrimary
- `subscription_plans` - id, name, description, price, durationDays, isActive
- `subscriptions` - id, userId, planId, startDate, endDate, isActive, paymentReference

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes
