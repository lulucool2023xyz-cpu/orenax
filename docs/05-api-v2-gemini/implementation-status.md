# TODO LIST: Gemini API v2 Implementation

## 📋 Project Overview
Membuat API endpoint `/api/v2/chat` menggunakan **Google Gemini API** (SDK `@google/genai`) sebagai alternatif dari Vertex AI. 
API ini harus fleksibel, memiliki dokumentasi lengkap, dan mendukung semua fitur utama Gemini API.

**SDK Pattern (Official):**
```typescript
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```

---

## 🎯 Target Models
| Model | Key Features |
|-------|-------------|
| `gemini-3-pro-preview` | Latest, thinking with thinkingLevel (low/high) |
| `gemini-2.5-flash` | Fast, thinking with thinkingBudget (0-24576) |
| `gemini-2.5-pro` | Premium, thinking with thinkingBudget (128-32768) |
| `gemini-2.0-flash` | Production-ready, no thinking |

---

## 📦 PHASE 1: Foundation & Setup ✅ CURRENT

### 1.1 Install Dependencies
- [ ] Verify `@google/genai` SDK sudah installed (v0.24.1)
- [ ] Update jika perlu ke versi terbaru

### 1.2 Environment Configuration  
- [ ] Tambahkan `GEMINI_API_KEY` ke `.env`
- [ ] Update `.env.example`

### 1.3 Module Structure
- [ ] Buat folder `src/gemini-api/`
  - [ ] `config/gemini-api.config.ts`
  - [ ] `dto/` folder
  - [ ] `services/` folder
  - [ ] `types/` folder
  - [ ] `utils/` folder
  - [ ] `gemini-api.module.ts`
  - [ ] `gemini-api.controller.ts`
- [ ] Register di `app.module.ts`

---

## 📦 PHASE 2: Core Types & Constants

### 2.1 `types/gemini-api.types.ts`
```typescript
// Key types based on official SDK
type GeminiModelId = 'gemini-3-pro-preview' | 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-2.0-flash';
type ThinkingLevel = 'low' | 'high';
type FunctionCallingMode = 'AUTO' | 'ANY' | 'NONE' | 'VALIDATED';
type FinishReason = 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER' | 'BLOCKLIST' | 'PROHIBITED_CONTENT';
```

### 2.2 `types/gemini-constants.ts`
- [ ] GEMINI_MODELS object
- [ ] DEFAULT_GENERATION_CONFIG (temperature: 1.0, topP, maxOutputTokens)
- [ ] DEFAULT_SAFETY_SETTINGS (HARM_CATEGORY_*)
- [ ] SUPPORTED_MIME_TYPES (image, audio, video, pdf)
- [ ] MODEL_THINKING_SUPPORT (which models support what)

---

## 📦 PHASE 3: DTOs

### 3.1 `dto/gemini-chat-request.dto.ts`
```typescript
class GeminiChatRequestDto {
  model?: GeminiModelId;
  contents: GeminiContentDto[];     // Messages with role: user/model
  config?: {
    systemInstruction?: string;
    temperature?: number;           // Default 1.0
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
    candidateCount?: number;
    responseMimeType?: 'text/plain' | 'application/json';
    responseSchema?: object;        // For JSON mode
    thinkingConfig?: {
      thinkingLevel?: 'low' | 'high';      // Gemini 3
      thinkingBudget?: number;             // Gemini 2.5
      includeThoughts?: boolean;
    };
    safetySettings?: SafetySettingDto[];
  };
  tools?: ToolDto[];
  toolConfig?: {
    functionCallingConfig: {
      mode: 'AUTO' | 'ANY' | 'NONE' | 'VALIDATED';
      allowedFunctionNames?: string[];
    };
  };
  stream?: boolean;
}
```

### 3.2 `dto/gemini-chat-response.dto.ts`
```typescript
class GeminiChatResponseDto {
  text: string;
  thoughts?: string[];
  finishReason: FinishReason;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    thoughtsTokenCount?: number;
    totalTokenCount: number;
  };
  functionCalls?: FunctionCallDto[];
  groundingMetadata?: GroundingMetadataDto;
  safetyRatings?: SafetyRatingDto[];
  model: string;
  conversationId?: string;
}
```

### 3.3 Additional DTOs
- [ ] `dto/gemini-content.dto.ts` - Content with parts
- [ ] `dto/gemini-part.dto.ts` - Text, inlineData, fileData
- [ ] `dto/gemini-tool.dto.ts` - Function declarations
- [ ] `dto/gemini-safety.dto.ts` - Safety settings

---

## 📦 PHASE 4: Core Services

### 4.1 `services/gemini-generation.service.ts`
Core service yang handle semua generation:
```typescript
@Injectable()
class GeminiGenerationService {
  private ai: GoogleGenAI;
  
  async generateContent(request: GeminiChatRequestDto): Promise<GeminiChatResponseDto>
  async generateContentStream(request: GeminiChatRequestDto): AsyncGenerator<chunk>
}
```

### 4.2 `services/gemini-chat.service.ts`
Multi-turn conversation handler:
```typescript
@Injectable()
class GeminiChatService {
  async sendMessage(conversationId: string, message: string): Promise<Response>
  async sendMessageStream(conversationId: string, message: string): AsyncGenerator
  getHistory(conversationId: string): Content[]
}
```

### 4.3 `services/gemini-multimodal.service.ts`
Handle image, video, audio, PDF:
```typescript
@Injectable()
class GeminiMultimodalService {
  async uploadFile(file: Buffer, mimeType: string): Promise<FileUploadResult>
  createInlinePart(data: Buffer, mimeType: string): Part
  createFilePart(fileUri: string, mimeType: string): Part
  validateMimeType(mimeType: string): boolean
}
```

### 4.4 `services/gemini-streaming.service.ts`
SSE streaming handler:
```typescript
@Injectable()
class GeminiStreamingService {
  async streamResponse(res: Response, request: GeminiChatRequestDto): Promise<void>
}
```

---

## 📦 PHASE 5: Controller

### 5.1 `gemini-api.controller.ts`
```typescript
@Controller('api/v2')
class GeminiApiController {
  @Post('chat')           // Main endpoint - non-streaming & streaming
  @Post('chat/stream')    // Dedicated streaming
  @Post('files/upload')   // File upload
  @Get('models')          // List models
  @Post('count-tokens')   // Token counting
}
```

---

## 📦 PHASE 6: Documentation

### 6.1 Main Documentation Files
- [ ] `docs/gemini-api-v2/README.md` - Overview & Quick Start
- [ ] `docs/gemini-api-v2/api-reference.md` - Full API Reference
- [ ] `docs/gemini-api-v2/models.md` - Model Comparison

### 6.2 Feature Guides (in docs/gemini-api-v2/features/)
- [ ] `text-generation.md`
- [ ] `thinking-mode.md`
- [ ] `multimodal.md` (image, video, audio, pdf)
- [ ] `function-calling.md`
- [ ] `json-mode.md`
- [ ] `streaming.md`
- [ ] `safety-settings.md`

### 6.3 Examples (in docs/gemini-api-v2/examples/)
- [ ] `basic-chat.md`
- [ ] `image-analysis.md`
- [ ] `function-calling.md`
- [ ] `json-output.md`
- [ ] `streaming.md`

### 6.4 Testing (in docs/gemini-api-v2/testing/)
- [ ] `curl-examples.md`

---

## 🔑 Key Implementation Patterns (from Official Docs)

### Basic Text Generation
```typescript
const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: "Write a story about a magic backpack.",
});
console.log(response.text);
```

### With Config
```typescript
const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: "Tell me a story.",
  config: {
    candidateCount: 1,
    stopSequences: ["x"],
    maxOutputTokens: 20,
    temperature: 1.0,
  },
});
```

### System Instruction
```typescript
const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: "Good morning!",
  config: {
    systemInstruction: "You are a cat. Your name is Neko.",
  },
});
```

### JSON Mode
```typescript
const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: "List a few popular cookie recipes.",
  config: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          recipeName: { type: "string" },
          ingredients: { type: "array", items: { type: "string" } },
        },
        required: ["recipeName", "ingredients"],
      },
    },
  },
});
```

### Streaming
```typescript
const response = await ai.models.generateContentStream({
  model: "gemini-2.0-flash",
  contents: "Write a story.",
});
for await (const chunk of response) {
  console.log(chunk.text);
}
```

### Image Input
```typescript
const organ = await ai.files.upload({ file: path.join(media, "organ.jpg") });
const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: [
    createUserContent([
      "Tell me about this instrument",
      createPartFromUri(organ.uri, organ.mimeType)
    ]),
  ],
});
```

### Multi-turn Chat
```typescript
const chat = ai.chats.create({
  model: "gemini-2.0-flash",
  history: [
    { role: "user", parts: [{ text: "Hello" }] },
    { role: "model", parts: [{ text: "Hi there!" }] },
  ],
});
const response = await chat.sendMessage({ message: "How are you?" });
```

### Function Calling
```typescript
const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: "What's 57 * 44?",
  config: {
    toolConfig: {
      functionCallingConfig: { mode: FunctionCallingConfigMode.ANY },
    },
    tools: [{
      functionDeclarations: [multiplyDeclaration],
    }],
  },
});
```

### Safety Settings
```typescript
const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: unsafePrompt,
  config: {
    safetySettings: [
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  },
});
```

---

## 📊 Response Structure (UsageMetadata)

```json
{
  "promptTokenCount": 100,
  "cachedContentTokenCount": 0,
  "candidatesTokenCount": 200,
  "toolUsePromptTokenCount": 0,
  "thoughtsTokenCount": 50,
  "totalTokenCount": 350,
  "promptTokensDetails": [...],
  "candidatesTokensDetails": [...]
}
```

---

## ⚠️ Important Notes

1. **Temperature**: Default 1.0, Gemini 3 recommends keeping at 1.0
2. **Thinking**: 
   - Gemini 3 uses `thinkingLevel` (low/high)
   - Gemini 2.5 uses `thinkingBudget` (number or -1 for dynamic)
3. **Thought Signatures**: Required for Gemini 3 Pro function calling
4. **File Size**: Use Files API for >20MB files
5. **Video**: Poll until state becomes ACTIVE after upload

---

## 📝 Progress Tracking

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1 | ✅ Complete | Foundation setup - module structure, .env config |
| Phase 2 | ✅ Complete | Types & Constants - gemini-constants.ts, gemini-api.types.ts |
| Phase 3 | ✅ Complete | DTOs - request & response DTOs created |
| Phase 4 | ✅ Complete | Services - generation, streaming services |
| Phase 5 | ✅ Complete | Controller - all endpoints implemented |
| Phase 6 | ⏳ In Progress | Documentation - API Reference complete, more guides needed |

### ✅ Completed Items
- [x] Module structure (`src/gemini-api/`)
- [x] Environment configuration (GEMINI_API_KEY)
- [x] Core types and constants
- [x] Request/Response DTOs
- [x] Generation service with non-streaming & streaming support
- [x] Streaming service with SSE
- [x] Controller with all basic endpoints:
  - [x] POST /api/v2/chat
  - [x] POST /api/v2/chat/stream
  - [x] POST /api/v2/chat/generate
  - [x] POST /api/v2/simple
  - [x] POST /api/v2/count-tokens
  - [x] GET /api/v2/models
  - [x] GET /api/v2/health
- [x] API Reference documentation
- [x] Build passing (npm run build)
- [x] Server running and tested

### ⏳ Remaining Items
- [ ] Multimodal service (file upload)
- [ ] Thinking mode examples
- [ ] Function calling examples
- [ ] Multi-turn conversation storage
- [ ] More detailed feature documentation
- [ ] Test coverage

---

*Document created for Gemini API v2 Implementation*
*Reference: Official Gemini API Documentation (ai.google.dev)*
*Last Updated: 2025-12-04*
