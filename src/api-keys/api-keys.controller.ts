import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Query,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    Logger,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto, ApiKeyUsageQueryDto } from './dto/api-keys.dto';

/**
 * API Keys Controller
 * Handles user API key management
 */
@Controller('api/v2/user')
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
    private readonly logger = new Logger(ApiKeysController.name);

    constructor(private readonly apiKeysService: ApiKeysService) { }

    /**
     * GET /api/v2/user/api-keys
     * List all API keys for the authenticated user
     */
    @Get('api-keys')
    @HttpCode(HttpStatus.OK)
    async listApiKeys(@Req() req: AuthenticatedRequest) {
        const userId = req.user?.sub || req.user?.id;
        this.logger.log(`List API keys request - User: ${userId}`);
        return this.apiKeysService.listApiKeys(userId);
    }

    /**
     * POST /api/v2/user/api-keys
     * Generate a new API key
     */
    @Post('api-keys')
    @HttpCode(HttpStatus.CREATED)
    async createApiKey(@Body() dto: CreateApiKeyDto, @Req() req: AuthenticatedRequest) {
        const userId = req.user?.sub || req.user?.id;
        this.logger.log(`Create API key request - User: ${userId}, Name: ${dto.name}`);
        return this.apiKeysService.createApiKey(userId, dto);
    }

    /**
     * DELETE /api/v2/user/api-keys/:id
     * Revoke an API key
     */
    @Delete('api-keys/:id')
    @HttpCode(HttpStatus.OK)
    async deleteApiKey(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const userId = req.user?.sub || req.user?.id;
        this.logger.log(`Delete API key request - User: ${userId}, Key: ${id}`);
        return this.apiKeysService.deleteApiKey(userId, id);
    }

    /**
     * GET /api/v2/user/api-usage
     * Get API usage statistics
     */
    @Get('api-usage')
    @HttpCode(HttpStatus.OK)
    async getApiUsage(@Query() query: ApiKeyUsageQueryDto, @Req() req: AuthenticatedRequest) {
        const userId = req.user?.sub || req.user?.id;
        this.logger.log(`API usage request - User: ${userId}, Period: ${query.period}`);
        return this.apiKeysService.getApiUsage(userId, query.period || 'daily');
    }
}
