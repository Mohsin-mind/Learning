import { Controller, Get, Param, Sse } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ImagesService, ProgressUpdate } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get(':id/metadata')
  async getMetadata(@Param('id') id: string) {
    console.log('[api-gateway] GET /images/:id/metadata', { id });
    return this.imagesService.getMetadata(id);
  }

  @Sse(':id/progress')
  progress(@Param('id') id: string): Observable<MessageEvent> {
    console.log('[api-gateway] GET /images/:id/progress (SSE)', { id });
    return this.imagesService.processWithProgress(id).pipe(
      map((update) => {
        console.log('[api-gateway] SSE emit:', update);
        return new MessageEvent('message', { data: update });
      }),
    );
  }
}
