# Test Text-to-Image Request

## Endpoint
POST http://localhost:3001/api/v1/image/text-to-image

## Headers
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

## Request Body (Full Example)
```json
{
  "model": "imagen-3.0-generate-001",
  "prompt": "A beautiful sunset over a mountain landscape with vibrant colors",
  "sampleCount": 1,
  "addWatermark": true,
  "negativePrompt": "blurry, low quality",
  "language": "en",
  "outputOptions": {
    "mimeType": "image/png",
    "compressionQuality": 75
  },
  "safetySetting": "block_medium_and_above",
  "personGeneration": "allow_adult"
}
```

## Request Body (Minimal)
```json
{
  "prompt": "A beautiful sunset over a mountain landscape with vibrant colors"
}
```

## Expected Response (Coming Soon)
```json
{
  "success": false,
  "message": "Fitur Coming Soon - Text-to-Image generation will be available soon",
  "feature": "text-to-image",
  "status": "coming_soon",
  "requestedParameters": {
    "prompt": "A beautiful sunset over a mountain landscape with vibrant colors",
    "numberOfImages": 1,
    "dimensions": {
      "width": 1024,
      "height": 1024
    }
  }
}
```
