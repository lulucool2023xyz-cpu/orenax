# API V2 Documentation (Gemini API)

Complete documentation for OrenaX Backend API V2 using **Gemini API**.

> **Frontend Framework**: Vite + React + TypeScript (TSX)

## 📋 Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v2/chat` | POST | Chat (streaming/non-streaming) |
| `/api/v2/chat/stream` | POST | Force streaming chat |
| `/api/v2/image/generate` | POST | Generate images |
| `/api/v2/video/generate` | POST | Text-to-video |
| `/api/v2/video/image-to-video` | POST | Image-to-video |
| `/api/v2/music/generate` | POST | Generate music |
| `/api/v2/tts/single` | POST | Single speaker TTS |
| `/api/v2/tts/multi` | POST | Multi-speaker TTS |
| `/api/v2/tts/voices` | GET | List voices |

## 📚 Documentation Files

| File | Description |
|------|-------------|
| [chat-stream.md](./chat-stream.md) | Chat streaming with SSE |
| [thinking-guide.md](./thinking-guide.md) | Thinking mode configuration |
| [tools-guide.md](./tools-guide.md) | Google Search, function calling, code execution |
| [image-guide.md](./image-guide.md) | Image generation |
| [video-guide.md](./video-guide.md) | Video generation (Veo) |
| [music-guide.md](./music-guide.md) | Music generation (Lyria) |
| [tts-guide.md](./tts-guide.md) | Text-to-Speech |
| [frontend-guide.md](./frontend-guide.md) | Complete Vite/TSX integration |

---

## Base URL & Authentication

```
Base URL: https://your-backend.com/api/v2
```

**All endpoints require JWT authentication:**
```
Authorization: Bearer <access_token>
```

---

## Vite + TSX Setup

### 1. Project Structure

```
src/
├── api/
│   ├── client.ts           # Base HTTP client
│   ├── auth.ts             # Auth API
│   ├── chat.ts             # Chat API
│   ├── image.ts            # Image API
│   ├── video.ts            # Video API
│   ├── music.ts            # Music API
│   └── tts.ts              # TTS API
├── hooks/
│   ├── useAuth.ts
│   ├── useChat.ts
│   └── useMediaGeneration.ts
├── types/
│   └── api.types.ts        # All TypeScript interfaces
├── context/
│   └── AuthContext.tsx
└── components/
    └── Chat/
```

### 2. Install Dependencies

```bash
npm install axios
```

### 3. Base API Client (`src/api/client.ts`)

```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_V2_BASE_URL = import.meta.env.VITE_API_URL + '/api/v2';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_V2_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });
  }

  setToken(token: string | null) {
    this.accessToken = token;
  }

  getToken(): string | null {
    return this.accessToken;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  // For SSE streaming
  async postStream(url: string, data: unknown): Promise<Response> {
    const response = await fetch(`${API_V2_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
      },
      body: JSON.stringify(data),
    });
    return response;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
```

### 4. TypeScript Interfaces (`src/types/api.types.ts`)

```typescript
// ============= CHAT TYPES =============
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ThinkingConfig {
  thinkingBudget?: number;      // For Gemini 2.5: 0-24576
  thinkingLevel?: 'low' | 'high'; // For Gemini 3
  includeThoughts?: boolean;
}

export interface GenerationConfig {
  temperature?: number;         // 0-2
  topP?: number;                // 0-1
  topK?: number;                // 1-40
  maxOutputTokens?: number;     // Max tokens
}

export interface Tool {
  googleSearch?: { enabled: boolean };
  codeExecution?: Record<string, never>;
  functionDeclarations?: FunctionDeclaration[];
}

export interface FunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
}

export interface ChatRequest {
  prompt?: string;
  messages?: ChatMessage[];
  model?: string;
  stream?: boolean;
  thinkingConfig?: ThinkingConfig;
  generationConfig?: GenerationConfig;
  tools?: Tool[];
}

export interface UsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
  thoughtsTokenCount?: number;
}

export interface GroundingChunk {
  web?: { uri: string; title: string };
}

export interface GroundingMetadata {
  webSearchQueries?: string[];
  groundingChunks?: GroundingChunk[];
  searchEntryPoint?: { renderedContent: string };
}

export interface FunctionCall {
  name: string;
  args: Record<string, unknown>;
}

export interface ChatResponse {
  message: ChatMessage;
  usageMetadata?: UsageMetadata;
  conversationId?: string;
  thoughts?: string[];
  groundingMetadata?: GroundingMetadata;
  functionCalls?: FunctionCall[];
}

export interface ChatStreamChunk {
  text?: string;
  thought?: string;
  done: boolean;
  finishReason?: string;
  usageMetadata?: UsageMetadata;
  groundingMetadata?: GroundingMetadata;
  functionCall?: FunctionCall;
}

// ============= IMAGE TYPES =============
export interface ImageRequest {
  prompt: string;
  model?: string;
  negativePrompt?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  numberOfImages?: number;
}

export interface GeneratedImage {
  url: string;
  gcsUri?: string;
  filename?: string;
  mimeType?: string;
}

export interface ImageResponse {
  success: boolean;
  model: string;
  images: GeneratedImage[];
}

// ============= VIDEO TYPES =============
export interface VideoRequest {
  prompt: string;
  model?: string;
  negativePrompt?: string;
  aspectRatio?: '16:9' | '9:16';
  durationSeconds?: number;
  generateAudio?: boolean;
}

export interface ImageToVideoRequest {
  prompt: string;
  image: {
    bytesBase64Encoded: string;
    mimeType: string;
  };
  durationSeconds?: number;
  generateAudio?: boolean;
}

export interface VideoResponse {
  success: boolean;
  url: string;
  gcsUri?: string;
  filename?: string;
  model: string;
  duration: number;
  aspectRatio: string;
  hasAudio: boolean;
}

// ============= MUSIC TYPES =============
export interface WeightedPrompt {
  text: string;
  weight?: number;
}

export interface MusicRequest {
  prompts: WeightedPrompt[];
  durationSeconds?: number;
  bpm?: number;
  temperature?: number;
}

export interface MusicResponse {
  success: boolean;
  url: string;
  gcsUri?: string;
  filename?: string;
  model: string;
  durationSeconds: number;
}

// ============= TTS TYPES =============
export interface SingleTtsRequest {
  text: string;
  voiceName?: string;
  model?: string;
}

export interface SpeakerConfig {
  speakerName: string;
  voiceName: string;
}

export interface MultiTtsRequest {
  text: string;
  speakerConfigs: SpeakerConfig[];
}

export interface TtsResponse {
  success: boolean;
  url: string;
  gcsUri?: string;
  filename?: string;
  mimeType?: string;
}

export interface VoiceInfo {
  name: string;
  description?: string;
}
```

---

## Models Reference

### Chat Models
| Model | Thinking | Best For |
|-------|----------|----------|
| `gemini-2.5-flash` | thinkingBudget (0-24576) | Fast + capable |
| `gemini-2.5-pro` | thinkingBudget (128-32768) | Complex reasoning |
| `gemini-3-pro-preview` | thinkingLevel (low/high) | Latest features |
| `gemini-2.0-flash` | ❌ | Production |

### Image Models
| Model | Description |
|-------|-------------|
| `imagen-4.0-generate-001` | Latest Imagen |
| `gemini-2.5-flash-image` | Gemini native |

### Video Models
| Model | Features |
|-------|----------|
| `veo-3.1-generate-preview` | 8s, audio |

### Music Models
| Model | Description |
|-------|-------------|
| `lyria-realtime-exp` | WebSocket, configurable duration |

### TTS Models
| Model | Description |
|-------|-------------|
| `gemini-2.5-flash-preview-tts` | 30 voices, 24kHz |
