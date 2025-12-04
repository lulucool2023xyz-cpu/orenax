import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        // In a real app, use ConfigService to get the key from .env
        this.genAI = new GoogleGenerativeAI('AIzaSyCXWJQXBw0jaQLC-0yjutJq4GgJYPeK1tw');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    }

    async generateText(prompt: string): Promise<string> {
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error generating content:', error);
            throw error;
        }
    }
}
