# Architecture

This document captures the high-level design and tradeoffs in BD-GPS.

## 1) Core Principles

- Multi-tenant by default: every business entity is scoped to an institution.
- Server-centric architecture: business logic in server actions and route handlers.
- Security as baseline: auth, RBAC, validated inputs, and secure headers.
- Operationally aware: health checks, CI gates, standalone Docker runtime.

## 2) Request Flow

```text
Browser
  -> Next.js App Router
  -> Middleware (auth + role checks)
  -> Server Action / API Route
  -> Prisma
  -> PostgreSQL
```

## 3) Multi-Tenancy Model

Top-level boundary is `Institution`.
Most domain records include `institutionId` and are queried in institution scope.

Examples from schema:

- `User -> institutionId`
- `Student -> institutionId`
- `Teacher -> institutionId`
- `Class -> institutionId`
- `Fee -> institutionId`

This creates a clear tenant boundary in application logic and data access.

## 4) Identity and Access Control

- Auth provider: Auth.js (NextAuth v5 beta), JWT session strategy.
- Credentials auth with optional Google OAuth.
- Middleware enforces protected route access and role checks.
- JWT includes role and institution claims for downstream authorization.

## 5) Application Layers

## UI Layer

- Next.js App Router pages and React components under `src/app` + `src/components`.
- **Server-First Component Pattern**: Used for global navigation (e.g., `MobileNavServer`).
  - Logical routing and data fetching (session, locale, dictionary) are handled in a Server Component.
  - Minimal client "islands" (e.g., `ActiveLink`) handle viewport-aware hydration (Active states, Prefetching).
  - Results in zero-JS overhead for menu generation and instant navigation via Next.js router cache.

## Domain Layer

- Server-side actions under `src/server/actions` implement business workflows.
- Validation and guardrails applied before persistence.

## Data Layer

- Prisma client in `src/lib/db.ts`.
- PostgreSQL schema managed via Prisma migrations/schema.

## Integration Layer

- Stripe for payment and webhook workflows.
- UploadThing for file ingestion.
- Resend for email delivery.

## 6) Security Controls

- Security headers configured in `next.config.ts` (CSP, HSTS, frame, content-type, referrer, permissions).
- Environment validation in `src/lib/env.ts`.
- Auth middleware in `middleware.ts`.
- Health endpoint at `/api/health` verifies app + DB readiness.

## 7) Runtime and Deployability

- Next.js configured with `output: "standalone"` for container deployment.
- Dockerfile uses multi-stage build optimized for production runtime.
- CI pipeline validates lint, type safety, tests, and build before deployment.

## 8) Tradeoffs and Next Steps

Current architecture emphasizes clarity and production readiness for a single service.
Natural next steps for scale:

- Introduce distributed rate limiter/cache backend (Redis) for multi-instance consistency.
- Add structured logging and centralized tracing.
- Add contract tests for external integration boundaries.

## 9) Recruiter-Visible Architecture Highlights

- **Clear separation of concerns:** request handling in App Router/API, business workflows in server actions, persistence in Prisma.
- **Tenant-safe authorization path:** middleware + JWT claims + scoped queries ensure institutional boundaries.
- **Operational discipline:** documented deployment runbooks, validated envs, health checks, and CI gates.
- **Scalable evolution path:** system is intentionally monolithic-first with explicit extension points (cache, tracing, contracts).

## 10) Architecture Decision Snapshot (ADR-style)

1. **Monolith with modular boundaries**
   - Chosen for delivery speed and reduced operational complexity.
   - Mitigation: strongly defined module boundaries in `src/server/actions` and `src/lib`.

2. **JWT session strategy with Auth.js**
   - Chosen for edge/middleware compatibility and low session-store coupling.
   - Mitigation: role + institution claims are validated server-side before sensitive actions.

3. **Prisma + PostgreSQL for tenant data isolation**
   - Chosen for schema clarity, migration tooling, and type-safe data access.
   - Mitigation: institution-scoped data access patterns are enforced in action/query design.
