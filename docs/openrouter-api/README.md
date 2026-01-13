# OpenRouter API Documentation

## Overview

OpenRouter provides access to **500+ AI models** through a unified, OpenAI-compatible API. This integration prioritizes **premium models** for the best quality results.

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/openrouter/chat/completions` | Chat completion (non-streaming) |
| POST | `/api/v2/openrouter/chat/stream` | Chat completion (SSE streaming) |
| GET | `/api/v2/openrouter/models` | List available models |
| GET | `/api/v2/openrouter/models/:id` | Get model details |
| GET | `/api/v2/openrouter/models/recommended/:useCase` | Get recommended models |
| POST | `/api/v2/openrouter/vision` | Analyze images |
| POST | `/api/v2/openrouter/audio` | Process audio |
| POST | `/api/v2/openrouter/tools/invoke` | Function calling |
| POST | `/api/v2/openrouter/tools/submit` | Submit function results |
| GET | `/api/v2/openrouter/tools/builtin` | Get built-in functions |
| GET | `/api/v2/openrouter/health` | Health check |

---

## Premium Models

### Flagship (Best Quality)
| Model ID | Description | Strengths |
|----------|-------------|-----------|
| `anthropic/claude-opus-4.5` | Most intelligent Claude | Complex reasoning, analysis |
| `openai/gpt-5.2-pro` | OpenAI flagship | General purpose, reliable |
| `openai/o1-pro` | Reasoning specialist | Mathematics, logic |

### Balanced (Quality + Speed)
| Model ID | Description | Strengths |
|----------|-------------|-----------|
| `anthropic/claude-sonnet-4.5` | Fast + capable | Coding, writing, general |
| `openai/gpt-5.2` | Latest GPT | Versatile, multimodal |
| `openai/gpt-4o` | Multimodal | Vision, audio, speed |
| `google/gemini-2.5-pro` | 1M context | Long documents, video |

### Fast (Speed Priority)
| Model ID | Description | Best For |
|----------|-------------|----------|
| `google/gemini-2.5-flash` | Ultra-fast | Simple tasks, high volume |
| `google/gemini-3-flash-preview` | Latest fast | Multimodal quick tasks |

---

## Usage Examples

### Basic Chat Completion

```bash
curl -X POST https://your-api.com/api/v2/openrouter/chat/completions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-sonnet-4.5",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Explain quantum computing in simple terms."}
    ],
    "max_tokens": 1000,
    "temperature": 0.7
  }'
```

### Vision (Image Analysis)

```bash
curl -X POST https://your-api.com/api/v2/openrouter/vision \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-4o",
    "images": [{"url": "https://example.com/image.jpg", "detail": "high"}],
    "prompt": "Describe this image in detail."
  }'
```

### Function Calling

```bash
curl -X POST https://your-api.com/api/v2/openrouter/tools/invoke \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-sonnet-4.5",
    "messages": [{"role": "user", "content": "What is the weather in Tokyo?"}],
    "tools": [{
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get weather for a location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {"type": "string"}
          },
          "required": ["location"]
        }
      }
    }]
  }'
```

---

## Model Capabilities

| Model | Vision | Audio | Functions | Max Context |
|-------|--------|-------|-----------|-------------|
| claude-opus-4.5 | ✅ | ❌ | ✅ | 200K |
| claude-sonnet-4.5 | ✅ | ❌ | ✅ | 200K |
| gpt-5.2 | ✅ | ❌ | ✅ | 128K |
| gpt-4o | ✅ | ✅ | ✅ | 128K |
| gpt-4o-audio | ✅ | ✅ | ✅ | 128K |
| gemini-2.5-pro | ✅ | ✅ | ✅ | 1M |
| o1 | ❌ | ❌ | ❌ | 128K |

---

## Rate Limits

| Endpoint Type | Limit |
|---------------|-------|
| Chat Completion | 30 req/min |
| Streaming | 20 req/min |
| Vision | 15 req/min |
| Audio | 10 req/min |
| Function Calling | 20 req/min |

---

## Error Handling

| Status | Description | Resolution |
|--------|-------------|------------|
| 400 | Invalid request | Check request body format |
| 401 | Unauthorized | Provide valid JWT token |
| 429 | Rate limited | Wait and retry |
| 502 | OpenRouter error | Model may be unavailable |
| 504 | Timeout | Request took too long |

---

## Configuration

Set these environment variables:

```bash
OPENROUTER_API_KEY=sk-or-v1-xxxxx
OPENROUTER_DEFAULT_MODEL=anthropic/claude-sonnet-4.5
OPENROUTER_SITE_URL=https://your-site.com
OPENROUTER_SITE_NAME=Your App Name
OPENROUTER_TIMEOUT=120000
```

Get your API key at: https://openrouter.ai/keys
