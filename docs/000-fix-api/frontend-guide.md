# Frontend Integration Guide

## Overview

This guide provides complete TypeScript/JavaScript examples for integrating the OrenaX API V2 into your frontend application.

---

## TypeScript Interfaces

```typescript
// === Request Types ===

interface ChatRequest {
  prompt?: string;
  messages?: Array<{ role: 'user' | 'model'; content: string }>;
  contents?: ContentPart[];
  model?: string;
  stream?: boolean;
  systemInstruction?: string;
  generationConfig?: GenerationConfig;
  thinkingConfig?: ThinkingConfig;
  tools?: Tool[];
  toolConfig?: ToolConfig;
  safetySettings?: SafetySetting[];
}

interface GenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  responseMimeType?: 'text/plain' | 'application/json';
  responseSchema?: object;
}

interface ThinkingConfig {
  thinkingLevel?: 'low' | 'high';
  thinkingBudget?: number;
  includeThoughts?: boolean;
}

interface Tool {
  googleSearch?: {};
  codeExecution?: {};
  functionDeclarations?: FunctionDeclaration[];
}

// === Response Types ===

interface StreamChunk {
  text?: string;
  thought?: string;
  functionCall?: { name: string; args: Record<string, unknown> };
  codeExecutionResult?: { code: string; language: string; output: string };
  groundingMetadata?: GroundingMetadata;
  done: boolean;
  finishReason?: string;
  usageMetadata?: UsageMetadata;
}

interface GroundingMetadata {
  groundingChunks?: Array<{ web?: { uri: string; title: string } }>;
  webSearchQueries?: string[];
}

interface UsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  thoughtsTokenCount?: number;
  totalTokenCount: number;
}

interface ImageResult {
  images: Array<{ url?: string; base64Data?: string; mimeType: string }>;
  prompt: string;
  model: string;
  generatedAt: string;
}

interface VideoResult {
  success: boolean;
  url: string;
  gcsUri: string;
  filename: string;
  prompt: string;
  model: string;
  duration: number;
  resolution: string;
  aspectRatio: string;
  hasAudio: boolean;
  generatedAt: string;
  operationId: string;
}
```

---

## API Client Class

```typescript
class OrenaXClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private headers() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  // === Chat Streaming ===
  async *streamChat(request: ChatRequest): AsyncGenerator<StreamChunk> {
    const response = await fetch(`${this.baseUrl}/api/v2/chat/stream`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            yield JSON.parse(data) as StreamChunk;
          } catch {}
        }
      }
    }
  }

  // === Non-Streaming Chat ===
  async chat(request: ChatRequest): Promise<ChatResponse> {
    request.stream = false;
    const response = await fetch(`${this.baseUrl}/api/v2/chat`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(request),
    });
    return response.json();
  }

  // === Image Generation ===
  async generateImage(request: ImageGenerationRequest): Promise<ImageResult> {
    const response = await fetch(`${this.baseUrl}/api/v2/image/generate`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(request),
    });
    return response.json();
  }

  // === Video Generation ===
  async generateVideo(request: VideoGenerationRequest): Promise<VideoResult> {
    const response = await fetch(`${this.baseUrl}/api/v2/video/generate`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(request),
    });
    return response.json();
  }
}
```

---

## React Hook Example

```typescript
import { useState, useCallback } from 'react';

interface UseStreamChatResult {
  response: string;
  thoughts: string[];
  isLoading: boolean;
  error: string | null;
  groundingMetadata: GroundingMetadata | null;
  sendMessage: (prompt: string, options?: ChatOptions) => Promise<void>;
}

export function useStreamChat(client: OrenaXClient): UseStreamChatResult {
  const [response, setResponse] = useState('');
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groundingMetadata, setGroundingMetadata] = useState<GroundingMetadata | null>(null);

  const sendMessage = useCallback(async (prompt: string, options?: ChatOptions) => {
    setIsLoading(true);
    setError(null);
    setResponse('');
    setThoughts([]);
    setGroundingMetadata(null);

    try {
      for await (const chunk of client.streamChat({
        prompt,
        model: options?.model || 'gemini-2.0-flash',
        thinkingConfig: options?.enableThinking ? {
          thinkingBudget: 8192,
          includeThoughts: true,
        } : undefined,
        tools: options?.enableSearch ? [{ googleSearch: {} }] : undefined,
      })) {
        if (chunk.text) {
          setResponse(prev => prev + chunk.text);
        }
        if (chunk.thought) {
          setThoughts(prev => [...prev, chunk.thought!]);
        }
        if (chunk.groundingMetadata) {
          setGroundingMetadata(chunk.groundingMetadata);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  return { response, thoughts, isLoading, error, groundingMetadata, sendMessage };
}
```

---

## React Component Examples

### Chat Interface
```tsx
function ChatInterface() {
  const client = useMemo(() => new OrenaXClient(API_URL, token), [token]);
  const { response, thoughts, isLoading, groundingMetadata, sendMessage } = useStreamChat(client);
  const [input, setInput] = useState('');
  
  const handleSubmit = () => {
    sendMessage(input, { enableSearch: true });
    setInput('');
  };

  return (
    <div className="chat-container">
      {/* Thinking Panel */}
      {thoughts.length > 0 && (
        <div className="thinking-panel">
          <h4>💭 Thinking</h4>
          {thoughts.map((t, i) => <p key={i}>{t}</p>)}
        </div>
      )}
      
      {/* Response */}
      <div className="response">
        <ReactMarkdown>{response}</ReactMarkdown>
      </div>
      
      {/* Citations */}
      {groundingMetadata?.groundingChunks && (
        <div className="citations">
          <h4>Sources</h4>
          {groundingMetadata.groundingChunks.map((c, i) => (
            <a key={i} href={c.web?.uri} target="_blank">
              [{i + 1}] {c.web?.title}
            </a>
          ))}
        </div>
      )}
      
      {/* Input */}
      <div className="input-area">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSubmit()}
          disabled={isLoading}
        />
        <button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
```

### Image Generator
```tsx
function ImageGenerator() {
  const client = useMemo(() => new OrenaXClient(API_URL, token), [token]);
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<ImageResult['images']>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generate = async () => {
    setIsLoading(true);
    try {
      const result = await client.generateImage({
        prompt,
        aspectRatio: '16:9',
      });
      setImages(result.images);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input value={prompt} onChange={e => setPrompt(e.target.value)} />
      <button onClick={generate} disabled={isLoading}>Generate</button>
      
      <div className="image-grid">
        {images.map((img, i) => (
          <img 
            key={i}
            src={img.url || `data:${img.mimeType};base64,${img.base64Data}`}
            alt={`Generated ${i}`}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## Error Handling

```typescript
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function handleAPIError(response: Response) {
  if (!response.ok) {
    const text = await response.text();
    let message = text;
    
    try {
      const json = JSON.parse(text);
      message = json.message || json.error || text;
    } catch {}
    
    throw new APIError(response.status, message);
  }
}

// Usage
try {
  const result = await client.chat({ prompt: 'Hello' });
} catch (e) {
  if (e instanceof APIError) {
    if (e.status === 401) showLogin();
    else if (e.status === 429) showRateLimitError();
    else showError(e.message);
  }
}
```

---

## Best Practices

1. **Use streaming for chat**: Better UX with real-time updates
2. **Handle errors gracefully**: Show user-friendly messages
3. **Display thinking process**: Builds trust and transparency
4. **Show citations**: Important for grounded responses
5. **Loading states**: Clear feedback during generation
6. **Cancel requests**: Allow users to stop long operations
7. **Retry logic**: Handle transient failures
8. **Token management**: Refresh tokens before expiry
