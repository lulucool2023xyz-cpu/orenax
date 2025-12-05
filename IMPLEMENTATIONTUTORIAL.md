# 🚀 OrenaX Implementation Tutorial

Complete testing guide untuk semua fitur yang telah diimplementasikan.

**Base URL**: `http://localhost:3001`

---

## 📋 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env dengan credentials Anda

# 3. Run development server
npm run start:dev

# 4. Test health endpoint
curl http://localhost:3001/v1/health
```

---

## 🔐 Authentication

### Register User
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:** Simpan `access_token` untuk request berikutnya.

---

## 💬 Chat API

### 1. Basic Chat (V1 Unified)
```bash
curl -X POST http://localhost:3001/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Halo, siapa kamu?"}
    ],
    "model": "gemini-2.5-flash"
  }'
```

### 2. Chat dengan Thinking Mode
```bash
curl -X POST http://localhost:3001/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Berapa hasil 15 x 23 + 47?"}
    ],
    "model": "gemini-2.5-flash",
    "thinking": {
      "thinkingBudget": 8192
    }
  }'
```

### 3. Chat dengan Google Search Grounding
```bash
curl -X POST http://localhost:3001/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Apa berita AI terbaru hari ini?"}
    ],
    "grounding": {
      "googleSearch": true
    }
  }'
```

### 4. Chat Streaming
```bash
curl -X POST http://localhost:3001/v1/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Ceritakan tentang Indonesia"}
    ]
  }'
```

### 5. Chat via Legacy API (with JWT)
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "model": "gemini-2.5-flash"
  }'
```

---

## 🖼️ Image Generation

### 1. Text to Image (Imagen 4.0)
```bash
curl -X POST http://localhost:3001/api/v1/image/text-to-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "model": "imagen-4.0-generate-001",
    "prompt": "A beautiful sunset over Indonesian rice terraces, golden hour, peaceful atmosphere",
    "sampleCount": 1,
    "aspectRatio": "16:9",
    "negativePrompt": "blurry, low quality, distorted",
    "personGeneration": "dont_allow",
    "addWatermark": true
  }'
```

**Response:**
```json
{
  "success": true,
  "model": "imagen-4.0-generate-001",
  "images": [{
    "url": "https://storage.googleapis.com/...",
    "publicUrl": "https://storage.googleapis.com/...",
    "gcsUri": "gs://bucket/path/image.png"
  }]
}
```

### 2. Image Upscale
```bash
curl -X POST http://localhost:3001/api/v1/image/image-upscale \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "image": "BASE64_ENCODED_IMAGE_HERE",
    "upscaleFactor": "x2",
    "prompt": "Upscale with high detail"
  }'
```

**Upscale Factors:** `x2`, `x3`, `x4`

### 3. Image Edit (Inpainting)
```bash
curl -X POST http://localhost:3001/api/v1/image/image-edit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prompt": "Add a rainbow in the sky",
    "editMode": "EDIT_MODE_INPAINT_INSERTION",
    "referenceImages": [
      {
        "referenceType": "REFERENCE_TYPE_RAW",
        "referenceId": 0,
        "bytesBase64Encoded": "BASE64_IMAGE"
      },
      {
        "referenceType": "REFERENCE_TYPE_MASK",
        "referenceId": 1,
        "bytesBase64Encoded": "BASE64_MASK",
        "maskImageConfig": {
          "maskMode": "MASK_MODE_USER_PROVIDED"
        }
      }
    ],
    "sampleCount": 2
  }'
```

**Edit Modes:**
- `EDIT_MODE_INPAINT_REMOVAL` - Hapus objek
- `EDIT_MODE_INPAINT_INSERTION` - Tambah objek
- `EDIT_MODE_OUTPAINT` - Extend gambar
- `EDIT_MODE_BGSWAP` - Ganti background

### 4. Virtual Try-On
```bash
curl -X POST http://localhost:3001/api/v1/image/virtual-try-on \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "personImage": "BASE64_PERSON_IMAGE",
    "productImages": ["BASE64_CLOTHING_IMAGE"],
    "sampleCount": 1
  }'
```

---

## 🎬 Video Generation

### 1. Text to Video (Veo 3.0)
```bash
curl -X POST http://localhost:3001/api/v1/video/text-to-video \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prompt": "A majestic Komodo dragon walking through tropical forest, cinematic quality, 4K",
    "model": "veo-3.0-generate-001",
    "durationSeconds": 8,
    "aspectRatio": "16:9",
    "resolution": "1080p",
    "generateAudio": true
  }'
```

**Response:** Returns `operationId` untuk check status.

### 2. Check Video Status
```bash
curl "http://localhost:3001/api/v1/video/operation?id=YOUR_OPERATION_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response when done:**
```json
{
  "done": true,
  "response": {
    "videos": [{
      "gcsUri": "gs://bucket/video.mp4",
      "publicUrl": "https://storage.googleapis.com/..."
    }]
  }
}
```

### 3. Image to Video
```bash
curl -X POST http://localhost:3001/api/v1/video/image-to-video \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prompt": "The person slowly walks forward, camera follows",
    "image": {
      "bytesBase64Encoded": "BASE64_IMAGE"
    },
    "durationSeconds": 6,
    "generateAudio": true
  }'
```

### 4. Video Extend
```bash
curl -X POST http://localhost:3001/api/v1/video/extend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prompt": "Continue the scene with more action",
    "video": {
      "gcsUri": "gs://bucket/original.mp4"
    },
    "extensionSeconds": 4
  }'
```

---

## 🎵 Music Generation

### Generate Music (Lyria)
```bash
curl -X POST http://localhost:3001/api/v1/music/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "prompt": "An uplifting orchestral piece with soaring strings and triumphant brass, epic cinematic feel",
    "negativePrompt": "drums, heavy bass, electronic sounds, vocals",
    "sampleCount": 1
  }'
```

**Output:** WAV, 48kHz, ~32 seconds instrumental

---

## 🎙️ Text-to-Speech (TTS)

### 1. List Available Voices
```bash
curl http://localhost:3001/v1/tts/voices
```

**Voices:** `Aoede`, `Charon`, `Fenrir`, `Kore`, `Puck`, `Zephyr`, `Harmony`, `Aurora`, `Ember`

### 2. Single Speaker TTS
```bash
curl -X POST http://localhost:3001/api/v1/audio/tts/single \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "text": "Selamat datang di OrenaX Platform! Kami senang Anda bergabung.",
    "voiceName": "Kore",
    "speakingRate": 1.0,
    "pitch": 0,
    "languageCode": "id-ID"
  }'
```

**Parameters:**
- `speakingRate`: 0.25 - 4.0
- `pitch`: -20.0 - 20.0
- `volumeGainDb`: -96.0 - 16.0

### 3. Multi-Speaker TTS
```bash
curl -X POST http://localhost:3001/api/v1/audio/tts/multi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "text": "[Host] Selamat pagi! [Guest] Terima kasih sudah mengundang saya.",
    "speakerConfigs": [
      {"speaker": "Host", "voiceName": "Kore"},
      {"speaker": "Guest", "voiceName": "Puck"}
    ]
  }'
```

---

## 📄 Document Analysis

### Analyze Document
```bash
curl -X POST http://localhost:3001/v1/document/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "document": {
      "bytesBase64Encoded": "BASE64_PDF_CONTENT",
      "mimeType": "application/pdf"
    },
    "prompt": "Ringkas dokumen ini dalam bahasa Indonesia",
    "model": "gemini-2.5-flash"
  }'
```

**Supported Types:** `application/pdf`, `text/plain`, `text/html`, `text/csv`

---

## ⚙️ Utility Endpoints

### List All Models
```bash
curl http://localhost:3001/v1/models
```

### Health Check
```bash
curl http://localhost:3001/v1/health
```

### List Prompts
```bash
curl http://localhost:3001/v1/prompts
```

### Safety Presets
```bash
curl http://localhost:3001/v1/safety/presets
```

---

## 📊 Model Reference

### Chat Models
| Model | Description |
|-------|-------------|
| `gemini-3-pro-preview` | Latest, thinking support |
| `gemini-2.5-pro` | 1M context, best reasoning |
| `gemini-2.5-flash` | Fast, recommended |
| `gemini-2.0-flash` | Previous gen |

### Image Models
| Model | Description |
|-------|-------------|
| `imagen-4.0-generate-001` | Latest generation |
| `imagen-4.0-ultra-generate-001` | Ultra quality |
| `imagen-3.0-generate-002` | Stable |

### Video Models
| Model | Description |
|-------|-------------|
| `veo-3.1-generate-001` | Latest, 1080p |
| `veo-3.0-generate-001` | Audio support |
| `veo-2.0-generate-001` | Stable |

### Music Model
| Model | Description |
|-------|-------------|
| `lyria-002` | Instrumental only |

---

## 🧪 Run Automated Tests

```bash
# Unit tests
npm run test

# E2E tests  
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 🔧 Troubleshooting

### Common Errors

| Error | Solution |
|-------|----------|
| `INVALID_ARGUMENT` | Check request format |
| `PERMISSION_DENIED` | Check GCP credentials |
| `RESOURCE_EXHAUSTED` | Rate limit, wait and retry |
| `EADDRINUSE` | Port 3001 in use, kill process |

### Environment Variables Required
```env
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
VERTEX_AI_LOCATION=us-central1
GCS_BUCKET_NAME=your-bucket
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-key
JWT_SECRET=your-secret
```

---

## 📁 Project Structure

```
src/
├── vertex-ai/
│   ├── services/
│   │   ├── genai-client.service.ts    # @google/genai SDK
│   │   ├── generation.service.ts      # Chat generation
│   │   ├── streaming.service.ts       # SSE streaming
│   │   ├── grounding.service.ts       # Google Search/Maps
│   │   ├── image.service.ts           # Imagen
│   │   ├── video.service.ts           # Veo
│   │   ├── music.service.ts           # Lyria
│   │   ├── tts.service.ts             # Text-to-Speech
│   │   ├── document.service.ts        # PDF understanding
│   │   ├── prompt-management.service.ts
│   │   └── safety-filter.service.ts
│   ├── controllers/
│   │   └── v1-api.controller.ts       # Unified V1 API
│   └── types/
│       └── constants.ts               # Model definitions
```

---

*Last Updated: December 5, 2024*
