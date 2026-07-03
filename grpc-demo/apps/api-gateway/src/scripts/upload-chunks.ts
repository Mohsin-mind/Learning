import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import * as fs from 'fs';

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
  const filePath = process.argv[2] || PROTO_PATH;
  const fileId = process.argv[3] || 'upload-test-file';
  const chunkSize = 64;

  console.log(`[upload-script] file: ${filePath}, fileId: ${fileId}, chunkSize: ${chunkSize}`);

  const fileBuffer = fs.readFileSync(filePath);
  const totalSize = fileBuffer.length;
  console.log(`[upload-script] file size: ${totalSize} bytes`);

  const client = new imageProto.image.ImageService(
    '0.0.0.0:5000',
    grpc.credentials.createInsecure(),
  );

  const call = client.UploadImageChunks(
    (error: any, response: any) => {
      if (error) {
        console.error('[upload-script] error:', error);
        return;
      }
      console.log('[upload-script] upload result:', response);
      client.close();
    },
  );

  let offset = 0;
  let index = 0;
  while (offset < totalSize) {
    const end = Math.min(offset + chunkSize, totalSize);
    const chunk = {
      fileId,
      data: fileBuffer.slice(offset, end),
      chunkIndex: index,
    };
    console.log(`[upload-script] sending chunk ${index}: ${chunk.data.length} bytes (offset ${offset})`);
    call.write(chunk);
    offset = end;
    index++;
    await new Promise((r) => setTimeout(r, 100));
  }

  call.end();
  console.log('[upload-script] all chunks sent, waiting for response...');
}

main().catch((err) => {
  console.error('[upload-script] error:', err);
  process.exit(1);
});
