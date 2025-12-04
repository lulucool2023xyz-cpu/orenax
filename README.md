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
- ☁️ **Google Cloud Storage** - Image generation and storage

## 🛠️ Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5
- **AI**: Google Gemini API, Vertex AI
- **Auth**: JWT, Passport, Supabase
- **Storage**: Google Cloud Storage
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
git clone https://github.com/lulucool2023xyz-cpu/orenax.git
cd orenax

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
# Then run development server
npm run start:dev
```

### Environment Variables

See `.env.example` for all required variables.

**Required:**
- `GEMINI_API_KEY` - Your Gemini API key
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key
- `JWT_SECRET` - Secret for JWT tokens

**For Vertex AI:**
- `GOOGLE_CLOUD_PROJECT` - Your GCP project ID
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account JSON

## 📡 API Endpoints

### Gemini API v2

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v2/health` | Health check |
| `GET` | `/api/v2/models` | List available models |
| `POST` | `/api/v2/simple` | Simple prompt → response |
| `POST` | `/api/v2/chat` | Full chat (streaming optional) |
| `POST` | `/api/v2/chat/stream` | Streaming responses |
| `POST` | `/api/v2/count-tokens` | Count tokens |

### Example Request

```bash
curl -X POST http://localhost:3001/api/v2/simple \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello!"}'
```

## 🚂 Railway Deployment

### 1. Connect to GitHub

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository

### 2. Configure Environment Variables

In Railway dashboard, add these variables:

```env
NODE_ENV=production
PORT=3001

# Supabase
SUPABASE_URL=your-url
SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-key

# JWT
JWT_SECRET=your-secret

# Gemini
GEMINI_API_KEY=your-api-key

# Google Cloud (Base64 encoded service account JSON)
GOOGLE_CREDENTIALS_JSON=base64-encoded-json
GOOGLE_CLOUD_PROJECT=your-project-id
```

### 3. Encode Service Account for Railway

```bash
# On Mac/Linux
base64 -i service-account-key.json | tr -d '\n'

# On Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account-key.json"))
```

Copy the output and set as `GOOGLE_CREDENTIALS_JSON` in Railway.

### 4. Deploy

Railway will automatically build and deploy. Your app will be available at:
`https://your-app.railway.app`

## 📁 Project Structure

```
src/
├── auth/           # Authentication module
├── chat/           # Legacy chat endpoints
├── gemini/         # Legacy Gemini service
├── gemini-api/     # NEW: Gemini API v2
│   ├── config/     # Configuration
│   ├── dto/        # Data Transfer Objects
│   ├── services/   # Core services
│   └── types/      # TypeScript types
├── image/          # Image generation
├── supabase/       # Supabase integration
├── vertex-ai/      # Vertex AI integration
├── bootstrap.ts    # Production bootstrap
└── main.ts         # Application entry
```

## 📚 Documentation

- [API Reference](/docs/gemini-api-v2/API-REFERENCE.md)
- [Vertex AI Docs](/docs/vertex-ai/)
- [Testing Guide](/docs/testing/)

## 🔧 Development

```bash
# Development mode
npm run start:dev

# Build
npm run build

# Production mode
npm run start:prod

# Run tests
npm run test

# Lint
npm run lint
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing`)
5. Open Pull Request

---

Built with ❤️ by OrenaX Team
