# ⚡ API V2 - Gemini Direct

API V2 menggunakan Google Gemini API langsung via SDK `@google/genai`.

## Base URL
```
/api/v2
```

## Authentication
Semua endpoint membutuhkan JWT token:
```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/models` | List models |
| `POST` | `/simple` | Simple prompt |
| `POST` | `/chat` | Full chat (streaming optional) |
| `POST` | `/chat/stream` | Dedicated streaming |
| `POST` | `/chat/generate` | Generate content |
| `POST` | `/count-tokens` | Count tokens |
| `POST` | `/image/generate` | Image generation |
| `GET` | `/image/status` | Image service status |
| `POST` | `/video/generate` | Video generation |
| `POST` | `/video/image-to-video` | Image to video |
| `POST` | `/video/extend` | Video extension |
| `POST` | `/video/interpolate` | Frame interpolation |
| `POST` | `/video/with-references` | With style refs |
| `GET` | `/video/operation` | Operation status |
| `GET` | `/video/status` | Video service status |
| `POST` | `/music/generate` | Music generation |
| `GET` | `/music/status` | Music service status |
| `POST` | `/tts/single` | Single speaker TTS |
| `POST` | `/tts/multi` | Multi-speaker TTS |
| `GET` | `/tts/voices` | Available voices |
| `GET` | `/tts/status` | TTS service status |

---

## Documentation

| Doc | Description |
|-----|-------------|
| [api-reference.md](api-reference.md) | Complete API reference with examples |
| [implementation-status.md](implementation-status.md) | Implementation progress & features |

---

## Quick Examples

### Health Check
```bash
curl http://localhost:3001/api/v2/health
```

### Simple Chat
```bash
curl -X POST http://localhost:3001/api/v2/simple \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello!"}'
```

### Chat with Thinking
```bash
curl -X POST http://localhost:3001/api/v2/chat \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Solve this math problem: 15 * 23",
    "model": "gemini-2.5-flash",
    "thinkingConfig": {
      "thinkingBudget": 8192,
      "includeThoughts": true
    }
  }'
```

---

## Models

| Model | Thinking | Features |
|-------|----------|----------|
| `gemini-2.0-flash` | ❌ | Fast, production-ready |
| `gemini-2.5-flash` | ✅ Budget | Fast with thinking |
| `gemini-2.5-pro` | ✅ Budget | Premium with thinking |
| `gemini-3-pro-preview` | ✅ Level | Latest with thinkingLevel |

---

## Features

- ✅ Thinking Mode (Budget & Level)
- ✅ Google Search Grounding
- ✅ Code Execution
- ✅ Multimodal (Image, Video, Audio, PDF)
- ✅ Function Calling
- ✅ JSON Mode
- ✅ Streaming
- ✅ Safety Settings

---

## Related

- [API V1 Chat](../03-api-v1-chat/README.md)
- [API V1 Media](../04-api-v1-media/README.md)
