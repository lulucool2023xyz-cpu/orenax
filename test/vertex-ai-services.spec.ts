import { Test, TestingModule } from '@nestjs/testing';
import { GenAIClientService } from '../src/vertex-ai/services/genai-client.service';
import { DocumentService } from '../src/vertex-ai/services/document.service';
import { SafetyFilterService } from '../src/vertex-ai/services/safety-filter.service';
import { PromptManagementService } from '../src/vertex-ai/services/prompt-management.service';
import { UrlContextService } from '../src/vertex-ai/services/url-context.service';
import { ConfigService } from '@nestjs/config';

/**
 * Unit Tests for Vertex AI Services
 * Section 13: Verification Plan
 */
describe('Vertex AI Services Unit Tests', () => {

    // =====================
    // SAFETY FILTER SERVICE
    // =====================

    describe('SafetyFilterService', () => {
        let service: SafetyFilterService;

        beforeEach(() => {
            service = new SafetyFilterService();
        });

        it('should return PERMISSIVE preset', () => {
            const preset = service.getPreset('PERMISSIVE');
            expect(preset).toBeDefined();
            expect(preset.length).toBe(4);
            expect(preset[0].threshold).toBe('BLOCK_ONLY_HIGH');
        });

        it('should return DEFAULT preset', () => {
            const preset = service.getPreset('DEFAULT');
            expect(preset[0].threshold).toBe('BLOCK_MEDIUM_AND_ABOVE');
        });

        it('should return STRICT preset', () => {
            const preset = service.getPreset('STRICT');
            expect(preset[0].threshold).toBe('BLOCK_LOW_AND_ABOVE');
        });

        it('should build custom settings', () => {
            const settings = service.buildCustomSettings({
                hateSpeech: 'BLOCK_NONE',
            });
            expect(settings.length).toBe(1);
            expect(settings[0].category).toBe('HARM_CATEGORY_HATE_SPEECH');
        });

        it('should detect blocked response', () => {
            const blocked = service.isBlocked({ candidates: [{ finishReason: 'SAFETY' }] });
            expect(blocked).toBe(true);
        });

        it('should detect unblocked response', () => {
            const blocked = service.isBlocked({ candidates: [{ finishReason: 'STOP' }] });
            expect(blocked).toBe(false);
        });
    });

    // =====================
    // PROMPT MANAGEMENT SERVICE
    // =====================

    describe('PromptManagementService', () => {
        let service: PromptManagementService;
        let configService: ConfigService;

        beforeEach(() => {
            configService = { get: jest.fn() } as any;
            service = new PromptManagementService(configService);
        });

        it('should have default prompts', () => {
            const prompts = service.listPrompts();
            expect(prompts.length).toBeGreaterThan(0);
        });

        it('should get orenax-agent prompt', () => {
            const prompt = service.getPrompt('orenax-agent');
            expect(prompt).toBeDefined();
            expect(prompt?.name).toBe('orenax-agent');
        });

        it('should create new prompt', () => {
            const prompt = service.createPrompt({
                name: 'test-prompt',
                contents: [],
            });
            expect(prompt.name).toBe('test-prompt');
            expect(prompt.version).toBe(1);
        });

        it('should update prompt and increment version', () => {
            service.createPrompt({ name: 'updatable', contents: [] });
            const updated = service.updatePrompt('updatable', { description: 'Updated' });
            expect(updated?.version).toBe(2);
        });

        it('should delete prompt', () => {
            service.createPrompt({ name: 'deletable', contents: [] });
            const deleted = service.deletePrompt('deletable');
            expect(deleted).toBe(true);
            expect(service.getPrompt('deletable')).toBeUndefined();
        });
    });

    // =====================
    // URL CONTEXT SERVICE
    // =====================

    describe('UrlContextService', () => {
        let service: UrlContextService;
        let configService: ConfigService;

        beforeEach(() => {
            configService = { get: jest.fn() } as any;
            service = new UrlContextService(configService);
        });

        it('should validate correct URL', () => {
            expect(service.isValidUrl('https://google.com')).toBe(true);
        });

        it('should invalidate incorrect URL', () => {
            expect(service.isValidUrl('not-a-url')).toBe(false);
        });

        it('should filter valid URLs', () => {
            const urls = service.filterValidUrls(['https://google.com', 'invalid', 'https://example.com']);
            expect(urls.length).toBe(2);
        });

        it('should prepare URL context tool', () => {
            const tool = service.prepareUrlContextTool(['https://google.com']);
            expect(tool).toBeDefined();
            expect(tool.urlContext.urls.length).toBe(1);
        });

        it('should return undefined for empty URLs', () => {
            const tool = service.prepareUrlContextTool([]);
            expect(tool).toBeUndefined();
        });
    });
});
