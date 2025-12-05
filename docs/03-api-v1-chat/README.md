# 💬 API V1 Chat

Chat API menggunakan Vertex AI dengan penyimpanan ke Supabase.

## Base URL
```
/api/v1/chat
```

## Authentication
Semua endpoint membutuhkan JWT token:
```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/chat` | Send chat message |
| `POST` | `/api/v1/chat/count-tokens` | Count tokens |
| `GET` | `/api/v1/chat/conversations` | List conversations |
| `GET` | `/api/v1/chat/conversations/:id` | Get conversation |
| `DELETE` | `/api/v1/chat/conversations/:id` | Delete conversation |

---

## POST /api/v1/chat

Send chat message dengan opsi:
- Thinking mode
- Google Search grounding
- Multi-turn conversation

### Request

```json
{
  "messages": [
    { "role": "user", "content": "Apa berita terbaru tentang AI?" }
  ],
  "model": "gemini-2.5-flash",
  "thinkingConfig": {
    "thinkingBudget": 8192,
    "includeThoughts": true
  },
  "groundingConfig": {
    "googleSearch": true
  },
  "conversationId": "optional-existing-conversation-id"
}
```

### Response

```json
{
  "message": {
    "role": "model",
    "content": "Berikut adalah berita terbaru tentang AI...",
    "finishReason": "STOP",
    "thoughts": ["Analyzing the question...", "Searching for recent news..."]
  },
  "usageMetadata": {
    "promptTokenCount": 50,
    "candidatesTokenCount": 200,
    "totalTokenCount": 250
  },
  "groundingMetadata": {
    "webSearchQueries": ["AI news December 2024"],
    "groundingChunks": [...]
  },
  "model": "gemini-2.5-flash",
  "conversationId": "uuid-conversation-id"
}
```

---

## Supported Models

| Model | Thinking | Grounding |
|-------|----------|-----------|
| `gemini-2.5-pro` | ✅ Budget | ✅ |
| `gemini-2.5-flash` | ✅ Budget | ✅ |
| `gemini-2.0-flash` | ❌ | ✅ |

---

## Features

### Thinking Mode
```json
{
  "thinkingConfig": {
    "thinkingBudget": 8192,
    "includeThoughts": true
  }
}
```

### Google Search Grounding
```json
{
  "groundingConfig": {
    "googleSearch": true
  }
}
```

### Conversation Storage
All messages automatically saved to Supabase:
- `conversations` table
- `messages` table

---

## cURL Example

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "messages": [{"role": "user", "content": "Hello!"}],
    "model": "gemini-2.5-flash"
  }'
```

---

## Related Docs

- [Thinking Mode](./thinking-mode.md)
- [Grounding Search](./grounding-search.md)
- [Conversation Storage](../06-database/conversation-guide.md)
