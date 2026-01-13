# OpenRouter API - Panduan Integrasi Frontend

## Daftar Isi
1. [Gambaran Umum API](#gambaran-umum-api)
2. [Autentikasi](#autentikasi)
3. [Endpoint API](#endpoint-api)
4. [Contoh Penggunaan](#contoh-penggunaan)
5. [Penanganan Error (PENTING!)](#penanganan-error-penting)
6. [Best Practices](#best-practices)

---

## Gambaran Umum API

API OpenRouter menyediakan akses ke 500+ model AI premium melalui satu endpoint terpadu. Endpoint utama:

```
Base URL: https://orenax-production-0c1a.up.railway.app/api/v2/openrouter
```

### Model Premium yang Tersedia

| Model ID | Nama | Kegunaan |
|----------|------|----------|
| `anthropic/claude-sonnet-4.5` | Claude Sonnet 4.5 | General purpose, coding |
| `anthropic/claude-opus-4.5` | Claude Opus 4.5 | Complex reasoning |
| `openai/gpt-4o` | GPT-4o | Multimodal (gambar + teks) |
| `google/gemini-2.5-pro` | Gemini 2.5 Pro | Long context (1M tokens) |

---

## Autentikasi

Semua endpoint memerlukan JWT token di header Authorization.

```typescript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${userToken}`
};
```

---

## Endpoint API

### 1. Chat Completion (Non-Streaming)
```
POST /api/v2/openrouter/chat/completions
```

**Request Body:**
```json
{
  "model": "anthropic/claude-sonnet-4.5",
  "messages": [
    { "role": "system", "content": "Kamu adalah asisten yang membantu." },
    { "role": "user", "content": "Halo, apa kabar?" }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

### 2. Chat Streaming (SSE)
```
POST /api/v2/openrouter/chat/stream
```

**Response:** Server-Sent Events stream

### 3. Vision (Analisis Gambar)
```
POST /api/v2/openrouter/vision
```

**Request Body:**
```json
{
  "model": "openai/gpt-4o",
  "images": [{ "url": "https://example.com/image.jpg" }],
  "prompt": "Jelaskan gambar ini."
}
```

### 4. Audio Processing
```
POST /api/v2/openrouter/audio
```

### 5. Function Calling
```
POST /api/v2/openrouter/tools/invoke
POST /api/v2/openrouter/tools/submit
```

### 6. Model List
```
GET /api/v2/openrouter/models
GET /api/v2/openrouter/models/:modelId
GET /api/v2/openrouter/models/recommended/:useCase
```

---

## Contoh Penggunaan

### TypeScript/React - Chat Completion

```typescript
// services/openrouter.ts

const API_BASE = 'https://orenax-production-0c1a.up.railway.app/api/v2/openrouter';

export async function sendChatMessage(
  messages: ChatMessage[],
  model: string = 'anthropic/claude-sonnet-4.5'
): Promise<string> {
  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  // PENTING: Handle error dengan user-friendly
  if (!response.ok) {
    throw await handleApiError(response);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
```

### Streaming dengan SSE

```typescript
// services/streaming.ts

export async function streamChat(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: UserFriendlyError) => void
) {
  try {
    const response = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4.5',
        messages,
        stream: true
      })
    });

    if (!response.ok) {
      throw await handleApiError(response);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onComplete();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {}
        }
      }
    }
    onComplete();
  } catch (error) {
    onError(parseError(error));
  }
}
```

---

## Penanganan Error (PENTING!)

### ⚠️ WAJIB DIIMPLEMENTASI

Jangan pernah menampilkan error teknis kepada user! Semua error harus diterjemahkan ke pesan user-friendly.

### Error Codes & User-Friendly Messages

```typescript
// utils/error-handler.ts

export interface UserFriendlyError {
  title: string;      // Judul singkat
  message: string;    // Pesan untuk user
  action?: string;    // Saran tindakan
  retry: boolean;     // Boleh retry?
  code: string;       // Internal code untuk logging
}

// Mapping error code ke pesan user-friendly (Bahasa Indonesia)
const ERROR_MESSAGES: Record<number | string, UserFriendlyError> = {
  // === Authentication Errors ===
  401: {
    title: 'Sesi Berakhir',
    message: 'Sesi login Anda telah berakhir.',
    action: 'Silakan login kembali untuk melanjutkan.',
    retry: false,
    code: 'AUTH_EXPIRED'
  },
  403: {
    title: 'Akses Ditolak',
    message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
    action: 'Hubungi admin jika Anda merasa ini adalah kesalahan.',
    retry: false,
    code: 'ACCESS_DENIED'
  },

  // === Rate Limiting ===
  429: {
    title: 'Terlalu Banyak Permintaan',
    message: 'Anda telah mencapai batas penggunaan.',
    action: 'Tunggu beberapa saat sebelum mencoba lagi.',
    retry: true,
    code: 'RATE_LIMITED'
  },

  // === Not Found ===
  404: {
    title: 'Tidak Ditemukan',
    message: 'Layanan yang Anda cari tidak tersedia.',
    action: 'Coba refresh halaman atau kembali ke beranda.',
    retry: false,
    code: 'NOT_FOUND'
  },

  // === Server Errors ===
  500: {
    title: 'Terjadi Kesalahan',
    message: 'Maaf, terjadi kesalahan pada sistem kami.',
    action: 'Coba lagi dalam beberapa saat.',
    retry: true,
    code: 'SERVER_ERROR'
  },
  502: {
    title: 'Server Sedang Sibuk',
    message: 'Server AI sedang memproses banyak permintaan.',
    action: 'Coba lagi dalam beberapa saat.',
    retry: true,
    code: 'BAD_GATEWAY'
  },
  503: {
    title: 'Layanan Tidak Tersedia',
    message: 'Layanan sedang dalam pemeliharaan.',
    action: 'Coba lagi dalam beberapa menit.',
    retry: true,
    code: 'SERVICE_UNAVAILABLE'
  },
  504: {
    title: 'Waktu Habis',
    message: 'Permintaan membutuhkan waktu terlalu lama.',
    action: 'Coba dengan pertanyaan yang lebih singkat.',
    retry: true,
    code: 'TIMEOUT'
  },

  // === Specific API Errors ===
  'API_KEY_EXHAUSTED': {
    title: 'Kuota Habis',
    message: 'Kuota penggunaan AI telah habis.',
    action: 'Hubungi admin untuk menambah kuota.',
    retry: false,
    code: 'QUOTA_EXCEEDED'
  },
  'MODEL_UNAVAILABLE': {
    title: 'Model Tidak Tersedia',
    message: 'Model AI yang dipilih sedang tidak tersedia.',
    action: 'Sistem akan menggunakan model alternatif.',
    retry: true,
    code: 'MODEL_UNAVAILABLE'
  },
  'CONTENT_FILTERED': {
    title: 'Konten Ditolak',
    message: 'Permintaan Anda tidak dapat diproses.',
    action: 'Coba ubah pertanyaan Anda.',
    retry: false,
    code: 'CONTENT_FILTERED'
  },

  // === Network Errors ===
  'NETWORK_ERROR': {
    title: 'Koneksi Terputus',
    message: 'Tidak dapat terhubung ke server.',
    action: 'Periksa koneksi internet Anda.',
    retry: true,
    code: 'NETWORK_ERROR'
  },
  'TIMEOUT': {
    title: 'Waktu Habis',
    message: 'Server tidak merespon dalam waktu yang ditentukan.',
    action: 'Coba lagi dalam beberapa saat.',
    retry: true,
    code: 'TIMEOUT'
  },

  // === Default ===
  'default': {
    title: 'Terjadi Kesalahan',
    message: 'Maaf, terjadi kesalahan yang tidak terduga.',
    action: 'Silakan coba lagi.',
    retry: true,
    code: 'UNKNOWN_ERROR'
  }
};
```

### Fungsi Error Handler

```typescript
// utils/error-handler.ts (lanjutan)

/**
 * Parse API response error ke UserFriendlyError
 */
export async function handleApiError(response: Response): Promise<UserFriendlyError> {
  let errorBody: any = {};
  
  try {
    errorBody = await response.json();
  } catch {
    // Response bukan JSON
  }

  // Check for specific error types from backend
  const errorType = errorBody.error?.type || errorBody.error?.code;
  
  // Cek error spesifik dari API
  if (errorType === 'insufficient_quota' || 
      errorBody.error?.message?.includes('quota') ||
      errorBody.error?.message?.includes('credit')) {
    return ERROR_MESSAGES['API_KEY_EXHAUSTED'];
  }

  if (errorType === 'model_not_available' || 
      errorBody.error?.message?.includes('model')) {
    return ERROR_MESSAGES['MODEL_UNAVAILABLE'];
  }

  if (errorType === 'content_filter' ||
      errorBody.error?.message?.includes('content')) {
    return ERROR_MESSAGES['CONTENT_FILTERED'];
  }

  // Fallback ke HTTP status code
  return ERROR_MESSAGES[response.status] || ERROR_MESSAGES['default'];
}

/**
 * Parse any error ke UserFriendlyError
 */
export function parseError(error: unknown): UserFriendlyError {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return ERROR_MESSAGES['NETWORK_ERROR'];
  }

  // AbortError (timeout)
  if (error instanceof DOMException && error.name === 'AbortError') {
    return ERROR_MESSAGES['TIMEOUT'];
  }

  // Already UserFriendlyError
  if (typeof error === 'object' && error !== null && 'title' in error) {
    return error as UserFriendlyError;
  }

  // Default
  return ERROR_MESSAGES['default'];
}
```

### Komponen UI untuk Error (React)

```tsx
// components/ErrorMessage.tsx

import React from 'react';
import { UserFriendlyError } from '@/utils/error-handler';

interface Props {
  error: UserFriendlyError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorMessage({ error, onRetry, onDismiss }: Props) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            {error.title}
          </h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            {error.message}
          </p>
          {error.action && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              💡 {error.action}
            </p>
          )}
        </div>

        {/* Dismiss */}
        {onDismiss && (
          <button onClick={onDismiss} className="text-red-500 hover:text-red-700">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Retry Button */}
      {error.retry && onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}
```

### Toast Notification untuk Error

```tsx
// components/ErrorToast.tsx

import { toast } from 'react-hot-toast'; // atau library toast lainnya
import { UserFriendlyError } from '@/utils/error-handler';

export function showErrorToast(error: UserFriendlyError) {
  toast.error(
    <div>
      <p className="font-medium">{error.title}</p>
      <p className="text-sm opacity-90">{error.message}</p>
    </div>,
    {
      duration: error.retry ? 5000 : 8000,
      position: 'top-center'
    }
  );
}
```

---

## Best Practices

### 1. Selalu Wrap API Calls dengan Try-Catch

```typescript
async function handleSendMessage() {
  setLoading(true);
  setError(null);

  try {
    const response = await sendChatMessage(messages);
    setMessages([...messages, { role: 'assistant', content: response }]);
  } catch (error) {
    const friendlyError = parseError(error);
    setError(friendlyError);
    showErrorToast(friendlyError);
    
    // Log ke monitoring (tidak tampil ke user)
    console.error('[Chat Error]', friendlyError.code, error);
  } finally {
    setLoading(false);
  }
}
```

### 2. Implement Loading States

```tsx
function ChatInterface() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UserFriendlyError | null>(null);

  if (loading) {
    return <LoadingSpinner message="AI sedang berpikir..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={handleRetry} />;
  }

  return <ChatMessages messages={messages} />;
}
```

### 3. Auto-Retry untuk Error Transient

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: UserFriendlyError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = parseError(error);
      
      // Hanya retry jika error bisa di-retry
      if (!lastError.retry) throw lastError;
      
      // Exponential backoff
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }

  throw lastError!;
}

// Usage
const response = await fetchWithRetry(() => sendChatMessage(messages));
```

### 4. Timeout untuk Request

```typescript
async function fetchWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = 60000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fn();
  } finally {
    clearTimeout(timeoutId);
  }
}
```

### 5. Jangan Pernah Tampilkan Ini ke User

❌ **SALAH:**
```
Error: insufficient_quota: You have exceeded your API quota. 
Please check your billing at https://openrouter.ai/account
```

✅ **BENAR:**
```
Kuota Habis
Kuota penggunaan AI telah habis.
💡 Hubungi admin untuk menambah kuota.
```

---

## Checklist Frontend Developer

- [ ] Implementasi `handleApiError()` function
- [ ] Implementasi `parseError()` function
- [ ] Buat komponen `ErrorMessage` yang user-friendly
- [ ] Semua API calls menggunakan try-catch
- [ ] Loading states untuk semua operasi async
- [ ] Retry button untuk error yang bisa di-retry
- [ ] Toast notifications untuk error
- [ ] JANGAN tampilkan error teknis ke user!

---

## Kontak

Jika ada pertanyaan tentang integrasi API:
- Swagger Docs: `/api/docs`
- Backend Team: [disesuaikan]
