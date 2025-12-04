import {
    Controller,
    Post,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImageService } from '../vertex-ai/services/image.service';
import {
    TextToImageDto,
    ImageUpscaleDto,
    ImageEditDto,
    ImageCustomizeDto,
    VirtualTryOnDto,
    ProductRecontextDto,
} from '../vertex-ai/dto/image-request.dto';
import { ImageUploadUtil } from './utils/image-upload.util';

/**
 * Image Controller
 * Handles all image generation, editing, and manipulation API endpoints
 * All endpoints require JWT authentication
 */
@Controller('api/v1/image')
@UseGuards(JwtAuthGuard)
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    /**
     * POST /api/v1/image/text-to-image
     * Generate image from text prompt
     */
    @Post('text-to-image')
    @HttpCode(HttpStatus.OK)
    async textToImage(@Body() dto: TextToImageDto) {
        return this.imageService.textToImage(dto);
    }

    /**
     * POST /api/v1/image/image-upscale
     * Upscale an image
     * Supports both JSON (base64) and multipart/form-data (file upload)
     */
    @Post('image-upscale')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('image'))
    async upscaleImage(
        @Body() dto: ImageUpscaleDto,
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [
                    new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
                    new FileTypeValidator({ fileType: /(image\/png|image\/jpeg|image\/jpg|image\/webp)/ }),
                ],
            }),
        )
        file?: Express.Multer.File,
    ) {
        // If file is uploaded, convert to base64 and use it
        if (file) {
            ImageUploadUtil.validateImageFile(ImageUploadUtil.fromExpressFile(file));
            const base64Image = ImageUploadUtil.convertToBase64(ImageUploadUtil.fromExpressFile(file));
            dto.image = base64Image;
        }

        return this.imageService.upscaleImage(dto);
    }

    /**
     * POST /api/v1/image/image-edit
     * Edit an image using masks and prompts
     */
    @Post('image-edit')
    @HttpCode(HttpStatus.OK)
    async editImage(@Body() dto: ImageEditDto) {
        return this.imageService.editImage(dto);
    }

    /**
     * POST /api/v1/image/image-customize
     * Customize image using reference images
     */
    @Post('image-customize')
    @HttpCode(HttpStatus.OK)
    async customizeImage(@Body() dto: ImageCustomizeDto) {
        return this.imageService.customizeImage(dto);
    }

    /**
     * POST /api/v1/image/virtual-try-on
     * Virtual try-on for clothing products
     * Supports both JSON (base64) and multipart/form-data (file upload)
     */
    @Post('virtual-try-on')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(
        FilesInterceptor('images', 5, {
            limits: { fileSize: 20 * 1024 * 1024 }, // 20MB per file
        }),
    )
    async virtualTryOn(
        @Body() dto: VirtualTryOnDto,
        @UploadedFiles(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [
                    new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
                    new FileTypeValidator({ fileType: /(image\/png|image\/jpeg|image\/jpg|image\/webp)/ }),
                ],
            }),
        )
        files?: Express.Multer.File[],
    ) {
        // If files are uploaded, convert to base64
        if (files && files.length > 0) {
            // First file is person image
            if (files[0]) {
                ImageUploadUtil.validateImageFile(ImageUploadUtil.fromExpressFile(files[0]));
                dto.personImage = ImageUploadUtil.convertToBase64(ImageUploadUtil.fromExpressFile(files[0]));
            }

            // Remaining files are product images
            if (files.length > 1) {
                dto.productImages = files.slice(1).map((file) => {
                    ImageUploadUtil.validateImageFile(ImageUploadUtil.fromExpressFile(file));
                    return ImageUploadUtil.convertToBase64(ImageUploadUtil.fromExpressFile(file));
                });
            }
        }

        return this.imageService.virtualTryOn(dto);
    }

    /**
     * POST /api/v1/image/product-recontext
     * Recontextualize product images into different scenes
     * Supports both JSON (base64) and multipart/form-data (file upload)
     */
    @Post('product-recontext')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(
        FilesInterceptor('productImages', 3, {
            limits: { fileSize: 20 * 1024 * 1024 }, // 20MB per file, max 3 files
        }),
    )
    async productRecontext(
        @Body() dto: ProductRecontextDto,
        @UploadedFiles(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [
                    new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
                    new FileTypeValidator({ fileType: /(image\/png|image\/jpeg|image\/jpg|image\/webp)/ }),
                ],
            }),
        )
        files?: Express.Multer.File[],
    ) {
        // If files are uploaded, convert to base64
        if (files && files.length > 0) {
            dto.productImages = files.map((file) => {
                ImageUploadUtil.validateImageFile(ImageUploadUtil.fromExpressFile(file));
                return ImageUploadUtil.convertToBase64(ImageUploadUtil.fromExpressFile(file));
            });
        }

        return this.imageService.productRecontext(dto);
    }
}

