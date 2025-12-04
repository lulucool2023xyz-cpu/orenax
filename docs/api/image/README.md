# Vertex AI Image Generation API - Documentation Index

## Overview

Dokumentasi lengkap untuk Vertex AI Image Generation API endpoints. Semua endpoints memerlukan JWT authentication dan otomatis menyimpan hasil ke Google Cloud Storage.

## Base URL

```
http://localhost:3001/api/v1/image
```

## Authentication

Semua endpoints memerlukan JWT Bearer token:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Lihat [Authentication Guide](../auth/authentication.md) untuk mendapatkan token.

## API Documentation by Category

### 1. Text-to-Image Generation

Generate images dari text prompts menggunakan Imagen atau Gemini models.

📖 **[Text-to-Image API Documentation](./image/text-to-image.md)**

**Endpoints:**
- `POST /api/v1/image/text-to-image` - Generate images dari prompt

**Supported Models:**
- Imagen 3.0 (generate, fast)
- Imagen 4.0 (generate, fast, ultra)
- Gemini 2.5 Flash Image
- Gemini 3 Pro Image Preview

---

### 2. Image Upscaling

Upscale images sampai 4x dengan Imagen 4.0 Upscale.

📖 **[Image Upscale API Documentation](./image/image-upscale.md)**

**Endpoints:**
- `POST /api/v1/image/image-upscale` - Upscale images (x2, x3, x4)

**Features:**
- Maximum output: 17 megapixels
- Support base64 dan GCS URI input
- Automatic public URL generation

---

### 3. Image Editing

Edit images menggunakan masks dan prompts.

📖 **[Image Edit API Documentation](./image/image-edit.md)**

**Endpoints:**
- `POST /api/v1/image/image-edit` - Edit dengan masks

**Edit Modes:**
- Inpaint Removal - Remove objects
- Inpaint Insertion - Add objects
- Background Swap - Change background
- Outpaint - Extend image

---

### 4. Image Customization

Customize images dengan reference images untuk subject/style control.

📖 **[Image Customize API Documentation](./image/image-customize.md)**

**Endpoints:**
- `POST /api/v1/image/image-customize` - Customize dengan reference images

**Features:**
- Face mesh control
- Subject consistency (people, animals, products)
- Style transfer
- Max 4 reference images

---

### 5. Virtual Try-On

Virtual try-on untuk clothing products.

📖 **[Virtual Try-On API Documentation](./image/virtual-try-on.md)**

**Endpoints:**
- `POST /api/v1/image/virtual-try-on` - Model clothing on person

**Features:**
- Person + product image input
- Realistic clothing rendering
- Support multiple product views

---

### 6. Product Recontextualization

Recontextualize product images ke different scenes/backgrounds.

📖 **[Product Recontext API Documentation](./image/product-recontext.md)**

**Endpoints:**
- `POST /api/v1/image/product-recontext` - Place product in new scene

**Features:**
- LLM-enhanced prompting
- Max 3 product images (different views)
- Background replacement

---

## Common Features

### Google Cloud Storage Integration

Semua generated images otomatis:
- ✅ Di-upload ke GCS bucket
- ✅ Dibuat public URL
- ✅ Accessible via `https://storage.googleapis.com/...`

📖 **[GCS Setup Guide](../setup/gcs-setup.md)**

### Safety Filters

Semua endpoints dilindungi oleh Responsible AI safety filters:
- Child content protection
- Celebrity detection
- Violence/hate/toxic content filtering
- Personal information protection

📖 **[Safety Filters Guide](./image/safety-filters.md)**

### Error Handling

Comprehensive error responses dengan:
- HTTP status codes
- Error messages
- Safety filter reason codes
- Troubleshooting hints

📖 **[Error Handling Guide](./image/error-handling.md)**

## Quick Start

### 1. Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env dengan credentials

# Setup GCS bucket
# Follow: docs/setup/gcs-setup.md
```

### 2. Get Authentication Token

```bash
# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'
```

### 3. Generate Your First Image

```bash
curl -X POST http://localhost:3001/api/v1/image/text-to-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset over mountains"
  }'
```

Response:
```json
{
  "success": true,
  "model": "imagen-3.0-generate-001",
  "images": [
    {
      "url": "https://storage.googleapis.com/bucket/images/generated/20251204_imagen3_abc123.png",
      "filename": "20251204_imagen3_abc123.png",
      "mimeType": "image/png"
    }
  ]
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "model": "MODEL_ID",
  "images": [
    {
      "url": "https://storage.googleapis.com/...",
      "filename": "FILENAME",
      "mimeType": "image/png",
      "generatedAt": "2025-12-04T06:23:29Z"
    }
  ]
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "raiFilteredReason": "Support codes: 56562880",
  "category": "Violence"
}
```

## Supported Models

| Model | Type | Speed | Quality | Max Resolution |
|-------|------|-------|---------|----------------|
| `imagen-3.0-generate-001` | Generation | Medium | High | 1024x1024 |
| `imagen-3.0-fast-generate-001` | Generation | Fast | Medium | 1024x1024 |
| `imagen-4.0-generate-001` | Generation | Medium | Very High | 1024x1024 |
| `imagen-4.0-ultra-generate-001` | Generation | Slow | Ultra | 1024x1024 |
| `gemini-2.5-flash-image` | Generation | Fast | High | 1024x1024 |
| `gemini-3-pro-image-preview` | Generation | Medium | Very High | 4096x4096 |
| `imagen-3.0-capability-001` | Edit/Customize | Medium | High | Variable |
| `imagen-4.0-upscale-preview` | Upscale | Medium | High | 17MP max |
| `virtual-try-on-preview-08-04` | Virtual Try-On | Medium | High | Variable |
| `imagen-product-recontext-preview-06-30` | Product Recontext | Medium | High | Variable |

## Rate Limits

- **Text-to-Image**: 60 requests/minute
- **Upscale**: 30 requests/minute
- **Edit/Customize**: 30 requests/minute
- **Virtual Try-On**: 20 requests/minute
- **Product Recontext**: 20 requests/minute

## Cost Estimation

Approximate costs per 1,000 API calls:

| Feature | Cost/1000 calls |
|---------|----------------|
| Text-to-Image (Imagen 3) | ~$4.00 |
| Text-to-Image (Imagen 4) | ~$8.00 |
| Image Upscale | ~$8.00 |
| Image Edit | ~$8.00 |
| Virtual Try-On | ~$12.00 |

Plus GCS storage costs (~$0.30/month per 15GB)

## Support & Troubleshooting

### Common Issues

1. **"403 Forbidden" on image URL**
   - Check GCS bucket public access settings
   - See [GCS Setup Guide](../setup/gcs-setup.md)

2. **"Safety filter blocked"**
   - Review prompt content
   - See [Safety Filters Guide](./image/safety-filters.md)

3. **"Invalid model ID"**
   - Check supported models list
   - Verify model availability in your region

### Getting Help

- 📧 Email: support@example.com
- 💬 Discord: [Join Server](https://discord.gg/example)
- 📝 Issues: [GitHub Issues](https://github.com/example/issues)

## Related Documentation

- [Main API Documentation](../README.md)
- [Chat API Documentation](./chat/README.md)
- [Vertex AI Setup](../setup/vertex-ai-setup.md)
- [Authentication Guide](../auth/authentication.md)
- [Testing Guide](../api-testing.md)
