# OrenaX Backend Documentation

Dokumentasi lengkap untuk OrenaX Backend - NestJS dengan Supabase Authentication dan Google Vertex AI.

## 📚 Dokumentasi Utama

### 🔐 API Authentication
Dokumentasi untuk autentikasi dan OAuth:
- [API Testing - Authentication](./api/authentication/api-testing.md) - Panduan testing endpoint autentikasi
- [Setup OAuth](./api/authentication/setup-oauth.md) - Konfigurasi Google & Facebook OAuth

### 💬 API Chat (Vertex AI)
Dokumentasi untuk Vertex AI Chat API:
- [API Chat Documentation](./api/chat/api-chat.md) - Dokumentasi lengkap endpoint chat dengan Vertex AI

### 🎨 API Image (Vertex AI)
Dokumentasi untuk Vertex AI Image API:
- [API Image Documentation](./api/image/api-image.md) - Image generation, editing, upscaling, virtual try-on, product recontext

### 💾 Database
Dokumentasi database dan storage:
- [Database Schema](./database/schema.sql) - SQL schema untuk conversations & messages
- [Conversation Storage Guide](./database/conversation-storage.md) - Panduan lengkap conversation management

### 🧪 Testing
Panduan testing untuk semua fitur:
- [API Testing - Chat](./testing/api-testing-chat.md) - Testing chat endpoints
- [Feature Testing Guide](./testing/TESTING-GUIDE.md) - **NEW!** Testing untuk Thinking Mode, Grounding, Streaming

### ⚙️ Setup & Configuration
Panduan setup dan konfigurasi:
- [Vertex AI Setup](./setup/vertex-ai-setup.md) - Setup Google Cloud Vertex AI
- [Success Criteria](./setup/success-criteria.md) - Kriteria keberhasilan implementasi

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd back_end
npm install
```

### 2. Configure Environment
Edit file `.env`:
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Cloud Vertex AI
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
```

### 3. Run Server
```bash
npm run start:dev
```

Server akan berjalan di: `http://localhost:3001`

---

## ✨ Fitur Utama

### 1. **Authentication**
- ✅ Email/Password authentication
- ✅ Google OAuth
- ✅ Facebook OAuth
- ✅ JWT token management
- ✅ Refresh token support

### 2. **Vertex AI Chat**
- ✅ Multiple Gemini models (2.5 Flash, 2.5 Pro, 3 Pro Preview)
- ✅ **Thinking Mode** - AI reasoning dengan streaming
  - Gemini 2.5: `thinkingBudget` (token-based)
  - Gemini 3: `thinkingLevel` (LOW/HIGH)
- ✅ **Grounding** - Real-time data dari Google
  - Google Search grounding
  - Google Maps grounding
  - URL context grounding
- ✅ **Streaming Responses** - Server-Sent Events (SSE)
- ✅ **Conversation Management** - Multi-turn conversations dengan history
- ✅ **Token Counting** - Estimasi biaya dan optimasi

### 3. **Vertex AI Image**
- ✅ **Text-to-Image** - Generate images dari text prompts
  - Imagen 3.0 & 4.0 models
  - Gemini Image models (2.5 Flash, 3 Pro)
- ✅ **Image Upscale** - Upscale images dengan Imagen 4.0
- ✅ **Image Edit** - Edit images dengan masks dan prompts
  - Inpainting (insertion/removal)
  - Background swap
  - Outpainting
- ✅ **Image Customize** - Customize images dengan reference images
  - Person/animal/product customization
  - Style transfer
  - Control image support
- ✅ **Virtual Try-On** - Virtual try-on untuk clothing products
- ✅ **Product Recontext** - Recontextualize products ke different scenes
- ✅ **Multiple Models** - Support 12+ image generation models
- ✅ **Safety Filters** - Built-in safety filtering dengan error codes

### 4. **Database**
- ✅ Supabase PostgreSQL
- ✅ Row Level Security (RLS)
- ✅ Conversation & message storage
- ✅ Automatic timestamps
- ✅ User data isolation

---

## 🧪 Testing Quick Reference

### Authentication Test
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

### Chat Test (Basic)
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'
```

### Thinking Mode Test
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [{"role": "user", "content": "Solve: 2x + 5 = 15"}],
    "thinkingConfig": {"thinkingBudget": 1000},
    "stream": true
  }'
```

### Grounding Test
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Latest AI news?"}],
    "groundingConfig": {"googleSearch": {}}
  }'
```

### Image Generation Test
```bash
curl -X POST http://localhost:3001/api/v1/image/text-to-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "model": "imagen-3.0-generate-001",
    "sampleCount": 1
  }'
```

Lihat [Feature Testing Guide](./testing/TESTING-GUIDE.md) untuk dokumentasi lengkap!

---

## 📖 Dokumentasi Lengkap

| Kategori | Dokumen | Deskripsi |
|----------|---------|-----------|
| **API** | [Authentication Testing](./api/authentication/api-testing.md) | Testing auth endpoints |
| | [OAuth Setup](./api/authentication/setup-oauth.md) | Konfigurasi OAuth providers |
| | [Chat API](./api/chat/api-chat.md) | Vertex AI chat endpoints |
| | [Image API](./api/image/api-image.md) | Vertex AI image generation & editing |
| **Database** | [Schema](./database/schema.sql) | Database schema SQL |
| | [Conversation Storage](./database/conversation-storage.md) | Conversation management |
| **Testing** | [Chat Testing](./testing/api-testing-chat.md) | Chat API testing |
| | [Feature Testing](./testing/TESTING-GUIDE.md) | Thinking, Grounding, Streaming |
| **Setup** | [Vertex AI Setup](./setup/vertex-ai-setup.md) | Google Cloud configuration |
| | [Success Criteria](./setup/success-criteria.md) | Implementation checklist |

---

## 🛠️ Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Cloud Vertex AI (Gemini)
- **Authentication**: Supabase Auth + JWT
- **API**: RESTful + Server-Sent Events (SSE)

---

## 📞 Support

Untuk pertanyaan dan dukungan:
- Lihat dokumentasi di folder `docs/`
- Check [Testing Guide](./testing/TESTING-GUIDE.md) untuk troubleshooting
- Review [Success Criteria](./setup/success-criteria.md) untuk checklist

---

## 📝 License

MIT License
