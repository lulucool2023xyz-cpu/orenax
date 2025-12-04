# Setup & Configuration

Panduan setup dan konfigurasi untuk OrenaX Backend.

## 📄 Setup Guides

### [vertex-ai-setup.md](./vertex-ai-setup.md)
Setup Google Cloud Vertex AI:
- Google Cloud Project setup
- Enable Vertex AI API
- Service account configuration
- Environment variables
- Testing connection

### [success-criteria.md](./success-criteria.md)
Kriteria keberhasilan implementasi:
- Feature checklist
- Testing requirements
- Performance benchmarks
- Security requirements

---

## Quick Setup

### 1. Environment Variables
Create `.env` file:
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Cloud Vertex AI
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1d

# Server
PORT=3001
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Server
```bash
npm run start:dev
```

---

## Quick Links

- [Back to Main Documentation](../README.md)
- [Testing Guide](../testing/TESTING-GUIDE.md)
- [Database Schema](../database/schema.sql)
