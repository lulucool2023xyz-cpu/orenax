import { Controller, Post, Body } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('gemini')
export class GeminiController {
    constructor(private readonly geminiService: GeminiService) { }

    @Post('chat')
    async chat(@Body('message') message: string) {
        const response = await this.geminiService.generateText(message);
        return { response };
    }
}
