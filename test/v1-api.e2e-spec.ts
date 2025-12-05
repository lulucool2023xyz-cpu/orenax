import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * V1 API Integration Tests
 * Section 13: Verification Plan
 */
describe('V1 API Endpoints (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    // =====================
    // HEALTH & UTILITY
    // =====================

    describe('Health & Utility Endpoints', () => {
        it('GET /v1/health - should return ok status', () => {
            return request(app.getHttpServer())
                .get('/v1/health')
                .expect(200)
                .expect((res) => {
                    expect(res.body.status).toBe('ok');
                    expect(res.body).toHaveProperty('timestamp');
                });
        });

        it('GET /v1/models - should return model lists', () => {
            return request(app.getHttpServer())
                .get('/v1/models')
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('chat');
                    expect(res.body).toHaveProperty('image');
                    expect(res.body).toHaveProperty('video');
                    expect(res.body).toHaveProperty('music');
                    expect(Array.isArray(res.body.chat)).toBe(true);
                });
        });
    });

    // =====================
    // TTS ENDPOINTS
    // =====================

    describe('TTS Endpoints', () => {
        it('GET /v1/tts/voices - should return voices list', () => {
            return request(app.getHttpServer())
                .get('/v1/tts/voices')
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('voices');
                    expect(Array.isArray(res.body.voices)).toBe(true);
                });
        });

        it('POST /v1/tts/synthesize - should accept TTS request', () => {
            return request(app.getHttpServer())
                .post('/v1/tts/synthesize')
                .send({ text: 'Hello world', voiceName: 'Kore' })
                .expect(200)
                .expect((res) => {
                    expect(res.body.success).toBe(true);
                });
        });
    });

    // =====================
    // PROMPT MANAGEMENT
    // =====================

    describe('Prompt Endpoints', () => {
        it('GET /v1/prompts - should return prompts list', () => {
            return request(app.getHttpServer())
                .get('/v1/prompts')
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('prompts');
                    expect(Array.isArray(res.body.prompts)).toBe(true);
                });
        });
    });

    // =====================
    // SAFETY CONFIGURATION
    // =====================

    describe('Safety Endpoints', () => {
        it('GET /v1/safety/presets - should return safety presets', () => {
            return request(app.getHttpServer())
                .get('/v1/safety/presets')
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('presets');
                    expect(res.body).toHaveProperty('categories');
                });
        });
    });

    // =====================
    // DOCUMENT ENDPOINTS
    // =====================

    describe('Document Endpoints', () => {
        it('POST /v1/document/analyze - should accept document', () => {
            return request(app.getHttpServer())
                .post('/v1/document/analyze')
                .send({
                    document: { mimeType: 'text/plain' },
                    prompt: 'Summarize this',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.success).toBe(true);
                });
        });
    });
});
