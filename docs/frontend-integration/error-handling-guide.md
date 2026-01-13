# Error Handling - Panduan Lengkap untuk Frontend

## 🚨 PENTING: Mengapa Error Handling Itu Kritis?

User tidak perlu melihat error teknis seperti:
```
Error: OpenRouterApiError: insufficient_quota - Your credit balance is $0.00. 
Please add credits at https://openrouter.ai/credits
```

User hanya perlu melihat pesan yang bisa dipahami dan ditindaklanjuti.

---

## Error Categories

### 1. Authentication Errors (401, 403)
```
User Message: "Sesi login Anda telah berakhir. Silakan login kembali."
Action: Redirect ke login page
```

### 2. Quota/Credit Errors
```
User Message: "Kuota penggunaan AI telah habis. Hubungi admin untuk menambah kuota."
Action: Tampilkan button kontak admin
```

### 3. Rate Limit (429)
```
User Message: "Terlalu banyak permintaan. Tunggu beberapa saat sebelum mencoba lagi."
Action: Tampilkan countdown timer lalu auto-retry
```

### 4. Timeout (504)
```
User Message: "Permintaan membutuhkan waktu terlalu lama. Coba dengan pertanyaan yang lebih singkat."
Action: Tampilkan button retry
```

### 5. Server Error (500, 502, 503)
```
User Message: "Terjadi kesalahan pada sistem. Coba lagi dalam beberapa saat."
Action: Tampilkan button retry dengan exponential backoff
```

### 6. Not Found (404)
```
User Message: "Halaman tidak ditemukan. Kembali ke beranda."
Action: Button kembali ke home
```

### 7. Network Error
```
User Message: "Koneksi terputus. Periksa koneksi internet Anda."
Action: Auto-retry ketika online
```

---

## Copy-Paste Code

### error-handler.ts

```typescript
/**
 * User-Friendly Error Handler
 * Copy file ini ke folder utils frontend
 */

export interface UserFriendlyError {
  title: string;
  message: string;
  action?: string;
  retry: boolean;
  code: string;
}

const ERROR_MAP: Record<string | number, UserFriendlyError> = {
  // Auth
  401: {
    title: 'Sesi Berakhir',
    message: 'Sesi login Anda telah berakhir.',
    action: 'Silakan login kembali.',
    retry: false,
    code: 'AUTH_EXPIRED'
  },
  403: {
    title: 'Akses Ditolak',
    message: 'Anda tidak memiliki izin untuk fitur ini.',
    retry: false,
    code: 'FORBIDDEN'
  },
  
  // Rate limit
  429: {
    title: 'Tunggu Sebentar',
    message: 'Anda telah mencapai batas penggunaan.',
    action: 'Coba lagi dalam 1 menit.',
    retry: true,
    code: 'RATE_LIMITED'
  },
  
  // Not found
  404: {
    title: 'Tidak Ditemukan',
    message: 'Halaman yang Anda cari tidak tersedia.',
    retry: false,
    code: 'NOT_FOUND'
  },
  
  // Server errors
  500: {
    title: 'Terjadi Kesalahan',
    message: 'Maaf, sistem sedang mengalami gangguan.',
    action: 'Coba lagi dalam beberapa saat.',
    retry: true,
    code: 'SERVER_ERROR'
  },
  502: {
    title: 'Server Sibuk',
    message: 'Server AI sedang sibuk memproses banyak permintaan.',
    retry: true,
    code: 'BAD_GATEWAY'
  },
  503: {
    title: 'Layanan Tidak Tersedia',
    message: 'Layanan sedang dalam pemeliharaan.',
    retry: true,
    code: 'UNAVAILABLE'
  },
  504: {
    title: 'Waktu Habis',
    message: 'Server tidak merespon tepat waktu.',
    action: 'Coba dengan pesan yang lebih pendek.',
    retry: true,
    code: 'TIMEOUT'
  },
  
  // API specific
  QUOTA_EXCEEDED: {
    title: 'Kuota Habis',
    message: 'Kuota penggunaan AI telah habis.',
    action: 'Hubungi admin untuk menambah kuota.',
    retry: false,
    code: 'QUOTA_EXCEEDED'
  },
  MODEL_UNAVAILABLE: {
    title: 'Model Tidak Tersedia',
    message: 'Model AI sedang tidak tersedia.',
    action: 'Sistem akan menggunakan model lain.',
    retry: true,
    code: 'MODEL_UNAVAILABLE'
  },
  CONTENT_BLOCKED: {
    title: 'Konten Ditolak',
    message: 'Permintaan tidak dapat diproses.',
    action: 'Coba ubah pertanyaan Anda.',
    retry: false,
    code: 'CONTENT_BLOCKED'
  },
  
  // Network
  NETWORK: {
    title: 'Tidak Ada Koneksi',
    message: 'Tidak dapat terhubung ke server.',
    action: 'Periksa koneksi internet Anda.',
    retry: true,
    code: 'NETWORK'
  },
  
  // Default
  DEFAULT: {
    title: 'Terjadi Kesalahan',
    message: 'Maaf, terjadi kesalahan yang tidak terduga.',
    retry: true,
    code: 'UNKNOWN'
  }
};

/**
 * Detect quota/credit errors from response body
 */
function isQuotaError(body: any): boolean {
  const msg = body?.error?.message?.toLowerCase() || '';
  const type = body?.error?.type?.toLowerCase() || '';
  
  return (
    msg.includes('quota') ||
    msg.includes('credit') ||
    msg.includes('balance') ||
    msg.includes('insufficient') ||
    type.includes('quota') ||
    type === 'insufficient_quota'
  );
}

/**
 * Detect model unavailable errors
 */
function isModelError(body: any): boolean {
  const msg = body?.error?.message?.toLowerCase() || '';
  return (
    msg.includes('model') && 
    (msg.includes('unavailable') || msg.includes('not found') || msg.includes('not available'))
  );
}

/**
 * Detect content filter errors
 */
function isContentError(body: any): boolean {
  const msg = body?.error?.message?.toLowerCase() || '';
  const type = body?.error?.type?.toLowerCase() || '';
  
  return (
    msg.includes('content') ||
    msg.includes('filter') ||
    msg.includes('moderation') ||
    type.includes('content') ||
    type.includes('filter')
  );
}

/**
 * Parse API Response to UserFriendlyError
 */
export async function handleApiError(response: Response): Promise<UserFriendlyError> {
  let body: any = {};
  
  try {
    body = await response.json();
  } catch {
    // Non-JSON response
  }

  // Check specific error types
  if (isQuotaError(body)) {
    return ERROR_MAP.QUOTA_EXCEEDED;
  }
  
  if (isModelError(body)) {
    return ERROR_MAP.MODEL_UNAVAILABLE;
  }
  
  if (isContentError(body)) {
    return ERROR_MAP.CONTENT_BLOCKED;
  }

  // Fall back to HTTP status
  return ERROR_MAP[response.status] || ERROR_MAP.DEFAULT;
}

/**
 * Parse any thrown error
 */
export function parseError(error: unknown): UserFriendlyError {
  // Network error
  if (error instanceof TypeError) {
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return ERROR_MAP.NETWORK;
    }
  }

  // Abort/timeout
  if (error instanceof DOMException && error.name === 'AbortError') {
    return ERROR_MAP[504];
  }

  // Already processed
  if (isUserFriendlyError(error)) {
    return error;
  }

  return ERROR_MAP.DEFAULT;
}

function isUserFriendlyError(error: unknown): error is UserFriendlyError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'title' in error &&
    'message' in error &&
    'code' in error
  );
}

/**
 * Create error throw helper
 */
export function throwApiError(response: Response): never {
  throw handleApiError(response);
}
```

---

## React Hook untuk Error Handling

```typescript
// hooks/useApiCall.ts

import { useState, useCallback } from 'react';
import { UserFriendlyError, parseError, handleApiError } from '@/utils/error-handler';

interface UseApiCallReturn<T> {
  data: T | null;
  loading: boolean;
  error: UserFriendlyError | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApiCall<T>(
  apiFunction: (...args: any[]) => Promise<Response>
): UseApiCallReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UserFriendlyError | null>(null);

  const execute = useCallback(async (...args: any[]) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction(...args);
      
      if (!response.ok) {
        const friendlyError = await handleApiError(response);
        setError(friendlyError);
        return null;
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      setError(parseError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}
```

### Penggunaan Hook

```tsx
function ChatPage() {
  const { data, loading, error, execute } = useApiCall<ChatResponse>(sendMessage);

  const handleSend = async (message: string) => {
    const result = await execute(message);
    if (result) {
      // Success
      addMessage(result);
    }
    // Error sudah di-handle oleh hook
  };

  return (
    <div>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} onRetry={() => handleSend(lastMessage)} />}
      {/* Chat UI */}
    </div>
  );
}
```

---

## Komponen UI

### ErrorBoundary.tsx

```tsx
import React, { Component, ReactNode } from 'react';
import { UserFriendlyError } from '@/utils/error-handler';

interface Props {
  children: ReactNode;
  fallback?: (error: UserFriendlyError, reset: () => void) => ReactNode;
}

interface State {
  error: UserFriendlyError | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(): State {
    return {
      error: {
        title: 'Terjadi Kesalahan',
        message: 'Maaf, halaman ini mengalami masalah.',
        action: 'Coba refresh halaman.',
        retry: true,
        code: 'REACT_ERROR'
      }
    };
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return <DefaultErrorFallback error={this.state.error} onRetry={this.reset} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, onRetry }: { error: UserFriendlyError; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 text-center">
        <div className="text-6xl mb-4">😔</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{error.title}</h1>
        <p className="text-gray-600 mb-4">{error.message}</p>
        {error.action && <p className="text-gray-500 text-sm mb-4">{error.action}</p>}
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
```

---

## Contoh Integrasi Lengkap

```tsx
// pages/chat.tsx

import { useState } from 'react';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { sendChatMessage } from '@/services/openrouter';
import { parseError, UserFriendlyError } from '@/utils/error-handler';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UserFriendlyError | null>(null);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage([...messages, userMessage]);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      const friendlyError = parseError(err);
      setError(friendlyError);
      
      // Log untuk debugging (tidak terlihat user)
      console.error('[Chat]', friendlyError.code, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        
        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <LoadingSpinner size="sm" />
            <span>AI sedang berpikir...</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 border-t">
          <ErrorMessage 
            error={error} 
            onRetry={error.retry ? handleSend : undefined}
            onDismiss={() => setError(null)}
          />
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ketik pesan..."
            disabled={loading}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Ringkasan

| Jangan | Lakukan |
|--------|---------|
| Tampilkan error teknis | Tampilkan pesan user-friendly |
| "insufficient_quota..." | "Kuota habis. Hubungi admin." |
| Stack trace | Emoji + pesan sederhana |
| Kode HTTP mentah | Pesan yang bisa dipahami |
| Error tanpa action | Berikan saran tindakan |
