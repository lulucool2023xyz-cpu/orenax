# Music Generation Guide (API V2)

Complete music generation implementation for Vite + React + TypeScript using Lyria RealTime.

## Endpoint

```
POST /api/v2/music/generate
GET /api/v2/music/status
```

## Request Format

```typescript
interface WeightedPrompt {
  text: string;                       // Music description
  weight?: number;                    // Importance (0-1, default 1.0)
}

interface MusicRequest {
  prompts: WeightedPrompt[];          // Required: Music descriptions
  durationSeconds?: number;           // 5-120, default 30
  bpm?: number;                       // Tempo
  temperature?: number;               // Creativity (0-1)
  scale?: 'MAJOR' | 'MINOR' | 'CHROMATIC';
  density?: 'LOW' | 'MEDIUM' | 'HIGH';
  brightness?: 'LOW' | 'MEDIUM' | 'HIGH';
}
```

## Response Format

```typescript
interface MusicResponse {
  success: boolean;
  url: string;                        // Public audio URL
  gcsUri?: string;
  filename?: string;
  model: string;
  durationSeconds: number;
  sampleRate: number;
  mimeType: string;
}
```

---

## Complete Vite + TSX Implementation

### 1. Music API Service (`src/api/music.ts`)

```typescript
import apiClient from './client';

export interface WeightedPrompt {
  text: string;
  weight?: number;
}

export interface MusicRequest {
  prompts: WeightedPrompt[];
  durationSeconds?: number;
  bpm?: number;
  temperature?: number;
  scale?: 'MAJOR' | 'MINOR' | 'CHROMATIC';
  density?: 'LOW' | 'MEDIUM' | 'HIGH';
  brightness?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface MusicResponse {
  success: boolean;
  url: string;
  gcsUri?: string;
  filename?: string;
  model: string;
  durationSeconds: number;
  sampleRate: number;
  mimeType: string;
}

export const musicApi = {
  /**
   * Generate music from prompts
   */
  async generate(request: MusicRequest): Promise<MusicResponse> {
    return apiClient.post<MusicResponse>('/music/generate', request);
  },

  /**
   * Get service status
   */
  async getStatus(): Promise<{
    available: boolean;
    model: string;
    features: {
      maxDuration: string;
      sampleRate: string;
      format: string;
    };
  }> {
    return apiClient.get('/music/status');
  },
};

export default musicApi;
```

### 2. useMusicGeneration Hook (`src/hooks/useMusicGeneration.ts`)

```typescript
import { useState, useCallback } from 'react';
import musicApi, { MusicRequest, MusicResponse } from '../api/music';

interface UseMusicGenerationReturn {
  music: MusicResponse | null;
  isLoading: boolean;
  error: string | null;
  progress: string;
  generate: (request: MusicRequest) => Promise<void>;
  clearMusic: () => void;
}

export function useMusicGeneration(): UseMusicGenerationReturn {
  const [music, setMusic] = useState<MusicResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');

  const generate = useCallback(async (request: MusicRequest) => {
    setIsLoading(true);
    setError(null);
    setProgress('Generating music... This may take 30-60 seconds.');

    try {
      const response = await musicApi.generate(request);

      if (response.success) {
        setMusic(response);
        setProgress('Music generated successfully!');
      } else {
        throw new Error('Music generation failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
      setProgress('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMusic = useCallback(() => {
    setMusic(null);
    setError(null);
    setProgress('');
  }, []);

  return {
    music,
    isLoading,
    error,
    progress,
    generate,
    clearMusic,
  };
}

export default useMusicGeneration;
```

### 3. MusicGenerator Component (`src/components/Music/MusicGenerator.tsx`)

```tsx
import React, { useState } from 'react';
import { useMusicGeneration } from '../../hooks/useMusicGeneration';
import type { WeightedPrompt } from '../../api/music';
import './MusicGenerator.css';

const SCALES = ['MAJOR', 'MINOR', 'CHROMATIC'] as const;
const DENSITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
const BRIGHTNESSES = ['LOW', 'MEDIUM', 'HIGH'] as const;

export const MusicGenerator: React.FC = () => {
  // Primary prompt
  const [primaryPrompt, setPrimaryPrompt] = useState('');
  const [primaryWeight, setPrimaryWeight] = useState(1.0);
  
  // Secondary prompt (optional)
  const [secondaryPrompt, setSecondaryPrompt] = useState('');
  const [secondaryWeight, setSecondaryWeight] = useState(0.5);
  
  // Settings
  const [duration, setDuration] = useState(30);
  const [bpm, setBpm] = useState(120);
  const [temperature, setTemperature] = useState(0.7);
  const [scale, setScale] = useState<typeof SCALES[number]>('MAJOR');
  const [density, setDensity] = useState<typeof DENSITIES[number]>('MEDIUM');
  const [brightness, setBrightness] = useState<typeof BRIGHTNESSES[number]>('MEDIUM');

  const { music, isLoading, error, progress, generate, clearMusic } =
    useMusicGeneration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryPrompt.trim() || isLoading) return;

    const prompts: WeightedPrompt[] = [
      { text: primaryPrompt, weight: primaryWeight },
    ];

    if (secondaryPrompt.trim()) {
      prompts.push({ text: secondaryPrompt, weight: secondaryWeight });
    }

    await generate({
      prompts,
      durationSeconds: duration,
      bpm,
      temperature,
      scale,
      density,
      brightness,
    });
  };

  return (
    <div className="music-generator">
      <h2>Music Generator</h2>

      <form onSubmit={handleSubmit} className="generator-form">
        {/* Primary Prompt */}
        <div className="prompt-group">
          <div className="form-group flex-1">
            <label>Primary Music Description *</label>
            <textarea
              value={primaryPrompt}
              onChange={(e) => setPrimaryPrompt(e.target.value)}
              placeholder="e.g., Upbeat electronic dance music with heavy bass"
              rows={2}
              required
            />
          </div>
          <div className="form-group weight-input">
            <label>Weight</label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={primaryWeight}
              onChange={(e) => setPrimaryWeight(parseFloat(e.target.value) || 1)}
            />
          </div>
        </div>

        {/* Secondary Prompt */}
        <div className="prompt-group">
          <div className="form-group flex-1">
            <label>Secondary Description (optional)</label>
            <textarea
              value={secondaryPrompt}
              onChange={(e) => setSecondaryPrompt(e.target.value)}
              placeholder="e.g., Add soft piano melodies"
              rows={2}
            />
          </div>
          <div className="form-group weight-input">
            <label>Weight</label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={secondaryWeight}
              onChange={(e) => setSecondaryWeight(parseFloat(e.target.value) || 0.5)}
            />
          </div>
        </div>

        {/* Settings Grid */}
        <div className="settings-grid">
          <div className="form-group">
            <label>Duration (seconds)</label>
            <input
              type="number"
              min={5}
              max={120}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
            />
          </div>

          <div className="form-group">
            <label>BPM</label>
            <input
              type="number"
              min={60}
              max={200}
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
            />
          </div>

          <div className="form-group">
            <label>Creativity</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
            />
            <span>{temperature}</span>
          </div>

          <div className="form-group">
            <label>Scale</label>
            <select value={scale} onChange={(e) => setScale(e.target.value as typeof scale)}>
              {SCALES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Density</label>
            <select value={density} onChange={(e) => setDensity(e.target.value as typeof density)}>
              {DENSITIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Brightness</label>
            <select value={brightness} onChange={(e) => setBrightness(e.target.value as typeof brightness)}>
              {BRIGHTNESSES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={isLoading || !primaryPrompt.trim()}>
          {isLoading ? 'Generating...' : 'Generate Music'}
        </button>
      </form>

      {/* Progress */}
      {progress && <div className="progress">{progress}</div>}

      {/* Error */}
      {error && <div className="error">{error}</div>}

      {/* Generated Music */}
      {music && (
        <div className="music-result">
          <div className="music-header">
            <h3>Generated Music</h3>
            <button onClick={clearMusic} className="clear-btn">
              Clear
            </button>
          </div>
          <audio controls className="audio-player">
            <source src={music.url} type={music.mimeType} />
          </audio>
          <div className="music-info">
            <p><strong>Model:</strong> {music.model}</p>
            <p><strong>Duration:</strong> {music.durationSeconds}s</p>
            <p><strong>Sample Rate:</strong> {music.sampleRate}Hz</p>
          </div>
          <a href={music.url} download={music.filename} className="download-btn">
            Download Audio
          </a>
        </div>
      )}
    </div>
  );
};

export default MusicGenerator;
```

### 4. CSS (`src/components/Music/MusicGenerator.css`)

```css
.music-generator {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.prompt-group {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.prompt-group .flex-1 {
  flex: 1;
}

.prompt-group .weight-input {
  width: 80px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 1rem 0;
}

.form-group input[type="range"] {
  width: 100%;
}

.audio-player {
  width: 100%;
  margin: 1rem 0;
}

.music-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
}
```

---

## Model

| Model | Duration | Sample Rate | Format |
|-------|----------|-------------|--------|
| `lyria-realtime-exp` | 5-120s | 48kHz | WAV |

---

## Example Requests

### Simple Music
```typescript
await musicApi.generate({
  prompts: [{ text: 'Calm ambient piano music' }],
  durationSeconds: 30,
});
```

### Complex with Weighted Prompts
```typescript
await musicApi.generate({
  prompts: [
    { text: 'Epic orchestral soundtrack', weight: 1.0 },
    { text: 'Electronic synth elements', weight: 0.3 },
  ],
  durationSeconds: 60,
  bpm: 100,
  scale: 'MINOR',
  density: 'HIGH',
  brightness: 'MEDIUM',
});
```
