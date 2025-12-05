# 🚀 Getting Started

Panduan setup dan konfigurasi untuk OrenaX Backend.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Google Cloud Project
- Supabase Project
- Gemini API Key

---

## Quick Setup

### 1. Clone & Install

```bash
git clone https://github.com/your-repo/orenax.git
cd orenax/back_end
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Server
NODE_ENV=development
PORT=3001

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1d

# Gemini API (untuk API V2)
GEMINI_API_KEY=your-gemini-api-key

# Google Cloud (untuk API V1 - Vertex AI)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
VERTEX_AI_LOCATION=us-central1

# GCS (optional, untuk media storage)
GCS_BUCKET_NAME=your-bucket-name
GCS_IMAGE_PATH=generated-images
GCS_ENABLE_PUBLIC_ACCESS=true
```

### 3. Database Setup

Run SQL files in Supabase SQL Editor:
1. `docs/06-database/01-conversations-schema.sql`
2. `docs/06-database/02-generated-media-schema.sql`

### 4. Run Server

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

---

## Setup Guides

| Guide | Description |
|-------|-------------|
| [vertex-ai-setup.md](vertex-ai-setup.md) | Google Cloud Vertex AI configuration |
| [gcs-setup.md](gcs-setup.md) | Google Cloud Storage setup |
| [success-criteria.md](success-criteria.md) | Implementation checklist |

---

## Verify Setup

After starting server, check:

```bash
# Health check
curl http://localhost:3001/api/v2/health

# Should return:
# {"status":"ok","configured":true,"timestamp":"..."}
```

---

## Next Steps

1. [Setup Authentication](../02-authentication/email-password-auth.md)
2. [Test API Endpoints](../07-testing/api-testing-curl.md)
3. [Explore API V2](../05-api-v2-gemini/api-reference.md)
