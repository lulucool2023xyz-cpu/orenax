# 🚀 OrenaX Backend

**AI-Powered Platform Backend** - Built with NestJS, powered by Google Gemini and Vertex AI.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/orenax)

## 📋 Features

- 🤖 **Gemini API v2** - Direct integration with Google Gemini models
- 🧠 **Thinking Mode** - Support for Gemini 2.5/3 thinking capabilities
- 🔍 **Google Search Grounding** - Real-time information from the web
- 💻 **Code Execution** - Run Python code in sandbox
- 🖼️ **Multimodal Support** - Image, video, audio, and PDF analysis
- 📊 **Vertex AI Integration** - Full Vertex AI capabilities
- 🔐 **JWT Authentication** - Secure authentication with Supabase
- ☁️ **Google Cloud Storage** - All generated media stored in GCS

## 🛠️ Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5
- **AI**: Google Gemini API, Vertex AI, Veo, Lyria, Imagen
- **Auth**: JWT, Passport, Supabase
- **Storage**: Google Cloud Storage, Supabase
- **Platform**: Railway (Production)

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Google Cloud Project with Vertex AI enabled
- Gemini API Key
- Supabase Project

### Installation

```bash
# Clone repository
git clone https://github.com/your-repo/orenax.git
cd orenax/back_end

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
# Then run development server
npm run start:dev
```

---

## 📡 Complete API Specification

### Authentication Required
All API endpoints (except `/auth/*`) require JWT authentication.

```bash
# Include in requests
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login with email/password |
| `POST` | `/auth/google` | Google OAuth login |
| `POST` | `/auth/facebook` | Facebook OAuth login |
| `POST` | `/auth/github` | GitHub OAuth login |
| `GET` | `/auth/me` | Get current user |
| `POST` | `/auth/refresh` | Refresh token |
| `POST` | `/auth/logout` | Logout |

---

## ⭐ V1 Unified API (`/v1`) - NEW!

Modern unified endpoints using @google/genai SDK.

### Chat & Generation
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/chat` | Chat with grounding & thinking |
| `POST` | `/v1/chat/stream` | Streaming chat |

### Media Generation
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/image/generate` | Text to image (Imagen 4.0) |
| `POST` | `/v1/image/upscale` | Upscale image |
| `POST` | `/v1/image/edit` | Edit image with mask |
| `POST` | `/v1/video/generate` | Text to video (Veo 3.0) |
| `GET` | `/v1/video/status` | Video operation status |
| `POST` | `/v1/music/generate` | Text to music (Lyria) |

### TTS & Utilities
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/tts/synthesize` | Text to speech |
| `GET` | `/v1/tts/voices` | Available voices |
| `GET` | `/v1/prompts` | List prompts |
| `GET` | `/v1/models` | List all models |
| `GET` | `/v1/health` | Health check |

### Chat Request Example
```json
{
  "messages": [{"role": "user", "content": "Hello!"}],
  "model": "gemini-2.5-flash",
  "grounding": {"googleSearch": true},
  "thinking": {"thinkingLevel": "HIGH"}
}
```

---

## 💬 Chat API v1 (`/api/v1/chat`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/chat` | Send chat message |
| `POST` | `/api/v1/chat/count-tokens` | Count tokens |
| `GET` | `/api/v1/chat/conversations` | List conversations |
| `GET` | `/api/v1/chat/conversations/:id` | Get conversation |
| `DELETE` | `/api/v1/chat/conversations/:id` | Delete conversation |

### Supported Models (Chat)
- `gemini-2.5-pro`
- `gemini-2.5-flash`
- `gemini-2.0-flash`

### Features
- ✅ Thinking Mode (`thinkingConfig`)
- ✅ Google Search Grounding
- ✅ Google Maps Grounding
- ✅ URL Context
- ✅ Conversation Storage (Supabase)

---

## 🖼️ Image API v1 (`/api/v1/image`)

| Method | Endpoint | Description | Model |
|--------|----------|-------------|-------|
| `POST` | `/api/v1/image/text-to-image` | Generate from text | Imagen 4.0 |
| `POST` | `/api/v1/image/image-upscale` | Upscale image | Imagen 4.0 Upscale |
| `POST` | `/api/v1/image/image-edit` | Edit with masks | Imagen 3.0 |
| `POST` | `/api/v1/image/image-customize` | Customize with refs | Imagen 3.0 |
| `POST` | `/api/v1/image/virtual-try-on` | Virtual try-on | VTO Preview |
| `POST` | `/api/v1/image/product-recontext` | Product recontxt | Imagen Recontext |
| `POST` | `/api/v1/image/gemini-generate` | Gemini text-to-image | Gemini Flash Image |
| `POST` | `/api/v1/image/gemini-interleaved` | Text + images | Gemini Flash Image |
| `POST` | `/api/v1/image/gemini-edit` | Conversational edit | Gemini Flash Image |
| `GET` | `/api/v1/image/gemini-status` | Check availability | - |

### Supported Models (Image)
- `imagen-4.0-generate-001`
- `imagen-4.0-ultra-generate-001`
- `imagen-3.0-generate-002`
- `imagen-4.0-upscale-preview`
- `gemini-2.5-flash-image`
- `gemini-3-pro-image-preview`

### Output
All images uploaded to GCS with response:
```json
{
  "success": true,
  "model": "imagen-4.0-generate-001",
  "images": [{
    "url": "https://storage.googleapis.com/...",
    "gcsUri": "gs://bucket/path/image.png",
    "publicUrl": "https://storage.googleapis.com/...",
    "filename": "imagen-xxx.png",
    "mimeType": "image/png"
  }]
}
```

---

## 🎬 Video API v1 (`/api/v1/video`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/video/text-to-video` | Generate from text |
| `POST` | `/api/v1/video/image-to-video` | Generate from image |
| `POST` | `/api/v1/video/extend` | Extend existing video |
| `POST` | `/api/v1/video/interpolate` | First-last frame interpolation |
| `POST` | `/api/v1/video/with-references` | With style/asset refs |
| `GET` | `/api/v1/video/operation?id=xxx` | Check operation status |
| `GET` | `/api/v1/video/status` | Service availability |
| `GET` | `/api/v1/video/models` | List models |

### Supported Models (Video)
- `veo-3.1-generate-001`
- `veo-3.1-fast-generate-001`
- `veo-3.1-generate-preview`
- `veo-3.0-generate-001`
- `veo-2.0-generate-001`

### Parameters
- `durationSeconds`: 4-8 seconds
- `aspectRatio`: `16:9`, `9:16`, `1:1`
- `resolution`: `720p`, `1080p`, `4k`
- `generateAudio`: true/false

---

## 🎵 Music API v1 (`/api/v1/music`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/music/generate` | Generate music from text |
| `GET` | `/api/v1/music/status` | Service availability |

### Model
- `lyria-002`

### Output
- Format: WAV
- Sample Rate: 48kHz
- Duration: 32.8 seconds (fixed)
- Type: Instrumental only

### Request Example
```json
{
  "prompt": "An uplifting orchestral piece with soaring strings",
  "negativePrompt": "drums, heavy bass",
  "seed": 12345
}
```

---

## 🎙️ Audio/TTS API v1 (`/api/v1/audio`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/audio/tts/single` | Single speaker TTS |
| `POST` | `/api/v1/audio/tts/multi` | Multi-speaker TTS |
| `GET` | `/api/v1/audio/tts/voices` | List voices |
| `GET` | `/api/v1/audio/tts/status` | Service status |

### Available Voices
`Aoede`, `Charon`, `Fenrir`, `Kore` (default), `Puck`, `Zephyr`, `Harmony`, `Aurora`, `Ember`

### Parameters
- `speakingRate`: 0.25 - 4.0
- `pitch`: -20.0 - 20.0
- `volumeGainDb`: -96.0 - 16.0

---

## 🆕 API v2 (`/api/v2`) - Gemini Direct

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v2/health` | Health check |
| `GET` | `/api/v2/models` | List models |
| `POST` | `/api/v2/simple` | Simple prompt |
| `POST` | `/api/v2/chat` | Full chat |
| `POST` | `/api/v2/chat/stream` | Streaming |
| `POST` | `/api/v2/chat/generate` | Generate |
| `POST` | `/api/v2/count-tokens` | Token count |
| `POST` | `/api/v2/image/generate` | Image generation |
| `POST` | `/api/v2/video/generate` | Video generation |
| `POST` | `/api/v2/video/image-to-video` | Image to video |
| `POST` | `/api/v2/video/extend` | Video extension |
| `POST` | `/api/v2/video/interpolate` | Interpolation |
| `POST` | `/api/v2/music/generate` | Music generation |
| `POST` | `/api/v2/tts/single` | Single speaker TTS |
| `POST` | `/api/v2/tts/multi` | Multi-speaker TTS |
| `GET` | `/api/v2/tts/voices` | Available voices |

---

## 🗄️ Database (Supabase)

### Tables
- `users` - User accounts
- `conversations` - Chat conversations
- `messages` - Chat messages
- `generated_media` - All generated media URLs

### Run Schema
```bash
# Copy SQL files from docs/06-database/ to Supabase SQL Editor
```

---

## ⚙️ Environment Variables

```env
# Required
NODE_ENV=development
PORT=3001

# Supabase
SUPABASE_URL=your-url
SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-key

# JWT
JWT_SECRET=your-secret

# Gemini API
GEMINI_API_KEY=your-api-key

# Google Cloud
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./creds.json
VERTEX_AI_LOCATION=us-central1

# GCS (optional)
GCS_BUCKET_NAME=your-bucket
GCS_IMAGE_PATH=generated-images
GCS_ENABLE_PUBLIC_ACCESS=true
```

---

## 📁 Project Structure

```
src/
├── auth/           # Authentication
├── audio/          # TTS endpoints (v1)
├── chat/           # Chat endpoints (v1)
├── gemini/         # Legacy Gemini
├── gemini-api/     # Gemini API v2
├── image/          # Image endpoints (v1)
├── music/          # Music endpoints (v1)
├── supabase/       # Supabase service
├── vertex-ai/      # All Vertex AI services
│   ├── services/
│   │   ├── generation.service.ts
│   │   ├── image.service.ts
│   │   ├── video.service.ts
│   │   ├── music.service.ts
│   │   ├── tts.service.ts
│   │   └── gcs-storage.service.ts
│   └── dto/
├── video/          # Video endpoints (v1)
└── app.module.ts   # Main module
```

---

## 📚 Documentation

See `/docs` folder:
- `01-setup/` - Setup guides
- `02-authentication/` - Auth docs
- `03-chat-api/` - Chat API docs
- `04-media-api/` - Media API docs
- `06-database/` - SQL schemas
- `07-testing/` - Test guides

---

## 🔧 Development

```bash
npm run start:dev   # Development
npm run build       # Build
npm run start:prod  # Production
npm run test        # Tests
npm run lint        # Lint
```

---

## 📄 License

MIT License

---

Built with ❤️ by OrenaX Team
