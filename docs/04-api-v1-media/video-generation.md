# 🎬 Video Generation API v1 (Veo)

Generate videos menggunakan Google Veo models via Vertex AI.

## Base URL
```
/api/v1/video
```

## Authentication
```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/text-to-video` | Generate from text |
| `POST` | `/image-to-video` | Generate from image |
| `POST` | `/extend` | Extend existing video |
| `POST` | `/interpolate` | First-last frame interpolation |
| `POST` | `/with-references` | With style/asset refs |
| `GET` | `/operation?id=xxx` | Check operation status |
| `GET` | `/status` | Service availability |
| `GET` | `/models` | List models |

---

## POST /api/v1/video/text-to-video

### Request

```json
{
  "prompt": "A cat playing with yarn, cinematic quality",
  "model": "veo-3.1-generate-preview",
  "durationSeconds": 8,
  "aspectRatio": "16:9",
  "resolution": "1080p",
  "generateAudio": true,
  "negativePrompt": "blurry, low quality"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | ✅ | Video description |
| `model` | string | ❌ | Model ID |
| `durationSeconds` | number | ❌ | 4-8 seconds |
| `aspectRatio` | string | ❌ | `16:9`, `9:16`, `1:1` |
| `resolution` | string | ❌ | `720p`, `1080p`, `4k` |
| `generateAudio` | boolean | ❌ | Enable audio generation |
| `negativePrompt` | string | ❌ | Elements to avoid |

---

## POST /api/v1/video/image-to-video

### Request

```json
{
  "prompt": "The person walks forward slowly",
  "image": {
    "bytesBase64Encoded": "base64_image_data"
  },
  "durationSeconds": 6,
  "resizeMode": "fit",
  "generateAudio": true
}
```

**Resize Modes**: `fit`, `fill`, `pad`

---

## POST /api/v1/video/extend

### Request

```json
{
  "prompt": "Continue the scene with more action",
  "video": {
    "gcsUri": "gs://bucket/path/video.mp4"
  },
  "extensionSeconds": 4
}
```

---

## POST /api/v1/video/interpolate

### Request

```json
{
  "prompt": "Smooth transition between frames",
  "firstFrame": {
    "bytesBase64Encoded": "base64_first_frame"
  },
  "lastFrame": {
    "bytesBase64Encoded": "base64_last_frame"
  },
  "durationSeconds": 4
}
```

---

## POST /api/v1/video/with-references

### Request

```json
{
  "prompt": "A landscape in impressionist style",
  "referenceImages": [
    {
      "image": {"bytesBase64Encoded": "base64_style_image"},
      "referenceType": "REFERENCE_TYPE_STYLE"
    }
  ],
  "durationSeconds": 6
}
```

**Reference Types**: `REFERENCE_TYPE_STYLE`, `REFERENCE_TYPE_ASSET`

---

## Response Format

```json
{
  "success": true,
  "url": "https://storage.googleapis.com/bucket/.../video.mp4",
  "gcsUri": "gs://bucket/path/video.mp4",
  "filename": "veo-video-xxx.mp4",
  "prompt": "A cat playing...",
  "model": "veo-3.1-generate-preview",
  "duration": 8,
  "resolution": "1080p",
  "aspectRatio": "16:9",
  "hasAudio": true,
  "generatedAt": "2024-12-05T12:34:56.789Z"
}
```

---

## Supported Models

| Model | Speed | Audio | Resolution |
|-------|-------|-------|------------|
| `veo-3.1-generate-001` | Normal | ✅ | Up to 4K |
| `veo-3.1-fast-generate-001` | Fast | ✅ | Up to 1080p |
| `veo-3.1-generate-preview` | Normal | ✅ | Up to 1080p |
| `veo-3.0-generate-001` | Normal | ❌ | Up to 1080p |
| `veo-2.0-generate-001` | Normal | ❌ | Up to 720p |

---

## cURL Example

```bash
curl -X POST http://localhost:3001/api/v1/video/text-to-video \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "A drone flying over tropical beach at golden hour",
    "durationSeconds": 8,
    "aspectRatio": "16:9",
    "generateAudio": true
  }'
```

---

## Related

- [Music Generation](music-generation.md)
- [TTS Audio](tts-audio.md)
- [Back to Media Overview](README.md)
