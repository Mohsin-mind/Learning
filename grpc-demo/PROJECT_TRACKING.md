# gRPC Learning Demo

Learn all 4 gRPC call patterns (unary, server streaming, client streaming, bidirectional) with NestJS.

## Project Structure

```
grpc-demo/
├── apps/
│   ├── api-gateway/      # REST gateway — trigger via curl/Postman (port 3001)
│   │   └── src/
│   │       ├── images/           # Images module (gRPC client + REST controller)
│   │       └── scripts/          # Standalone cli scripts for client/bidir streaming
│   └── image-service/    # gRPC microservice — does the actual work (port 5000)
│       └── src/
│           └── image.controller.ts  # All 4 gRPC method handlers
├── proto/
│   └── image.proto       # Shared contract between both apps
├── PROJECT_TRACKING.md   # This file
├── nest-cli.json         # Monorepo config
├── package.json
└── tsconfig.json
```

## Phases & Checklist

| #   | Task                                                              | Done | Notes |
| --- | ----------------------------------------------------------------- | ---- | ----- |
| 1   | Scaffold Nest monorepo + proto + wire `Transport.GRPC`            | [x]  | 2 apps: api-gateway (3001), image-service (5000) |
| 2   | Unary — `GetImageMetadata` REST → gRPC                           | [x]  | `GET /images/:id/metadata` proxies via `ClientGrpc` |
| 3   | Server streaming — `ProcessImageWithProgress` + SSE bridge        | [x]  | `@Sse()` bridges gRPC Observable → SSE stream |
| 4   | Client streaming — `UploadImageChunks` standalone script          | [x]  | @GrpcStreamMethod with raw `call.on('end')` |
| 5   | Bidirectional — `LiveImageEditSession` standalone script          | [x]  | Subject/Observable pattern, duplex stream |

## 4 gRPC Patterns at a Glance

| Pattern | RPC | Client → Server | Server → Client | Decorator |
|---|---|---|---|---|
| **Unary** | `GetImageMetadata` | single request | single response | `@GrpcMethod()` |
| **Server streaming** | `ProcessImageWithProgress` | single request | stream of responses | `@GrpcMethod()` returning `Observable` |
| **Client streaming** | `UploadImageChunks` | stream of requests | single response | `@GrpcStreamMethod()` + `call.on('end')` |
| **Bidirectional** | `LiveImageEditSession` | stream of requests | stream of responses | `@GrpcStreamMethod()` returning `Subject` |

## How to Start

Both services must be running for the gateway to work.

### Terminal 1 — gRPC image-service:

```bash
cd ../grpc-demo
pnpm dev:image
```

Or in production mode:

```bash
pnpm start:image-service
```

### Terminal 2 — REST api-gateway:

```bash
cd ../grpc-demo
pnpm dev:api
```

Or start both at once (concurrent):

```bash
pnpm dev
```

### Quick sanity check

```bash
grpcurl -plaintext -import-path proto -proto proto/image.proto localhost:5000 list
# Should show: image.ImageService
```

## API Endpoints

### Unary — Get Image Metadata

```
GET http://localhost:3001/images/:id/metadata
```

**curl:**

```bash
curl http://localhost:3001/images/abc123/metadata
```

**Response:**

```json
{
  "fileName": "file-abc123.jpg",
  "sizeBytes": { "low": 1024000, "high": 0, "unsigned": false },
  "format": "jpeg"
}
```

### Server streaming — Image Processing Progress

```
GET http://localhost:3001/images/:id/progress
```

**curl (SSE stream):**

```bash
curl -N http://localhost:3001/images/img1/progress
```

**Output (streaming, 1.5s between each):**

```
event: message
id: 1
data: {"stage":"uploading","percent":25}

event: message
id: 2
data: {"stage":"resizing","percent":50}

event: message
id: 3
data: {"stage":"optimizing","percent":75}

event: message
id: 4
data: {"stage":"done","percent":100}
```

### grpcurl (direct to gRPC — bypasses api-gateway)

```bash
# List services
grpcurl -plaintext -import-path proto -proto proto/image.proto localhost:5000 list

# Unary
grpcurl -plaintext -import-path proto -proto proto/image.proto \
  -d '{"fileId":"abc123"}' localhost:5000 image.ImageService/GetImageMetadata

# Server streaming
grpcurl -plaintext -import-path proto -proto proto/image.proto \
  -d '{"fileId":"img1"}' localhost:5000 image.ImageService/ProcessImageWithProgress

# Client streaming
grpcurl -plaintext -import-path proto -proto proto/image.proto \
  -d '{"fileId":"test","data":"","chunkIndex":0}' localhost:5000 image.ImageService/UploadImageChunks
```

## Standalone Scripts

These scripts run from `apps/api-gateway/src/scripts/` and connect directly to the gRPC service using `@grpc/grpc-js`.

### Client streaming — Upload chunks

```bash
pnpm upload:script
# or with custom file and fileId:
npx ts-node -r tsconfig-paths/register apps/api-gateway/src/scripts/upload-chunks.ts /path/to/file my-file-id
```

Reads a file, splits it into 64-byte chunks, streams them to `image-service`, logs the result.

### Bidirectional — Live edit session

```bash
pnpm bidir:script
# or with custom fileId:
npx ts-node -r tsconfig-paths/register apps/api-gateway/src/scripts/live-edit-session.ts my-image
```

Sends 6 filter commands (grayscale, sepia, blur, sharpen, vintage, invert) 800ms apart. Server responds to each with a preview status.

## Commands

```bash
pnpm dev            # start both apps with watch mode
pnpm dev:api        # start api-gateway only (port 3001)
pnpm dev:image      # start image-service only (port 5000)
pnpm build          # compile both apps
pnpm upload:script  # run client-streaming demo
pnpm bidir:script   # run bidirectional streaming demo
pnpm test           # unit tests
pnpm test:e2e       # e2e tests
pnpm lint           # lint
```

## How SSE Bridging Works

```
Client (curl -N)          api-gateway (NestJS)          image-service (gRPC)
     │                         │                              │
     │  GET /images/id/progress │                              │
     │────────────────────────►│                              │
     │                         │  ProcessImageWithProgress()   │
     │                         │─────────────────────────────►│
     │                         │                              │
     │                         │  ◄── streaming Observable ── │
     │                         │      (1.5s intervals)        │
     │  event: message         │                              │
     │  data: {stage,percent}  │                              │
     │◄────────────────────────│                              │
     │  event: message         │                              │
     │  data: {stage,percent}  │                              │
     │◄────────────────────────│                              │
     │    ...                  │                              │
```

The `@Sse()` decorator subscribes to the gRPC Observable and wraps each emission as a Server-Sent Event. When the Observable completes, the SSE stream closes. If the client disconnects, NestJS auto-unsubscribes.

## Commands (from project root)

```bash
# Development (from ecommerce-backend/)
pnpm run dev          # REST API on port 3000

# gRPC demo (from grpc-demo/)
cd ../grpc-demo
pnpm dev              # api-gateway on 3001 + image-service on 5000
```
