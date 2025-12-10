# Music Generation - API V1 (Lyria-002)

## Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/music/generate` | Generate instrumental music |

---

## Request/Response

### Request
```typescript
interface MusicRequestV1 {
  prompt: string;
  negativePrompt?: string;
  seed?: number;
  sampleCount?: number;  // 1-4, not with seed
}
```

### Response
```json
{
  "success": true,
  "tracks": [{
    "url": "https://storage.googleapis.com/...",
    "duration": 32.8,
    "sampleRate": 48000,
    "mimeType": "audio/wav"
  }],
  "model": "lyria-002"
}
```

---

## Vite + TSX Implementation

### Music API (`src/api/musicApiV1.ts`)

```typescript
import { apiClientV1 } from './clientV1';

export const musicApiV1 = {
  async generate(request: {
    prompt: string;
    negativePrompt?: string;
    seed?: number;
    sampleCount?: number;
  }) {
    return apiClientV1.post('/music/generate', request);
  },
};
```

### useMusicGeneration Hook

```typescript
import { useState, useCallback } from 'react';
import { musicApiV1 } from '../api/musicApiV1';

export function useMusicGenerationV1() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, opts = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await musicApiV1.generate({ prompt, ...opts });
      setTracks(res.tracks);
      return res;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { tracks, isLoading, error, generate, clear: () => setTracks([]) };
}
```

### MusicGenerator Component

```tsx
import React, { useState } from 'react';
import { useMusicGenerationV1 } from '../hooks/useMusicGenerationV1';

export const MusicGeneratorV1: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const { tracks, isLoading, error, generate, clear } = useMusicGenerationV1();

  return (
    <div className="music-gen">
      <h2>🎵 Music Generator V1</h2>
      {error && <div className="error">{error}</div>}
      
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Describe the music style..."
        disabled={isLoading}
      />

      <div className="actions">
        <button onClick={() => generate(prompt)} disabled={isLoading || !prompt}>
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
        <button onClick={clear}>Clear</button>
      </div>

      {tracks.map((track, i) => (
        <div key={i} className="track">
          <audio src={track.url} controls />
          <span>{track.duration}s</span>
          <a href={track.url} download>Download</a>
        </div>
      ))}
    </div>
  );
};
```

## Notes

- **Duration**: Fixed 32.8 seconds
- **Format**: WAV 48kHz stereo
- **Model**: `lyria-002` (instrumental only)
- **V1 vs V2**: V2 uses Lyria RealTime with configurable duration
