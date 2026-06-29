import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface HealthResponse {
  status: string;
  uptime: number;
  timestamp: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', {
      exclude: ['/', 'health/live', 'health/ready'],
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.enableCors();
    app.enableShutdownHooks();
    await app.init();
  });

  it('GET / should return health status', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        const body = res.body as HealthResponse;
        expect(body).toHaveProperty('status', 'ok');
        expect(body).toHaveProperty('uptime');
        expect(body).toHaveProperty('timestamp');
      });
  });

  it('GET /api/v1/health/live should return alive status', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health/live')
      .expect(200)
      .expect((res) => {
        const body = res.body as ApiResponse<HealthResponse>;
        expect(body).toHaveProperty('success', true);
        expect(body.data).toHaveProperty('status', 'ok');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
