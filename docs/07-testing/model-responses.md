# Model Response Samples

Contoh response dari berbagai model Gemini untuk referensi testing.

---

## Chat Models

### gemini-2.0-flash

**Request:**
```json
{"prompt": "Say hello in 3 languages"}
```

**Response:**
```json
{
  "text": "Hello! (English)\nHola! (Spanish)\nBonjour! (French)",
  "model": "gemini-2.0-flash",
  "usage": {
    "promptTokens": 6,
    "completionTokens": 15,
    "totalTokens": 21
  },
  "finishReason": "STOP"
}
```

### gemini-2.0-flash-thinking-exp

**Request:**
```json
{
  "prompt": "What is 15 * 23?",
  "thinkingConfig": {"includeThoughts": true}
}
```

**Response:**
```json
{
  "text": "15 × 23 = 345",
  "thinkingContent": "Let me solve this step by step:\n1. 15 × 20 = 300\n2. 15 × 3 = 45\n3. 300 + 45 = 345",
  "model": "gemini-2.0-flash-thinking-exp"
}
```

### gemini-2.5-pro

**Request:**
```json
{"prompt": "Explain REST API"}
```

**Response:**
```json
{
  "text": "REST (Representational State Transfer) is an architectural style for designing networked applications...",
  "model": "gemini-2.5-pro"
}
```

---

## Image Generation

### imagen-4.0-generate-001

**Request:**
```json
{
  "prompt": "A cat sitting on a laptop",
  "aspectRatio": "1:1"
}
```

**Response:**
```json
{
  "images": [
    {
      "url": "https://storage.googleapis.com/orenax-vertex-ai-images/images/generated/image-generation/20241205_123456_abc.png",
      "mimeType": "image/png",
      "filename": "20241205_123456_abc.png"
    }
  ],
  "prompt": "A cat sitting on a laptop",
  "model": "imagen-4.0-generate-001",
  "generatedAt": "2024-12-05T12:34:56.789Z"
}
```

---

## Video Generation

### veo-3.1-generate-preview

**Request:**
```json
{
  "prompt": "Ocean waves crashing on rocks",
  "durationSeconds": 8
}
```

**Response:**
```json
{
  "url": "https://storage.googleapis.com/orenax-vertex-ai-images/videos/generated/20241205_123456_xyz.mp4",
  "filename": "20241205_123456_xyz.mp4",
  "prompt": "Ocean waves crashing on rocks",
  "model": "veo-3.1-generate-preview",
  "generatedAt": "2024-12-05T12:34:56.789Z"
}
```

---

## Music Generation

### lyria-realtime-exp

**Request:**
```json
{
  "prompts": [
    {"text": "calm piano melody", "weight": 1.0}
  ],
  "durationSeconds": 30,
  "bpm": 80
}
```

**Response:**
```json
{
  "url": "https://storage.googleapis.com/orenax-vertex-ai-images/audio/generated/20241205_123456_music.wav",
  "filename": "20241205_123456_music.wav",
  "prompts": [{"text": "calm piano melody", "weight": 1.0}],
  "config": {
    "bpm": 80,
    "duration": 30
  },
  "generatedAt": "2024-12-05T12:34:56.789Z"
}
```

---

## TTS

### gemini-2.5-flash-preview-tts

**Single Speaker Request:**
```json
{
  "text": "Welcome to OrenaX!",
  "voiceName": "Kore"
}
```

**Response:**
```json
{
  "url": "https://storage.googleapis.com/orenax-vertex-ai-images/audio/tts/20241205_123456_tts.wav",
  "filename": "20241205_123456_tts.wav",
  "text": "Welcome to OrenaX!",
  "voice": "Kore",
  "model": "gemini-2.5-flash-preview-tts",
  "generatedAt": "2024-12-05T12:34:56.789Z"
}
```

**Multi Speaker Request:**
```json
{
  "text": "Alice: Hello!\nBob: Hi there!",
  "speakers": [
    {"name": "Alice", "voiceName": "Kore"},
    {"name": "Bob", "voiceName": "Puck"}
  ]
}
```

**Response:**
```json
{
  "url": "https://storage.googleapis.com/...",
  "text": "Alice: Hello!\nBob: Hi there!",
  "speakers": [
    {"name": "Alice", "voiceName": "Kore"},
    {"name": "Bob", "voiceName": "Puck"}
  ],
  "model": "gemini-2.5-flash-preview-tts",
  "generatedAt": "2024-12-05T12:34:56.789Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid prompt: prompt is required",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "error": "Unauthorized"
}
```

### 429 Rate Limited
```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded. Please try again later.",
  "error": "Too Many Requests"
}
```

### 503 Service Unavailable
```json
{
  "statusCode": 503,
  "message": "Image generation service not configured. Missing GEMINI_API_KEY.",
  "error": "Service Unavailable"
}
```

---

## Live WebSocket Messages

### Setup Complete
```json
{"setupComplete": {}}
```

### Server Content (Audio)
```json
{
  "serverContent": {
    "modelTurn": {
      "parts": [
        {
          "inlineData": {
            "mimeType": "audio/pcm",
            "data": "base64_audio_data..."
          }
        }
      ]
    },
    "turnComplete": false
  }
}
```

### Turn Complete
```json
{
  "serverContent": {
    "turnComplete": true,
    "generationComplete": true
  }
}
```

### Error
```json
{
  "error": {
    "code": "INVALID_ARGUMENT",
    "message": "Audio format not supported"
  }
}
```
