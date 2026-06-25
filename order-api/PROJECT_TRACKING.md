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
  users/          # User entity, service, controller
  products/       # Product CRUD
  orders/         # Order creation, status management
  payments/       # Payment webhook handling
  files/          # File upload
  common/         # Shared decorators, filters, interceptors, pipes, middleware
  config/         # ConfigModule with env validation
  database/       # TypeORM connection setup
```

## Phases & Checklist

### Phase 1 — Core Fundamentals

| # | Task | Done | Notes |
|---|------|------|-------|
| 1.1 | Organize feature modules (auth, users, products, orders, payments, files) | [x] | All module dirs created; products/orders/payments/files need module files |
| 1.2 | Create controllers for each module | [~] | Auth controller done; others need controllers |
| 1.3 | Create services with business logic | [~] | AuthService, UsersService done |
| 1.4 | Use Dependency Injection properly | [x] | Constructor injection; interface tokens for services (`USERS_SERVICE_TOKEN`) |
| 1.5 | Define DTOs for all inputs/outputs | [~] | RegisterDto, LoginDto done; more needed |
| 1.6 | Add validation with `class-validator` + `ValidationPipe` | [x] | Global ValidationPipe with whitelist + transform |

### Phase 2 — Middleware, Guards & Decorators

| # | Task | Done | Notes |
|---|------|------|-------|
| 2.1 | Create a custom Pipe (e.g., ParseIdPipe) | [x] | ParseUUIDPipe in common/pipes |
| 2.2 | Add Middleware (e.g., request logging) | | |
| 2.3 | Implement JWT Guard | [x] | JwtStrategy + AuthGuard('jwt') |
| 2.4 | Implement Roles Guard | [x] | RolesGuard + @Roles() decorator |
| 2.5 | Create `@CurrentUser()` custom decorator | [x] | In common/decorators |

### Phase 3 — Cross-cutting Concerns

| # | Task | Done | Notes |
|---|------|------|-------|
| 3.1 | Global Exception Filter | [x] | HttpExceptionFilter in common/filters |
| 3.2 | Interceptors (logging, transform, timeout) | [~] | LoggingInterceptor done; more can be added |
| 3.3 | ConfigModule with environment validation | [x] | Using @nestjs/config + Joi |

### Phase 4 — Database & Auth

| # | Task | Done | Notes |
|---|------|------|-------|
| 4.1 | Install TypeORM + PostgreSQL driver | [x] | typeorm + pg installed |
| 4.2 | Create entities (User, Product, Order, OrderItem, Payment) | [~] | User entity done (with role field); others pending |
| 4.3 | Create database module with connection | [x] | DatabaseModule with async config |
| 4.4 | TypeORM repositories in services | [x] | Custom `UserRepository` extends Repository; `UsersService` injects repository, no `@InjectRepository` |
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
| 5.7 | Swagger / OpenAPI setup | [x] | Add @ApiTags, @ApiOperation, @ApiBearerAuth to every new controller/endpoint |
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

**Project scaffolded with NestJS 11 + TypeScript strict mode.**
**Build passes cleanly.**

### What's built so far:
- ConfigModule with env file + Joi validation
- DatabaseModule with async TypeORM connection (PostgreSQL)
- User entity with `UserRole` enum (`user` | `admin`)
- UsersService with `findByEmail`, `findById`, `create`
- Auth module with register, login, JWT strategy
- Common module with `@CurrentUser()`, `RolesGuard`, `@Roles()`, `HttpExceptionFilter`, `LoggingInterceptor`, `ParseUUIDPipe`
- Global ValidationPipe in main.ts

### Next steps (pick any):
1. Create products module (entity, service, controller)
2. Create orders module
3. Create payments module
4. Create files module
5. Add pagination/filtering/sorting (Phase 5)
6. Add Swagger (Phase 5)

## How to Use This Document

- **Starting fresh**: Pick the first unchecked task from Phase 1.
- **Continuing work**: Check `Done` column to find the next task.
- **Each agent**: Update this file after completing a task — mark it `[x]` and optionally add notes.
- **Swagger decorators**: Every new controller must include `@ApiTags()`, every endpoint must include `@ApiOperation()`, and authenticated endpoints must include `@ApiBearerAuth()`.
- **DTOs**: Every DTO property must include `@ApiProperty()` with an `example` value for Swagger schema generation.
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
