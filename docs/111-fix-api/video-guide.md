# Video Generation - API V1 (Vertex AI Veo)

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/video/text-to-video` | Generate video from text |
| POST | `/api/v1/video/image-to-video` | Generate video from image |
| GET | `/api/v1/video/operation/:id` | Check operation status |

---

## Request/Response

### Text-to-Video Request
```typescript
interface TextToVideoRequestV1 {
  prompt: string;
  model?: string;           // 'veo-3.1-generate-preview'
  aspectRatio?: '16:9' | '9:16';
  durationSeconds?: number; // 5-8
  resolution?: '720p' | '1080p';
  generateAudio?: boolean;
}
```

### Response
```json
{
  "operationId": "op_abc123",
  "status": "RUNNING"
}
```

### Completed
```json
{
  "success": true,
  "url": "https://storage.googleapis.com/...",
  "model": "veo-3.1-generate-preview",
  "duration": 8,
  "hasAudio": true
}
```

---

## Vite + TSX Implementation

### Video API (`src/api/videoApiV1.ts`)

```typescript
import { apiClientV1 } from './clientV1';

export const videoApiV1 = {
  async textToVideo(request: any) {
    return apiClientV1.post('/video/text-to-video', request);
  },

  async getStatus(operationId: string) {
    return apiClientV1.get(`/video/operation/${operationId}`);
  },

  async pollUntilComplete(operationId: string, onProgress?: (p: number) => void) {
    let attempts = 0;
    while (attempts < 60) {
      const status = await this.getStatus(operationId);
      onProgress?.(status.progress || 0);
      if (status.status === 'COMPLETED') return status.result;
      if (status.status === 'FAILED') throw new Error(status.error);
      await new Promise(r => setTimeout(r, 5000));
      attempts++;
    }
    throw new Error('Timeout');
  },
};
```

### useVideoGeneration Hook

```typescript
import { useState, useCallback } from 'react';
import { videoApiV1 } from '../api/videoApiV1';

export function useVideoGenerationV1() {
  const [video, setVideo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, opts = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const op = await videoApiV1.textToVideo({ prompt, ...opts });
      const result = await videoApiV1.pollUntilComplete(op.operationId, setProgress);
      setVideo(result);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { video, isLoading, progress, error, generate, reset: () => setVideo(null) };
}
```

### VideoGenerator Component

```tsx
import React, { useState } from 'react';
import { useVideoGenerationV1 } from '../hooks/useVideoGenerationV1';

export const VideoGeneratorV1: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const { video, isLoading, progress, error, generate, reset } = useVideoGenerationV1();

  return (
    <div className="video-gen">
      <h2>🎬 Video Generator V1</h2>
      {error && <div className="error">{error}</div>}
      
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Describe your video..."
        disabled={isLoading}
      />

      {isLoading && (
        <div className="progress">
          <div style={{ width: `${progress}%` }} />
          <span>{progress}%</span>
        </div>
      )}

      <div className="actions">
        <button onClick={() => generate(prompt)} disabled={isLoading || !prompt}>
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
        <button onClick={reset}>Reset</button>
      </div>

      {video && (
        <video src={video.url} controls autoPlay />
      )}
    </div>
  );
};
```

## Models

| Model | Audio | Duration |
|-------|-------|----------|
| `veo-3.1-generate-preview` | ✅ | 8s |
| `veo-3.0-generate-preview` | ✅ | 8s |
| `veo-2.0-generate-001` | ❌ | 8s |
