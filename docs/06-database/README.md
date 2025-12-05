# 🗄️ Database (Supabase)

Database schema dan panduan untuk OrenaX Backend.

## Overview

OrenaX menggunakan **Supabase PostgreSQL** dengan:
- Row Level Security (RLS) untuk isolasi data user
- UUID primary keys
- JSONB untuk metadata
- Automatic timestamps
- Service role bypass untuk backend operations

---

## Quick Start

### 1. Setup Database

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Copy content dari `complete-schema.sql`
3. Paste dan **Run**

### 2. Verify

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Check RLS
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
```

---

## SQL Files

| File | Description |
|------|-------------|
| [complete-schema.sql](complete-schema.sql) | **RECOMMENDED** - Complete schema v2.0 |
| [01-conversations-schema.sql](01-conversations-schema.sql) | Legacy: Chat conversations only |
| [02-generated-media-schema.sql](02-generated-media-schema.sql) | Legacy: Media storage only |

> **Note**: Gunakan `complete-schema.sql` untuk fresh install. File lama tetap ada untuk referensi.

---

## Tables

### conversations
Stores chat sessions (v1 & v2 APIs).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to auth.users |
| `title` | TEXT | Conversation title |
| `model` | TEXT | AI model used |
| `api_version` | TEXT | 'v1' or 'v2' |
| `created_at` | TIMESTAMPTZ | Created |
| `updated_at` | TIMESTAMPTZ | Last activity |

### messages
Individual messages within conversations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `conversation_id` | UUID | FK to conversations |
| `role` | TEXT | 'user', 'model', 'system' |
| `content` | TEXT | Message content |
| `metadata` | JSONB | Token usage, etc. |
| `created_at` | TIMESTAMPTZ | Created |

### generated_media
All user-generated media with GCS URLs.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to auth.users |
| `media_type` | TEXT | 'image', 'video', 'music', 'audio' |
| `url` | TEXT | **Required** Public HTTPS URL |
| `gcs_uri` | TEXT | GCS URI (gs://...) |
| `model` | TEXT | AI model used |
| `prompt` | TEXT | Original prompt |
| `api_version` | TEXT | 'v1' or 'v2' |
| `metadata` | JSONB | Type-specific data |
| `created_at` | TIMESTAMPTZ | Created |

### context_prompts
AI-generated summaries for context memory.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to auth.users |
| `summary` | TEXT | AI-generated summary |
| `is_active` | BOOLEAN | Include in context |
| `created_at` | TIMESTAMPTZ | Created |

---

## Row Level Security (RLS)

All tables have RLS enabled:
- Users can only access their own data
- Backend uses **service role** to bypass RLS

---

## API Endpoints

### User Media
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/user/media` | All generated media |
| GET | `/api/v2/user/media/images` | User's images |
| GET | `/api/v2/user/media/videos` | User's videos |
| GET | `/api/v2/user/media/audio` | User's TTS audio |
| GET | `/api/v2/user/media/music` | User's music |
| DELETE | `/api/v2/user/media/:id` | Delete media |

### Conversations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/user/conversations` | List conversations |
| GET | `/api/v2/user/conversations/:id` | Get messages |

### Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/user/stats` | Generation statistics |

---

## Guides

| Guide | Description |
|-------|-------------|
| [conversation-guide.md](conversation-guide.md) | Conversation storage patterns |

---

## Quick Queries

```sql
-- List user's generated images
SELECT * FROM generated_media 
WHERE user_id = 'user-uuid' AND media_type = 'image' 
ORDER BY created_at DESC;

-- Get user's conversations
SELECT * FROM conversations 
WHERE user_id = 'user-uuid' 
ORDER BY updated_at DESC;

-- User stats
SELECT media_type, COUNT(*) 
FROM generated_media 
WHERE user_id = 'user-uuid' 
GROUP BY media_type;
```
