# Gemini API v2 Documentation

## Overview

Gemini API v2 adalah endpoint baru untuk berinteraksi dengan Google Gemini API langsung menggunakan SDK `@google/generative-ai`. API ini mendukung berbagai model Gemini dan fitur-fitur canggih seperti **thinking mode**, **multimodal input**, **function calling**, **Google Search grounding**, **code execution**, dan **streaming responses**.

## Base URL

```
http://localhost:3001/api/v2
```

---

## 📋 Table of Contents

1. [Endpoints](#endpoints)
2. [Request Formats](#request-formats)
3. [Thinking Mode](#-thinking-mode)
4. [Tools & Function Calling](#-tools--function-calling)
5. [Google Search Grounding](#-google-search-grounding)
6. [Code Execution](#-code-execution)
7. [Multimodal Input](#-multimodal-input)
8. [JSON Mode](#-json-mode-structured-output)
9. [Safety Settings](#-safety-settings)
10. [Complete Request Schema](#-complete-request-schema)
11. [Examples](#-complete-examples)

---

## Endpoints

### 1. Health Check
**GET** `/api/v2/health`

Check status dan konfigurasi API.

**Response:**
```json
{
  "status": "ok",
  "configured": true,
  "timestamp": "2025-12-04T07:00:00.000Z"
}
```

---

### 2. List Models
**GET** `/api/v2/models`

Mendapatkan daftar model yang didukung.

**Response:**
```json
{
  "models": [
    {
      "name": "gemini-2.0-flash",
      "displayName": "Gemini 2.0 Flash",
      "description": "Production-ready fast model without thinking",
      "supportsThinking": false,
      "thinkingType": null,
      "maxInputTokens": 1048576,
      "maxOutputTokens": 8192,
      "supportedFeatures": ["text", "image", "video", "audio", "pdf", "function-calling", "json-mode", "streaming", "google-search", "code-execution"]
    },
    {
      "name": "gemini-2.5-flash",
      "displayName": "Gemini 2.5 Flash",
      "description": "Fast model with thinking budget support",
      "supportsThinking": true,
      "thinkingType": "budget",
      "maxInputTokens": 1048576,
      "maxOutputTokens": 65536,
      "supportedFeatures": ["text", "image", "video", "audio", "pdf", "function-calling", "json-mode", "streaming", "thinking", "google-search", "code-execution"]
    },
    {
      "name": "gemini-2.5-pro",
      "displayName": "Gemini 2.5 Pro",
      "description": "Premium model with thinking budget support",
      "supportsThinking": true,
      "thinkingType": "budget",
      "maxInputTokens": 1048576,
      "maxOutputTokens": 65536,
      "supportedFeatures": ["text", "image", "video", "audio", "pdf", "function-calling", "json-mode", "streaming", "thinking", "google-search", "code-execution"]
    },
    {
      "name": "gemini-3-pro-preview",
      "displayName": "Gemini 3 Pro Preview",
      "description": "Latest model with thinkingLevel support",
      "supportsThinking": true,
      "thinkingType": "level",
      "maxInputTokens": 1048576,
      "maxOutputTokens": 65536,
      "supportedFeatures": ["text", "image", "video", "audio", "pdf", "function-calling", "json-mode", "streaming", "thinking", "google-search", "code-execution"]
    }
  ],
  "defaultModel": "gemini-2.0-flash"
}
```

---

### 3. Simple Generate
**POST** `/api/v2/simple`

Endpoint paling sederhana - kirim prompt, dapatkan respons.

**Request Body:**
```json
{
  "prompt": "Halo! Siapa kamu?",
  "model": "gemini-2.0-flash"
}
```

**Response:**
```json
{
  "text": "Halo! Saya adalah Gemini, model AI yang dikembangkan oleh Google.",
  "model": "gemini-2.0-flash"
}
```

---

### 4. Chat Generate (Full)
**POST** `/api/v2/chat/generate`

Endpoint untuk generasi dengan kontrol penuh.

**Request Body:**
```json
{
  "prompt": "Jelaskan tentang AI",
  "model": "gemini-2.5-flash",
  "systemInstruction": "Kamu adalah asisten yang ramah dan berbahasa Indonesia",
  "generationConfig": {
    "temperature": 0.7,
    "topP": 0.95,
    "maxOutputTokens": 2048
  }
}
```

**Response:**
```json
{
  "text": "AI atau Kecerdasan Buatan adalah...",
  "finishReason": "STOP",
  "usageMetadata": {
    "promptTokenCount": 15,
    "candidatesTokenCount": 150,
    "totalTokenCount": 165
  },
  "model": "gemini-2.5-flash"
}
```

---

### 5. Chat (with optional streaming)
**POST** `/api/v2/chat`

Endpoint utama untuk chat - mendukung streaming dan non-streaming.

**Request Body (non-streaming):**
```json
{
  "prompt": "Halo!",
  "stream": false
}
```

**Request Body (streaming):**
```json
{
  "prompt": "Ceritakan cerita pendek",
  "stream": true
}
```

**Streaming Response (SSE):**
```
data: {"text":"Dahulu","done":false}
data: {"text":" kala","done":false}
data: {"text":"...","done":false}
data: {"done":true,"finishReason":"STOP","usageMetadata":{...}}
data: [DONE]
```

---

### 6. Chat Stream (dedicated)
**POST** `/api/v2/chat/stream`

Endpoint khusus untuk streaming responses.

**Request Body:**
```json
{
  "prompt": "Ceritakan cerita pendek",
  "model": "gemini-2.0-flash"
}
```

---

### 7. Count Tokens
**POST** `/api/v2/count-tokens`

Menghitung jumlah token dalam request.

**Request Body:**
```json
{
  "prompt": "Hello world!",
  "model": "gemini-2.0-flash"
}
```

**Response:**
```json
{
  "totalTokens": 3,
  "model": "gemini-2.0-flash"
}
```

---

## Request Formats

API mendukung 3 format input:

### 1. Simple Prompt
```json
{
  "prompt": "Your question here"
}
```

### 2. Simple Messages (Multi-turn)
```json
{
  "messages": [
    { "role": "user", "content": "Hi there!" },
    { "role": "model", "content": "Hello! How can I help?" },
    { "role": "user", "content": "Tell me about AI" }
  ]
}
```

### 3. Full Contents (Advanced - Multimodal)
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        { "text": "What is in this image?" },
        {
          "inlineData": {
            "mimeType": "image/jpeg",
            "data": "base64-encoded-image-data"
          }
        }
      ]
    }
  ]
}
```

---

## 🧠 Thinking Mode

Thinking mode memungkinkan model untuk "berpikir" sebelum menjawab, menghasilkan respons yang lebih akurat untuk pertanyaan kompleks.

### Model Support

| Model | Thinking Type | Configuration |
|-------|--------------|---------------|
| `gemini-3-pro-preview` | Level | `thinkingLevel: "low" \| "high"` |
| `gemini-2.5-pro` | Budget | `thinkingBudget: 128-32768 \| -1` |
| `gemini-2.5-flash` | Budget | `thinkingBudget: 0-24576 \| -1` |
| `gemini-2.0-flash` | ❌ | Not supported |

### Thinking Configuration

#### Gemini 3 (thinkingLevel)
```json
{
  "prompt": "Solve this complex math problem: ...",
  "model": "gemini-3-pro-preview",
  "thinkingConfig": {
    "thinkingLevel": "high",
    "includeThoughts": true
  }
}
```

#### Gemini 2.5 (thinkingBudget)
```json
{
  "prompt": "Analyze this code for bugs",
  "model": "gemini-2.5-flash",
  "thinkingConfig": {
    "thinkingBudget": 8192,
    "includeThoughts": true
  }
}
```

### Thinking Budget Values

| Value | Meaning |
|-------|---------|
| `0` | Disable thinking (Gemini 2.5 Flash only) |
| `128-32768` | Specific token budget (Gemini 2.5 Pro) |
| `0-24576` | Specific token budget (Gemini 2.5 Flash) |
| `-1` | Dynamic/automatic budget |

### Response with Thoughts
```json
{
  "text": "The answer is 42.",
  "thoughts": [
    "Let me break down this problem step by step...",
    "First, I need to consider...",
    "After analyzing, I conclude that..."
  ],
  "finishReason": "STOP",
  "usageMetadata": {
    "promptTokenCount": 50,
    "candidatesTokenCount": 100,
    "thoughtsTokenCount": 500,
    "totalTokenCount": 650
  },
  "model": "gemini-2.5-pro"
}
```

---

## 🔧 Tools & Function Calling

Function calling memungkinkan model memanggil fungsi yang Anda definisikan.

### Basic Function Declaration
```json
{
  "prompt": "What's the weather in Jakarta?",
  "model": "gemini-2.0-flash",
  "tools": [
    {
      "functionDeclarations": [
        {
          "name": "get_weather",
          "description": "Get the current weather for a location",
          "parameters": {
            "type": "object",
            "properties": {
              "location": {
                "type": "string",
                "description": "City name, e.g., Jakarta, Surabaya"
              },
              "unit": {
                "type": "string",
                "enum": ["celsius", "fahrenheit"],
                "description": "Temperature unit"
              }
            },
            "required": ["location"]
          }
        }
      ]
    }
  ],
  "toolConfig": {
    "functionCallingConfig": {
      "mode": "AUTO"
    }
  }
}
```

### Function Calling Modes

| Mode | Description |
|------|-------------|
| `AUTO` | Model decides when to call functions |
| `ANY` | Model must call at least one function |
| `NONE` | Model cannot call functions |
| `VALIDATED` | Uses validated function calling |

### Multiple Functions Example
```json
{
  "prompt": "Find restaurants near Monas and show me the route from my location",
  "model": "gemini-2.0-flash",
  "tools": [
    {
      "functionDeclarations": [
        {
          "name": "search_places",
          "description": "Search for places like restaurants, hotels, attractions",
          "parameters": {
            "type": "object",
            "properties": {
              "query": {
                "type": "string",
                "description": "Search query, e.g., 'restaurants', 'coffee shops'"
              },
              "location": {
                "type": "string",
                "description": "Location to search near"
              },
              "radius": {
                "type": "number",
                "description": "Search radius in meters"
              },
              "type": {
                "type": "string",
                "enum": ["restaurant", "cafe", "hotel", "attraction", "gas_station"],
                "description": "Place type"
              }
            },
            "required": ["query", "location"]
          }
        },
        {
          "name": "get_directions",
          "description": "Get directions between two locations",
          "parameters": {
            "type": "object",
            "properties": {
              "origin": {
                "type": "string",
                "description": "Starting location"
              },
              "destination": {
                "type": "string",
                "description": "Destination location"
              },
              "mode": {
                "type": "string",
                "enum": ["driving", "walking", "transit", "bicycling"],
                "description": "Travel mode"
              }
            },
            "required": ["origin", "destination"]
          }
        },
        {
          "name": "get_place_details",
          "description": "Get detailed information about a place",
          "parameters": {
            "type": "object",
            "properties": {
              "place_id": {
                "type": "string",
                "description": "Google Place ID"
              }
            },
            "required": ["place_id"]
          }
        }
      ]
    }
  ],
  "toolConfig": {
    "functionCallingConfig": {
      "mode": "AUTO",
      "allowedFunctionNames": ["search_places", "get_directions"]
    }
  }
}
```

### Response with Function Calls
```json
{
  "text": "",
  "functionCalls": [
    {
      "name": "search_places",
      "args": {
        "query": "restaurants",
        "location": "Monas, Jakarta",
        "radius": 1000,
        "type": "restaurant"
      }
    }
  ],
  "finishReason": "FUNCTION_CALL",
  "model": "gemini-2.0-flash"
}
```

### Responding to Function Calls
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": "Find restaurants near Monas" }]
    },
    {
      "role": "model",
      "parts": [{
        "functionCall": {
          "name": "search_places",
          "args": { "query": "restaurants", "location": "Monas" }
        }
      }]
    },
    {
      "role": "user",
      "parts": [{
        "functionResponse": {
          "name": "search_places",
          "response": {
            "results": [
              { "name": "Restoran Padang Sederhana", "rating": 4.5 },
              { "name": "Sate Khas Senayan", "rating": 4.7 }
            ]
          }
        }
      }]
    }
  ]
}
```

---

## 🔍 Google Search Grounding

Google Search Grounding memungkinkan model mengakses informasi terkini dari internet.

### Enable Google Search
```json
{
  "prompt": "Apa berita terbaru tentang ekonomi Indonesia hari ini?",
  "model": "gemini-2.0-flash",
  "tools": [
    {
      "googleSearch": {}
    }
  ]
}
```

### Dynamic Retrieval (Gemini 2.0+)
```json
{
  "prompt": "What are the latest AI developments?",
  "model": "gemini-2.0-flash",
  "tools": [
    {
      "googleSearch": {
        "dynamicRetrievalConfig": {
          "mode": "MODE_DYNAMIC",
          "dynamicThreshold": 0.5
        }
      }
    }
  ]
}
```

### Response with Grounding Metadata
```json
{
  "text": "Berdasarkan berita terbaru, ekonomi Indonesia...",
  "groundingMetadata": {
    "groundingChunks": [
      {
        "web": {
          "uri": "https://example.com/news/economy",
          "title": "Indonesia Economy News"
        }
      }
    ],
    "webSearchQueries": ["berita ekonomi Indonesia terbaru"],
    "searchEntryPoint": {
      "renderedContent": "<search-widget-html>"
    }
  },
  "finishReason": "STOP",
  "model": "gemini-2.0-flash"
}
```

---

## 💻 Code Execution

Code Execution memungkinkan model menulis dan menjalankan kode Python.

### Enable Code Execution
```json
{
  "prompt": "Calculate the first 20 Fibonacci numbers and plot them",
  "model": "gemini-2.0-flash",
  "tools": [
    {
      "codeExecution": {}
    }
  ]
}
```

### Response with Code Execution
```json
{
  "text": "Here's the Fibonacci sequence calculation:",
  "codeExecutionResult": {
    "code": "def fibonacci(n):\n    fib = [0, 1]\n    for i in range(2, n):\n        fib.append(fib[-1] + fib[-2])\n    return fib\n\nresult = fibonacci(20)\nprint(result)",
    "output": "[0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181]",
    "language": "python"
  },
  "finishReason": "STOP",
  "model": "gemini-2.0-flash"
}
```

---

## 🖼️ Multimodal Input

### Image Analysis
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        { "text": "Describe this image in detail" },
        {
          "inlineData": {
            "mimeType": "image/jpeg",
            "data": "base64-encoded-image-data"
          }
        }
      ]
    }
  ],
  "model": "gemini-2.0-flash"
}
```

### Image from URL
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        { "text": "What's in this image?" },
        {
          "fileData": {
            "mimeType": "image/jpeg",
            "fileUri": "gs://bucket-name/image.jpg"
          }
        }
      ]
    }
  ]
}
```

### Video Analysis
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        { "text": "Summarize this video" },
        {
          "fileData": {
            "mimeType": "video/mp4",
            "fileUri": "gs://bucket-name/video.mp4"
          }
        }
      ]
    }
  ],
  "model": "gemini-2.0-flash"
}
```

### Audio Transcription
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        { "text": "Transcribe this audio" },
        {
          "inlineData": {
            "mimeType": "audio/mp3",
            "data": "base64-encoded-audio"
          }
        }
      ]
    }
  ]
}
```

### PDF Analysis
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        { "text": "Summarize this document" },
        {
          "fileData": {
            "mimeType": "application/pdf",
            "fileUri": "gs://bucket-name/document.pdf"
          }
        }
      ]
    }
  ]
}
```

### Supported MIME Types

| Category | MIME Types |
|----------|-----------|
| **Images** | `image/png`, `image/jpeg`, `image/webp`, `image/heic`, `image/heif`, `image/gif` |
| **Audio** | `audio/wav`, `audio/mp3`, `audio/mpeg`, `audio/aiff`, `audio/aac`, `audio/ogg`, `audio/flac` |
| **Video** | `video/mp4`, `video/mpeg`, `video/mov`, `video/quicktime`, `video/avi`, `video/webm`, `video/wmv`, `video/3gpp` |
| **Documents** | `application/pdf` |
| **Text** | `text/plain`, `text/html`, `text/css`, `text/javascript`, `application/json`, `text/markdown` |

---

## 📊 JSON Mode (Structured Output)

### Basic JSON Output
```json
{
  "prompt": "List 3 Indonesian cities with their population",
  "model": "gemini-2.0-flash",
  "generationConfig": {
    "responseMimeType": "application/json"
  }
}
```

### With Schema Validation
```json
{
  "prompt": "Generate a user profile",
  "model": "gemini-2.0-flash",
  "generationConfig": {
    "responseMimeType": "application/json",
    "responseSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "User's full name"
        },
        "age": {
          "type": "integer",
          "description": "User's age"
        },
        "email": {
          "type": "string",
          "description": "User's email address"
        },
        "interests": {
          "type": "array",
          "items": { "type": "string" },
          "description": "List of interests"
        },
        "address": {
          "type": "object",
          "properties": {
            "city": { "type": "string" },
            "country": { "type": "string" }
          },
          "required": ["city", "country"]
        }
      },
      "required": ["name", "email"]
    }
  }
}
```

### Array Response Schema
```json
{
  "prompt": "List popular Indonesian dishes",
  "model": "gemini-2.0-flash",
  "generationConfig": {
    "responseMimeType": "application/json",
    "responseSchema": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "origin": { "type": "string" },
          "ingredients": {
            "type": "array",
            "items": { "type": "string" }
          },
          "spicyLevel": {
            "type": "string",
            "enum": ["mild", "medium", "hot", "very_hot"]
          }
        },
        "required": ["name", "origin"]
      }
    }
  }
}
```

---

## 🛡️ Safety Settings

```json
{
  "prompt": "Your prompt here",
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HATE_SPEECH",
      "threshold": "BLOCK_ONLY_HIGH"
    },
    {
      "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      "category": "HARM_CATEGORY_HARASSMENT",
      "threshold": "BLOCK_ONLY_HIGH"
    },
    {
      "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      "category": "HARM_CATEGORY_CIVIC_INTEGRITY",
      "threshold": "BLOCK_ONLY_HIGH"
    }
  ]
}
```

### Harm Categories

| Category | Description |
|----------|-------------|
| `HARM_CATEGORY_HATE_SPEECH` | Content promoting hate against groups |
| `HARM_CATEGORY_DANGEROUS_CONTENT` | Content promoting harmful activities |
| `HARM_CATEGORY_HARASSMENT` | Content targeting individuals |
| `HARM_CATEGORY_SEXUALLY_EXPLICIT` | Sexual content |
| `HARM_CATEGORY_CIVIC_INTEGRITY` | Election/civic misinformation |

### Thresholds

| Threshold | Description |
|-----------|-------------|
| `BLOCK_NONE` | Never block |
| `BLOCK_ONLY_HIGH` | Block only high probability |
| `BLOCK_MEDIUM_AND_ABOVE` | Block medium and high |
| `BLOCK_LOW_AND_ABOVE` | Block all detected content |

---

## 📋 Complete Request Schema

```typescript
interface GeminiChatRequest {
  // Input (choose one)
  prompt?: string;
  messages?: Array<{
    role: "user" | "model";
    content: string;
  }>;
  contents?: Array<{
    role: "user" | "model";
    parts: Array<TextPart | InlineDataPart | FileDataPart>;
  }>;
  
  // Model selection
  model?: "gemini-2.0-flash" | "gemini-2.5-flash" | "gemini-2.5-pro" | "gemini-3-pro-preview";
  
  // System instruction
  systemInstruction?: string;
  
  // Generation configuration
  generationConfig?: {
    temperature?: number;           // 0-2, default 1.0
    topP?: number;                  // 0-1, default 0.95
    topK?: number;                  // default 40
    maxOutputTokens?: number;       // default 8192
    stopSequences?: string[];
    candidateCount?: number;        // 1
    responseMimeType?: "text/plain" | "application/json";
    responseSchema?: JSONSchema;
  };
  
  // Thinking configuration
  thinkingConfig?: {
    thinkingLevel?: "low" | "high";    // Gemini 3
    thinkingBudget?: number;           // Gemini 2.5 (-1, 0, 128-32768)
    includeThoughts?: boolean;
  };
  
  // Safety settings
  safetySettings?: Array<{
    category: HarmCategory;
    threshold: SafetyThreshold;
  }>;
  
  // Tools
  tools?: Array<{
    functionDeclarations?: FunctionDeclaration[];
    googleSearch?: {
      dynamicRetrievalConfig?: {
        mode?: "MODE_DYNAMIC" | "MODE_UNSPECIFIED";
        dynamicThreshold?: number;
      };
    };
    codeExecution?: {};
  }>;
  
  // Tool configuration
  toolConfig?: {
    functionCallingConfig?: {
      mode: "AUTO" | "ANY" | "NONE" | "VALIDATED";
      allowedFunctionNames?: string[];
    };
  };
  
  // Streaming
  stream?: boolean;
}
```

---

## Generation Config Options

| Parameter | Type | Description | Default | Range |
|-----------|------|-------------|---------|-------|
| `temperature` | number | Creativity/randomness level | 1.0 | 0-2 |
| `topP` | number | Nucleus sampling probability | 0.95 | 0-1 |
| `topK` | number | Top-k sampling | 40 | 1-100 |
| `maxOutputTokens` | number | Max tokens in response | 8192 | 1-65536 |
| `stopSequences` | string[] | Sequences to stop generation | [] | max 5 |
| `candidateCount` | number | Number of responses | 1 | 1 |
| `responseMimeType` | string | Output format | "text/plain" | "text/plain", "application/json" |
| `responseSchema` | object | JSON schema for structured output | - | Valid JSON Schema |

---

## Supported Models

| Model | Thinking | Max Input | Max Output | Key Features |
|-------|----------|-----------|------------|--------------|
| `gemini-2.0-flash` | ❌ | 1M tokens | 8K tokens | Fast, production-ready, Google Search, Code Execution |
| `gemini-2.5-flash` | ✅ budget | 1M tokens | 65K tokens | Thinking mode, balanced speed/quality |
| `gemini-2.5-pro` | ✅ budget | 1M tokens | 65K tokens | Premium quality, extended thinking |
| `gemini-3-pro-preview` | ✅ level | 1M tokens | 65K tokens | Latest features, thinkingLevel control |

---

## 📝 Complete Examples

### Example 1: Weather Assistant with Function Calling
```json
{
  "prompt": "What's the weather like in Jakarta and should I bring an umbrella?",
  "model": "gemini-2.0-flash",
  "systemInstruction": "You are a helpful weather assistant. Always provide weather information in a friendly manner.",
  "tools": [
    {
      "functionDeclarations": [
        {
          "name": "get_current_weather",
          "description": "Get current weather conditions for a city",
          "parameters": {
            "type": "object",
            "properties": {
              "city": { "type": "string" },
              "country": { "type": "string" }
            },
            "required": ["city"]
          }
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 500
  }
}
```

### Example 2: Code Analysis with Thinking Mode
```json
{
  "prompt": "Review this code for security vulnerabilities:\n\n```python\ndef login(username, password):\n    query = f\"SELECT * FROM users WHERE username='{username}' AND password='{password}'\"\n    result = db.execute(query)\n    return result\n```",
  "model": "gemini-2.5-pro",
  "systemInstruction": "You are a security expert. Analyze code for vulnerabilities and provide fixes.",
  "thinkingConfig": {
    "thinkingBudget": 16384,
    "includeThoughts": true
  },
  "generationConfig": {
    "temperature": 0.3,
    "maxOutputTokens": 2000
  }
}
```

### Example 3: Research with Google Search
```json
{
  "prompt": "What are the latest developments in quantum computing in 2024?",
  "model": "gemini-2.0-flash",
  "tools": [
    {
      "googleSearch": {
        "dynamicRetrievalConfig": {
          "mode": "MODE_DYNAMIC",
          "dynamicThreshold": 0.3
        }
      }
    }
  ],
  "generationConfig": {
    "temperature": 0.5,
    "maxOutputTokens": 2000
  }
}
```

### Example 4: Math Problem with Code Execution
```json
{
  "prompt": "Calculate the compound interest for $10,000 invested at 5% annually for 10 years, compounded monthly. Show the calculation and create a growth chart.",
  "model": "gemini-2.0-flash",
  "tools": [
    {
      "codeExecution": {}
    }
  ],
  "generationConfig": {
    "temperature": 0.2,
    "maxOutputTokens": 3000
  }
}
```

### Example 5: Travel Planner (Multiple Tools)
```json
{
  "prompt": "Plan a 3-day trip to Bali. Find popular attractions, suggest restaurants, and give me directions from the airport to Ubud.",
  "model": "gemini-2.0-flash",
  "systemInstruction": "You are an expert travel planner for Indonesia. Provide detailed, practical advice.",
  "tools": [
    {
      "functionDeclarations": [
        {
          "name": "search_attractions",
          "description": "Search for tourist attractions",
          "parameters": {
            "type": "object",
            "properties": {
              "location": { "type": "string" },
              "category": { 
                "type": "string",
                "enum": ["nature", "culture", "adventure", "beach", "temple"]
              },
              "rating_min": { "type": "number" }
            },
            "required": ["location"]
          }
        },
        {
          "name": "search_restaurants",
          "description": "Search for restaurants",
          "parameters": {
            "type": "object",
            "properties": {
              "location": { "type": "string" },
              "cuisine": { "type": "string" },
              "price_range": {
                "type": "string",
                "enum": ["budget", "moderate", "expensive"]
              }
            },
            "required": ["location"]
          }
        },
        {
          "name": "get_route",
          "description": "Get driving route between locations",
          "parameters": {
            "type": "object",
            "properties": {
              "from": { "type": "string" },
              "to": { "type": "string" }
            },
            "required": ["from", "to"]
          }
        }
      ]
    },
    {
      "googleSearch": {}
    }
  ],
  "toolConfig": {
    "functionCallingConfig": {
      "mode": "AUTO"
    }
  },
  "generationConfig": {
    "temperature": 0.8,
    "maxOutputTokens": 4000
  }
}
```

### Example 6: Document Analysis (Multimodal)
```json
{
  "model": "gemini-2.0-flash",
  "contents": [
    {
      "role": "user",
      "parts": [
        { "text": "Analyze this financial report. Summarize the key metrics and identify any concerning trends." },
        {
          "fileData": {
            "mimeType": "application/pdf",
            "fileUri": "gs://my-bucket/financial-report-2024.pdf"
          }
        }
      ]
    }
  ],
  "generationConfig": {
    "responseMimeType": "application/json",
    "responseSchema": {
      "type": "object",
      "properties": {
        "summary": { "type": "string" },
        "keyMetrics": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "value": { "type": "string" },
              "trend": { "type": "string", "enum": ["up", "down", "stable"] }
            }
          }
        },
        "concerns": {
          "type": "array",
          "items": { "type": "string" }
        },
        "recommendations": {
          "type": "array",
          "items": { "type": "string" }
        }
      },
      "required": ["summary", "keyMetrics"]
    },
    "maxOutputTokens": 3000
  }
}
```

---

## Error Responses

```json
{
  "statusCode": 400,
  "message": "Model yang dipilih tidak valid",
  "error": "Bad Request",
  "details": {
    "blockReason": "SAFETY",
    "safetyRatings": [
      { "category": "HARM_CATEGORY_HARASSMENT", "probability": "HIGH", "blocked": true }
    ]
  }
}
```

### Common Error Codes

| Code | Error | Description |
|------|-------|-------------|
| `400` | Bad Request | Invalid input, missing required fields |
| `401` | Unauthorized | Invalid or missing API key |
| `403` | Forbidden | API key doesn't have access |
| `429` | Too Many Requests | Rate limit or quota exceeded |
| `500` | Internal Server Error | Server-side error |

### Finish Reasons

| Reason | Description |
|--------|-------------|
| `STOP` | Natural completion |
| `MAX_TOKENS` | Output limit reached |
| `SAFETY` | Blocked for safety reasons |
| `RECITATION` | Blocked due to recitation |
| `FUNCTION_CALL` | Model wants to call a function |
| `OTHER` | Unknown reason |

---

## Environment Variables

```env
# Required
GEMINI_API_KEY=your-api-key-here

# Optional
GEMINI_DEFAULT_MODEL=gemini-2.0-flash
GEMINI_SYSTEM_INSTRUCTION=Custom system instruction
```

---

## cURL Examples

### Simple Generate
```bash
curl -X POST http://localhost:3001/api/v2/simple \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Halo!"}'
```

### With Thinking Mode
```bash
curl -X POST http://localhost:3001/api/v2/chat/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Solve this logic puzzle step by step",
    "model": "gemini-2.5-pro",
    "thinkingConfig": {
      "thinkingBudget": 8192,
      "includeThoughts": true
    }
  }'
```

### With Google Search
```bash
curl -X POST http://localhost:3001/api/v2/chat/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What are the latest news about Indonesia today?",
    "model": "gemini-2.0-flash",
    "tools": [{ "googleSearch": {} }]
  }'
```

### With Function Calling
```bash
curl -X POST http://localhost:3001/api/v2/chat/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Find restaurants near Bundaran HI Jakarta",
    "model": "gemini-2.0-flash",
    "tools": [{
      "functionDeclarations": [{
        "name": "search_places",
        "description": "Search for places",
        "parameters": {
          "type": "object",
          "properties": {
            "query": { "type": "string" },
            "location": { "type": "string" }
          },
          "required": ["query", "location"]
        }
      }]
    }]
  }'
```

### Streaming Response
```bash
curl -X POST http://localhost:3001/api/v2/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Ceritakan cerita pendek"}'
```

---

## JavaScript/TypeScript Client Example

```typescript
// Simple request
const response = await fetch('http://localhost:3001/api/v2/simple', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'Halo!' })
});
const data = await response.json();
console.log(data.text);

// With thinking mode
const thinkingResponse = await fetch('http://localhost:3001/api/v2/chat/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Solve this complex problem',
    model: 'gemini-2.5-pro',
    thinkingConfig: {
      thinkingBudget: 8192,
      includeThoughts: true
    }
  })
});
const thinkingData = await thinkingResponse.json();
console.log('Thoughts:', thinkingData.thoughts);
console.log('Answer:', thinkingData.text);

// With Google Search
const searchResponse = await fetch('http://localhost:3001/api/v2/chat/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'What is the latest news?',
    model: 'gemini-2.0-flash',
    tools: [{ googleSearch: {} }]
  })
});
const searchData = await searchResponse.json();
console.log('Answer:', searchData.text);
console.log('Sources:', searchData.groundingMetadata?.groundingChunks);

// Streaming request
const streamResponse = await fetch('http://localhost:3001/api/v2/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'Tell me a story' })
});

const reader = streamResponse.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
  
  for (const line of lines) {
    const data = line.replace('data: ', '');
    if (data === '[DONE]') break;
    
    const parsed = JSON.parse(data);
    if (parsed.text) {
      process.stdout.write(parsed.text);
    }
  }
}
```

---

## Python Client Example

```python
import requests
import json

BASE_URL = "http://localhost:3001/api/v2"

# Simple request
response = requests.post(f"{BASE_URL}/simple", json={
    "prompt": "Halo!"
})
print(response.json()["text"])

# With thinking mode
response = requests.post(f"{BASE_URL}/chat/generate", json={
    "prompt": "Analyze this complex problem",
    "model": "gemini-2.5-pro",
    "thinkingConfig": {
        "thinkingBudget": 8192,
        "includeThoughts": True
    }
})
data = response.json()
print("Thoughts:", data.get("thoughts"))
print("Answer:", data["text"])

# With Google Search
response = requests.post(f"{BASE_URL}/chat/generate", json={
    "prompt": "Latest AI news",
    "model": "gemini-2.0-flash",
    "tools": [{"googleSearch": {}}]
})
data = response.json()
print("Answer:", data["text"])

# Streaming
response = requests.post(f"{BASE_URL}/chat/stream", json={
    "prompt": "Tell me a story"
}, stream=True)

for line in response.iter_lines():
    if line:
        line = line.decode('utf-8')
        if line.startswith('data: '):
            data = line[6:]
            if data == '[DONE]':
                break
            chunk = json.loads(data)
            if chunk.get('text'):
                print(chunk['text'], end='', flush=True)
```

---

## Changelog

### v2.0.0 (2025-12-04)
- Initial release
- Support for all Gemini models
- Thinking mode (thinkingLevel for Gemini 3, thinkingBudget for Gemini 2.5)
- Function calling
- Google Search grounding
- Code execution
- Multimodal input (image, video, audio, PDF)
- JSON mode with schema validation
- Safety settings
- Streaming responses

---

*Last Updated: 2025-12-04*
*Reference: [Google AI Gemini API Documentation](https://ai.google.dev/docs)*
