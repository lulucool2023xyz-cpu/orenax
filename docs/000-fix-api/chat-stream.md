# Chat Streaming Guide (API V2)

Complete SSE streaming implementation for Vite + React + TypeScript.

## Endpoint

```
POST /api/v2/chat/stream
POST /api/v2/chat (with stream: true)
```

## Request Format

```typescript
interface ChatRequest {
  prompt?: string;                    // Simple text prompt
  messages?: ChatMessage[];           // Multi-turn conversation
  model?: string;                     // Default: 'gemini-2.5-flash'
  stream?: boolean;                   // true for streaming
  thinkingConfig?: ThinkingConfig;    // Thinking mode
  generationConfig?: GenerationConfig;
  tools?: Tool[];                     // Google Search, code execution
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface ThinkingConfig {
  thinkingBudget?: number;            // 0-24576 for Gemini 2.5
  thinkingLevel?: 'low' | 'high';     // For Gemini 3
  includeThoughts?: boolean;          // Return thoughts in response
}

interface GenerationConfig {
  temperature?: number;               // 0-2, default 1.0
  topP?: number;                      // 0-1, default 0.95
  topK?: number;                      // 1-40, default 40
  maxOutputTokens?: number;           // Default 8192
}
```

## SSE Response Format

Each SSE event is `data: <JSON>\n\n`:

```typescript
interface ChatStreamChunk {
  text?: string;                      // Text content
  thought?: string;                   // Thinking content
  done: boolean;                      // Stream complete
  finishReason?: string;              // 'STOP', 'MAX_TOKENS', etc.
  usageMetadata?: UsageMetadata;      // Token usage (final chunk)
  groundingMetadata?: GroundingMetadata;  // Search results
  functionCall?: FunctionCall;        // Function to call
  codeExecutionResult?: CodeResult;   // Code execution output
}
```

Final event: `data: [DONE]\n\n`

---

## Complete Vite + TSX Implementation

### 1. Chat API Service (`src/api/chat.ts`)

```typescript
import apiClient from './client';
import type { ChatRequest, ChatResponse, ChatStreamChunk } from '../types/api.types';

export const chatApi = {
  /**
   * Non-streaming chat
   */
  async send(request: ChatRequest): Promise<ChatResponse> {
    return apiClient.post<ChatResponse>('/chat', {
      ...request,
      stream: false,
    });
  },

  /**
   * Streaming chat - returns async generator
   */
  async *stream(request: ChatRequest): AsyncGenerator<ChatStreamChunk> {
    const response = await apiClient.postStream('/chat/stream', {
      ...request,
      stream: true,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Stream request failed');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') return;
            if (data) {
              try {
                yield JSON.parse(data) as ChatStreamChunk;
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};

export default chatApi;
```

### 2. useChat Hook (`src/hooks/useChat.ts`)

```typescript
import { useState, useCallback, useRef } from 'react';
import chatApi from '../api/chat';
import type { ChatMessage, ChatRequest, ChatStreamChunk, ThinkingConfig } from '../types/api.types';

interface UseChatOptions {
  model?: string;
  thinkingConfig?: ThinkingConfig;
  onChunk?: (chunk: ChatStreamChunk) => void;
  onThought?: (thought: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  currentThought: string;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  sendMessageStream: (content: string) => Promise<void>;
  clearMessages: () => void;
  stopStreaming: () => void;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentThought, setCurrentThought] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);

    try {
      const request: ChatRequest = {
        messages: [...messages, userMessage],
        model: options.model || 'gemini-2.5-flash',
        thinkingConfig: options.thinkingConfig,
      };

      const response = await chatApi.send(request);
      
      setMessages(prev => [...prev, response.message]);
      options.onComplete?.(response.message.content);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      setError(message);
      options.onError?.(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [messages, options]);

  const sendMessageStream = useCallback(async (content: string) => {
    setIsLoading(true);
    setIsStreaming(true);
    setError(null);
    setCurrentThought('');
    abortRef.current = false;

    const userMessage: ChatMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);

    let fullText = '';

    try {
      const request: ChatRequest = {
        messages: [...messages, userMessage],
        model: options.model || 'gemini-2.5-flash',
        thinkingConfig: options.thinkingConfig,
        stream: true,
      };

      // Add placeholder for assistant message
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of chatApi.stream(request)) {
        if (abortRef.current) break;

        options.onChunk?.(chunk);

        if (chunk.thought) {
          setCurrentThought(prev => prev + chunk.thought);
          options.onThought?.(chunk.thought);
        }

        if (chunk.text) {
          fullText += chunk.text;
          // Update the last message (assistant)
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'model', content: fullText };
            return updated;
          });
        }

        if (chunk.done) {
          options.onComplete?.(fullText);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Streaming failed';
      setError(message);
      options.onError?.(err as Error);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [messages, options]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setCurrentThought('');
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current = true;
    setIsStreaming(false);
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    currentThought,
    error,
    sendMessage,
    sendMessageStream,
    clearMessages,
    stopStreaming,
  };
}

export default useChat;
```

### 3. Chat Component (`src/components/Chat/ChatBox.tsx`)

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';

interface ChatBoxProps {
  model?: string;
  enableThinking?: boolean;
  thinkingBudget?: number;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  model = 'gemini-2.5-flash',
  enableThinking = false,
  thinkingBudget = 1024,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    isStreaming,
    currentThought,
    error,
    sendMessageStream,
    stopStreaming,
  } = useChat({
    model,
    thinkingConfig: enableThinking
      ? { thinkingBudget, includeThoughts: true }
      : undefined,
    onComplete: (text) => {
      console.log('Complete:', text);
    },
  });

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentThought]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');
    await sendMessageStream(message);
  };

  return (
    <div className="chat-container">
      {/* Messages */}
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isStreaming && currentThought && (
          <div className="thinking">
            <span className="thinking-label">🧠 Thinking...</span>
            <div className="thinking-content">{currentThought}</div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !isStreaming && (
          <div className="loading">Loading...</div>
        )}

        {/* Error */}
        {error && <div className="error">{error}</div>}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        {isStreaming ? (
          <button type="button" onClick={stopStreaming}>
            Stop
          </button>
        ) : (
          <button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatBox;
```

### 4. CSS Styles (`src/components/Chat/ChatBox.css`)

```css
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
  background: #007bff;
  color: white;
}

.message.model {
  align-self: flex-start;
  background: #f0f0f0;
  color: #333;
}

.thinking {
  align-self: flex-start;
  background: #fff3cd;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  max-width: 80%;
  font-style: italic;
}

.thinking-label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.input-form {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #ddd;
}

.input-form input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.input-form button {
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.input-form button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: #dc3545;
  padding: 0.5rem;
}
```

---

## Example Usage

### Basic Chat
```tsx
<ChatBox />
```

### With Thinking Mode
```tsx
<ChatBox
  model="gemini-2.5-flash"
  enableThinking={true}
  thinkingBudget={2048}
/>
```

### With Google Search
```typescript
const request: ChatRequest = {
  prompt: "What's the latest news about AI?",
  model: 'gemini-2.5-flash',
  tools: [
    { googleSearch: { enabled: true } }
  ],
};
```

### With Code Execution
```typescript
const request: ChatRequest = {
  prompt: "Calculate the first 10 Fibonacci numbers",
  model: 'gemini-2.5-flash',
  tools: [
    { codeExecution: {} }
  ],
};
```
