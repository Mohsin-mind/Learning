import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

const PROTO_PATH = join(process.cwd(), 'proto/image.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: Number,
  enums: String,
  defaults: true,
  oneofs: true,
});

const imageProto = grpc.loadPackageDefinition(packageDefinition) as any;

async function main() {
  const fileId = process.argv[2] || 'demo-image';
  const filters = ['grayscale', 'sepia', 'blur', 'sharpen', 'vintage', 'invert'];

  console.log(`[bidir-script] starting LiveImageEditSession for ${fileId}`);
  console.log(`[bidir-script] filters to apply: ${filters.join(', ')}`);

  const client = new imageProto.image.ImageService(
    '0.0.0.0:5000',
    grpc.credentials.createInsecure(),
  );

  const call = client.LiveImageEditSession();

  call.on('data', (response: { previewStatus: string }) => {
    console.log(`[bidir-script] server: ${response.previewStatus}`);
  });

  call.on('end', () => {
    console.log('[bidir-script] server stream ended');
    client.close();
  });

  call.on('error', (err: Error) => {
    console.error('[bidir-script] error:', err);
  });

  call.on('status', (status: grpc.StatusObject) => {
    console.log('[bidir-script] final status:', status.code, status.details);
  });

  for (const filter of filters) {
    console.log(`[bidir-script] sending filter: ${filter}`);
    call.write({ fileId, filter });
    await new Promise((r) => setTimeout(r, 800));
  }

  call.end();
  console.log('[bidir-script] all filters sent, waiting for server to finish...');
}

main().catch((err) => {
  console.error('[bidir-script] error:', err);
  process.exit(1);
});
