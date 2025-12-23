# Live API Guide (API V2)

Real-time bidirectional audio/video/text communication with Gemini via WebSocket.

## Overview

Live API enables low-latency, real-time voice and video interactions with Gemini. It processes continuous streams of audio, video, or text to deliver immediate, human-like spoken responses.

**Key Features:**
- 🎤 Real-time audio streaming
- 📹 Video input support
- 💬 Text messaging
- 🛠️ Tool/Function calling
- 🗣️ Voice Activity Detection (VAD)
- 🔊 Native audio output

## Connection

```
WebSocket: wss://{your-backend-url}/live
Protocol: Socket.IO
```

> **Note**: Replace `{your-backend-url}` with your actual backend URL (e.g., `your-backend.up.railway.app`)

**Require:** `socket.io-client` library

---

## Client Messages (Events to Send)

### 1. `setup` - Initialize Session

Configure the Gemini Live API session.

```typescript
interface LiveApiSetup {
  model: string;                          // e.g., 'gemini-2.5-flash-native-audio-preview'
  generationConfig?: {
    responseModalities?: string[];        // ['AUDIO'] or ['TEXT']
    speechConfig?: {
      voiceConfig?: {
        prebuiltVoiceConfig?: { 
          voiceName: string;              // 'Kore', 'Aoede', etc.
        };
      };
    };
  };
  systemInstruction?: {
    parts: Array<{ text: string }>;       // System prompt
  };
}

// Example
socket.emit('setup', {
  model: 'gemini-2.5-flash-native-audio-preview',
  generationConfig: {
    responseModalities: ['AUDIO'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: 'Kore' }
      }
    }
  },
  systemInstruction: {
    parts: [{ text: 'You are a helpful assistant.' }]
  }
});
```

---

### 2. `realtimeInput` - Send Audio/Video/Text

Stream real-time data to the model.

```typescript
interface RealtimeInput {
  audio?: {
    data: string;         // Base64 encoded PCM audio
    mimeType: string;     // 'audio/pcm;rate=16000'
  };
  video?: {
    data: string;         // Base64 encoded video frame
    mimeType: string;     // 'image/jpeg'
  };
  text?: string;          // Real-time text input
}

// Audio example
socket.emit('realtimeInput', {
  audio: {
    data: base64AudioData,
    mimeType: 'audio/pcm;rate=16000'
  }
});

// Text example
socket.emit('realtimeInput', {
  text: 'Hello, how are you?'
});
```

**Audio Format Requirements:**
- Input: 16-bit PCM, 16kHz, mono
- Output: 16-bit PCM, 24kHz, mono

---

### 3. `clientContent` - Send Text Message

Send a complete text message (non-streaming).

```typescript
interface ClientContent {
  parts: Array<{ text: string }>;
}

socket.emit('clientContent', {
  parts: [{ text: 'Tell me about AI' }]
});
```

---

### 4. `toolResponse` - Respond to Function Calls

Send function execution results back to the model.

```typescript
interface ToolResponse {
  functionResponses: Array<{
    name: string;         // Function name
    response: any;        // Function result
    id: string;           // Function call ID
  }>;
}

socket.emit('toolResponse', {
  functionResponses: [{
    name: 'get_weather',
    response: { temperature: 25, condition: 'sunny' },
    id: 'call_abc123'
  }]
});
```

---

### 5. `getStatus` - Check Session Status

Query the current session state.

```typescript
socket.emit('getStatus');
```

---

## Server Events (Events to Listen)

### `connected`
Connection established.

```typescript
socket.on('connected', (data: { message: string; sessionId: string }) => {
  console.log('Connected:', data.sessionId);
});
```

### `setupComplete`
Session is ready for input.

```typescript
socket.on('setupComplete', () => {
  console.log('Session ready!');
  // Now you can send realtimeInput or clientContent
});
```

### `serverContent`
Model response (audio/text).

```typescript
interface ServerContent {
  modelTurn?: {
    parts: Array<{
      text?: string;
      inlineData?: {
        data: string;         // Base64 audio
        mimeType: string;     // 'audio/pcm;rate=24000'
      };
    }>;
  };
  turnComplete?: boolean;     // Response finished
  interrupted?: boolean;      // User interrupted
}

socket.on('serverContent', (content: ServerContent) => {
  if (content.modelTurn?.parts) {
    for (const part of content.modelTurn.parts) {
      if (part.text) {
        console.log('Text:', part.text);
      }
      if (part.inlineData) {
        // Play audio: part.inlineData.data (base64 PCM 24kHz)
        playAudio(part.inlineData.data);
      }
    }
  }
  if (content.turnComplete) {
    console.log('Response complete');
  }
  if (content.interrupted) {
    console.log('Response interrupted by user');
  }
});
```

### `toolCall`
Model requests function execution.

```typescript
interface ToolCall {
  functionCalls: Array<{
    name: string;
    args: Record<string, any>;
    id: string;
  }>;
}

socket.on('toolCall', (toolCall: ToolCall) => {
  for (const fc of toolCall.functionCalls) {
    console.log('Call function:', fc.name, fc.args);
    // Execute function and send toolResponse
  }
});
```

### `status`
Session status response.

```typescript
interface SessionStatus {
  connected: boolean;
  setupComplete: boolean;
  model: string;
}

socket.on('status', (status: SessionStatus) => {
  console.log('Status:', status);
});
```

### `sessionClosed`
Session has ended.

```typescript
socket.on('sessionClosed', (data: { message: string }) => {
  console.log('Session closed:', data.message);
});
```

### `error`
Error occurred.

```typescript
socket.on('error', (error: { message: string; details?: string }) => {
  console.error('Error:', error.message);
});
```

---

## Complete Vite + TSX Implementation

### 1. Install Dependencies

```bash
npm install socket.io-client
```

### 2. TypeScript Types (`src/types/live-api.types.ts`)

```typescript
// ============= LIVE API TYPES =============

export interface LiveApiSetup {
  model: string;
  generationConfig?: {
    responseModalities?: ('AUDIO' | 'TEXT')[];
    speechConfig?: {
      voiceConfig?: {
        prebuiltVoiceConfig?: { voiceName: string };
      };
    };
  };
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
}

export interface RealtimeInput {
  audio?: {
    data: string;
    mimeType: string;
  };
  video?: {
    data: string;
    mimeType: string;
  };
  text?: string;
}

export interface ToolResponse {
  functionResponses: Array<{
    name: string;
    response: any;
    id: string;
  }>;
}

export interface ServerContent {
  modelTurn?: {
    parts: Array<{
      text?: string;
      inlineData?: {
        data: string;
        mimeType: string;
      };
    }>;
  };
  turnComplete?: boolean;
  interrupted?: boolean;
  inputTranscription?: { text: string };
  outputTranscription?: { text: string };
}

export interface ToolCall {
  functionCalls: Array<{
    name: string;
    args: Record<string, any>;
    id: string;
  }>;
}

export interface SessionStatus {
  connected: boolean;
  setupComplete: boolean;
  model: string;
}

export interface LiveApiConfig {
  model?: string;
  voiceName?: string;
  systemPrompt?: string;
  responseModality?: 'AUDIO' | 'TEXT';
}
```

### 3. Live API Client (`src/api/live.ts`)

```typescript
import { io, Socket } from 'socket.io-client';
import type { 
  LiveApiSetup, 
  RealtimeInput, 
  ToolResponse, 
  ServerContent,
  ToolCall,
  SessionStatus,
  LiveApiConfig
} from '../types/live-api.types';

const LIVE_API_URL = import.meta.env.VITE_API_URL || '';

// Configure in .env:
// VITE_API_URL=https://your-backend.up.railway.app

export class LiveApiClient {
  private socket: Socket | null = null;
  private isSetupComplete = false;

  // Event callbacks
  onConnected?: (data: { message: string; sessionId: string }) => void;
  onSetupComplete?: () => void;
  onServerContent?: (content: ServerContent) => void;
  onToolCall?: (toolCall: ToolCall) => void;
  onStatus?: (status: SessionStatus) => void;
  onSessionClosed?: (data: { message: string }) => void;
  onError?: (error: { message: string; details?: string }) => void;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(`${LIVE_API_URL}/live`, {
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
      });

      this.socket.on('connected', (data) => {
        this.onConnected?.(data);
        resolve();
      });

      this.socket.on('setupComplete', () => {
        this.isSetupComplete = true;
        this.onSetupComplete?.();
      });

      this.socket.on('serverContent', (content: ServerContent) => {
        this.onServerContent?.(content);
      });

      this.socket.on('toolCall', (toolCall: ToolCall) => {
        this.onToolCall?.(toolCall);
      });

      this.socket.on('status', (status: SessionStatus) => {
        this.onStatus?.(status);
      });

      this.socket.on('sessionClosed', (data) => {
        this.isSetupComplete = false;
        this.onSessionClosed?.(data);
      });

      this.socket.on('error', (error) => {
        this.onError?.(error);
      });

      this.socket.on('connect_error', (error) => {
        reject(error);
      });
    });
  }

  setup(config: LiveApiConfig = {}): void {
    if (!this.socket) throw new Error('Not connected');

    const setup: LiveApiSetup = {
      model: config.model || 'gemini-2.5-flash-native-audio-preview',
      generationConfig: {
        responseModalities: [config.responseModality || 'AUDIO'],
        speechConfig: config.voiceName ? {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: config.voiceName }
          }
        } : undefined,
      },
      systemInstruction: config.systemPrompt ? {
        parts: [{ text: config.systemPrompt }]
      } : undefined,
    };

    this.socket.emit('setup', setup);
  }

  sendAudio(base64Data: string): void {
    if (!this.socket || !this.isSetupComplete) {
      throw new Error('Session not ready');
    }

    this.socket.emit('realtimeInput', {
      audio: {
        data: base64Data,
        mimeType: 'audio/pcm;rate=16000'
      }
    } as RealtimeInput);
  }

  sendText(text: string): void {
    if (!this.socket || !this.isSetupComplete) {
      throw new Error('Session not ready');
    }

    this.socket.emit('clientContent', {
      parts: [{ text }]
    });
  }

  sendRealtimeText(text: string): void {
    if (!this.socket || !this.isSetupComplete) {
      throw new Error('Session not ready');
    }

    this.socket.emit('realtimeInput', { text } as RealtimeInput);
  }

  sendToolResponse(response: ToolResponse): void {
    if (!this.socket) throw new Error('Not connected');
    this.socket.emit('toolResponse', response);
  }

  getStatus(): void {
    if (!this.socket) throw new Error('Not connected');
    this.socket.emit('getStatus');
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isSetupComplete = false;
    }
  }

  get ready(): boolean {
    return this.isSetupComplete;
  }
}

export const liveApiClient = new LiveApiClient();
export default liveApiClient;
```

### 4. useLiveApi Hook (`src/hooks/useLiveApi.ts`)

```typescript
import { useState, useCallback, useEffect, useRef } from 'react';
import { LiveApiClient } from '../api/live';
import type { ServerContent, ToolCall, LiveApiConfig } from '../types/live-api.types';

interface UseLiveApiOptions extends LiveApiConfig {
  onAudioReceived?: (base64Audio: string) => void;
  onTextReceived?: (text: string) => void;
  onToolCall?: (toolCall: ToolCall) => void;
  onError?: (error: string) => void;
}

interface UseLiveApiReturn {
  isConnected: boolean;
  isReady: boolean;
  isListening: boolean;
  transcript: string;
  response: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendText: (text: string) => void;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

export function useLiveApi(options: UseLiveApiOptions = {}): UseLiveApiReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<LiveApiClient | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize client
  useEffect(() => {
    clientRef.current = new LiveApiClient();
    return () => {
      clientRef.current?.disconnect();
    };
  }, []);

  const connect = useCallback(async () => {
    if (!clientRef.current) return;

    const client = clientRef.current;

    client.onConnected = () => {
      setIsConnected(true);
      // Setup after connection
      client.setup(options);
    };

    client.onSetupComplete = () => {
      setIsReady(true);
    };

    client.onServerContent = (content: ServerContent) => {
      if (content.modelTurn?.parts) {
        for (const part of content.modelTurn.parts) {
          if (part.text) {
            setResponse(prev => prev + part.text);
            options.onTextReceived?.(part.text);
          }
          if (part.inlineData) {
            options.onAudioReceived?.(part.inlineData.data);
          }
        }
      }
      if (content.inputTranscription) {
        setTranscript(content.inputTranscription.text);
      }
      if (content.interrupted) {
        // Handle interruption - stop audio playback
      }
    };

    client.onToolCall = (toolCall: ToolCall) => {
      options.onToolCall?.(toolCall);
    };

    client.onError = (err) => {
      setError(err.message);
      options.onError?.(err.message);
    };

    client.onSessionClosed = () => {
      setIsConnected(false);
      setIsReady(false);
    };

    try {
      await client.connect();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
    }
  }, [options]);

  const disconnect = useCallback(() => {
    stopListening();
    clientRef.current?.disconnect();
    setIsConnected(false);
    setIsReady(false);
    setResponse('');
    setTranscript('');
  }, []);

  const sendText = useCallback((text: string) => {
    if (!clientRef.current?.ready) return;
    setResponse(''); // Clear previous response
    clientRef.current.sendText(text);
  }, []);

  const startListening = useCallback(async () => {
    if (!clientRef.current?.ready) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });

      // Create AudioContext for processing
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert float32 to int16
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        // Convert to base64
        const base64 = btoa(String.fromCharCode(...new Uint8Array(int16Data.buffer)));
        clientRef.current?.sendAudio(base64);
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      setIsListening(true);
      setResponse(''); // Clear previous response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Microphone access failed';
      setError(message);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsListening(false);
  }, []);

  return {
    isConnected,
    isReady,
    isListening,
    transcript,
    response,
    connect,
    disconnect,
    sendText,
    startListening,
    stopListening,
    error,
  };
}

export default useLiveApi;
```

### 5. Audio Player Utility (`src/utils/audioPlayer.ts`)

```typescript
/**
 * Audio player for Live API PCM output
 */
export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private audioQueue: AudioBuffer[] = [];
  private isPlaying = false;
  private nextPlayTime = 0;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext({ sampleRate: 24000 });
    }
    return this.audioContext;
  }

  /**
   * Play base64 PCM audio (24kHz, 16-bit, mono)
   */
  async play(base64Audio: string): Promise<void> {
    const ctx = this.getContext();
    
    // Decode base64 to ArrayBuffer
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert Int16 to Float32
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768;
    }

    // Create AudioBuffer
    const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    // Queue and play
    this.audioQueue.push(audioBuffer);
    if (!this.isPlaying) {
      this.playQueue();
    }
  }

  private playQueue(): void {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const ctx = this.getContext();
    const buffer = this.audioQueue.shift()!;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const startTime = Math.max(ctx.currentTime, this.nextPlayTime);
    source.start(startTime);
    this.nextPlayTime = startTime + buffer.duration;

    source.onended = () => {
      this.playQueue();
    };
  }

  /**
   * Stop all audio playback
   */
  stop(): void {
    this.audioQueue = [];
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isPlaying = false;
    this.nextPlayTime = 0;
  }
}

export const audioPlayer = new AudioPlayer();
export default audioPlayer;
```

### 6. LiveChat Component (`src/components/Live/LiveChat.tsx`)

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { useLiveApi } from '../../hooks/useLiveApi';
import { audioPlayer } from '../../utils/audioPlayer';
import './LiveChat.css';

interface LiveChatProps {
  model?: string;
  voiceName?: string;
  systemPrompt?: string;
}

export const LiveChat: React.FC<LiveChatProps> = ({
  model = 'gemini-2.5-flash-native-audio-preview',
  voiceName = 'Kore',
  systemPrompt = 'You are a helpful assistant.',
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    isReady,
    isListening,
    transcript,
    response,
    connect,
    disconnect,
    sendText,
    startListening,
    stopListening,
    error,
  } = useLiveApi({
    model,
    voiceName,
    systemPrompt,
    responseModality: 'AUDIO',
    onAudioReceived: (base64Audio) => {
      audioPlayer.play(base64Audio);
    },
  });

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [response, transcript]);

  const handleConnect = async () => {
    if (isConnected) {
      audioPlayer.stop();
      disconnect();
    } else {
      await connect();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isReady) return;
    sendText(input);
    setInput('');
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="live-chat">
      {/* Header */}
      <div className="live-header">
        <h2>🎤 Live Chat</h2>
        <button
          className={`connect-btn ${isConnected ? 'connected' : ''}`}
          onClick={handleConnect}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </button>
      </div>

      {/* Status */}
      <div className="status-bar">
        <span className={`status-dot ${isReady ? 'ready' : ''}`} />
        <span>
          {!isConnected ? 'Disconnected' : !isReady ? 'Connecting...' : 'Ready'}
        </span>
        {isListening && <span className="listening-indicator">🔴 Listening</span>}
      </div>

      {/* Messages */}
      <div className="messages">
        {transcript && (
          <div className="message user">
            <div className="message-label">You (voice)</div>
            <div className="message-content">{transcript}</div>
          </div>
        )}

        {response && (
          <div className="message model">
            <div className="message-label">Gemini</div>
            <div className="message-content">{response}</div>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="input-area">
        <button
          className={`voice-btn ${isListening ? 'active' : ''}`}
          onClick={handleVoiceToggle}
          disabled={!isReady}
        >
          {isListening ? '⏹️ Stop' : '🎤 Voice'}
        </button>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={!isReady}
          />
          <button type="submit" disabled={!isReady || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default LiveChat;
```

### 7. LiveChat Styles (`src/components/Live/LiveChat.css`)

```css
.live-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: var(--bg-primary, #1a1a2e);
  border-radius: 16px;
  overflow: hidden;
}

.live-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-secondary, #16213e);
  border-bottom: 1px solid var(--border, #0f3460);
}

.live-header h2 {
  margin: 0;
  color: var(--text-primary, #e94560);
}

.connect-btn {
  padding: 0.5rem 1rem;
  background: var(--accent, #e94560);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.connect-btn:hover {
  transform: scale(1.05);
}

.connect-btn.connected {
  background: #28a745;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-tertiary, #0f3460);
  font-size: 0.875rem;
  color: var(--text-secondary, #a0a0a0);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6c757d;
}

.status-dot.ready {
  background: #28a745;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.listening-indicator {
  margin-left: auto;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
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
  background: linear-gradient(135deg, #e94560, #0f3460);
  color: white;
}

.message.model {
  align-self: flex-start;
  background: var(--bg-secondary, #16213e);
  color: var(--text-primary, #f0f0f0);
}

.message-label {
  font-size: 0.75rem;
  color: var(--text-secondary, #a0a0a0);
  margin-bottom: 0.25rem;
}

.input-area {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--bg-secondary, #16213e);
  border-top: 1px solid var(--border, #0f3460);
}

.voice-btn {
  padding: 0.75rem 1rem;
  background: var(--bg-tertiary, #0f3460);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.voice-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.voice-btn.active {
  background: #dc3545;
  animation: pulse 1s infinite;
}

.input-area form {
  display: flex;
  flex: 1;
  gap: 0.5rem;
}

.input-area input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: var(--bg-primary, #1a1a2e);
  border: 1px solid var(--border, #0f3460);
  border-radius: 8px;
  color: var(--text-primary, #f0f0f0);
  font-size: 1rem;
}

.input-area input:focus {
  outline: none;
  border-color: var(--accent, #e94560);
}

.input-area button[type="submit"] {
  padding: 0.75rem 1.5rem;
  background: var(--accent, #e94560);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.input-area button[type="submit"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  color: #dc3545;
  padding: 0.5rem;
  text-align: center;
}
```

---

## Models Reference

### Native Audio Output Models

| Model | Description |
|-------|-------------|
| `gemini-2.5-flash-native-audio-preview` | Real-time audio streaming |
| `gemini-2.5-flash-native-audio-preview-12-2025` | Latest preview |
| `gemini-live-2.5-flash-preview` | Live API optimized |

### Available Voices

| Voice | Description |
|-------|-------------|
| Aoede | Female, warm |
| Charon | Male, authoritative |
| Fenrir | Male, casual |
| Kore | Female, friendly |
| Puck | Male, playful |
| Zephyr | Female, calm |

---

## Audio Specifications

| Direction | Format | Sample Rate | Bit Depth | Channels |
|-----------|--------|-------------|-----------|----------|
| **Input** | PCM | 16,000 Hz | 16-bit | Mono |
| **Output** | PCM | 24,000 Hz | 16-bit | Mono |

---

## Session Limitations

| Limit | Value |
|-------|-------|
| Audio-only session | 15 minutes |
| Audio + video session | 2 minutes |
| Context window | 128k tokens (native audio) |

---

## Example Usage

### Basic Voice Chat
```tsx
<LiveChat />
```

### Custom Configuration
```tsx
<LiveChat
  model="gemini-2.5-flash-native-audio-preview"
  voiceName="Aoede"
  systemPrompt="You are a friendly language tutor."
/>
```

### Programmatic Usage
```typescript
import liveApiClient from './api/live';
import audioPlayer from './utils/audioPlayer';

// Connect
await liveApiClient.connect();

// Configure
liveApiClient.setup({
  model: 'gemini-2.5-flash-native-audio-preview',
  voiceName: 'Kore',
  systemPrompt: 'Be helpful and concise.',
});

// Wait for ready
liveApiClient.onSetupComplete = () => {
  console.log('Ready!');
};

// Handle audio responses
liveApiClient.onServerContent = (content) => {
  if (content.modelTurn?.parts) {
    for (const part of content.modelTurn.parts) {
      if (part.inlineData) {
        audioPlayer.play(part.inlineData.data);
      }
    }
  }
};

// Send text
liveApiClient.sendText('Hello!');

// Disconnect when done
liveApiClient.disconnect();
```
