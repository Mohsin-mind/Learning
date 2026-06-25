# E-commerce Order Management API

## Objective

Build a production-grade NestJS API to learn the framework's core and advanced features. This document serves as a single source of truth for all agents working on this project.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js 22 + TypeScript (strict) |
| Framework | NestJS 11 |
| Package Manager | pnpm |
| ORM | TypeORM |
| Database | PostgreSQL (local) |
| Auth | JWT + Passport |
| Validation | class-validator + class-transformer |
| API Docs | Swagger (OpenAPI) |
| Testing | Jest (unit) + Supertest (e2e) |
| File handling | multer |
| Cache | cache-manager (in-memory / Redis) |
| Cron | @nestjs/schedule |
| Events | @nestjs/event-emitter |

## Project Structure

```
src/
  auth/           # Login, register, JWT, roles guard
  users/          # User entity, service, controller, repository
  products/       # Product CRUD
  orders/         # Order creation, status management
  payments/       # Payment webhook handling
  files/          # File upload
  common/         # Shared decorators, filters, interceptors, pipes, constants
  config/         # ConfigModule with env validation
  database/       # TypeORM connection setup + seeds
    seeds/
      seed.ts         # Entry point (NestFactory.createApplicationContext)
      user.seed.ts    # Seeds admin + user accounts
```

## Architecture Patterns (from NestJS skill)

| Rule | Status | Notes |
|------|--------|-------|
| `arch-feature-modules` | ✅ | Organized by feature |
| `arch-use-repository-pattern` | ✅ | `UserRepository extends Repository<User>` |
| `di-use-interfaces-tokens` | ✅ | `USERS_SERVICE_TOKEN` Symbol, `IUsersService` interface |
| `security-sanitize-output` | ✅ | `@Exclude()` on password + global `ClassSerializerInterceptor` |

## Phases & Checklist

### Phase 1 — Core Fundamentals

| # | Task | Done | Notes |
|---|------|------|-------|
| 1.1 | Organize feature modules (auth, users, products, orders, payments, files) | [x] | All module dirs created; products/orders/payments/files need module files |
| 1.2 | Create controllers for each module | [~] | Auth controller done; others need controllers |
| 1.3 | Create services with business logic | [~] | AuthService, UsersService done |
| 1.4 | Use Dependency Injection properly | [x] | Constructor injection; interface tokens for services |
| 1.5 | Define DTOs for all inputs/outputs | [~] | RegisterDto, LoginDto done with @ApiProperty |
| 1.6 | Add validation with `class-validator` + `ValidationPipe` | [x] | Global ValidationPipe with whitelist + transform; password regex via `REGEX.PASSWORD` constant |

### Phase 2 — Middleware, Guards & Decorators

| # | Task | Done | Notes |
|---|------|------|-------|
| 2.1 | Create a custom Pipe (e.g., ParseIdPipe) | [x] | ParseUUIDPipe in common/pipes |
| 2.2 | Add Middleware (e.g., request logging) | | |
| 2.3 | Implement JWT Guard | [x] | JwtStrategy uses `@Inject(USERS_SERVICE_TOKEN)` |
| 2.4 | Implement Roles Guard | [x] | RolesGuard + @Roles() decorator |
| 2.5 | Create `@CurrentUser()` custom decorator | [x] | In common/decorators |

### Phase 3 — Cross-cutting Concerns

| # | Task | Done | Notes |
|---|------|------|-------|
| 3.1 | Global Exception Filter | [x] | HttpExceptionFilter in common/filters |
| 3.2 | Interceptors (logging, transform, timeout) | [x] | LoggingInterceptor + ClassSerializerInterceptor (global) |
| 3.3 | ConfigModule with environment validation | [x] | Using @nestjs/config + Joi |

### Phase 4 — Database & Auth

| # | Task | Done | Notes |
|---|------|------|-------|
| 4.1 | Install TypeORM + PostgreSQL driver | [x] | typeorm + pg installed |
| 4.2 | Create entities (User, Product, Order, OrderItem, Payment) | [~] | User entity done (with role field + @Exclude on password); others pending |
| 4.3 | Create database module with connection | [x] | DatabaseModule with async config |
| 4.4 | TypeORM repositories in services | [x] | Custom `UserRepository` extends Repository; no `@InjectRepository` |
| 4.5 | User registration endpoint | [x] | POST /auth/register |
| 4.6 | User login with JWT token | [x] | POST /auth/login |
| 4.7 | Admin / User role-based authorization | [x] | RolesGuard + UserRole enum + @Roles() |

### Phase 5 — Advanced Features

| # | Task | Done | Notes |
|---|------|------|-------|
| 5.1 | Pagination (offset-based) | | |
| 5.2 | Filtering & Sorting | | |
| 5.3 | File upload endpoint | | |
| 5.4 | Caching layer | | |
| 5.5 | Cron jobs (e.g., clean stale orders) | | |
| 5.6 | EventEmitter for async flows | | |
| 5.7 | Swagger / OpenAPI setup | [x] | Add @ApiTags, @ApiOperation, @ApiBearerAuth, @ApiProperty to every new endpoint |
| 5.8 | Webhook simulation endpoint | | |

### Phase 6 — Testing

| # | Task | Done | Notes |
|---|------|------|-------|
| 6.1 | Unit tests for services | | |
| 6.2 | Unit tests for controllers | | |
| 6.3 | Unit tests for guards / pipes / filters | | |
| 6.4 | E2E tests for auth endpoints | | |
| 6.5 | E2E tests for CRUD endpoints | | |

## API Endpoints

### Auth
```
POST /auth/register    # Create account (role defaults to 'user')  ✅
POST /auth/login       # Returns JWT token                         ✅
GET  /auth/profile     # Get current user profile (authenticated)  ✅
```

### Products
```
GET    /products       # List products (public, with pagination/filtering/sorting)
POST   /products       # Create product (admin only)
GET    /products/:id   # Get single product
PATCH  /products/:id   # Update product (admin only)
DELETE /products/:id   # Delete product (admin only)
```

### Orders
```
POST   /orders         # Create order (authenticated)
GET    /orders         # List user's orders (authenticated, with pagination)
GET    /orders/:id     # Get order detail (owner or admin)
PATCH  /orders/:id/status  # Update order status (admin only)
```

### Payments
```
POST /payments/webhook  # Stripe-like webhook (no auth, signature verification)
```

### Files
```
POST /files/upload      # Upload file (authenticated)
GET  /files/:id         # Get file metadata (authenticated)
```

### Users (admin)
```
GET /users              # List all users (admin only)
GET /users/:id          # Get user detail (admin only)
```

## Current State

**✅ Build passes cleanly — 0 errors, 0 lint warnings**

### What's built so far:
- ConfigModule with env file + Joi validation
- DatabaseModule with async TypeORM connection (PostgreSQL)
- `User` entity with `UserRole` enum, `@Exclude()` on password
- `UserRepository` extends `Repository<User>` (repository pattern)
- `UsersService` implements `IUsersService` interface, injected via `USERS_SERVICE_TOKEN`
- Auth module with register, login, JWT strategy, profile
- Common: `@CurrentUser()`, `RolesGuard`, `@Roles()`, `HttpExceptionFilter`, `LoggingInterceptor`, `ClassSerializerInterceptor`, `ParseUUIDPipe`
- Global `ValidationPipe` (whitelist + transform)
- Global `ClassSerializerInterceptor` (auto-strips `@Exclude()` fields)
- Swagger at `http://localhost:3000/api/docs` with bearer auth
- `REGEX.PASSWORD` constant for reusable password validation
- Seed script using `NestFactory.createApplicationContext`
- All lint rules passing (no `any`, no unused imports, promises handled)

### Next steps (pick any):
1. Products module (entity, service, controller, CRUD)
2. Orders module (entity, service, controller, status management)
3. Payments module (webhook endpoint)
4. Files module (upload + metadata)
5. Pagination / Filtering / Sorting (Phase 5)
6. Caching / Cron / Events (Phase 5)
7. Tests (Phase 6)

## How to Use This Document

- **Starting fresh**: Pick the first unchecked task from Phase 1.
- **Continuing work**: Check `Done` column to find the next task.
- **Each agent**: Update this file after completing a task — mark it `[x]` and optionally add notes.
- **Swagger**: Every controller needs `@ApiTags()`, every endpoint needs `@ApiOperation()`, authenticated endpoints need `@ApiBearerAuth()`.
- **DTOs**: Every DTO property needs `@ApiProperty({ example: '...' })`.
- **Password validation**: Use `REGEX.PASSWORD` from `common/constants/regex.constant.ts` — never inline the regex.
- **Service injection**: Use `@Inject(TOKEN)` with interface type — never inject a service class directly.
- **If you get stuck**: Add a note in the Notes column and move to the next task.

## Commands

```bash
pnpm run dev          # development with watch
pnpm run debug        # debug with watch
pnpm run prod         # production (runs compiled dist/main)
pnpm run seed         # seed DB with admin + user accounts
pnpm run test         # unit tests
pnpm run test:e2e     # e2e tests
pnpm run lint         # lint
pnpm run build        # type-check + compile
```

### Seed Credentials

```
Admin: admin@mailinator.com / Admin@123
User:  user@mailinator.com / User@123
```
