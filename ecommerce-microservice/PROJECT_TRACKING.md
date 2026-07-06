# E-commerce Microservice (RabbitMQ)

## Objective

Build a minimal NestJS microservice system that communicates via RabbitMQ, separate from the existing `ecommerce-backend`. This project serves as a learning reference for event-driven architecture with RabbitMQ in NestJS — using a **true microservice topology** (two separate processes), not a single hybrid app.

## Tech Stack

| Layer            | Choice                              |
| ---------------- | ----------------------------------- |
| Runtime          | Node.js 22+ / TypeScript (strict)   |
| Framework        | NestJS 11                           |
| Package Manager  | pnpm                                |
| Transport        | RabbitMQ (AMQP) via @nestjs/microservices |
| Message Broker   | RabbitMQ (local install)            |
| Configuration    | @nestjs/config with registerAs + Joi |
| API Docs         | Swagger (OpenAPI) — optional        |
| Testing          | Jest (unit) + Supertest (e2e)       |

## Architecture

```
┌──────────────┐     ┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────────┐
│  HTTP Client │────▶│   Order Service      │────▶│      RabbitMQ       │────▶│   Inventory Service      │
│              │     │  (REST API)          │     │  (Exchange + Queue) │     │  (Microservice, RMQ only)│
│              │     │  Port 3000           │     │  order_events       │     │                          │
└──────────────┘     └──────────────────────┘     └──────────────────────┘     └──────────────────────────┘
```

Messages flow **unidirectionally** through RabbitMQ — the controller never talks to the consumer directly. The producer publishes events to the queue via `ClientProxy.emit()/send()`, and the consumer picks them up via `@EventPattern/@MessagePattern`.

Architecture: **NestJS monorepo** — two separate processes (order-service + inventory-service), sharing a `libs/common` library for config and constants.

## Project Structure

```
├── apps/
│   ├── order-service/         # HTTP server (port 3000)
│   │   └── src/
│   │       ├── main.ts             # Bootstrap — HTTP on 3000
│   │       ├── app.module.ts       # Root module imports OrderModule + SharedConfigModule
│   │       └── order/
│   │           ├── order.module.ts       # Registers RMQ ClientProxy via ClientProxyFactory
│   │           ├── order.controller.ts   # POST /orders/create, GET /:id/check-stock
│   │           └── order.service.ts      # publishOrderCreated (emit), checkStock (send)
│   │
│   ├── inventory-service/     # Pure RMQ microservice (no HTTP)
│   │   └── src/
│   │       ├── main.ts             # Bootstrap — connectMicroservice(Transport.RMQ)
│   │       ├── app.module.ts       # Root module imports InventoryModule + SharedConfigModule
│   │       └── inventory/
│   │           ├── inventory.module.ts   # Registers InventoryService as a controller
│   │           └── inventory.service.ts  # @EventPattern + @MessagePattern handlers
│   │
│   └── ... (dist/ after build)
│
├── libs/
│   └── common/                # Shared library
│       └── src/
│           ├── index.ts                        # Barrel exports
│           ├── config/
│           │   ├── config.module.ts            # SharedConfigModule with Joi validation
│           │   ├── app.config.ts               # APP config namespace
│           │   └── rabbitmq.config.ts          # RabbitMQ config namespace (registerAs)
│           └── constants/
│               └── app.constants.ts            # RMQ_PRODUCER_TOKEN, EVENTS enum
│
├── nest-cli.json              # Monorepo config — 3 projects: producer, consumer, common
├── tsconfig.json              # Root TS config with paths alias @app/common
└── PROJECT_TRACKING.md        # This file
```

## Architecture Patterns (from NestJS skill)

| Rule                          | Status | Notes                                                         |
| ----------------------------- | ------ | ------------------------------------------------------------- |
| `arch-feature-modules`        | ✅     | Organized by domain (order, inventory) in separate apps        |
| `di-use-interfaces-tokens`    | ✅     | `RMQ_CLIENT_TOKEN` for ClientProxy injection                   |
| `devops-use-config-module`    | ✅     | SharedConfigModule with typed namespaces + Joi validation     |
| `micro-use-patterns`          | ✅     | `@EventPattern` (fire-and-forget) + `@MessagePattern` (RPC)   |
| `micro-use-health-checks`     |        | Phase 4                                                        |
| `error-use-exception-filters` |        | Phase 4                                                        |
| `api-use-interceptors`        |        | Phase 4                                                        |
| `test-use-testing-module`     |        | Phase 5                                                        |

## Phases & Checklist

### Phase 1 — Project Setup & Scaffolding

| #   | Task                                            | Done | Notes                                                       |
| --- | ----------------------------------------------- | ---- | ----------------------------------------------------------- |
| 1.1 | Create project directory + package.json         | [x]  | pnpm, NestJS 11, TypeScript strict                          |
| 1.2 | Set up NestJS monorepo (apps + libs)            | [x]  | `nest new` with monorepo, `nest generate app` × 2          |
| 1.3 | Configure TypeScript + path aliases             | [x]  | `@app/common` -> `libs/common/src`, `module: commonjs`      |
| 1.4 | Set up ConfigModule + env validation            | [x]  | SharedConfigModule with Joi in `libs/common/src/config/`    |
| 1.5 | Create shared library `libs/common`             | [x]  | Config namespaces, constants, barrel export                 |
| 1.6 | Create PROJECT_TRACKING.md                      | [x]  | This file                                                   |
| 1.7 | Install dependencies + verify both apps build  | [x]  | `pnpm install && pnpm build` — order-service + inventory-service both pass |

### Phase 2 — RabbitMQ Integration

| #   | Task                                                    | Done | Notes                                                          |
| --- | ------------------------------------------------------- | ---- | -------------------------------------------------------------- |
| 2.1 | Create RabbitMQ config with typed namespace             | [x]  | `rabbitmq.config.ts` in `@app/common/config`                   |
| 2.2 | Create Producer module + ClientProxy via DI             | [x]  | `ClientProxyFactory` with `ConfigService` injection            |
| 2.3 | Create Producer controller + service                    | [x]  | `POST /orders/create` (emit), `POST /:id/check-stock` (send)  |
| 2.4 | Create Consumer module + handlers                       | [x]  | `@EventPattern` + `@MessagePattern`, `@Controller()` for scan |
| 2.5 | Wire consumer as standalone microservice                | [x]  | Consumer `main.ts` uses `app.connectMicroservice(Transport.RMQ)` |
| 2.6 | Wire order-service as standalone HTTP server             | [x]  | Order-service `main.ts` — pure HTTP, no microservice connection |
| 2.7 | Test event flow end-to-end with RabbitMQ                |      | Start RMQ + both apps, publish event, verify consume          |

### Phase 3 — Business Logic

| #   | Task                                                | Done | Notes |
| --- | --------------------------------------------------- | ---- | ----- |
| 3.1 | Add DTOs with class-validator                       |      |       |
| 3.2 | Define typed event contracts (interfaces)           | [x]  | `CreateOrderDto`, `CheckStockDto`, `StockResult` in producer |
| 3.3 | Implement stock reservation on order.created        | [x]  | In-memory stock map with basic deduction in consumer         |
| 3.4 | Implement stock check via request-response pattern  | [x]  | `@MessagePattern('check_stock')` returns `{ stockAvailable }`|
| 3.5 | Handle insufficient stock (reject / compensate)     |      |       |
| 3.6 | Add manual ack / nack for reliable delivery         |      |       |

### Phase 4 — Production Patterns

| #   | Task                                            | Done | Notes |
| --- | ----------------------------------------------- | ---- | ----- |
| 4.1 | Add global exception filter                     |      |       |
| 4.2 | Add logging interceptor                         |      |       |
| 4.3 | Add Terminus health check                       |      |       |
| 4.4 | Add graceful shutdown handlers                  |      |       |
| 4.5 | Add Swagger / OpenAPI docs                      |      |       |
| 4.6 | Add retry + dead-letter queue configuration     |      |       |

### Phase 5 — Testing

| #   | Task                                            | Done | Notes |
| --- | ----------------------------------------------- | ---- | ----- |
| 5.1 | Unit tests for ProducerService                  |      |       |
| 5.2 | Unit tests for ConsumerService                  |      |       |
| 5.3 | Integration test with RabbitMQ test container   |      |       |
| 5.4 | E2E test for HTTP endpoints                     |      |       |

## Running the Project

```bash
# 1. Start RabbitMQ (local install)
echo "mind" | sudo -S systemctl start rabbitmq-server

# 2. Install dependencies
pnpm install

# 3. Start both apps in dev mode (two terminals)
pnpm run dev:inventory-service   # Terminal 1 — watches + restarts inventory-service on changes
pnpm run dev:order-service       # Terminal 2 — watches + restarts order-service on changes

# 4. Publish a test event
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ord-001",
    "userId": "usr-1",
    "total": 59.99,
    "items": [
      { "productId": "prod-1", "quantity": 2, "price": 19.99 },
      { "productId": "prod-2", "quantity": 1, "price": 20.01 }
    ],
    "timestamp": "2026-07-06T12:00:00Z"
  }'

# 5. Check stock (RPC pattern)
curl http://localhost:3000/api/orders/ord-001/check-stock

# 6. Verify in RabbitMQ UI
open http://localhost:15672  # user / password
```

## Commands

```bash
pnpm run dev:order-service       # development with watch (order-service)
pnpm run dev:inventory-service   # development with watch (inventory-service)
pnpm run debug:order-service     # debug with watch (order-service)
pnpm run debug:inventory-service # debug with watch (inventory-service)
pnpm run build:order-service     # compile order-service
pnpm run build:inventory-service # compile inventory-service
pnpm run build                   # compile all projects
pnpm run test                    # unit tests
pnpm run test:e2e                # e2e tests
```

## RabbitMQ Management UI

- URL: http://localhost:15672
- Username: `user`
- Password: `password`

## Key Learnings

| Lesson | Description |
| ------ | ----------- |
| **`@Controller()` required for handlers** | NestJS only scans `controllers` (not all `providers`) for `@EventPattern`/`@MessagePattern` — discovered by reading NestJS source (`listeners-controller.js`, `microservices-module.js`) |
| **`ClientProxyFactory` over `ClientsModule.register`** | Using `ClientProxyFactory` with `ConfigService` injection avoids calling `registerAs` at module load time, keeping config within DI lifecycle |
| **`moduleResolution: "node"` + extensionless imports** | NestJS monorepo uses webpack which handles `.ts` resolution; `moduleResolution: "bundler"` caused build failures with the default webpack config — `"node"` works reliably |
| **Domain naming over technical roles** | `producer`/`consumer` describe infrastructure; `order-service`/`inventory-service` describe business domain — the latter scales naturally when adding more services |
| **Stale scaffold files cause resolution errors** | `nest generate app` creates a `src/<app-name>.module.ts` that must be deleted when organizing into subdirectories — otherwise TypeScript resolves the wrong copy |
