# Text-to-Speech - API V1 (Google Cloud TTS)

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/audio/tts/single` | Single speaker TTS |
| POST | `/api/v1/audio/tts/multi` | Multi-speaker TTS |
| GET | `/api/v1/audio/tts/voices` | List available voices |

---

## Request/Response

### Single Speaker
```typescript
interface SingleTtsRequestV1 {
  text: string;
  voiceName?: string;      // Default: 'Kore'
  languageCode?: string;   // Default: 'en-US'
  speakingRate?: number;   // 0.25-4.0
  pitch?: number;          // -20 to 20
}
```

### Multi-Speaker
```typescript
interface MultiTtsRequestV1 {
  text: string;
  speakerConfigs: { speakerName: string; voiceName: string }[];
  languageCode?: string;
}
```

### Response
```json
{
  "success": true,
  "url": "https://storage.googleapis.com/...",
  "mimeType": "audio/mpeg",
  "voiceName": "Kore"
}
```

---

## Vite + TSX Implementation

### TTS API (`src/api/ttsApiV1.ts`)

```typescript
import { apiClientV1 } from './clientV1';

export const ttsApiV1 = {
  async synthesize(request: {
    text: string;
    voiceName?: string;
    languageCode?: string;
    speakingRate?: number;
    pitch?: number;
  }) {
    return apiClientV1.post('/audio/tts/single', request);
  },

  async multiSpeaker(request: {
    text: string;
    speakerConfigs: { speakerName: string; voiceName: string }[];
  }) {
    return apiClientV1.post('/audio/tts/multi', request);
  },

  async getVoices() {
    return apiClientV1.get('/audio/tts/voices');
  },
};
```

### useTts Hook

```typescript
import { useState, useCallback, useEffect } from 'react';
import { ttsApiV1 } from '../api/ttsApiV1';

export function useTtsV1() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<any[]>([]);

  useEffect(() => {
    ttsApiV1.getVoices().then(res => setVoices(res.voices || []));
  }, []);

  const synthesize = useCallback(async (text: string, opts = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ttsApiV1.synthesize({ text, ...opts });
      setAudioUrl(res.url);
      return res;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { audioUrl, isLoading, error, voices, synthesize, clear: () => setAudioUrl(null) };
}
```

### TtsGenerator Component

```tsx
import React, { useState } from 'react';
import { useTtsV1 } from '../hooks/useTtsV1';

const VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Aoede', 'Zephyr'];

export const TtsGeneratorV1: React.FC = () => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('Kore');
  const [rate, setRate] = useState(1.0);
  const { audioUrl, isLoading, error, synthesize, clear } = useTtsV1();

  return (
    <div className="tts-gen">
      <h2>🔊 TTS Generator V1</h2>
      {error && <div className="error">{error}</div>}
      
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Enter text to speak..."
        disabled={isLoading}
      />

      <div className="controls">
        <select value={voice} onChange={e => setVoice(e.target.value)}>
          {VOICES.map(v => <option key={v}>{v}</option>)}
        </select>
        <label>Rate: {rate}x</label>
        <input type="range" min="0.5" max="2" step="0.1" value={rate}
          onChange={e => setRate(Number(e.target.value))} />
      </div>

      <div className="actions">
        <button onClick={() => synthesize(text, { voiceName: voice, speakingRate: rate })}
          disabled={isLoading || !text}>
          {isLoading ? 'Generating...' : 'Speak'}
        </button>
        <button onClick={clear}>Clear</button>
      </div>

      {audioUrl && <audio src={audioUrl} controls autoPlay />}
    </div>
  );
};
```

## Voices

| Voice | Style |
|-------|-------|
| Kore | Warm female |
| Puck | Energetic male |
| Charon | Deep male |
| Fenrir | Authoritative |
| Aoede | Melodic female |
| Zephyr | Calm neutral |

## Notes

- **Format**: MP3 (audio/mpeg)
- **V1 vs V2**: V1 uses Cloud TTS (MP3), V2 uses Gemini TTS (WAV 24kHz)
