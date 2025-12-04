# Vertex AI Image API - API Documentation

Complete API reference untuk Vertex AI Image endpoints - Image generation, editing, upscaling, virtual try-on, dan product recontext.

## Base URL

```
http://localhost:3001/api/v1/image
```

> [!NOTE]
> Semua endpoints memerlukan **JWT Authentication** via Bearer token

---

## Authentication

Semua request harus include JWT token di header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Dapatkan token via [Authentication API](../README.md#authentication-api).

---

## Endpoints

### 1. POST /api/v1/image/text-to-image

Generate image dari text prompt menggunakan Imagen atau Gemini Image models.

#### Headers
```http
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Request Body

**Contoh Lengkap (dengan semua optional parameters):**
```json
{
  "model": "imagen-3.0-generate-001",
  "prompt": "A beautiful sunset over a mountain landscape with vibrant colors",
  "sampleCount": 1,
  "addWatermark": true,
  "negativePrompt": "blurry, low quality",
  "outputOptions": {
    "mimeType": "image/png",
    "compressionQuality": 75
  },
  "safetySetting": "block_medium_and_above",
  "personGeneration": "allow_adult"
}
```

> [!WARNING]
> Parameter `language` **TIDAK DIDUKUNG** oleh Vertex AI Imagen API dan akan diabaikan. Jangan gunakan parameter ini.

**Contoh Minimal (hanya required field):**
```json
{
  "prompt": "A beautiful sunset over a mountain landscape with vibrant colors"
}
```

> [!TIP]
> Field `prompt` adalah **required**. Semua field lainnya adalah **optional** dan akan menggunakan default values jika tidak diisi.

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `model` | string | No | Model ID. Default: `imagen-3.0-generate-001` |
| `prompt` | string | **Yes** | Text prompt untuk generate image |
| `sampleCount` | integer | No | Number of images to generate (1-4). Default: 1 |
| `addWatermark` | boolean | No | Add invisible watermark. Default: true |
| `seed` | integer | No | Random seed (not available if addWatermark=true) |
| `negativePrompt` | string | No | Description of what to avoid in generated images |
| `outputOptions` | object | No | Output format options |
| `outputOptions.mimeType` | string | No | "image/png" or "image/jpeg". Default: "image/png" |
| `outputOptions.compressionQuality` | integer | No | JPEG compression (0-100). Default: 75 |
| `storageUri` | string | No | GCS URI untuk store generated images |
| `safetySetting` | string | No | Safety filter level |
| `personGeneration` | string | No | Person generation policy |

#### Supported Models

| Model ID | Description |
|----------|-------------|
| `imagen-3.0-generate-002` | Imagen 3.0 (latest) |
| `imagen-3.0-generate-001` | Imagen 3.0 (stable) |
| `imagen-3.0-fast-generate-001` | Imagen 3.0 (fast) |
| `imagen-4.0-generate-001` | Imagen 4.0 (latest) |
| `imagen-4.0-fast-generate-001` | Imagen 4.0 (fast) |
| `imagen-4.0-ultra-generate-001` | Imagen 4.0 (ultra quality) |
| `gemini-3-pro-image-preview` | Gemini 3 Pro Image (preview) |
| `gemini-2.5-flash-image` | Gemini 2.5 Flash Image |

#### Safety Settings

| Value | Description |
|-------|-------------|
| `block_low_and_above` | Strongest filtering (most strict) |
| `block_medium_and_above` | Medium filtering (default) |
| `block_only_high` | Low filtering (less strict) |
| `block_none` | Minimal filtering (restricted access) |

#### Person Generation

| Value | Description |
|-------|-------------|
| `dont_allow` | No people or faces |
| `allow_adult` | Adults only (default) |
| `allow_all` | All ages |

#### Response

> [!IMPORTANT]
> **Response Format Update**: Backend sekarang otomatis menyimpan images ke Google Cloud Storage dan mengembalikan public URLs instead of base64 data.

**Success (200 OK)**:
```json
{
  "success": true,
  "model": "imagen-3.0-generate-001",
  "images": [
    {
      "url": "https://storage.googleapis.com/orenax-vertex-ai-images/images/generated/text-to-image/20251204_062329_img3_text-to-image_abc123.png",
      "filename": "20251204_062329_img3_text-to-image_abc123.png",
      "mimeType": "image/png",
      "generatedAt": "2025-12-04T06:23:29.000Z"
    }
  ]
}
```

**Multiple Images (sampleCount > 1)**:
```json
{
  "success": true,
  "model": "imagen-3.0-generate-001",
  "images": [
    {
      "url": "https://storage.googleapis.com/orenax-vertex-ai-images/images/generated/text-to-image/20251204_img3_001.png",
      "filename": "20251204_img3_001.png",
      "mimeType": "image/png",
      "generatedAt": "2025-12-04T06:23:29.000Z"
    },
    {
      "url": "https://storage.googleapis.com/orenax-vertex-ai-images/images/generated/text-to-image/20251204_img3_002.png",
      "filename": "20251204_img3_002.png",
      "mimeType": "image/png",
      "generatedAt": "2025-12-04T06:23:30.000Z"
    }
  ]
}
```

> [!TIP]
> Images dapat langsung diakses via URL tanpa perlu decode base64. URL bersifat public dan permanent.

**Error - Safety Filter Blocked (400)**:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Request blocked by safety filters: Violence in output",
  "raiFilteredReason": "Support codes: 56562880",
  "errorCode": 56562880,
  "category": "Violence",
  "filteredOn": "output",
  "hint": "Avoid violent or graphic content in prompts"
}
```

---

### 2. POST /api/v1/image/image-upscale

Upscale image menggunakan Imagen 4.0 Upscale Preview.

#### Request Body

```json
{
  "image": "BASE64_ENCODED_IMAGE_OR_GCS_URI",
  "upscaleFactor": "x2",
  "prompt": "Upscale the image",
  "addWatermark": true,
  "outputOptions": {
    "mimeType": "image/png",
    "compressionQuality": 75
  },
  "storageUri": "gs://bucket/path/to/output"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | string | **Yes** | Base64-encoded image atau GCS URI (gs://...) |
| `upscaleFactor` | string | No | Scaling factor: "x2", "x3", or "x4". Default: "x2" |
| `prompt` | string | No | Optional prompt. Default: "Upscale the image" |
| `addWatermark` | boolean | No | Add watermark. Default: true |
| `outputOptions` | object | No | Output format options |
| `storageUri` | string | No | GCS URI untuk store output |

> [!IMPORTANT]
> Output resolution (input resolution × upscaleFactor) must not exceed 17 megapixels.

#### Response

**Success (200 OK)**:
```json
{
  "predictions": [
    {
      "bytesBase64Encoded": "BASE64_UPSCALED_IMAGE",
      "mimeType": "image/png"
    }
  ],
  "model": "imagen-4.0-upscale-preview"
}
```

---

### 3. POST /api/v1/image/image-edit

Edit image menggunakan masks dan prompts dengan Imagen 3.0 Capability.

#### Request Body

```json
{
  "prompt": "Add a red car in the parking lot",
  "referenceImages": [
    {
      "referenceType": "REFERENCE_TYPE_RAW",
      "referenceId": 1,
      "bytesBase64Encoded": "BASE64_BASE_IMAGE"
    },
    {
      "referenceType": "REFERENCE_TYPE_MASK",
      "referenceId": 2,
      "bytesBase64Encoded": "BASE64_MASK_IMAGE",
      "maskImageConfig": {
        "maskMode": "MASK_MODE_USER_PROVIDED",
        "dilation": 0.01
      }
    }
  ],
  "editMode": "EDIT_MODE_INPAINT_INSERTION",
  "baseSteps": 35,
  "guidanceScale": 60,
  "sampleCount": 4,
  "addWatermark": true
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | No | Text prompt untuk guide editing |
| `referenceImages` | array | **Yes** | Array of reference images (min 2 for mask editing) |
| `referenceImages[].referenceType` | string | **Yes** | REFERENCE_TYPE_RAW or REFERENCE_TYPE_MASK |
| `referenceImages[].referenceId` | integer | **Yes** | Unique identifier |
| `referenceImages[].bytesBase64Encoded` | string | **Yes** | Base64-encoded image |
| `referenceImages[].maskImageConfig` | object | No | Mask configuration (required for REFERENCE_TYPE_MASK) |
| `editMode` | string | **Yes** | Edit mode (for mask editing) |
| `baseSteps` | integer | No | Sampling steps (1-75). Default: 75 |
| `guidanceScale` | integer | No | Prompt adherence (0-500). Default: 60-75 |
| `sampleCount` | integer | No | Number of images (1-4). Default: 4 |

#### Edit Modes

| Mode | Description |
|------|-------------|
| `EDIT_MODE_INPAINT_REMOVAL` | Remove objects and fill background |
| `EDIT_MODE_INPAINT_INSERTION` | Add objects from prompt |
| `EDIT_MODE_BGSWAP` | Swap background while preserving objects |
| `EDIT_MODE_OUTPAINT` | Extend image into mask area |

#### Mask Modes

| Mode | Description |
|------|-------------|
| `MASK_MODE_USER_PROVIDED` | Use provided mask image |
| `MASK_MODE_BACKGROUND` | Auto-generate background mask |
| `MASK_MODE_FOREGROUND` | Auto-generate foreground mask |
| `MASK_MODE_SEMANTIC` | Auto-generate semantic mask |

#### Response

**Success (200 OK)**:
```json
{
  "predictions": [
    {
      "bytesBase64Encoded": "BASE64_EDITED_IMAGE_1",
      "mimeType": "image/png"
    },
    {
      "bytesBase64Encoded": "BASE64_EDITED_IMAGE_2",
      "mimeType": "image/png"
    }
  ],
  "model": "imagen-3.0-capability-001"
}
```

---

### 4. POST /api/v1/image/image-customize

Customize image menggunakan reference images dengan Imagen 3.0 Capability.

#### Request Body

```json
{
  "prompt": "Create an image about a man with short hair [1] in the pose of control image [2]",
  "referenceImages": [
    {
      "referenceType": "REFERENCE_TYPE_CONTROL",
      "referenceId": 2,
      "bytesBase64Encoded": "BASE64_CONTROL_IMAGE",
      "controlImageConfig": {
        "controlType": "CONTROL_TYPE_FACE_MESH",
        "enableControlImageComputation": true
      }
    },
    {
      "referenceType": "REFERENCE_TYPE_SUBJECT",
      "referenceId": 1,
      "bytesBase64Encoded": "BASE64_SUBJECT_IMAGE",
      "subjectImageConfig": {
        "subjectDescription": "a man with short hair",
        "subjectType": "SUBJECT_TYPE_PERSON"
      }
    }
  ],
  "sampleCount": 4,
  "negativePrompt": "wrinkles, noise, low quality",
  "seed": 1
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | **Yes** | Text prompt (use [referenceId] to reference images) |
| `referenceImages` | array | **Yes** | Array of reference images (max 4) |
| `referenceImages[].referenceType` | string | **Yes** | REFERENCE_TYPE_CONTROL, REFERENCE_TYPE_SUBJECT, or REFERENCE_TYPE_STYLE |
| `referenceImages[].referenceId` | integer | **Yes** | Reference ID (use in prompt as [id]) |
| `referenceImages[].controlImageConfig` | object | No | Control image config (for REFERENCE_TYPE_CONTROL) |
| `referenceImages[].subjectImageConfig` | object | No | Subject image config (for REFERENCE_TYPE_SUBJECT) |
| `sampleCount` | integer | No | Number of images (1-4). Default: 4 |

#### Control Types

| Type | Description |
|------|-------------|
| `CONTROL_TYPE_FACE_MESH` | Face mesh for person customization |
| `CONTROL_TYPE_CANNY` | Canny edge detection |
| `CONTROL_TYPE_SCRIBBLE` | Scribble control |

#### Subject Types

| Type | Description |
|------|-------------|
| `SUBJECT_TYPE_PERSON` | Person subject |
| `SUBJECT_TYPE_ANIMAL` | Animal subject |
| `SUBJECT_TYPE_PRODUCT` | Product subject |
| `SUBJECT_TYPE_DEFAULT` | Default subject |

#### Response

**Success (200 OK)**:
```json
{
  "predictions": [
    {
      "bytesBase64Encoded": "BASE64_CUSTOMIZED_IMAGE",
      "mimeType": "image/png"
    }
  ],
  "model": "imagen-3.0-capability-001"
}
```

---

### 5. POST /api/v1/image/virtual-try-on

Virtual try-on untuk clothing products menggunakan Virtual Try-On Preview.

#### Request Body

```json
{
  "personImage": "BASE64_PERSON_IMAGE_OR_GCS_URI",
  "productImages": [
    "BASE64_PRODUCT_IMAGE_1_OR_GCS_URI"
  ],
  "sampleCount": 1,
  "baseSteps": 32,
  "addWatermark": true,
  "outputOptions": {
    "mimeType": "image/png"
  }
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `personImage` | string | **Yes** | Base64-encoded person image atau GCS URI |
| `productImages` | array | **Yes** | Array of product images (base64 or GCS URI) |
| `sampleCount` | integer | No | Number of images (1-4). Default: 1 |
| `baseSteps` | integer | No | Sampling steps. Default: 32 |
| `addWatermark` | boolean | No | Add watermark. Default: true |
| `outputOptions` | object | No | Output format options |
| `storageUri` | string | No | GCS URI untuk store output |

#### Response

**Success (200 OK)**:
```json
{
  "predictions": [
    {
      "bytesBase64Encoded": "BASE64_VIRTUAL_TRYON_IMAGE",
      "mimeType": "image/png"
    }
  ],
  "model": "virtual-try-on-preview-08-04"
}
```

---

### 6. POST /api/v1/image/product-recontext

Recontextualize product images ke different scenes menggunakan Product Recontext Preview.

#### Request Body

```json
{
  "prompt": "Place the product on a modern kitchen counter with natural lighting",
  "productImages": [
    "BASE64_PRODUCT_IMAGE_1_OR_GCS_URI"
  ],
  "sampleCount": 1,
  "addWatermark": true,
  "enhancePrompt": true,
  "safetySetting": "block_medium_and_above",
  "personGeneration": "allow_adult"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | No | Text prompt untuk guide scene generation |
| `productImages` | array | **Yes** | Array of product images (max 3, different views) |
| `sampleCount` | integer | No | Number of images (1-4). Default: 1 |
| `addWatermark` | boolean | No | Add watermark. Default: true |
| `enhancePrompt` | boolean | No | Use LLM-based prompt rewriting. Default: true |
| `safetySetting` | string | No | Safety filter level |
| `personGeneration` | string | No | Person generation policy |

> [!NOTE]
> If `enhancePrompt` is true, `seed` parameter won't work because the prompt is rewritten.

#### Response

**Success (200 OK)**:
```json
{
  "predictions": [
    {
      "bytesBase64Encoded": "BASE64_RECONTEXT_IMAGE",
      "mimeType": "image/png"
    }
  ],
  "model": "imagen-product-recontext-preview-06-30"
}
```

---

## Examples

### Text-to-Image

```bash
curl -X POST http://localhost:3001/api/v1/image/text-to-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "imagen-3.0-generate-001",
    "prompt": "A futuristic cityscape at night with neon lights",
    "sampleCount": 2,
    "outputOptions": {
      "mimeType": "image/png"
    }
  }'
```

### Image Upscale

**Using JSON (base64):**
```bash
curl -X POST http://localhost:3001/api/v1/image/image-upscale \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "image": "BASE64_ENCODED_IMAGE",
    "upscaleFactor": "x2",
    "outputOptions": {
      "mimeType": "image/png"
    }
  }'
```

**Using multipart/form-data (file upload):**
```bash
curl -X POST http://localhost:3001/api/v1/image/image-upscale \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.png" \
  -F "upscaleFactor=x2" \
  -F "outputOptions[mimeType]=image/png"
```

### Image Edit (Mask-based)

```bash
curl -X POST http://localhost:3001/api/v1/image/image-edit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Add a red sports car",
    "referenceImages": [
      {
        "referenceType": "REFERENCE_TYPE_RAW",
        "referenceId": 1,
        "bytesBase64Encoded": "BASE64_BASE_IMAGE"
      },
      {
        "referenceType": "REFERENCE_TYPE_MASK",
        "referenceId": 2,
        "bytesBase64Encoded": "BASE64_MASK_IMAGE",
        "maskImageConfig": {
          "maskMode": "MASK_MODE_USER_PROVIDED",
          "dilation": 0.01
        }
      }
    ],
    "editMode": "EDIT_MODE_INPAINT_INSERTION",
    "baseSteps": 35,
    "sampleCount": 4
  }'
```

### Virtual Try-On

**Using JSON (base64):**
```bash
curl -X POST http://localhost:3001/api/v1/image/virtual-try-on \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "personImage": "BASE64_PERSON_IMAGE",
    "productImages": ["BASE64_PRODUCT_IMAGE"],
    "sampleCount": 1
  }'
```

**Using multipart/form-data (file upload):**
```bash
curl -X POST http://localhost:3001/api/v1/image/virtual-try-on \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@/path/to/person.png" \
  -F "images=@/path/to/product1.png" \
  -F "images=@/path/to/product2.png" \
  -F "sampleCount=1"
```

### Product Recontext

**Using JSON (base64):**
```bash
curl -X POST http://localhost:3001/api/v1/image/product-recontext \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Place the product on a beach with sunset in the background",
    "productImages": ["BASE64_PRODUCT_IMAGE"],
    "sampleCount": 2,
    "enhancePrompt": true
  }'
```

**Using multipart/form-data (file upload):**
```bash
curl -X POST http://localhost:3001/api/v1/image/product-recontext \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "productImages=@/path/to/product1.png" \
  -F "productImages=@/path/to/product2.png" \
  -F "prompt=Place the product on a beach with sunset in the background" \
  -F "sampleCount=2" \
  -F "enhancePrompt=true"
```

---

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": ["prompt should not be empty"],
  "error": "Bad Request"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Terjadi kesalahan internal"
}
```

### Safety Filter Blocked

```json
{
  "statusCode": 400,
  "message": "Request blocked by safety filters",
  "raiFilteredReason": "ERROR_MESSAGE. Support codes: 56562880"
}
```

---

## Safety Filter Error Codes

| Error Code | Safety Category | Description |
|-----------|----------------|-------------|
| 58061214 | Child | Child content detected in prompt |
| 17301594 | Child | Child content detected in output |
| 29310472 | Celebrity | Celebrity detected in prompt |
| 15236754 | Celebrity | Celebrity detected in output |
| 62263041 | Dangerous | Dangerous content detected |
| 57734940 | Hate | Hate content in prompt |
| 22137204 | Hate | Hate content in output |
| 39322892 | People/Face | Person/face not allowed |
| 92201652 | Personal Info | PII detected in prompt |
| 89371032 | Prohibited | Prohibited content in prompt |
| 49114662 | Prohibited | Prohibited content in output |
| 90789179 | Sexual | Sexual content in prompt |
| 63429089 | Sexual | Sexual content in output |
| 78610348 | Toxic | Toxic content in prompt |
| 61493863 | Violence | Violence in prompt |
| 56562880 | Violence | Violence in output |

---

## Best Practices

### ✅ DO:

- **Be specific in prompts**: More details give better control
- **Provide context**: Explain the purpose of the image
- **Iterate and refine**: Use follow-up requests for adjustments
- **Use step-by-step instructions**: For complex scenes, break into steps
- **Describe what you want**: Positive descriptions work better
- **Control the camera**: Use photographic terms (wide-angle, macro, etc.)
- **Include "generate an image"**: For Gemini models, explicitly ask for images

### ❌ DON'T:

- Don't exceed 17 megapixels for upscaled images
- Don't use seed when addWatermark is true
- Don't use seed when enhancePrompt is true (product recontext)
- Don't send images larger than 20MB (after transcoding to PNG)
- Don't exceed 3 product images for product recontext
- Don't exceed 4 reference images for customization

---

## Model Information

### Imagen Models

| Model | Use Case | Speed | Quality |
|-------|----------|-------|---------|
| `imagen-3.0-generate-001` | General generation | Medium | High |
| `imagen-3.0-fast-generate-001` | Fast generation | Fast | Medium |
| `imagen-3.0-capability-001` | Editing & customization | Medium | High |
| `imagen-4.0-generate-001` | Latest generation | Medium | Very High |
| `imagen-4.0-fast-generate-001` | Fast generation | Fast | High |
| `imagen-4.0-ultra-generate-001` | Ultra quality | Slow | Ultra High |
| `imagen-4.0-upscale-preview` | Image upscaling | Medium | High |

### Gemini Image Models

| Model | Use Case | Features |
|-------|----------|----------|
| `gemini-2.5-flash-image` | Fast image generation | 1024px, interleaved text+image |
| `gemini-3-pro-image-preview` | High quality | Up to 4096px, interleaved text+image |

### Specialized Models

| Model | Use Case |
|-------|----------|
| `virtual-try-on-preview-08-04` | Virtual try-on for clothing |
| `imagen-product-recontext-preview-06-30` | Product recontextualization |

---

## Language Support

Supported languages for text prompts:

- `en` - English (default)
- `es` - Spanish
- `hi` - Hindi
- `ja` - Japanese
- `ko` - Korean
- `pt` - Portuguese
- `zh` or `zh-CN` - Chinese (simplified)
- `zh-TW` - Chinese (traditional)
- `auto` - Automatic detection

---

## Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid request body/parameters |
| 401 | Unauthorized | Missing atau invalid JWT token |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Vertex AI temporarily unavailable |

---

## Next Steps

- 🧪 Test endpoints dengan cURL atau Postman
- 📖 Review [Main Documentation](../../README.md) untuk setup
- 🔧 Check [Vertex AI Setup](../../setup/vertex-ai-setup.md) untuk configuration
- 💬 See [Chat API](./api-chat.md) untuk text generation

