/**
 * OpenTelemetry tracing bootstrap for Grafana Cloud.
 *
 * This file is loaded via NODE_OPTIONS --require BEFORE the NestJS application
 * starts, so all imports must resolve without the NestJS container.
 *
 * Following the pattern recommended by Grafana Cloud AI:
 *   - Use @opentelemetry/exporter-trace-otlp-http  (JSON/HTTP, not protobuf)
 *   - Construct the Authorization header with Buffer.from() in code —
 *     no env-var parsing that could break on base64 '=' padding
 */

import { config } from 'dotenv';
import { resolve } from 'node:path';

// Load .env.development (or .env.production etc.) BEFORE reading any OTEL vars.
const nodeEnv = process.env.NODE_ENV || 'development';
config({ path: resolve(process.cwd(), `.env.${nodeEnv}`) });

import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const PREFIX = '[OpenTelemetry]';

// ── Required config ────────────────────────────────────────────────────────────
// Find these in Grafana Cloud Portal → Your Stack → OpenTelemetry (or Tempo → Details)
const instanceId = process.env.GRAFANA_INSTANCE_ID; // numeric, e.g. "1726444"
const apiToken = process.env.GRAFANA_TOKEN; // glc_… token with Traces write scope
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT; // https://tempo-…/otlp/v1/traces
const serviceName = process.env.OTEL_SERVICE_NAME || 'ecommerce-backend';

if (!instanceId || !apiToken || !otlpEndpoint) {
  const missing = [
    !instanceId && 'GRAFANA_INSTANCE_ID',
    !apiToken && 'GRAFANA_TOKEN',
    !otlpEndpoint && 'OTEL_EXPORTER_OTLP_ENDPOINT',
  ]
    .filter(Boolean)
    .join(', ');
  console.warn(`${PREFIX} Tracing disabled — missing env vars: ${missing}`);
} else {
  // Build the full traces URL — Grafana Cloud OTLP gateway requires /otlp/v1/traces
  const tracesUrl = `${otlpEndpoint.replace(/\/$/, '').replace(/\/v1\/traces$/, '')}/v1/traces`;

  // Construct the Authorization header directly in code using Buffer.from().
  // This is the safest approach: no shell escaping, no env-var '=' splitting,
  // no base64 truncation — exactly as Grafana Cloud AI recommends.
  const authHeader = 'Basic ' + Buffer.from(`${instanceId}:${apiToken}`).toString('base64');

  console.log(`${PREFIX} endpoint  → ${tracesUrl}`);
  console.log(`${PREFIX} service   → ${serviceName}`);
  console.log(`${PREFIX} instance  → ${instanceId}`);

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
    traceExporter: new OTLPTraceExporter({
      url: tracesUrl,
      headers: {
        Authorization: authHeader,
      },
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable fs instrumentation — creates thousands of noisy low-value spans
        '@opentelemetry/instrumentation-fs': { enabled: false },

        // Only create pg/pg-pool spans when an HTTP span already exists as parent.
        // Without this, DB connection-pool initialization during app startup creates
        // orphan root spans — those become the "root" in Tempo instead of the HTTP span.
        '@opentelemetry/instrumentation-pg': { requireParentSpan: true },

        // Exclude the OTLP exporter's own HTTP calls from tracing — otherwise the
        // act of exporting spans would itself generate new spans (infinite loop).
        '@opentelemetry/instrumentation-http': {
          ignoreOutgoingRequestHook: (request) =>
            (request.hostname ?? '').includes('grafana.net'),
        },
      }),
    ],
  });

  try {
    sdk.start();
    console.log(`${PREFIX} SDK started — traces → Grafana Cloud (${tracesUrl})`);
  } catch (err) {
    console.error(`${PREFIX} SDK start failed`, err);
  }

  // Flush buffered spans before the process exits so no data is lost
  const shutdown = (signal: string) => () => {
    sdk
      .shutdown()
      .then(() => console.log(`${PREFIX} SDK shut down (${signal})`))
      .catch((err) => console.error(`${PREFIX} Shutdown error`, err));
  };
  process.on('SIGTERM', shutdown('SIGTERM'));
  process.on('SIGINT', shutdown('SIGINT'));
}
