# TTS (Text-to-Speech) Guide (API V2)

Complete TTS implementation for Vite + React + TypeScript using Gemini TTS.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/tts/single` | Single speaker synthesis |
| POST | `/api/v2/tts/multi` | Multi-speaker dialogue |
| GET | `/api/v2/tts/voices` | List available voices |
| GET | `/api/v2/tts/status` | Service status |

## Request Formats

### Single Speaker

```typescript
interface SingleTtsRequest {
  text: string;                       // Required: Text to synthesize
  voiceName?: string;                 // Default: 'Kore'
  model?: string;                     // Default: 'gemini-2.5-flash-preview-tts'
}
```

### Multi-Speaker Dialogue

```typescript
interface SpeakerConfig {
  speakerName: string;                // Speaker identifier in text
  voiceName: string;                  // Voice to use
}

interface MultiTtsRequest {
  text: string;                       // Text with speaker lines
  speakerConfigs: SpeakerConfig[];    // Voice assignments
  model?: string;
}
```

## Response Format

```typescript
interface TtsResponse {
  success: boolean;
  url: string;                        // Public audio URL
  gcsUri?: string;
  filename?: string;
  mimeType: string;                   // 'audio/wav'
  voiceName?: string;
  speakerCount?: number;
}
```

## Available Voices (30 voices)

```
Aoede, Charon, Fenrir, Kore, Puck, Zephyr, Harmony, Aurora, 
Ember, River, Sage, Creek, Meadow, Willow, Cloud, Fern,
Brook, Finch, Moon, Star, Ocean, Sandy, Dusty, Sparrow,
Ridge, Coral, Haven, Ivy, Aspen, Jasper
```

---

## Complete Vite + TSX Implementation

### 1. TTS API Service (`src/api/tts.ts`)

```typescript
import apiClient from './client';

export interface SingleTtsRequest {
  text: string;
  voiceName?: string;
  model?: string;
}

export interface SpeakerConfig {
  speakerName: string;
  voiceName: string;
}

export interface MultiTtsRequest {
  text: string;
  speakerConfigs: SpeakerConfig[];
  model?: string;
}

export interface TtsResponse {
  success: boolean;
  url: string;
  gcsUri?: string;
  filename?: string;
  mimeType: string;
  voiceName?: string;
  speakerCount?: number;
}

export interface VoiceInfo {
  name: string;
  description?: string;
}

export const ttsApi = {
  /**
   * Get available voices
   */
  async getVoices(): Promise<VoiceInfo[]> {
    const response = await apiClient.get<{ voices: VoiceInfo[] }>('/tts/voices');
    return response.voices;
  },

  /**
   * Single speaker TTS
   */
  async synthesizeSingle(request: SingleTtsRequest): Promise<TtsResponse> {
    return apiClient.post<TtsResponse>('/tts/single', request);
  },

  /**
   * Multi-speaker dialogue TTS
   */
  async synthesizeMulti(request: MultiTtsRequest): Promise<TtsResponse> {
    return apiClient.post<TtsResponse>('/tts/multi', request);
  },

  /**
   * Get service status
   */
  async getStatus(): Promise<{
    available: boolean;
    model: string;
    voiceCount: number;
  }> {
    return apiClient.get('/tts/status');
  },
};

export default ttsApi;
```

### 2. useTts Hook (`src/hooks/useTts.ts`)

```typescript
import { useState, useCallback, useEffect } from 'react';
import ttsApi, {
  SingleTtsRequest,
  MultiTtsRequest,
  TtsResponse,
  VoiceInfo,
} from '../api/tts';

interface UseTtsReturn {
  audio: TtsResponse | null;
  voices: VoiceInfo[];
  isLoading: boolean;
  error: string | null;
  synthesizeSingle: (request: SingleTtsRequest) => Promise<void>;
  synthesizeMulti: (request: MultiTtsRequest) => Promise<void>;
  loadVoices: () => Promise<void>;
  clearAudio: () => void;
}

export function useTts(): UseTtsReturn {
  const [audio, setAudio] = useState<TtsResponse | null>(null);
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVoices = useCallback(async () => {
    try {
      const voiceList = await ttsApi.getVoices();
      setVoices(voiceList);
    } catch (err) {
      console.error('Failed to load voices:', err);
    }
  }, []);

  // Load voices on mount
  useEffect(() => {
    loadVoices();
  }, [loadVoices]);

  const synthesizeSingle = useCallback(async (request: SingleTtsRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ttsApi.synthesizeSingle(request);

      if (response.success) {
        setAudio(response);
      } else {
        throw new Error('TTS synthesis failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Synthesis failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const synthesizeMulti = useCallback(async (request: MultiTtsRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ttsApi.synthesizeMulti(request);

      if (response.success) {
        setAudio(response);
      } else {
        throw new Error('Multi-speaker TTS failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Synthesis failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAudio = useCallback(() => {
    setAudio(null);
    setError(null);
  }, []);

  return {
    audio,
    voices,
    isLoading,
    error,
    synthesizeSingle,
    synthesizeMulti,
    loadVoices,
    clearAudio,
  };
}

export default useTts;
```

### 3. TtsGenerator Component (`src/components/TTS/TtsGenerator.tsx`)

```tsx
import React, { useState } from 'react';
import { useTts } from '../../hooks/useTts';
import type { SpeakerConfig } from '../../api/tts';
import './TtsGenerator.css';

type Mode = 'single' | 'multi';

export const TtsGenerator: React.FC = () => {
  const [mode, setMode] = useState<Mode>('single');
  
  // Single speaker state
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  
  // Multi-speaker state
  const [dialogueText, setDialogueText] = useState(
    'Alice: Hi Bob, how are you today?\nBob: I am doing great, thanks for asking!'
  );
  const [speakerConfigs, setSpeakerConfigs] = useState<SpeakerConfig[]>([
    { speakerName: 'Alice', voiceName: 'Aurora' },
    { speakerName: 'Bob', voiceName: 'Charon' },
  ]);

  const { audio, voices, isLoading, error, synthesizeSingle, synthesizeMulti, clearAudio } =
    useTts();

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    await synthesizeSingle({
      text,
      voiceName: selectedVoice,
    });
  };

  const handleMultiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dialogueText.trim() || isLoading) return;

    await synthesizeMulti({
      text: dialogueText,
      speakerConfigs,
    });
  };

  const updateSpeakerVoice = (index: number, voiceName: string) => {
    setSpeakerConfigs((prev) =>
      prev.map((config, i) => (i === index ? { ...config, voiceName } : config))
    );
  };

  const addSpeaker = () => {
    const name = `Speaker${speakerConfigs.length + 1}`;
    setSpeakerConfigs((prev) => [...prev, { speakerName: name, voiceName: 'Kore' }]);
  };

  const removeSpeaker = (index: number) => {
    if (speakerConfigs.length > 2) {
      setSpeakerConfigs((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="tts-generator">
      <h2>Text-to-Speech</h2>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          className={mode === 'single' ? 'active' : ''}
          onClick={() => setMode('single')}
        >
          Single Speaker
        </button>
        <button
          className={mode === 'multi' ? 'active' : ''}
          onClick={() => setMode('multi')}
        >
          Multi-Speaker
        </button>
      </div>

      {/* Single Speaker Form */}
      {mode === 'single' && (
        <form onSubmit={handleSingleSubmit} className="tts-form">
          <div className="form-group">
            <label>Text to Synthesize *</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to convert to speech..."
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label>Voice</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={isLoading || !text.trim()}>
            {isLoading ? 'Synthesizing...' : 'Generate Speech'}
          </button>
        </form>
      )}

      {/* Multi-Speaker Form */}
      {mode === 'multi' && (
        <form onSubmit={handleMultiSubmit} className="tts-form">
          <div className="form-group">
            <label>Dialogue Text *</label>
            <textarea
              value={dialogueText}
              onChange={(e) => setDialogueText(e.target.value)}
              placeholder="Speaker1: Hello there&#10;Speaker2: Hi, how are you?"
              rows={6}
              required
            />
            <small>Format: SpeakerName: Text (one per line)</small>
          </div>

          <div className="speakers-config">
            <div className="speakers-header">
              <label>Speaker Voice Assignments</label>
              <button type="button" onClick={addSpeaker} className="add-btn">
                + Add Speaker
              </button>
            </div>

            {speakerConfigs.map((config, index) => (
              <div key={index} className="speaker-row">
                <input
                  type="text"
                  value={config.speakerName}
                  onChange={(e) =>
                    setSpeakerConfigs((prev) =>
                      prev.map((c, i) =>
                        i === index ? { ...c, speakerName: e.target.value } : c
                      )
                    )
                  }
                  placeholder="Speaker name"
                />
                <select
                  value={config.voiceName}
                  onChange={(e) => updateSpeakerVoice(index, e.target.value)}
                >
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name}
                    </option>
                  ))}
                </select>
                {speakerConfigs.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeSpeaker(index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="submit" disabled={isLoading || !dialogueText.trim()}>
            {isLoading ? 'Synthesizing...' : 'Generate Dialogue'}
          </button>
        </form>
      )}

      {/* Error */}
      {error && <div className="error">{error}</div>}

      {/* Generated Audio */}
      {audio && (
        <div className="audio-result">
          <div className="audio-header">
            <h3>Generated Audio</h3>
            <button onClick={clearAudio} className="clear-btn">
              Clear
            </button>
          </div>
          <audio controls autoPlay className="audio-player">
            <source src={audio.url} type={audio.mimeType} />
          </audio>
          <div className="audio-info">
            {audio.voiceName && <p><strong>Voice:</strong> {audio.voiceName}</p>}
            {audio.speakerCount && <p><strong>Speakers:</strong> {audio.speakerCount}</p>}
          </div>
          <a href={audio.url} download={audio.filename} className="download-btn">
            Download Audio
          </a>
        </div>
      )}
    </div>
  );
};

export default TtsGenerator;
```

### 4. CSS (`src/components/TTS/TtsGenerator.css`)

```css
.tts-generator {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.mode-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.mode-toggle button {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #007bff;
  background: white;
  color: #007bff;
  cursor: pointer;
}

.mode-toggle button.active {
  background: #007bff;
  color: white;
}

.tts-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.speakers-config {
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 8px;
}

.speakers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.speaker-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.speaker-row input {
  flex: 1;
}

.speaker-row select {
  flex: 1;
}

.add-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
}

.audio-player {
  width: 100%;
  margin: 1rem 0;
}
```

---

## Model

| Model | Voices | Format | Sample Rate |
|-------|--------|--------|-------------|
| `gemini-2.5-flash-preview-tts` | 30 | WAV | 24kHz |

---

## Example Requests

### Single Speaker
```typescript
await ttsApi.synthesizeSingle({
  text: 'Hello! Welcome to our application.',
  voiceName: 'Zephyr',
});
```

### Multi-Speaker Dialogue
```typescript
await ttsApi.synthesizeMulti({
  text: `Alice: Good morning, how can I help you?
Bob: I would like to book a table for two.
Alice: Certainly! What time would you prefer?`,
  speakerConfigs: [
    { speakerName: 'Alice', voiceName: 'Aurora' },
    { speakerName: 'Bob', voiceName: 'Charon' },
  ],
});
```
