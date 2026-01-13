# Quick Reference - API Endpoints

## Base URL
```
Production: https://orenax-production-0c1a.up.railway.app/api/v2/openrouter
Local Dev:  http://localhost:3001/api/v2/openrouter
```

## Authentication
```
Header: Authorization: Bearer <JWT_TOKEN>
```

---

## Endpoints

### Chat
```http
POST /chat/completions    # Non-streaming
POST /chat/stream         # SSE streaming
```

### Models
```http
GET /models                        # List all premium models
GET /models/:modelId              # Get model details
GET /models/recommended/:useCase  # chat|vision|audio|coding|reasoning
```

### Multimodal
```http
POST /vision   # Image analysis
POST /audio    # Audio processing
```

### Function Calling
```http
POST /tools/invoke   # Initial request with tools
POST /tools/submit   # Submit function results
GET  /tools/builtin  # Get built-in functions
```

### Health
```http
GET /health   # API status
```

---

## Request Examples

### Chat Completion
```json
POST /chat/completions
{
  "model": "anthropic/claude-sonnet-4.5",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

### Vision
```json
POST /vision
{
  "model": "openai/gpt-4o",
  "images": [{ "url": "https://..." }],
  "prompt": "Describe this image."
}
```

---

## Premium Models

| Use Case | Model ID |
|----------|----------|
| Default | `anthropic/claude-sonnet-4.5` |
| Complex Reasoning | `anthropic/claude-opus-4.5` |
| Vision | `openai/gpt-4o` |
| Audio | `openai/gpt-4o-audio-preview` |
| Long Context | `google/gemini-2.5-pro` |
| Fast | `google/gemini-2.5-flash` |
| Coding | `deepseek/deepseek-r1` |

---

## Error Response Format
```json
{
  "error": {
    "message": "Error description",
    "type": "error_type",
    "code": "ERROR_CODE"
  }
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 401 | Unauthorized (login required) |
| 403 | Forbidden (no permission) |
| 404 | Not found |
| 429 | Rate limited |
| 500 | Server error |
| 502 | AI provider error |
| 504 | Timeout |
