# API V1 Documentation (Vertex AI)

Complete documentation for OrenaX Backend API V1 using **Vertex AI SDK**.

> **Frontend Framework**: Vite + React + TypeScript (TSX)

## 📋 Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/chat` | POST | Chat (streaming/non-streaming) |
| `/api/v1/chat/count-tokens` | POST | Count tokens |
| `/api/v1/chat/conversations` | GET | List conversations |
| `/api/v1/image/text-to-image` | POST | Generate images (Imagen) |
| `/api/v1/image/image-upscale` | POST | Upscale images |
| `/api/v1/image/gemini-generate` | POST | Gemini native image gen |
| `/api/v1/video/text-to-video` | POST | Generate video (Veo) |
| `/api/v1/video/image-to-video` | POST | Image to video |
| `/api/v1/music/generate` | POST | Generate music (Lyria-002) |
| `/api/v1/audio/tts/single` | POST | Single speaker TTS |
| `/api/v1/audio/tts/multi` | POST | Multi-speaker TTS |

## 📚 Documentation Files

| File | Description |
|------|-------------|
| [chat-stream.md](./chat-stream.md) | Chat streaming with SSE |
| [thinking-guide.md](./thinking-guide.md) | Thinking mode (budget/level) |
| [tools-guide.md](./tools-guide.md) | Grounding & URL context |
| [models-guide.md](./models-guide.md) | Model capabilities matrix |
| [image-guide.md](./image-guide.md) | Image generation (Imagen) |
| [video-guide.md](./video-guide.md) | Video generation (Veo) |
| [music-guide.md](./music-guide.md) | Music generation (Lyria-002) |
| [tts-guide.md](./tts-guide.md) | Text-to-Speech (Cloud TTS) |

---

## Base URL & Authentication

```
Base URL: https://your-backend.com/api/v1
```

**All endpoints require JWT authentication:**
```
Authorization: Bearer <access_token>
```

---

## Vite + TSX Setup

### 1. API Client (`src/api/clientV1.ts`)

```typescript
import axios, { AxiosInstance } from 'axios';

const API_V1_BASE_URL = import.meta.env.VITE_API_URL + '/api/v1';

class ApiClientV1 {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_V1_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

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

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  // SSE Streaming
  async postStream(url: string, data: unknown): Promise<Response> {
    return fetch(`${API_V1_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
      },
      body: JSON.stringify(data),
    });
  }
}

export const apiClientV1 = new ApiClientV1();
export default apiClientV1;
```

### 2. TypeScript Interfaces (`src/types/apiV1.types.ts`)

```typescript
// ============= CHAT TYPES (V1) =============
export interface ChatMessageV1 {
  role: 'user' | 'model';
  content: string;
}

export interface ThinkingConfigV1 {
  thinkingBudget?: number;        // Gemini 2.5: 0-24576
  thinkingLevel?: 'low' | 'high'; // Gemini 3
  includeThoughts?: boolean;
}

export interface GroundingConfigV1 {
  googleSearch?: boolean;
  urlContext?: {
    enabled: boolean;
    urls?: string[];
  };
  searchRegion?: string;          // e.g., 'id' for Indonesia
}

export interface GenerationConfigV1 {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
}

export interface ChatRequestV1 {
  prompt?: string;
  messages?: ChatMessageV1[];
  model?: string;
  stream?: boolean;
  thinkingConfig?: ThinkingConfigV1;
  groundingConfig?: GroundingConfigV1;
  generationConfig?: GenerationConfigV1;
  useSystemInstruction?: boolean;
}

export interface UsageMetadataV1 {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

export interface GroundingMetadataV1 {
  webSearchQueries?: string[];
  groundingChunks?: Array<{
    web?: { uri: string; title: string };
  }>;
}

export interface ChatResponseV1 {
  message: ChatMessageV1;
  usageMetadata?: UsageMetadataV1;
  conversationId?: string;
  thoughts?: string[];
  groundingMetadata?: GroundingMetadataV1;
  model?: string;
}

export interface ChatStreamChunkV1 {
  content?: string;
  done: boolean;
  usageMetadata?: UsageMetadataV1;
  error?: string;
}

// ============= IMAGE TYPES (V1) =============
export interface TextToImageRequestV1 {
  prompt: string;
  model?: string;                 // Default: 'imagen-3.0-generate-001'
  sampleCount?: number;           // 1-8
  negativePrompt?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  enhancePrompt?: boolean;
  seed?: number;
  addWatermark?: boolean;
  personGeneration?: 'allow_adult' | 'dont_allow';
}

export interface GeneratedImageV1 {
  url: string;
  gcsUri?: string;
  filename?: string;
  mimeType?: string;
}

export interface ImageResponseV1 {
  success: boolean;
  model: string;
  images: GeneratedImageV1[];
}

export interface ImageUpscaleRequestV1 {
  image: string;                  // Base64
  upscaleFactor?: 'x2' | 'x4';
  prompt?: string;
}

// ============= VIDEO TYPES (V1) =============
export interface TextToVideoRequestV1 {
  prompt: string;
  model?: string;                  // Default: 'veo-3.1-generate-preview'
  negativePrompt?: string;
  aspectRatio?: '16:9' | '9:16';
  durationSeconds?: number;        // 5-8
  resolution?: '720p' | '1080p';
  generateAudio?: boolean;
  seed?: number;
}

export interface VideoResponseV1 {
  success: boolean;
  url: string;
  gcsUri?: string;
  filename?: string;
  model: string;
  duration: number;
  aspectRatio: string;
  hasAudio: boolean;
  operationId?: string;
  generatedAt: string;
}

export interface VideoOperationStatusV1 {
  operationId: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress?: number;
  result?: VideoResponseV1;
  error?: string;
}

// ============= MUSIC TYPES (V1) =============
export interface MusicRequestV1 {
  prompt: string;
  negativePrompt?: string;
  seed?: number;
  sampleCount?: number;           // 1-4, not with seed
}

export interface MusicTrackV1 {
  url: string;
  publicUrl?: string;
  gcsUri?: string;
  filename?: string;
  mimeType: string;
  duration: number;               // 32.8s
  sampleRate: number;             // 48000
  prompt: string;
}

export interface MusicResponseV1 {
  success: boolean;
  tracks: MusicTrackV1[];
  model: string;
  generatedAt: string;
}

// ============= TTS TYPES (V1) =============
export interface SingleTtsRequestV1 {
  text: string;
  voiceName?: string;             // Default: 'Kore'
  languageCode?: string;          // Default: 'en-US'
  speakingRate?: number;          // 0.25-4.0
  pitch?: number;                 // -20 to 20
  volumeGainDb?: number;          // -96 to 16
}

export interface SpeakerConfigV1 {
  speakerName: string;
  voiceName: string;
}

export interface MultiTtsRequestV1 {
  text: string;
  speakerConfigs: SpeakerConfigV1[];
  languageCode?: string;
  speakingRate?: number;
}

export interface TtsResponseV1 {
  success: boolean;
  url: string;
  publicUrl?: string;
  gcsUri?: string;
  filename?: string;
  mimeType: string;               // 'audio/mpeg'
  voiceName: string;
  speakerCount: number;
  generatedAt: string;
}

export interface VoiceInfoV1 {
  name: string;
  languageCodes: string[];
  ssmlGender: string;
}
```

---

## V1 vs V2 Key Differences

| Feature | V1 (Vertex AI) | V2 (Gemini API) |
|---------|----------------|-----------------|
| Backend | Vertex AI SDK | Gemini API |
| Auth | GCP Service Account | Gemini API Key |
| Streaming | Simulated (chunked) | Native SSE |
| Music | Lyria-002 (32.8s) | Lyria RealTime (configurable) |
| TTS | Cloud TTS (MP3) | Gemini TTS (WAV 24kHz) |
| Image | Imagen models | Imagen + Gemini Image |
| Video | Veo via Vertex | Veo via Gemini |
| Function Calling | Via grounding | Native functions |
| Code Execution | ❌ | ✅ |

---

## Models Reference

### Chat Models
| Model | Thinking | Grounding |
|-------|----------|-----------|
| `gemini-2.5-flash` | ✅ budget | ✅ |
| `gemini-2.5-pro` | ✅ budget | ✅ |
| `gemini-3-pro-preview` | ✅ level | ✅ |
| `gemini-2.0-flash` | ❌ | ✅ |
| `gemini-1.5-pro` | ❌ | ✅ |

### Image Models
| Model | Use Case |
|-------|----------|
| `imagen-4.0-generate-001` | Latest |
| `imagen-3.0-generate-001` | Default |
| `imagen-4.0-upscale-preview` | Upscaling |
| `imagen-3.0-capability-001` | Edit/customize |
| `virtual-try-on-preview-08-04` | Clothing |
| `imagen-product-recontext-preview-06-30` | Product scenes |

### Video Models
| Model | Duration | Audio |
|-------|----------|-------|
| `veo-3.1-generate-preview` | 8s | ✅ |
| `veo-3.0-generate-preview` | 8s | ✅ |
| `veo-2.0-generate-001` | 8s | ❌ |

### Music Model
| Model | Duration | Format |
|-------|----------|--------|
| `lyria-002` | 32.8s | WAV 48kHz |

### TTS Voices
```
Aoede, Charon, Fenrir, Kore, Puck, Zephyr, 
Harmony, Aurora, Ember (Wavenet voices)
```
