import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import type { IFilesService } from './interfaces/files-service.interface';
import { FILES_SERVICE_TOKEN } from './interfaces/files-service.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    @Inject(FILES_SERVICE_TOKEN)
    private readonly filesService: IFilesService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, callback) => {
          const uniqueName = randomUUID() + extname(file.originalname);
          callback(null, uniqueName);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a file (authenticated)' })
  upload(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: User) {
    return this.filesService.upload(file, user.id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get file metadata (authenticated)' })
  findOne(@Param('id') id: string) {
    return this.filesService.findById(id);
  }
}
