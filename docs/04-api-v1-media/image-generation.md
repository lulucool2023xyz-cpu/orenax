# Image API v1 (Vertex AI Imagen)

> **Base URL**: `/api/v1/image`  
> **Auth**: JWT required

---

## Endpoints

| Endpoint | Description | Model |
|----------|-------------|-------|
| POST `/text-to-image` | Generate from text | Imagen 4.0 |
| POST `/image-upscale` | Upscale image | Imagen Upscale |
| POST `/image-edit` | Edit with masks | Imagen 3.0 |
| POST `/image-customize` | With references | Imagen 3.0 |
| POST `/virtual-try-on` | Clothing try-on | VTO Preview |
| POST `/product-recontext` | Product scenes | Imagen Recontext |
| GET `/gemini-status` | Check availability | - |

---

## POST /text-to-image

```json
{
  "model": "imagen-4.0-generate-001",
  "prompt": "A sunset over mountains",
  "sampleCount": 1,
  "negativePrompt": "blurry, low quality",
  "addWatermark": true,
  "outputOptions": {
    "mimeType": "image/png"
  },
  "safetySetting": "block_medium_and_above",
  "personGeneration": "allow_adult"
}
```

**Models**: `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-3.0-generate-002`

---

## POST /image-upscale

```json
{
  "image": "base64_data",
  "upscaleFactor": "x2",
  "prompt": "Enhance detail",
  "addWatermark": true
}
```

**Factors**: `x2`, `x3`, `x4`

---

## POST /image-edit

```json
{
  "prompt": "Add rainbow",
  "editMode": "EDIT_MODE_INPAINT_INSERTION",
  "referenceImages": [{
    "referenceType": "REFERENCE_TYPE_RAW",
    "referenceId": 0,
    "bytesBase64Encoded": "base64_data",
    "maskImageConfig": {"maskMode": "MASK_MODE_USER_PROVIDED"}
  }],
  "sampleCount": 4
}
```

**Modes**: `EDIT_MODE_INPAINT_REMOVAL`, `EDIT_MODE_INPAINT_INSERTION`, `EDIT_MODE_OUTPAINT`

---

## POST /virtual-try-on

```json
{
  "personImage": "base64_person",
  "productImages": ["base64_clothing"],
  "sampleCount": 1
}
```

---

## Response Format

```json
{
  "success": true,
  "model": "imagen-4.0-generate-001",
  "images": [{
    "url": "https://storage.googleapis.com/...",
    "gcsUri": "gs://bucket/path/image.png",
    "filename": "imagen-xxx.png",
    "mimeType": "image/png"
  }]
}
```

---

## ⚠️ Notes

- Gemini Image generation (`/gemini-generate`) is **Coming Soon**
- Use `imagen-4.0-generate-001` for best results
- All outputs uploaded to GCS automatically
