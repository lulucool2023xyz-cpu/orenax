# V1 Unified API Reference

> **Base URL**: `/v1`  
> **SDK**: @google/genai with Vertex AI

This is the new unified API endpoint using the modern GenAI SDK.

---

## 🏥 Health & Status

### GET /v1/health
Check API and service availability.

```bash
curl http://localhost:3001/v1/health
```

**Response:**
```json
{
  "status": "ok",
  "genaiClient": true,
  "timestamp": "2024-12-05T12:00:00.000Z"
}
```

### GET /v1/models
List all available models.

```bash
curl http://localhost:3001/v1/models
```

**Response:**
```json
{
  "chat": ["gemini-3-pro-preview", "gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"],
  "image": ["imagen-4.0-generate-001", "imagen-4.0-ultra-generate-001", "imagen-3.0-generate-002"],
  "video": ["veo-3.1-generate-001", "veo-3.0-generate-001", "veo-2.0-generate-001"],
  "music": ["lyria-002"]
}
```

---

## 💬 Chat API

### POST /v1/chat
Full-featured chat with grounding and thinking.

```json
{
  "messages": [
    {"role": "user", "content": "What's the latest AI news?"}
  ],
  "model": "gemini-2.5-flash",
  "grounding": {
    "googleSearch": true,
    "googleMaps": {"latitude": 37.7749, "longitude": -122.4194}
  },
  "thinking": {
    "thinkingLevel": "HIGH",
    "thinkingBudget": 8192
  },
  "temperature": 1.0,
  "maxOutputTokens": 8192
}
```

**Response:**
```json
{
  "success": true,
  "model": "gemini-2.5-flash",
  "response": {
    "text": "Here's the latest AI news...",
    "thoughts": ["Analyzing query...", "Searching..."],
    "grounding": {
      "webSearchQueries": ["latest AI news 2024"],
      "searchEntryPoint": {...},
      "groundingSupports": [...]
    }
  },
  "usage": {"promptTokenCount": 10, "candidatesTokenCount": 150}
}
```

### POST /v1/chat/stream
Streaming chat with Server-Sent Events.

```bash
curl -X POST http://localhost:3001/v1/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

**Stream Response:**
```
data: {"text":"Hello"}
data: {"text":" there!"}
data: [DONE]
```

---

## 🖼️ Image API

### POST /v1/image/generate
Generate image from text prompt.

```json
{
  "prompt": "A beautiful sunset over mountains",
  "model": "imagen-4.0-generate-001",
  "sampleCount": 1,
  "negativePrompt": "blurry, low quality",
  "personGeneration": "allow_adult"
}
```

**Models:** `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-3.0-generate-002`

### POST /v1/image/upscale
Upscale image resolution.

```json
{
  "image": "base64_encoded_image",
  "upscaleFactor": "x2"
}
```

**Factors:** `x2`, `x3`, `x4`

### POST /v1/image/edit
Edit image with masks.

```json
{
  "prompt": "Add a rainbow in the sky",
  "image": {"bytesBase64Encoded": "base64_image"},
  "mask": {"bytesBase64Encoded": "base64_mask"},
  "editMode": "EDIT_MODE_INPAINT_INSERTION"
}
```

**Edit Modes:**
- `EDIT_MODE_INPAINT_REMOVAL` - Remove objects
- `EDIT_MODE_INPAINT_INSERTION` - Add objects
- `EDIT_MODE_OUTPAINT` - Extend image

---

## 🎬 Video API

### POST /v1/video/generate
Generate video from text.

```json
{
  "prompt": "A cat playing with yarn, cinematic quality",
  "model": "veo-3.0-generate-001",
  "durationSeconds": 8,
  "aspectRatio": "16:9",
  "generateAudio": true
}
```

**Models:** `veo-3.1-generate-001`, `veo-3.0-generate-001`, `veo-2.0-generate-001`

**Parameters:**
- Duration: 4-8 seconds
- Aspect: `16:9`, `9:16`, `1:1`
- Resolution: `720p`, `1080p`

### GET /v1/video/status?operationId=xxx
Check video generation status.

```json
{
  "done": true,
  "response": {
    "videos": [{"gcsUri": "gs://...", "mimeType": "video/mp4"}]
  }
}
```

---

## 🎵 Music API

### POST /v1/music/generate
Generate instrumental music.

```json
{
  "prompt": "An uplifting orchestral piece with soaring strings",
  "negativePrompt": "drums, heavy bass",
  "seed": 12345,
  "sampleCount": 1
}
```

**Model:** `lyria-002`  
**Output:** WAV, 48kHz, ~32 seconds

---

## 🎙️ TTS API

### POST /v1/tts/synthesize
Text-to-speech synthesis.

```json
{
  "text": "Hello, welcome to OrenaX!",
  "voiceName": "Kore",
  "speakingRate": 1.0,
  "pitch": 0,
  "languageCode": "en-US"
}
```

### GET /v1/tts/voices
List available voices.

```json
{
  "voices": [
    {"name": "Kore", "type": "standard"},
    {"name": "Zephyr", "type": "expressive"},
    {"name": "Aurora", "type": "expressive"}
  ]
}
```

**All Voices:** `Aoede`, `Charon`, `Fenrir`, `Kore`, `Puck`, `Zephyr`, `Harmony`, `Aurora`, `Ember`

---

## 📄 Document API

### POST /v1/document/analyze
Analyze document content (PDF, TXT, HTML, CSV).

```json
{
  "document": {
    "bytesBase64Encoded": "base64_pdf_content",
    "mimeType": "application/pdf"
  },
  "prompt": "Summarize this document",
  "model": "gemini-2.5-flash"
}
```

### POST /v1/document/summarize
Quick document summarization.

```json
{
  "document": {
    "gcsUri": "gs://bucket/document.pdf",
    "mimeType": "application/pdf"
  }
}
```

**Supported Types:** `application/pdf`, `text/plain`, `text/html`, `text/csv`

---

## 📝 Prompt Management

### GET /v1/prompts
List available prompts.

```json
{
  "prompts": [
    {"name": "orenax-agent", "displayName": "OrenaX Agent", "description": "Default Indonesian AI assistant"},
    {"name": "code-assistant", "displayName": "Code Assistant", "description": "Programming assistant"}
  ]
}
```

---

## 🛡️ Safety Configuration

### GET /v1/safety/presets
Get safety filter presets.

```json
{
  "presets": {
    "PERMISSIVE": "Blocks only high probability harm",
    "DEFAULT": "Blocks medium and above",
    "STRICT": "Blocks low and above"
  },
  "categories": [
    "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "HARM_CATEGORY_HATE_SPEECH",
    "HARM_CATEGORY_HARASSMENT",
    "HARM_CATEGORY_DANGEROUS_CONTENT"
  ]
}
```

---

## 📊 Response Format

All media generation endpoints return:

```json
{
  "success": true,
  "model": "model-name",
  "url": "https://storage.googleapis.com/...",
  "publicUrl": "https://storage.googleapis.com/...",
  "gcsUri": "gs://bucket/path/file",
  "filename": "generated-file.ext",
  "mimeType": "type/subtype",
  "generatedAt": "2024-12-05T12:00:00.000Z"
}
```

---

## 🔗 Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/health` | GET | Health check |
| `/v1/models` | GET | List models |
| `/v1/chat` | POST | Chat with grounding |
| `/v1/chat/stream` | POST | Streaming chat |
| `/v1/image/generate` | POST | Text to image |
| `/v1/image/upscale` | POST | Upscale image |
| `/v1/image/edit` | POST | Edit image |
| `/v1/video/generate` | POST | Text to video |
| `/v1/video/status` | GET | Video status |
| `/v1/music/generate` | POST | Text to music |
| `/v1/tts/synthesize` | POST | Text to speech |
| `/v1/tts/voices` | GET | List voices |
| `/v1/document/analyze` | POST | Analyze document |
| `/v1/document/summarize` | POST | Summarize document |
| `/v1/prompts` | GET | List prompts |
| `/v1/safety/presets` | GET | Safety presets |
