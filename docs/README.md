# OrenaX Backend Documentation

Dokumentasi lengkap untuk OrenaX Backend API.

---

## 📁 Struktur Dokumentasi

```
docs/
├── README.md                    # File ini (indeks utama)
│
├── 01-getting-started/          # 🚀 Setup & konfigurasi awal
│   ├── README.md                # Quick start guide
│   ├── environment-setup.md     # Environment variables
│   ├── gcs-cloud-storage.md     # Google Cloud Storage setup
│   └── vertex-ai-setup.md       # Google Cloud Vertex AI setup
│
├── 02-authentication/           # 🔐 Auth endpoints
│   ├── email-password-auth.md   # Email/password login
│   ├── google-oauth.md          # Google OAuth
│   ├── github-oauth.md          # GitHub OAuth
│   └── facebook-oauth.md        # Facebook OAuth
│
├── 03-api-v1-chat/              # 💬 Chat API V1 (Vertex AI)
│   ├── README.md                # Overview & endpoints
│   ├── v1-complete-reference.md # /api/v1/* legacy endpoints
│   ├── v1-unified-api.md        # ⭐ NEW /v1/* unified API
│   ├── chat-endpoints.md        # POST /api/v1/chat
│   ├── thinking-mode.md         # Thinking configuration
│   ├── grounding-search.md      # Google Search grounding
│   └── conversation-storage.md  # Supabase storage
│
├── 04-api-v1-media/             # 🎨 Media API V1
│   ├── README.md                # Overview
│   ├── image-generation.md      # Image endpoints (Imagen)
│   ├── gemini-images.md         # Gemini image generation
│   ├── video-generation.md      # Video endpoints (Veo)
│   ├── music-generation.md      # Music endpoints (Lyria)
│   └── tts-audio.md             # TTS endpoints
│
├── 05-api-v2-gemini/            # ⚡ API V2 (Gemini Direct)
│   ├── README.md                # Overview
│   ├── api-reference.md         # Complete API reference
│   ├── models-and-features.md   # Models comparison
│   └── examples.md              # Usage examples
│
├── 06-database/                 # 🗄️ Supabase Database
│   ├── README.md                # Overview
│   ├── 01-users-auth-schema.sql       # Basic auth schema
│   ├── 02-conversations-schema.sql    # Chat conversations
│   ├── 03-generated-media-schema.sql  # Generated assets
│   └── conversation-guide.md          # Storage guide
│
├── 07-testing/                  # 🧪 Testing guides
│   ├── api-testing-curl.md      # cURL examples
│   ├── postman-collection.json  # Postman collection
│   └── model-responses.md       # Sample responses
│
└── 08-troubleshooting/          # 🔧 Common issues
    ├── common-errors.md         # Error solutions
    ├── project-structure.md     # Code structure
    └── frontend-issues.md       # Frontend fixes
```

---

## 🔗 Quick Links

### Untuk Developer Baru
1. [Getting Started](01-getting-started/README.md) - Setup environment
2. [Authentication](02-authentication/email-password-auth.md) - Login system
3. [API Testing](07-testing/api-testing-curl.md) - Test endpoints

### API Reference
- ⭐ **[V1 Unified API](03-api-v1-chat/v1-unified-api.md)** - NEW! Modern `/v1/*` endpoints
- [API V1 Legacy](03-api-v1-chat/v1-complete-reference.md) - `/api/v1/*` endpoints
- [API V1 Media](04-api-v1-media/README.md) - Image, Video, Music, TTS
- [API V2 Gemini](05-api-v2-gemini/api-reference.md) - Full Gemini API

### Database
- [Schema Overview](06-database/README.md)
- [Run SQL Files](06-database/) - Copy-paste to Supabase

---

## 📊 API Summary

| API Version | Base URL | Auth Required | Description |
|-------------|----------|---------------|-------------|
| ⭐ V1 Unified | `/v1/*` | Optional | Modern GenAI SDK endpoints |
| V1 Chat | `/api/v1/chat` | ✅ JWT | Vertex AI chat |
| V1 Image | `/api/v1/image` | ✅ JWT | Imagen models |
| V1 Video | `/api/v1/video` | ✅ JWT | Veo models |
| V1 Music | `/api/v1/music` | ✅ JWT | Lyria model |
| V1 Audio | `/api/v1/audio` | ✅ JWT | TTS |
| V2 | `/api/v2/*` | ✅ JWT | Gemini API |

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Configure .env with your credentials:
#    - SUPABASE_URL, SUPABASE_ANON_KEY
#    - GEMINI_API_KEY
#    - GOOGLE_CLOUD_PROJECT
#    - JWT_SECRET

# 4. Run database migrations
# Copy SQL files from docs/06-database/ to Supabase SQL Editor

# 5. Run development server
npm run start:dev
```

---

## 📞 Status

| Component | Status |
|-----------|--------|
| API V1 Chat | ✅ Production |
| API V1 Image (Imagen) | ✅ Production |
| API V1 Image (Gemini) | ✅ Production |
| API V1 Video (Veo) | ✅ Production |
| API V1 Music (Lyria) | ✅ Production |
| API V1 Audio (TTS) | ✅ Production |
| API V2 Gemini | ✅ Production |
| Database (Supabase) | ✅ Production |
| Storage (GCS) | ✅ Production |

---

*Last Updated: December 2024*
