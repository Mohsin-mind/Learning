# E-commerce Order Management API

A production-grade NestJS API built to learn the framework's core and advanced features.

## Project Structure

```
src/
│
├── main.ts                     # Entry point — bootstrap, swagger, global pipes/filters/interceptors
├── app.module.ts               # Root module
│
├── auth/                       # Authentication module
│   ├── auth.module.ts
│   ├── auth.controller.ts      # POST /auth/register, /auth/login, GET /auth/profile
│   ├── auth.service.ts         # Register, login, JWT generation
│   ├── strategies/
│   │   └── jwt.strategy.ts     # Passport JWT strategy
│   └── dto/
│       ├── auth-response.dto.ts
│       ├── register.dto.ts     # Register input — email, password (REGEX.PASSWORD), name
│       └── login.dto.ts        # Login input — email, password
│
├── users/                      # Users module
│   ├── users.module.ts         # Exports USERS_SERVICE_TOKEN
│   ├── users.controller.ts
│   ├── users.service.ts        # Implements IUsersService, uses UserRepository
│   ├── user.repository.ts      # Extends Repository<User> — repository pattern
│   ├── entities/
│   │   └── user.entity.ts      # User entity — id, email, password (@Exclude), name, role
│   ├── dto/
│   │   └── user-response.dto.ts
│   └── interfaces/
│       └── users-service.interface.ts  # IUsersService + USERS_SERVICE_TOKEN
│
├── common/                     # Shared cross-cutting code
│   ├── common.module.ts
│   ├── constants/
│   │   └── regex.constant.ts   # REGEX.PASSWORD — reusable password validation
│   ├── decorators/
│   │   ├── current-user.decorator.ts   # @CurrentUser()
│   │   └── roles.decorator.ts          # @Roles()
│   ├── filters/
│   │   └── all-exceptions.filter.ts    # Catch-all global exception filter
│   ├── guards/
│   │   └── roles.guard.ts              # RolesGuard — checks user.role
│   ├── interceptors/
│   │   ├── logging.interceptor.ts      # Request logging interceptor
│   │   └── response-transform.interceptor.ts  # Wraps responses in { success, data, timestamp }
│   └── pipes/
│       └── parse-id.pipe.ts            # ParseUUIDPipe
│
├── config/                     # Configuration
│   ├── app.config.ts
│   ├── auth.config.ts
│   ├── config.module.ts        # Global ConfigModule
│   ├── config.validation.ts    # Joi env validation schema
│   └── database.config.ts
│
├── database/                   # Database infrastructure
│   ├── data-source.ts          # TypeORM CLI migrations data source
│   ├── database.module.ts      # Async TypeORM connection
│   ├── migrations/
│   └── seeds/
│       ├── seed.ts             # Entry point — NestFactory.createApplicationContext
│       └── user.seed.ts        # Seeds admin + user accounts
│
├── products/                   # Product module (pending)
├── health/                     # Health checks (GET /, /health/live, /health/ready)
├── orders/                     # Order module (pending)
├── payments/                   # Payment module (pending)
└── files/                      # File upload module (pending)
```

## Architecture

### Application Startup

```
main.ts
  │
  ▼
AppModule
  │
  ▼
Modules Registered (ConfigModule, DatabaseModule, AuthModule, UsersModule, CommonModule)
```

### Request Lifecycle

```
HTTP Request
     │
     ▼
┌──────────────────────────────────────────────────┐
│ Guards                                            │
│ JwtAuthGuard (authenticate) → RolesGuard (roles)  │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│ Pipes                                             │
│ ValidationPipe (global) → ParseUUIDPipe (params)  │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│ Controller                                        │
│ AuthController │ UsersController │ ...             │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│ Service (via interface tokens)                    │
│ AuthService → @Inject(USERS_SERVICE_TOKEN)        │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│ Repository                                        │
│ UserRepository extends Repository<User>            │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │   PostgreSQL    │
              └───────┬────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│ Interceptors (DI-managed global providers)        │
│ LoggingInterceptor │ ResponseTransformInterceptor  │
│ ClassSerializerInterceptor                        │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│ Exception Filter (only on error)                  │
│ AllExceptionsFilter                               │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
HTTP Response
```

## NestJS Features Used

- Modules
- Controllers
- Services
- Dependency Injection (constructor injection)
- DTOs
- Validation Pipes (global ValidationPipe)
- Custom Pipes (ParseUUIDPipe)
- Guards (JWT Guard via Passport, RolesGuard)
- Custom Decorators (@CurrentUser())
- Interceptors (LoggingInterceptor, ResponseTransformInterceptor, ClassSerializerInterceptor)
- Exception Filters (AllExceptionsFilter)
- ConfigModule (@nestjs/config + Joi)
- TypeORM (DatabaseModule, migrations, Repository pattern)
- Authentication (JWT + PassportStrategy)
- Authorization (RolesGuard + @Roles() + UserRole enum)
- Swagger (@nestjs/swagger, DocumentBuilder)
- Custom Providers (USERS_SERVICE_TOKEN)
- Standalone Application (NestFactory.createApplicationContext for seeding)

## Scripts

| Command                                                         | Description                            |
| --------------------------------------------------------------- | -------------------------------------- |
| `pnpm run dev`                                                  | Development with watch                 |
| `pnpm run debug`                                                | Debug with watch                       |
| `pnpm run prod`                                                 | Production (runs compiled dist/main)   |
| `pnpm run seed`                                                 | Seed DB with admin + user accounts     |
| `pnpm migration:generate -- src/database/migrations/CreateName` | Generate migration from entity changes |
| `pnpm migration:create -- src/database/migrations/CreateName`   | Create empty migration                 |
| `pnpm migration:run`                                            | Run pending migrations                 |
| `pnpm migration:revert`                                         | Revert last migration                  |
| `pnpm run test`                                                 | Unit tests                             |
| `pnpm run test:e2e`                                             | E2E tests                              |
| `pnpm run lint`                                                 | Lint                                   |
| `pnpm run build`                                                | Type-check + compile                   |

## Seed Credentials

```
Admin: admin@mailinator.com / Admin@123
User:  user@mailinator.com / User@123
```

## Swagger

```
http://localhost:3000/api/docs
```

## API Endpoints

| Method | Path                    | Description                        |
| ------ | ----------------------- | ---------------------------------- |
| GET    | `/`                     | Health check                       |
| GET    | `/health/live`          | Liveness check                     |
| GET    | `/health/ready`         | Readiness check with database ping |
| POST   | `/api/v1/auth/register` | Create account                     |
| POST   | `/api/v1/auth/login`    | Login, returns JWT                 |
| GET    | `/api/v1/auth/profile`  | Current user profile (auth)        |

## Progress Tracking

See `PROJECT_TRACKING.md` for detailed feature checklist and current status.
