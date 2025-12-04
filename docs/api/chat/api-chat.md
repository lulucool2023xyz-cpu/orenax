# Vertex AI Chat API - API Documentation

Complete API reference untuk Vertex AI Chat endpoints.

## Base URL

```
http://localhost:3001/api/v1/chat
```

> [!NOTE]
> Semua endpoints memerlukan **JWT Authentication** via Bearer token

---

## Authentication

Semua request harus include JWT token di header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Dapatkan token via [Authentication API](./README.md#authentication-api).

---

## Endpoints

### 1. POST /api/v1/chat

Generate chat response dari Gemini model.

#### Headers
```http
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Request Body

```json
{
  "model": "gemini-2.5-flash",  // Optional, default: gemini-2.5-flash
  "messages": [
    {
      "role": "user",
      "content": "Halo! Siapa kamu?"
    }
  ],
  "stream": false,              // Optional, default: false
  "generationConfig": {         // Optional
    "temperature": 1.0,
    "maxOutputTokens": 8192
  },
  "systemInstruction": "..."    // Optional, custom system instruction
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `model` | string | No | Model ID (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-3-pro-preview`). Default: `gemini-2.5-flash` |
| `messages` | array | **Yes** | Array of message objects dengan `role` ('user'/'model') dan `content` |
| `stream` | boolean | No | Enable streaming response. Default: `false` |
| `generationConfig` | object | No | Generation parameters (temperature, topP, topK, maxOutputTokens) |
| `systemInstruction` | string | No | Custom system instruction. Jika tidak provided, akan use OrenaX Agent default |
| `thinkingConfig` | object | No | Thinking mode config (`thinkingBudget` untuk Gemini 2.5, `thinkingLevel` untuk Gemini 3) |
| `groundingConfig` | object | No | Grounding config untuk Google Search dan Google Maps |
| `multimodalContents` | array | No | Multimodal content (images, documents) |

#### Generation Config Options

```typescript
{
  "temperature": 1.0,        // 0.0 - 2.0, default: 1.0
  "topP": 0.95,              // 0.0 - 1.0, default: 0.95
  "topK": 40,                // 1 - 100, default: 40
  "maxOutputTokens": 8192,   // Max: 8192
  "candidateCount": 1        // Only 1 supported currently
}
```

#### Response (Non-Streaming)

**Success (200 OK)**:
```json
{
  "message": {
    "role": "model",
    "content": "Halo! Saya OrenaX Agent, asisten AI yang dikembangkan dengan teknologi Google Cloud Vertex AI. Saya siap membantu Anda! 🚀",
    "finishReason": "STOP"
  },
  "usageMetadata": {
    "promptTokenCount": 25,
    "candidatesTokenCount": 45,
    "totalTokenCount": 70
  },
  "model": "gemini-2.5-flash",
  "conversationId": "uuid-here"
}
```

#### Response (Streaming)

When `stream: true`, responses use **Server-Sent Events (SSE)**:

```
Content-Type: text/event-stream

data: {"content":"Halo","done":false}

data: {"content":" Saya ","done":false}

data: {"content":"OrenaX Agent","done":false}

data: {"content":"!","done":true,"usageMetadata":{...}}

data: [DONE]
```

#### Error Responses

**401 Unauthorized**:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**400 Bad Request**:
```json
{
  "statusCode": 400,
  "message": ["messages should not be empty"],
  "error": "Bad Request"
}
```

**500 Internal Server Error**:
```json
{
  "statusCode": 500,
  "message": "Terjadi kesalahan internal"
}
```

---

### 2. POST /api/v1/chat/count-tokens

Count jumlah tokens dari messages.

#### Request Body

```json
{
  "model": "gemini-2.5-flash",  // Optional
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ]
}
```

#### Response

**Success (200 OK)**:
```json
{
  "totalTokens": 15,
  "model": "gemini-2.5-flash"
}
```

> [!TIP]
> Token counting useful untuk:
> - Estimate API costs
> - Validate input tidak exceed limits
> - Optimize prompt engineering

---

### 3. GET /api/v1/chat/conversations

List semua conversations untuk logged-in user.

#### Query Parameters

None

#### Response

**Success (200 OK)**:
```json
[
  {
    "id": "uuid-1",
    "title": "Halo! Siapa kamu?",
    "model": "gemini-2.5-flash",
    "created_at": "2025-12-02T10:00:00Z",
    "updated_at": "2025-12-02T10:05:00Z"
  },
  {
    "id": "uuid-2",
    "title": "Explain quantum computing",
    "model": "gemini-2.5-pro",
    "created_at": "2025-12-01T15:30:00Z",
    "updated_at": "2025-12-01T15:45:00Z"
  }
]
```

---

### 4. GET /api/v1/chat/conversations/:id

Get conversation history by ID.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Conversation ID |

#### Response

**Success (200 OK)**:
```json
[
  {
    "role": "user",
    "content": "Halo! Siapa kamu?"
  },
  {
    "role": "model",
    "content": "Halo! Saya OrenaX Agent..."
  }
]
```

**404 Not Found**:
```json
{
  "statusCode": 404,
  "message": "Conversation not found or unauthorized"
}
```

---

### 5. DELETE /api/v1/chat/conversations/:id

Delete conversation by ID.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Conversation ID |

#### Response

**Success (204 No Content)**: Empty response

**404 Not Found**:
```json
{
  "statusCode": 404,
  "message": "Conversation not found"
}
```

---

## Query Parameters

### POST /api/v1/chat

| Parameter | Type | Description |
|-----------|------|-------------|
| `conversation_id` | string (UUID) | Optional. Continue existing conversation |

**Example**:
```http
POST /api/v1/chat?conversation_id=uuid-here
```

---

## Model Information

### Available Models

| Model ID | Description | Use Case |
|----------|-------------|----------|
| `gemini-2.5-flash` | **Default**. Fastest response, cost-effective | General chat, FAQ bots |
| `gemini-2.5-pro` | Higher quality, more capable | Complex reasoning, content creation |
| `gemini-3-pro-preview` | Latest model (preview) | Testing new features |

### Token Limits

| Model | Input Tokens | Output Tokens |
| ------|--------------|---------------|
| `gemini-2.5-flash` | 1,048,576 (1M) | 8,192 |
| `gemini-2.5-pro` | 1,048,576 (1M) | 8,192 |
| `gemini-3-pro-preview` | 1,048,576 (1M) | 8,192 |

---

## Rate Limits

Default rate limits per project:
- **Requests per minute (RPM)**: 60
- **Tokens per minute (TPM)**: 32,000

> [!WARNING]
> Rate limits dapat vary berdasarkan billing plan dan region

---

## Examples

### Basic Chat

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Jelaskan tentang machine learning"
      }
    ]
  }'
```

### Multi-Turn Conversation

```bash
curl -X POST "http://localhost:3001/api/v1/chat?conversation_id=uuid-here" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Apa perbedaannya dengan deep learning?"
      }
    ]
  }'
```

### Streaming Response

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -N \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Ceritakan sebuah kisah pendek"
      }
    ],
    "stream": true
  }'
```

### Custom Generation Config

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-pro",
    "messages": [
      {
        "role": "user",
        "content": "Write a creative story"
      }
    ],
    "generationConfig": {
      "temperature": 1.5,
      "maxOutputTokens": 2048
    }
  }'
```

### Grounding dengan Google Search

Grounding memungkinkan AI mengakses data real-time dari Google Search.

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Apa berita terbaru tentang AI di tahun 2025?"
      }
    ],
    "groundingConfig": {
      "googleSearch": {}
    }
  }'
```

**Dengan excludeDomains:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Latest technology trends"
      }
    ],
    "groundingConfig": {
      "googleSearch": {
        "excludeDomains": ["wikipedia.org", "reddit.com"]
      }
    }
  }'
```

**Response dengan Grounding:**
```json
{
  "message": {
    "role": "model",
    "content": "Berdasarkan berita terbaru, berikut perkembangan AI di 2025...",
    "finishReason": "STOP"
  },
  "groundingMetadata": {
    "webSearchQueries": ["AI news 2025", "artificial intelligence latest"],
    "groundingChunks": [
      {
        "uri": "https://example.com/ai-news-1",
        "title": "Latest AI Developments"
      }
    ],
    "searchEntryPoint": "GOOGLE_SEARCH"
  },
  "usageMetadata": {...},
  "model": "gemini-2.5-flash"
}
```

### Grounding dengan Google Maps

Google Maps grounding untuk query lokasi dan tempat.

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Temukan restoran Italia terbaik di dekat Times Square, New York"
      }
    ],
    "groundingConfig": {
      "googleMaps": {
        "enableWidget": true
      }
    }
  }'
```

**Parameter Google Maps:**
- `enableWidget` (boolean, optional): Enable map widget dalam response

### Kombinasi Google Search + Maps

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Saya ingin mengunjungi coffee shop terbaik di Seattle. Beri tahu saya tentang mereka dan lokasinya."
      }
    ],
    "groundingConfig": {
      "googleSearch": {},
      "googleMaps": {
        "enableWidget": true
      }
    }
  }'
```

### Thinking Mode (Gemini 2.5 & 3)

**Gemini 2.5 dengan thinkingBudget:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-pro",
    "messages": [
      {
        "role": "user",
        "content": "Selesaikan: 2x + 5 = 15"
      }
    ],
    "thinkingConfig": {
      "thinkingBudget": 1000
    },
    "stream": true
  }'
```

**Gemini 3 dengan thinkingLevel:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3-pro-preview",
    "messages": [
      {
        "role": "user",
        "content": "Analisis dampak ekonomi dari AI"
      }
    ],
    "thinkingConfig": {
      "thinkingLevel": "HIGH"
    }
  }'
```

---

## Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 204 | No Content | Delete successful |
| 400 | Bad Request | Invalid request body/parameters |
| 401 | Unauthorized | Missing atau invalid JWT token |
| 404 | Not Found | Resource not found |
| 429 |  Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Vertex AI temporarily unavailable |

---

## Best Practices

### ✅ DO:
- Use conversation IDs untuk multi-turn conversations
- Implement retry logic dengan exponential backoff
- Monitor token usage untuk cost optimization
- Use streaming untuk better UX pada long responses
- Handle errors gracefully dengan user-friendly messages

### ❌ DON'T:
- Send extremely long messages (>1M tokens)
- Make rapid sequential requests (respect rate limits)
- Store sensitive data dalam conversation history
- Hardcode API tokens dalam client code

---

## Next Steps

- 🧪 [API Testing Guide](./api-testing-chat.md) - Test dengan cURL/Postman
- 💾 [Conversation Storage](./conversation-storage.md) - Understand data model
- 🔧 [Setup Guide](./vertex-ai-setup.md) - Configure Google Cloud
