# SpaceLink 2D

SpaceLink is a full-stack 2D virtual space platform where users can create, customize, and join interactive rooms. Users move avatars around shared maps in real time, decorate spaces with elements, and can use proximity-based video calling in the client experience.

The backend is organized as a TypeScript monorepo with an Express HTTP API, a WebSocket presence server, and a shared PostgreSQL data layer powered by Prisma.

## Features

- User authentication with JWT-based sessions
- Role-based admin and user routes
- Avatar selection and user metadata management
- Custom 2D spaces with dimensions, thumbnails, and map templates
- Admin-managed avatars, elements, and maps
- Real-time room join, leave, and movement events over WebSockets
- PostgreSQL persistence through Prisma
- Monorepo setup with pnpm workspaces and Turborepo

## Tech Stack

- Node.js
- TypeScript
- Express
- WebSocket server using `ws`
- PostgreSQL
- Prisma
- JWT authentication
- pnpm workspaces
- Turborepo

The broader platform is designed to pair this backend with a Next.js frontend, WebRTC media sessions, Protobuf-encoded real-time sync messages, and S3-backed asset storage for avatars, thumbnails, and map elements.

## Monorepo Structure

```txt
spacelink-2d/
  apps/
    http/                 Express REST API
    ws/                   WebSocket room and avatar sync server
  packages/
    db/                   Prisma schema and shared Prisma client
    eslint-config/        Shared ESLint configuration
    typescript-config/    Shared TypeScript configuration
    ui/                   Shared React UI package placeholder
  package.json
  pnpm-workspace.yaml
  turbo.json
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- pnpm 9
- PostgreSQL database

### Install dependencies

```sh
pnpm install
```

### Configure environment

Create a `.env` file where Prisma can load it, commonly in `packages/db/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/spacelink"
```

The current HTTP and WebSocket services use a shared JWT secret from `apps/http/src/config.ts` and `apps/ws/src/config.ts`. For production, move this value to an environment variable and keep both services configured with the same secret.

### Prepare the database

Run Prisma migrations from the database package:

```sh
pnpm --filter @repo/db exec prisma migrate dev
pnpm --filter @repo/db exec prisma generate
```

### Run the services

Run the backend services in separate terminals:

```sh
pnpm --filter http run nodemon
pnpm --filter ws run nodemon
```

Build and start each service:

```sh
pnpm --filter http start
pnpm --filter ws start
```

Default service ports:

- HTTP API: `http://localhost:3000`
- WebSocket server: `ws://localhost:3001`

## Scripts

```sh
pnpm dev       # Run configured dev tasks through Turborepo
pnpm build     # Build all packages/apps
pnpm lint      # Run lint tasks where configured
pnpm format    # Format TypeScript, TSX, and Markdown files
```

## HTTP API Overview

Base routes are mounted under `/api/v1`.

### Auth and Public Data

- `POST /api/v1/signup` creates a user or admin account
- `POST /api/v1/signin` returns a JWT
- `GET /api/v1/avatars` lists available avatars
- `GET /api/v1/elements` lists placeable map elements

### User Routes

- `POST /api/v1/user/metadata` updates the current user's avatar
- `GET /api/v1/user/metadata/bulk?ids=[id1,id2]` fetches avatar metadata for users

### Space Routes

- `POST /api/v1/space` creates a space, optionally from a map template
- `GET /api/v1/space/all` lists spaces created by the authenticated user
- `GET /api/v1/space/:spaceId` returns a space with its elements
- `DELETE /api/v1/space/:spaceId` deletes a space owned by the authenticated user
- `POST /api/v1/space/element` adds an element to a space
- `DELETE /api/v1/space/element/:elementId` removes an element from a space

### Admin Routes

- `POST /api/v1/admin/element` creates a map element
- `PUT /api/v1/admin/element/:elementId` updates an element image URL
- `POST /api/v1/admin/avatar` creates an avatar
- `POST /api/v1/admin/map` creates a reusable map template

Authenticated routes expect:

```http
Authorization: Bearer <token>
```

## WebSocket Protocol

Connect to:

```txt
ws://localhost:3001
```

### Join a space

```json
{
  "type": "join",
  "payload": {
    "spaceId": "space_id",
    "token": "jwt_token"
  }
}
```

Server response:

```json
{
  "type": "space-joined",
  "payload": {
    "spawn": {
      "x": 0,
      "y": 0
    },
    "users": []
  }
}
```

### Move avatar

```json
{
  "type": "move",
  "x": 1,
  "y": 0
}
```

The server accepts one-tile movement on either axis. Invalid moves are rejected with the user's current position.

Broadcast event types include:

- `user-joined`
- `movement`
- `movement-rejected`
- `user-left`

## Database Models

The Prisma schema includes:

- `User`
- `Avatar`
- `Space`
- `SpaceElements`
- `Element`
- `Map`
- `MapElements`

These models support account management, avatar selection, reusable map templates, and per-space element placement.

## Production Notes

- Move JWT secrets and service configuration into environment variables.
- Add CORS and request hardening before exposing the HTTP API publicly.
- Store uploaded avatar, element, and thumbnail assets in S3 or compatible object storage.
- Use WebRTC signaling alongside the WebSocket room events for proximity-based video calls.
- Use Protobuf message schemas for real-time sync when optimizing bandwidth and client compatibility.
