# Vertex AI Chat API - Google Cloud Setup Guide

Panduan lengkap untuk setup Google Cloud Vertex AI dan konfigurasi backend NestJS.

## Prerequisites

- Google Cloud Account
- Node.js 18.x atau lebih tinggi
- NPM atau Yarn
- Supabase Account (untuk conversation storage)

---

## 1. Google Cloud Project Setup

### 1.1 Create Google Cloud Project

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"New Project"**
3. Masukkan nama project (contoh: `orenax-chat-api`)
4. Click **"Create"**

### 1.2 Enable Vertex AI API

1. Di Google Cloud Console, buka **Navigation menu** (☰)
2. Pilih **"APIs & Services"** → **"Library"**
3. Cari **"Vertex AI API"**
4. Click **"Enable"**

> [!IMPORTANT]
> Enable juga **"Generative Language API"** jika ingin menggunakan Gemini models

---

## 2. Service Account Setup

### 2.1 Create Service Account

1. Buka **Navigation menu** → **"IAM & Admin"** → **"Service Accounts"**
2. Click **"Create Service Account"**
3. Masukkan detail:
   - **Name**: `vertex-ai-chat-service`
   - **ID**: `vertex-ai-chat-service`
   - **Description**: `Service account for Vertex AI Chat API`
4. Click **"Create and Continue"**

### 2.2 Grant Permissions

Tambahkan roles berikut:
- ✅ **Vertex AI User** (`roles/aiplatform.user`)
- ✅ **Service Account Token Creator** (`roles/iam.serviceAccountTokenCreator`)

Click **"Continue"** → **"Done"**

### 2.3 Download Service Account Key

1. Click pada service account yang baru dibuat
2. Tab **"Keys"** → **"Add Key"** → **"Create new key"**
3. Pilih type: **JSON**
4. Click **"Create"**
5. **Save file** dengan nama `service-account-key.json`

> [!WARNING]
> **JANGAN commit file ini ke Git!** 
> File `service-account-key.json` berisi credentials sensitif

---

## 3. Backend Configuration

### 3.1 Copy Service Account Key

Copy file ` service-account-key.json` ke root folder backend:

```bash
cd back_end
# Copy file service-account-key.json ke folder ini
```

### 3.2 Update `.env` File

Update file `.env` dengan konfigurasi Google Cloud:

```env
# Google Cloud Vertex AI Configuration
GOOGLE_CLOUD_PROJECT=orenax-chat-api # Ganti dengan Project ID Anda
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# Vertex AI Settings
VERTEX_AI_DEFAULT_MODEL=gemini-2.5-flash
VERTEX_AI_API_ENDPOINT=aiplatform.googleapis.com
```

> [!TIP]
> **Available Models:**
> - `gemini-2.5-flash` - Fastest, recommended for production
> - `gemini-2.5-pro` - More capable, higher quality
> - `gemini-3-pro-preview` - Latest preview (may be unstable)

### 3.3 Install Dependencies

```bash
npm install
```

Dependencies yang dibutuhkan:
- `@google-cloud/aiplatform` - Vertex AI SDK
- `google-auth-library` - Google Authentication
- `google-gax` - Google API Extensions

---

## 4. Supabase Database Setup

### 4.1 Run Database Schema

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Buka **SQL Editor**
4. Copy & paste isi file `docs/database-schema.sql`
5. Click **"Run"**

Schema akan create:
- ✅ Table `conversations`
- ✅ Table `messages`
- ✅ Indexes untuk performance
- ✅ Row Level Security (RLS) policies

### 4.2 Verify Database

Check bahwa tables sudah created:
1. Buka **Table Editor**
2. Verify tables:
   - `conversations` - untuk menyimpan conversation metadata
   - `messages` - untuk menyimpan chat history

---

## 5. Test Configuration

### 5.1 Build Project

```bash
npm run build
```

Pastikan build SUKSES (exit code: 0)

### 5.2 Start Development Server

```bash
npm run start:dev
```

Server akan berjalan di `http://localhost:3001`

### 5.3 Verify Vertex AI Connection

Check logs untuk message:
```
[VertexAiConfigService] Vertex AI configuration validated successfully
[GenerationService] Vertex AI PredictionServiceClient initialized successfully
[NestApplication] Nest application successfully started
```

---

## 6. Troubleshooting

### Error: "GOOGLE_CLOUD_PROJECT environment variable is not set"

**Solution**: Update file `.env` dengan Project ID yang benar

### Error: "Failed to load credentials"

**Solutions**:
- Pastikan file `service-account-key.json` ada di root folder backend
- Check path di `GOOGLE_APPLICATION_CREDENTIALS` benar
- Verify JSON file valid (bisa buka dengan text editor)

### Error: "Permission denied"

**Solutions**:
- Verify Service Account punya role **"Vertex AI User"**
- Check Vertex AI API sudah di-enable
- Wait beberapa menit untuk propagation

### Error: "Quota exceeded"

**Solutions**:
- Check [Quotas page](https://console.cloud.google.com/iam-admin/quotas)
- Request quota increase jika diperlukan
- Consider upgrade billing plan

---

## 7. Security Best Practices

### ✅ DO:
- Store `service-account-key.json` secara aman
- Add `.env` dan `service-account-key.json` ke `.gitignore`
- Use environment variables untuk semua credentials
- Rotate service account keys secara periodic
- Enable monitoring dan logging di Google Cloud
- Use least privilege principle untuk IAM roles

### ❌ DON'T:
- Commit credentials ke Git repository
- Share service account key via email/chat
- Use same service account untuk development dan production
- Give excessive permissions ke service account

---

## 8. Production Deployment

Untuk production deployment:

1. **Create separate Google Cloud project** untuk production
2. **Create new service account** dengan permissions minimal
3. **Use Secret Manager** untuk store credentials (bukan file JSON)
4. **Enable Cloud Armor** untuk protection
5. **Setup monitoring** dengan Cloud Logging dan Cloud Monitoring
6. **Configure budget alerts** untuk avoid unexpected costs

---

## Next Steps

Setup sudah complete! Proceed to:
- 📖 [API Documentation](./api-chat.md) - Learn API endpoints
- 🧪 [API Testing Guide](./api-testing-chat.md) - Test dengan cURL/Postman
- 💾 [Conversation Storage](./conversation-storage.md) - Understand data storage

---

## Support

Butuh bantuan? Check:
- [Google Cloud Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Supabase Documentation](https://supabase.com/docs)
