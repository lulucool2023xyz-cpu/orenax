# Chat Streaming - API V1 (Vertex AI)

Complete chat implementation with SSE streaming, thinking mode, and grounding.

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chat` | Main chat (streaming/non-streaming) |
| POST | `/api/v1/chat/count-tokens` | Count tokens |
| GET | `/api/v1/chat/conversations` | List conversations |
| DELETE | `/api/v1/chat/conversations/:id` | Delete conversation |

---

## Request Format

```typescript
interface ChatRequestV1 {
  prompt?: string;                    // Simple text prompt
  messages?: ChatMessageV1[];         // Or conversation history
  model?: string;                     // Default: 'gemini-2.5-flash'
  stream?: boolean;                   // Enable SSE streaming
  thinkingConfig?: {
    thinkingBudget?: number;          // 0-24576 for Gemini 2.5
    thinkingLevel?: 'low' | 'high';   // For Gemini 3
    includeThoughts?: boolean;
  };
  groundingConfig?: {
    googleSearch?: boolean;
    urlContext?: { enabled: boolean; urls?: string[] };
  };
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
  };
}
```

---

## Response Format

### Non-Streaming
```json
{
  "message": {
    "role": "model",
    "content": "Response text..."
  },
  "usageMetadata": {
    "promptTokenCount": 10,
    "candidatesTokenCount": 150,
    "totalTokenCount": 160
  },
  "thoughts": ["Step 1: ...", "Step 2: ..."],
  "groundingMetadata": {
    "webSearchQueries": ["query"],
    "groundingChunks": [{ "web": { "uri": "...", "title": "..." }}]
  }
}
```

### Streaming (SSE)
```
data: {"content":"Hello","done":false}
data: {"content":" world","done":false}
data: {"content":"","done":true,"usageMetadata":{...}}
```

---

## Vite + TSX Implementation

### 1. Chat API Service (`src/api/chatApiV1.ts`)

```typescript
import { apiClientV1 } from './clientV1';
import type {
  ChatRequestV1,
  ChatResponseV1,
  ChatStreamChunkV1,
} from '../types/apiV1.types';

const API_V1_URL = import.meta.env.VITE_API_URL + '/api/v1';

export const chatApiV1 = {
  // Non-streaming chat
  async chat(request: ChatRequestV1): Promise<ChatResponseV1> {
    return apiClientV1.post('/chat', { ...request, stream: false });
  },

  // Streaming chat with callback
  async chatStream(
    request: ChatRequestV1,
    onChunk: (chunk: ChatStreamChunkV1) => void,
    onComplete: (response: ChatResponseV1) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch(`${API_V1_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ ...request, stream: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let finalMetadata: ChatResponseV1 | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const chunk: ChatStreamChunkV1 = JSON.parse(line.slice(6));
              
              if (chunk.content) {
                fullContent += chunk.content;
                onChunk(chunk);
              }
              
              if (chunk.done && chunk.usageMetadata) {
                finalMetadata = {
                  message: { role: 'model', content: fullContent },
                  usageMetadata: chunk.usageMetadata,
                };
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }

      if (finalMetadata) {
        onComplete(finalMetadata);
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Stream failed'));
    }
  },

  // Count tokens
  async countTokens(prompt: string, model?: string): Promise<{ tokenCount: number }> {
    return apiClientV1.post('/chat/count-tokens', { prompt, model });
  },

  // List conversations
  async getConversations(): Promise<{ conversations: Array<{ id: string; title: string }> }> {
    return apiClientV1.get('/chat/conversations');
  },

  // Delete conversation
  async deleteConversation(id: string): Promise<void> {
    return apiClientV1.delete(`/chat/conversations/${id}`);
  },
};
```

### 2. useChat Hook (`src/hooks/useChatV1.ts`)

```typescript
import { useState, useCallback, useRef } from 'react';
import { chatApiV1 } from '../api/chatApiV1';
import type {
  ChatMessageV1,
  ChatRequestV1,
  ChatResponseV1,
  ThinkingConfigV1,
  GroundingConfigV1,
} from '../types/apiV1.types';

interface UseChatV1Options {
  model?: string;
  thinkingConfig?: ThinkingConfigV1;
  groundingConfig?: GroundingConfigV1;
}

export function useChatV1(options: UseChatV1Options = {}) {
  const [messages, setMessages] = useState<ChatMessageV1[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const abortRef = useRef(false);

  const sendMessage = useCallback(async (
    prompt: string, 
    useStream = true
  ) => {
    if (!prompt.trim()) return;

    abortRef.current = false;
    setError(null);
    setIsLoading(true);
    setThoughts([]);

    // Add user message
    const userMessage: ChatMessageV1 = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);

    const request: ChatRequestV1 = {
      prompt,
      messages: [...messages, userMessage],
      model: options.model || 'gemini-2.5-flash',
      stream: useStream,
      thinkingConfig: options.thinkingConfig,
      groundingConfig: options.groundingConfig,
    };

    if (useStream) {
      setIsStreaming(true);
      setStreamingContent('');

      await chatApiV1.chatStream(
        request,
        (chunk) => {
          if (abortRef.current) return;
          if (chunk.content) {
            setStreamingContent(prev => prev + chunk.content);
          }
        },
        (response) => {
          if (abortRef.current) return;
          setMessages(prev => [...prev, response.message]);
          setStreamingContent('');
          setIsStreaming(false);
          setIsLoading(false);
        },
        (err) => {
          setError(err.message);
          setIsStreaming(false);
          setIsLoading(false);
        }
      );
    } else {
      try {
        const response = await chatApiV1.chat(request);
        setMessages(prev => [...prev, response.message]);
        if (response.thoughts) {
          setThoughts(response.thoughts);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Chat failed');
      } finally {
        setIsLoading(false);
      }
    }
  }, [messages, options]);

  const stopStreaming = useCallback(() => {
    abortRef.current = true;
    setIsStreaming(false);
    setIsLoading(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingContent('');
    setThoughts([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    streamingContent,
    thoughts,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
  };
}
```

### 3. ChatBox Component (`src/components/ChatBoxV1.tsx`)

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { useChatV1 } from '../hooks/useChatV1';
import './ChatBoxV1.css';

interface ChatBoxV1Props {
  model?: string;
  enableThinking?: boolean;
  thinkingBudget?: number;
  enableGrounding?: boolean;
}

export const ChatBoxV1: React.FC<ChatBoxV1Props> = ({
  model = 'gemini-2.5-flash',
  enableThinking = false,
  thinkingBudget = 8192,
  enableGrounding = false,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    isStreaming,
    streamingContent,
    thoughts,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
  } = useChatV1({
    model,
    thinkingConfig: enableThinking ? {
      thinkingBudget,
      includeThoughts: true,
    } : undefined,
    groundingConfig: enableGrounding ? {
      googleSearch: true,
    } : undefined,
  });

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="chat-box-v1">
      <div className="chat-header">
        <h3>Chat V1 - {model}</h3>
        <button onClick={clearMessages} className="clear-btn">Clear</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className="message model streaming">
            <div className="message-content">{streamingContent}</div>
          </div>
        )}

        {thoughts.length > 0 && (
          <div className="thoughts-panel">
            <h4>💭 Thinking Process</h4>
            {thoughts.map((thought, idx) => (
              <p key={idx}>{thought}</p>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        {isStreaming ? (
          <button type="button" onClick={stopStreaming} className="stop-btn">
            Stop
          </button>
        ) : (
          <button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? '...' : 'Send'}
          </button>
        )}
      </form>
    </div>
  );
};
```

### 4. CSS Styles (`src/components/ChatBoxV1.css`)

```css
.chat-box-v1 {
  display: flex;
  flex-direction: column;
  height: 600px;
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  background: #1a1a1a;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.chat-header h3 { margin: 0; }

.clear-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.error-banner {
  background: #ff4757;
  color: white;
  padding: 12px;
  text-align: center;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.message {
  margin-bottom: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 80%;
}

.message.user {
  background: #667eea;
  color: white;
  margin-left: auto;
}

.message.model {
  background: #2d2d2d;
  color: #e0e0e0;
}

.message.streaming {
  border: 1px solid #667eea;
}

.thoughts-panel {
  background: #2a2a2a;
  border-left: 3px solid #ffa502;
  padding: 12px;
  margin: 12px 0;
  border-radius: 0 8px 8px 0;
}

.thoughts-panel h4 {
  margin: 0 0 8px 0;
  color: #ffa502;
}

.thoughts-panel p {
  margin: 4px 0;
  color: #b0b0b0;
  font-size: 14px;
}

.input-form {
  display: flex;
  gap: 8px;
  padding: 16px;
  background: #2a2a2a;
}

.input-form input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  background: #1a1a1a;
  color: white;
  font-size: 14px;
}

.input-form button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: #667eea;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.input-form button:disabled {
  background: #4a4a4a;
  cursor: not-allowed;
}

.stop-btn {
  background: #ff4757 !important;
}
```

---

## Usage Example

```tsx
import { ChatBoxV1 } from './components/ChatBoxV1';

function App() {
  return (
    <ChatBoxV1
      model="gemini-2.5-flash"
      enableThinking={true}
      thinkingBudget={8192}
      enableGrounding={true}
    />
  );
}
```
