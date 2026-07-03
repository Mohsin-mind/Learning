import { Controller } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable, interval, map, take, Subject } from 'rxjs';

@Controller()
export class ImageController {
  @GrpcMethod('ImageService', 'GetImageMetadata')
  getImageMetadata(data: { fileId: string }): {
    fileName: string;
    sizeBytes: number;
    format: string;
  } {
    console.log('[image-service] GetImageMetadata called with:', data);
    return {
      fileName: `file-${data.fileId}.jpg`,
      sizeBytes: 1024000,
      format: 'jpeg',
    };
  }

  @GrpcMethod('ImageService', 'ProcessImageWithProgress')
  processImageWithProgress(data: { fileId: string }): Observable<{ stage: string; percent: number }> {
    console.log('[image-service] ProcessImageWithProgress called with:', data);
    const stages = ['uploading', 'resizing', 'optimizing', 'done'];
    return interval(1500).pipe(
      take(stages.length),
      map((i) => {
        const update = { stage: stages[i], percent: (i + 1) * 25 };
        console.log('[image-service] emitting progress:', update);
        return update;
      }),
    );
  }

  @GrpcStreamMethod('ImageService', 'UploadImageChunks')
  uploadImageChunks(
    chunks$: Observable<{ fileId: string; data: Buffer; chunkIndex: number }>,
    _metadata: any,
    call: any,
  ): Promise<{ fileId: string; totalBytes: number }> {
    console.log('[image-service] UploadImageChunks stream started');

    return new Promise((resolve) => {
      let totalBytes = 0;
      let fileId = '';

      chunks$.subscribe({
        next: (chunk) => {
          fileId = chunk.fileId;
          totalBytes += Buffer.byteLength(chunk.data as any);
          console.log(`[image-service] received chunk ${chunk.chunkIndex}: ${Buffer.byteLength(chunk.data as any)} bytes (total: ${totalBytes})`);
        },
        error: (err) => {
          console.error('[image-service] stream error:', err);
        },
      });

      call.on('end', () => {
        console.log(`[image-service] upload complete: ${totalBytes} total bytes for ${fileId}`);
        resolve({ fileId, totalBytes });
      });
    });
  }

  @GrpcStreamMethod('ImageService', 'LiveImageEditSession')
  liveImageEditSession(
    filterRequests$: Observable<{ fileId: string; filter: string }>,
  ): Observable<{ previewStatus: string }> {
    console.log('[image-service] LiveImageEditSession started');

    const response$ = new Subject<{ previewStatus: string }>();

    filterRequests$.subscribe({
      next: (req) => {
        console.log(`[image-service] received filter request: ${req.filter}`);
        const status = `Applied filter "${req.filter}" to ${req.fileId}`;
        console.log(`[image-service] sending preview: ${status}`);
        response$.next({ previewStatus: status });
      },
      error: (err) => {
        console.error('[image-service] bidir stream error:', err);
        response$.error(err);
      },
      complete: () => {
        console.log('[image-service] bidir stream complete');
        response$.complete();
      },
    });

    return response$.asObservable();
  }
}
