# 📁 API v1 Media Reference

All media generation endpoints untuk API v1 (Vertex AI).

## Quick Links

| API | Docs | Endpoints |
|-----|------|-----------|
| 🖼️ Image | [image-generation.md](image-generation.md) | 7 endpoints |
| 🎬 Video | [video-generation.md](video-generation.md) | 8 endpoints |
| 🎵 Music | [music-generation.md](music-generation.md) | 2 endpoints |
| 🎙️ Audio | [tts-audio.md](tts-audio.md) | 4 endpoints |

---

## Authentication

All endpoints require JWT token:
```
Authorization: Bearer <your-jwt-token>
```

---

## Full Reference

See [v1-complete-reference.md](../03-api-v1-chat/v1-complete-reference.md) for complete API reference with all endpoints and examples.

---

## Output

All media automatically uploaded to GCS with response:
```json
{
  "success": true,
  "url": "https://storage.googleapis.com/...",
  "gcsUri": "gs://bucket/path/file",
  "filename": "generated-file.ext"
}
```
