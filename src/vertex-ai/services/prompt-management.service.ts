import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Prompt DTO
 */
export interface PromptData {
    name: string;
    displayName?: string;
    description?: string;
    systemInstruction?: string;
    contents: Array<{
        role: 'user' | 'model';
        parts: Array<{ text: string }>;
    }>;
    config?: {
        temperature?: number;
        topP?: number;
        topK?: number;
        maxOutputTokens?: number;
    };
    createdAt?: string;
    updatedAt?: string;
    version?: number;
}

/**
 * Prompt Management Service
 * 
 * Manages prompt templates for Vertex AI
 * Features:
 * - Create, read, update, delete prompts
 * - Version management
 * - In-memory storage (can be extended to database)
 */
@Injectable()
export class PromptManagementService {
    private readonly logger = new Logger(PromptManagementService.name);
    private prompts: Map<string, PromptData[]> = new Map(); // name -> versions array

    constructor(private readonly configService: ConfigService) {
        // Initialize with default prompts
        this.initializeDefaults();
    }

    /**
     * Initialize default prompts
     */
    private initializeDefaults(): void {
        // OrenaX Agent default prompt
        this.createPrompt({
            name: 'orenax-agent',
            displayName: 'OrenaX Agent',
            description: 'Default Indonesian AI assistant prompt',
            systemInstruction: `Kamu adalah OrenaX Agent, asisten AI yang dikembangkan dengan teknologi terdepan dari Google Cloud Vertex AI.

**Kepribadian:**
- Berbasis budaya Indonesia dengan sopan dan ramah
- Komunikatif dan mudah dipahami
- Profesional namun tetap hangat
- Siap membantu dalam berbagai topik

**Kemampuan:**
- Menjawab pertanyaan dengan konteks yang tepat
- Menggunakan bahasa Indonesia yang baik dan benar
- Dapat beralih ke bahasa Inggris jika diminta
- Memahami konteks percakapan multi-turn

**Pedoman:**
- Selalu perkenalkan diri sebagai "OrenaX Agent" pada percakapan pertama
- Berikan jawaban yang akurat dan relevan
- Jika tidak yakin, katakan dengan jujur
- Gunakan emoji dengan bijak untuk komunikasi yang lebih baik 🚀`,
            contents: [],
            config: {
                temperature: 1.0,
                topP: 0.95,
                maxOutputTokens: 8192,
            },
        });

        // Code assistant prompt
        this.createPrompt({
            name: 'code-assistant',
            displayName: 'Code Assistant',
            description: 'Programming assistant for code generation and debugging',
            systemInstruction: `You are a highly skilled programming assistant. 

Your responsibilities:
- Write clean, efficient, and well-documented code
- Debug and fix code issues
- Explain complex programming concepts
- Suggest best practices and optimizations
- Support multiple programming languages

Always provide code with proper formatting and comments.`,
            contents: [],
            config: {
                temperature: 0.7,
                topP: 0.9,
                maxOutputTokens: 8192,
            },
        });

        this.logger.log('Default prompts initialized');
    }

    /**
     * Create a new prompt
     */
    createPrompt(data: PromptData): PromptData {
        const prompt: PromptData = {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
        };

        this.prompts.set(data.name, [prompt]);
        this.logger.log(`Prompt created: ${data.name}`);
        return prompt;
    }

    /**
     * Get prompt by name (latest version)
     */
    getPrompt(name: string): PromptData | undefined {
        const versions = this.prompts.get(name);
        if (!versions || versions.length === 0) return undefined;
        return versions[versions.length - 1];
    }

    /**
     * Get specific version of prompt
     */
    getPromptVersion(name: string, version: number): PromptData | undefined {
        const versions = this.prompts.get(name);
        if (!versions) return undefined;
        return versions.find(p => p.version === version);
    }

    /**
     * List all prompts
     */
    listPrompts(): PromptData[] {
        const prompts: PromptData[] = [];
        this.prompts.forEach((versions) => {
            if (versions.length > 0) {
                prompts.push(versions[versions.length - 1]);
            }
        });
        return prompts;
    }

    /**
     * Update prompt (creates new version)
     */
    updatePrompt(name: string, updates: Partial<PromptData>): PromptData | undefined {
        const versions = this.prompts.get(name);
        if (!versions || versions.length === 0) return undefined;

        const latest = versions[versions.length - 1];
        const newVersion: PromptData = {
            ...latest,
            ...updates,
            name: latest.name, // Prevent name change
            updatedAt: new Date().toISOString(),
            version: (latest.version || 0) + 1,
        };

        versions.push(newVersion);
        this.logger.log(`Prompt updated: ${name} v${newVersion.version}`);
        return newVersion;
    }

    /**
     * Delete prompt
     */
    deletePrompt(name: string): boolean {
        const deleted = this.prompts.delete(name);
        if (deleted) {
            this.logger.log(`Prompt deleted: ${name}`);
        }
        return deleted;
    }

    /**
     * Restore prompt to specific version
     */
    restoreVersion(name: string, version: number): PromptData | undefined {
        const targetVersion = this.getPromptVersion(name, version);
        if (!targetVersion) return undefined;

        return this.updatePrompt(name, {
            systemInstruction: targetVersion.systemInstruction,
            contents: targetVersion.contents,
            config: targetVersion.config,
        });
    }

    /**
     * Get all versions of a prompt
     */
    getVersionHistory(name: string): PromptData[] {
        return this.prompts.get(name) || [];
    }

    /**
     * Generate content request from prompt
     */
    buildContentRequest(name: string, userMessage?: string): any | undefined {
        const prompt = this.getPrompt(name);
        if (!prompt) return undefined;

        const contents = [...(prompt.contents || [])];
        if (userMessage) {
            contents.push({
                role: 'user',
                parts: [{ text: userMessage }],
            });
        }

        return {
            systemInstruction: prompt.systemInstruction ? {
                parts: [{ text: prompt.systemInstruction }],
            } : undefined,
            contents,
            generationConfig: prompt.config,
        };
    }
}
