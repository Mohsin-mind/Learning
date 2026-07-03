# E-commerce Order Management API

## Objective

Build a production-grade NestJS API to learn the framework's core and advanced features. This document serves as a single source of truth for all agents working on this project.

## Tech Stack

| Layer           | Choice                              |
| --------------- | ----------------------------------- |
| Runtime         | Node.js 22 + TypeScript (strict)    |
| Framework       | NestJS 11                           |
| Package Manager | pnpm                                |
| ORM             | TypeORM                             |
| Database        | PostgreSQL (local)                  |
| Auth            | JWT + Passport                      |
| Validation      | class-validator + class-transformer |
| API Docs        | Swagger (OpenAPI)                   |
| Testing         | Jest (unit) + Supertest (e2e)       |
| File handling   | multer                              |
| Cache           | cache-manager (in-memory / Redis)   |
| Cron            | @nestjs/schedule                    |
| Events          | @nestjs/event-emitter               |

## Project Structure

```
src/
  auth/           # Login, register, JWT, roles guard
  users/          # User entity, service, controller, repository
  products/       # Product CRUD
  orders/         # Order creation, status management (traditional)
  orders-cqrs/    # Order module using CQRS + Event Sourcing (learning)
  payments/       # Payment webhook handling
  files/          # File upload
  events/         # BullMQ event processors
  common/         # Shared decorators, filters, interceptors, pipes, constants
  config/         # Typed app/auth/database config + env validation
  database/       # TypeORM connection setup + seeds
    migrations/       # TypeORM migrations
    seeds/
      seed.ts         # Entry point (NestFactory.createApplicationContext)
      user.seed.ts    # Seeds admin + user accounts
  health/         # Liveness/readiness endpoints (GET /, /health/live, /health/ready)
```

## Architecture Patterns (from NestJS skill)

| Rule                          | Status | Notes                                                                                              |
| ----------------------------- | ------ | -------------------------------------------------------------------------------------------------- |
| `arch-feature-modules`        | ✅     | Organized by feature                                                                               |
| `arch-use-repository-pattern` | ✅     | `UserRepository extends Repository<User>`                                                          |
| `di-use-interfaces-tokens`    | ✅     | `USERS_SERVICE_TOKEN` Symbol, `IUsersService` interface                                            |
| `error-use-exception-filters` | ✅     | Catch-all `AllExceptionsFilter` handles HTTP and unexpected errors                                 |
| `api-use-interceptors`        | ✅     | Global response wrapping, request IDs, serialization, and request/error logging via `CommonModule` |
| `api-use-dto-serialization`   | ✅     | Auth/profile responses use explicit response DTOs instead of returning entities                    |
| `security-sanitize-output`    | ✅     | Response DTOs avoid password output; entity still has `@Exclude()` as backup                       |
| `micro-use-health-checks`     | ✅     | Liveness + readiness endpoints with DB ping                                                        |
| `db-use-migrations`           | ✅     | TypeORM data source and migration scripts configured                                               |

## Phases & Checklist

### Phase 1 — Core Fundamentals

| #   | Task                                                                      | Done | Notes                                                                                          |
| --- | ------------------------------------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------- |
| 1.1 | Organize feature modules (auth, users, products, orders, payments, files) | [x]  | All module dirs created; products/orders/payments/files need module files                      |
| 1.2 | Create controllers for each module                                        | [~]  | Auth controller done; others need controllers                                                  |
| 1.3 | Create services with business logic                                       | [~]  | AuthService, UsersService done                                                                 |
| 1.4 | Use Dependency Injection properly                                         | [x]  | Constructor injection; interface tokens for services                                           |
| 1.5 | Define DTOs for all inputs/outputs                                        | [~]  | Register/Login input DTOs plus Auth/User response DTOs done                                    |
| 1.6 | Add validation with `class-validator` + `ValidationPipe`                  | [x]  | Global ValidationPipe with whitelist + transform; password regex via `REGEX.PASSWORD` constant |

### Phase 2 — Middleware, Guards & Decorators

| #   | Task                                     | Done | Notes                                                     |
| --- | ---------------------------------------- | ---- | --------------------------------------------------------- |
| 2.1 | Create a custom Pipe (e.g., ParseIdPipe) | [x]  | ParseUUIDPipe in common/pipes                             |
| 2.2 | Add Middleware (e.g., request logging)   | [x]  | Request logging handled globally via `LoggingInterceptor` |
| 2.3 | Implement JWT Guard                      | [x]  | JwtStrategy uses `@Inject(USERS_SERVICE_TOKEN)`           |
| 2.4 | Implement Roles Guard                    | [x]  | RolesGuard + @Roles() decorator                           |
| 2.5 | Create `@CurrentUser()` custom decorator | [x]  | In common/decorators                                      |

### Phase 3 — Cross-cutting Concerns

| #   | Task                                       | Done | Notes                                                                                                                                               |
| --- | ------------------------------------------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 | Global Exception Filter                    | [x]  | `AllExceptionsFilter` catches HTTP + unexpected errors, logs failures, and returns one error shape                                                  |
| 3.2 | Interceptors (logging, transform, timeout) | [x]  | `LoggingInterceptor`, `ResponseTransformInterceptor`, and `ClassSerializerInterceptor` registered globally via `CommonModule`; request IDs included |
| 3.3 | ConfigModule with environment validation   | [x]  | Typed app/auth/database config with Joi env validation                                                                                              |

### Phase 4 — Database & Auth

| #   | Task                                                       | Done | Notes                                                                           |
| --- | ---------------------------------------------------------- | ---- | ------------------------------------------------------------------------------- |
| 4.1 | Install TypeORM + PostgreSQL driver                        | [x]  | typeorm + pg installed                                                          |
| 4.2 | Create entities (User, Product, Order, OrderItem, Payment) | [~]  | User, Product, Order, OrderItem done; Payment pending                           |
| 4.3 | Create database module with connection                     | [x]  | DatabaseModule with async config; `DB_SYNCHRONIZE` defaults false               |
| 4.4 | TypeORM repositories in services                           | [x]  | Custom `UserRepository` extends Repository; no `@InjectRepository`              |
| 4.5 | User registration endpoint                                 | [x]  | POST /auth/register                                                             |
| 4.6 | User login with JWT token                                  | [x]  | POST /auth/login                                                                |
| 4.7 | Admin / User role-based authorization                      | [x]  | RolesGuard + UserRole enum + @Roles()                                           |
| 4.8 | Configure TypeORM migrations                               | [x]  | `src/database/data-source.ts`, `src/database/migrations`, and migration scripts |
| 4.9 | Create migrations for new entities                         | [x]  | Users, Products, Orders + OrderItems migrations created                         |

### Phase 5 — Advanced Features

| #   | Task                                 | Done | Notes                                                                                               |
| --- | ------------------------------------ | ---- | --------------------------------------------------------------------------------------------------- |
| 5.1 | Pagination (offset-based)            | [x]  | Products and Orders GET endpoints accept `?page=1&limit=10&sortBy=createdAt&sortOrder=DESC&search=` |
| 5.2 | Filtering & Sorting                  | [x]  | Products support `search` on name/description; both support `sortBy`/`sortOrder`                    |
| 5.3 | File upload endpoint                 | [x]  | POST /files/upload (authenticated, multer), GET /files/:id for metadata                             |
| 5.4 | Caching layer                        | [x]  | In-memory cache with @nestjs/cache-manager (60s TTL, 100 items max)                                 |
| 5.5 | Cron jobs (e.g., clean stale orders) | [x]  | Daily midnight cleanup of cancelled orders older than 30 days                                       |
| 5.6 | EventEmitter for async flows         | [x]  | `order.created` and `payment.processed` events emitted                                              |
| 5.7 | Swagger / OpenAPI setup              | [x]  | Add @ApiTags, @ApiOperation, @ApiBearerAuth, @ApiProperty to every new endpoint                     |
| 5.8 | Webhook simulation endpoint          | [x]  | POST /payments/webhook with signature, updates order status + creates payment record                |

### Phase 6 — Testing

| #   | Task                                    | Done | Notes                                                          |
| --- | --------------------------------------- | ---- | -------------------------------------------------------------- |
| 6.1 | Unit tests for services                 | [x]  | ProductsService, OrdersService, AuthService — 10 tests passing |
| 6.2 | Unit tests for controllers              |      |                                                                |
| 6.3 | Unit tests for guards / pipes / filters |      |                                                                |
| 6.4 | E2E tests for auth endpoints            |      |                                                                |
| 6.5 | E2E tests for CRUD endpoints            |      |                                                                |

### Phase 7 — Production Patterns (completed)

| #    | Task                                                                                    | Done | Notes                                                                                                                                                                                               |
| ---- | --------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1  | Event Listeners — `@OnEvent()` for `order.created` and `payment.processed`              | [x]  | Migrated from EventEmitter to BullMQ; `OrderEventsProcessor` (@Processor) handles `order.created`, `order.failed`, `payment.processed` with retry                                                   |
| 7.2  | Caching — `CacheInterceptor` on Products GET, env-driven TTL, invalidation on mutations | [x]  | `@UseInterceptors(CacheInterceptor)` on `GET /products` only; TTL from `CACHE_TTL` env (default 60s); `cacheManager.clear()` on create/update/delete                                                |
| 7.3  | Serialization — `@Expose()` computed properties on entities                             | [x]  | `inStock` and `formattedPrice` getters on Product entity exposed via `@Expose()`; `ClassSerializerInterceptor` global                                                                               |
| 7.4  | Configuration — Multi-env factories, auto-generated secrets                             | [x]  | `.env.development` / `.env.production` / `.env.test`; `cacheConfig` factory with env-aware store selection; `authConfig` auto-generates `jwtRefreshSecret` via `randomBytes` if env var missing     |
| 7.5  | DI Internals — Custom factory/value providers, REQUEST scope, injection tokens          | [x]  | `REQUEST_ID_TOKEN` factory (`() => randomUUID()`), `APP_VERSION_TOKEN` value provider; `LoggingInterceptor` injects the factory; `authConfig.KEY` injected in `AuthService`                         |
| 7.6  | Dynamic Modules                                                                         | [x]  | `NotificationsModule` uses `ConfigurableModuleClass` with `.register()` pattern; `MODULE_OPTIONS_TOKEN` re-exported for consumer use                                                                |
| 7.7  | Advanced TypeORM — Transactions, subscribers, locking, soft deletes                     | [x]  | Transactions using QueryRunner in OrdersService, ProductSubscriber for stock changes, @VersionColumn & @DeleteDateColumn in Product, fully migrated                                                 |
| 7.8  | Advanced Auth — Refresh tokens, env-configurable expiries                               | [x]  | `POST /auth/refresh` with JWT refresh token; `JWT_ACCESS_EXPIRES_IN` (15m default) and `JWT_REFRESH_EXPIRES_IN` (7d default) from env; `authConfig` injected instead of `process.env`               |
| 7.9  | Background Jobs — BullMQ queue for order events                                         | [x]  | BullMQ (`@nestjs/bullmq`) replaces EventEmitter; `ORDER_QUEUE` used by `OrdersService` + `PaymentsService` as producers; `OrderEventsProcessor` is the worker with `@OnWorkerEvent` lifecycle hooks |
| 7.10 | Performance — Compression, helmet, slow-request profiling                               | [x]  | `compression()` + `helmet()` middleware in `main.ts`; `PerformanceInterceptor` warns on requests >1s                                                                                                |
| 7.11 | Testing — Unit tests for services, updated e2e scaffold                                 | [x]  | 20 unit tests across Auth, Products, Orders, Payments, Notifications services; e2e test updated for health endpoint shape                                                                           |

### Phase 8 — Platform Integration (real-world additions, naturally coupled)

These features integrate directly into the existing project — they extend current modules rather than living in isolation.

| #   | Task                                                                                                                                                | Why it fits here                                                                          | Impact         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------- |
| 8.1 | **Async Local Storage** — Replace `x-request-id` header propagation with `AsyncLocalStorage` for per-request context                                | Fixes the fragile header-based approach in `LoggingInterceptor` and `AllExceptionsFilter` | Cross-cutting  |
| 8.2 | **Lifecycle Hooks** — `OnModuleInit` to connect Redis/BullMQ, `OnApplicationBootstrap` to warm cache, `OnApplicationShutdown` for graceful teardown | Real production startup/shutdown logic                                                    | Infrastructure |
| 8.3 | **Terminus Health Checks** — Replace custom `GET /health/ready` with `@nestjs/terminus` health checks for DB + Redis                                | Standard probes for K8s/Docker orchestration                                              | Infrastructure |
| 8.4 | **WebSockets** — Emit order status changes from orders flow, push real-time updates to connected clients via WebSocket gateway                      | Orders already emit BullMQ events — WebSocket is the natural consumer, eliminates polling | Feature        |

### Phase 9 — CQRS & Event Sourcing (completed)

A parallel order module implementing CQRS with `@nestjs/cqrs`, Event Sourcing via a Postgres event store, and a Saga orchestrator backed by BullMQ. Coexists alongside the traditional `orders/` module for direct comparison.

| #    | Task                                                                                          | Done | Notes                                                                                                                                                |
| ---- | --------------------------------------------------------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9.1  | Install `@nestjs/cqrs`                                                                        | [x]  | v11.0.3 installed                                                                                                                                    |
| 9.2  | Create Event Store — `StoredEvent` entity + `EventStoreService` + module                      | [x]  | Postgres `event_store` table with `(aggregate_id, version)` unique index; `ConflictException` on version collision                                   |
| 9.3  | Define domain events — `OrderCreated`, `StockDeducted`, `StockDeductionFailed`, etc.          | [x]  | 6 events implementing `IEvent`                                                                                                                       |
| 9.4  | Create `OrderAggregate` — extends `AggregateRoot` with `apply()` + state mutation             | [x]  | Demonstrates the aggregate pattern even though event-store persists outside the aggregate                                                            |
| 9.5  | Implement Commands + Handlers — `CreateOrder`, `DeductStock`, `ChargePayment`, `RestoreStock` | [x]  | Each handler persists to event store + publishes via `EventBus`; `DeductStock` uses TypeORM transactions; `ChargePayment` simulates 70% success rate |
| 9.6  | Implement Saga orchestrator — `@Saga()` + RxJS `ofType()` → BullMQ dispatch                   | [x]  | Stateless saga — `tap()` pushes durable BullMQ jobs; `filter(() => false)` prevents in-memory command execution                                      |
| 9.7  | Create BullMQ Processors — workers on existing `orders` queue                                 | [x]  | `DeductStockProcessor`, `ChargePaymentProcessor`, `RestoreStockProcessor` share the existing `orders` queue; each filters by job name                |
| 9.8  | Query reads from existing `orders` table (no separate read model)                             | [x]  | CQRS read side queries via `Repository<Order>.findOne()` — reuses the same table as the traditional module; no separate projection maintained        |
| 9.9  | Create Query Handler — `GetOrderQuery`                                                        | [x]  | `@QueryHandler(GetOrderQuery)` → `Repository<Order>.findOne({ relations: { items: true }})`                                                          |
| 9.10 | Create Controller + Module — `@Controller('orders-cqrs')` with 3 endpoints                    | [x]  | `POST /orders-cqrs`, `GET /orders-cqrs/:id`, `GET /orders-cqrs/:id/history` (event replay)                                                           |
| 9.11 | Build passes with 0 lint errors                                                               | [x]  | All `@typescript-eslint/no-unsafe-*` and `no-floating-promises` resolved; Prettier formatting enforced                                               |

## API Endpoints

### Auth

```
POST /auth/register    # Create account (role defaults to 'user')  ✅
POST /auth/login       # Returns JWT token                         ✅
GET  /auth/profile     # Get current user profile (authenticated)  ✅
```

### Products

```
GET    /products       # List products (public, with pagination/filtering/sorting)  ✅
POST   /products       # Create product (admin only)                               ✅
GET    /products/:id   # Get single product                                        ✅
PATCH  /products/:id   # Update product (admin only)                               ✅
DELETE /products/:id   # Delete product (admin only)                               ✅
```

### Orders

```
POST   /orders         # Create order (authenticated)                         ✅
GET    /orders         # List user's orders (authenticated, with pagination)  ✅
GET    /orders/:id     # Get order detail (owner or admin)                    ✅
PATCH  /orders/:id/status  # Update order status (admin only)                ✅
```

### Orders CQRS (learning — side-by-side with traditional orders)

```
POST   /orders-cqrs               # Create order via CQRS (authenticated)         ✅
GET    /orders-cqrs/:id            # Get order from read model projection          ✅
GET    /orders-cqrs/:id/history    # Reconstruct order state from event store replay  ✅
```

### Payments

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

- Products module with full CRUD (entity, repository, service, controller)
- Typed ConfigModule with env file + Joi validation
- DatabaseModule with async TypeORM connection (PostgreSQL) and migration data source
- `User` entity with `UserRole` enum, `@Exclude()` on password
- `UserRepository` extends `Repository<User>` (repository pattern)
- `UsersService` implements `IUsersService` interface, injected via `USERS_SERVICE_TOKEN`
- Auth module with register, login, JWT strategy, profile, explicit response DTOs
- Common: `@CurrentUser()`, `RolesGuard`, `@Roles()`, `AllExceptionsFilter`, `LoggingInterceptor`, `ClassSerializerInterceptor`, `ParseUUIDPipe`
- CommonModule registers global filter/interceptors with Nest DI (`APP_FILTER`, `APP_INTERCEPTOR`)
- Global `ValidationPipe` (whitelist + transform)
- Global `ClassSerializerInterceptor` (auto-strips `@Exclude()` fields)
- Swagger at `http://localhost:3000/api/docs` with bearer auth
- `REGEX.PASSWORD` constant for reusable password validation
- Seed script using `NestFactory.createApplicationContext`
- All lint rules passing (no `any`, no unused imports, promises handled)

### Completed recently:

- CQRS + Event Sourcing module (`orders-cqrs/`) — parallel order API using `@nestjs/cqrs`, event store, saga orchestration with BullMQ-backed durability, and read model projection
  - `POST /orders-cqrs` — CreateOrder command with aggregate + event store persistence
  - `@Saga()` orchestrator routes events to BullMQ jobs for crash-safe step chaining
  - `DeductStockProcessor`, `ChargePaymentProcessor`, `RestoreStockProcessor` workers
  - `OrderViewProjection` event handler updates denormalized read model
  - `GET /orders-cqrs/:id/history` — event replay endpoint (the ES payoff)

## How to Use This Document

- **Starting fresh**: Pick the first unchecked task from Phase 1.
- **Continuing work**: Check `Done` column to find the next task.
- **Each agent**: Update this file after completing a task — mark it `[x]` and optionally add notes.
- **Swagger**: Every controller needs `@ApiTags()`, every endpoint needs `@ApiOperation()`, authenticated endpoints need `@ApiBearerAuth()`.
- **DTOs**: Every DTO property needs `@ApiProperty({ example: '...' })`.
- **Password validation**: Use `REGEX.PASSWORD` from `common/constants/regex.constant.ts` — never inline the regex.
- **If you get stuck**: Add a note in the Notes column and move to the next task.

### New Module Checklist (mandatory)

Before writing any new module, re-read the `users/` module as the reference. Every feature module must follow this exact pattern:

1. **Entity** → `entities/feature.entity.ts` — TypeORM columns, no sensitive fields exposed
2. **Repository** → `feature.repository.ts` — extends `Repository<Entity>`, injects `DataSource`
3. **Interface + Token** → `interfaces/feature-service.interface.ts` — exports `IFeatureService` + `FEATURE_SERVICE_TOKEN`
4. **Service** → `feature.service.ts` — `implements IFeatureService`, injects repository
5. **Module** → `feature.module.ts` — provider uses `{ provide: TOKEN, useClass: Service }` + repository; no duplicate class provider; exports only the token
6. **Controller** → `feature.controller.ts` — injects via `@Inject(TOKEN) private readonly service: IFeatureService`; use `import type` for the interface
7. **DTOs** → `dto/create.dto.ts`, `dto/update.dto.ts` — validation + `@ApiProperty()` on every field
8. **Migration** → run `pnpm migration:generate src/database/migrations/CreateName` after creating entities, then verify the generated file

---## Commands

```bash
pnpm run dev          # development with watch
pnpm run debug        # debug with watch
pnpm run prod         # production (runs compiled dist/main)
pnpm run seed         # seed DB with admin + user accounts
pnpm migration:generate src/database/migrations/CreateName
pnpm migration:create src/database/migrations/CreateName
pnpm migration:run    # run pending migrations
pnpm migration:revert # revert last migration
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
