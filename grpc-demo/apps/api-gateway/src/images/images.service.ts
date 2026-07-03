import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';

export interface ImageMetadata {
  fileName: string;
  sizeBytes: number;
  format: string;
}

export interface ProgressUpdate {
  stage: string;
  percent: number;
}

interface ImageServiceGrpc {
  getImageMetadata(data: { fileId: string }): Observable<ImageMetadata>;
  processImageWithProgress(data: { fileId: string }): Observable<ProgressUpdate>;
}

@Injectable()
export class ImagesService implements OnModuleInit {
  private imageService!: ImageServiceGrpc;

  constructor(@Inject('IMAGE_SERVICE') private client: ClientGrpc) {}

  onModuleInit() {
    this.imageService =
      this.client.getService<ImageServiceGrpc>('ImageService');
    console.log('[api-gateway] gRPC ImageService client initialized');
  }

  async getMetadata(fileId: string): Promise<ImageMetadata> {
    console.log('[api-gateway] calling image-service.GetImageMetadata:', {
      fileId,
    });
    const result = await firstValueFrom(
      this.imageService.getImageMetadata({ fileId }),
    );
    console.log('[api-gateway] gRPC response:', result);
    return result;
  }

  processWithProgress(fileId: string): Observable<ProgressUpdate> {
    console.log('[api-gateway] calling image-service.ProcessImageWithProgress:', {
      fileId,
    });
    return this.imageService.processImageWithProgress({ fileId });
  }
}
