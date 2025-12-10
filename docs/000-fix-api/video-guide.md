# Video Generation Guide (API V2)

Complete video generation implementation for Vite + React + TypeScript.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/video/generate` | Text-to-video |
| POST | `/api/v2/video/image-to-video` | Image-to-video |
| POST | `/api/v2/video/extend` | Extend video |
| GET | `/api/v2/video/status` | Service status |

## Request Formats

### Text-to-Video

```typescript
interface VideoRequest {
  prompt: string;                     // Required
  model?: string;                     // Default: 'veo-3.1-generate-preview'
  negativePrompt?: string;
  aspectRatio?: '16:9' | '9:16';
  durationSeconds?: number;           // 5-8
  generateAudio?: boolean;            // Include audio
  resolution?: string;                // '720p', '1080p'
}
```

### Image-to-Video

```typescript
interface ImageToVideoRequest {
  prompt: string;
  image: {
    bytesBase64Encoded: string;       // Base64 image data
    mimeType: string;                 // 'image/png', 'image/jpeg'
  };
  durationSeconds?: number;
  generateAudio?: boolean;
  aspectRatio?: '16:9' | '9:16';
}
```

## Response Format

```typescript
interface VideoResponse {
  success: boolean;
  url: string;                        // Public video URL
  gcsUri?: string;                    // GCS URI
  filename?: string;
  model: string;
  duration: number;
  aspectRatio: string;
  hasAudio: boolean;
  generatedAt: string;
}
```

---

## Complete Vite + TSX Implementation

### 1. Video API Service (`src/api/video.ts`)

```typescript
import apiClient from './client';

export interface VideoRequest {
  prompt: string;
  model?: string;
  negativePrompt?: string;
  aspectRatio?: '16:9' | '9:16';
  durationSeconds?: number;
  generateAudio?: boolean;
  resolution?: string;
}

export interface ImageToVideoRequest {
  prompt: string;
  image: {
    bytesBase64Encoded: string;
    mimeType: string;
  };
  durationSeconds?: number;
  generateAudio?: boolean;
  aspectRatio?: '16:9' | '9:16';
}

export interface VideoResponse {
  success: boolean;
  url: string;
  gcsUri?: string;
  filename?: string;
  model: string;
  duration: number;
  aspectRatio: string;
  hasAudio: boolean;
  generatedAt: string;
}

export const videoApi = {
  /**
   * Generate video from text prompt
   */
  async generate(request: VideoRequest): Promise<VideoResponse> {
    return apiClient.post<VideoResponse>('/video/generate', request);
  },

  /**
   * Generate video from image
   */
  async imageToVideo(request: ImageToVideoRequest): Promise<VideoResponse> {
    return apiClient.post<VideoResponse>('/video/image-to-video', request);
  },

  /**
   * Extend existing video
   */
  async extend(request: {
    prompt: string;
    videoUrl: string;
    extensionSeconds?: number;
    generateAudio?: boolean;
  }): Promise<VideoResponse> {
    return apiClient.post<VideoResponse>('/video/extend', request);
  },

  /**
   * Get service status
   */
  async getStatus(): Promise<{
    available: boolean;
    defaultModel: string;
    supportedModels: string[];
  }> {
    return apiClient.get('/video/status');
  },
};

export default videoApi;
```

### 2. useVideoGeneration Hook (`src/hooks/useVideoGeneration.ts`)

```typescript
import { useState, useCallback } from 'react';
import videoApi, { VideoRequest, ImageToVideoRequest, VideoResponse } from '../api/video';

interface UseVideoGenerationReturn {
  video: VideoResponse | null;
  isLoading: boolean;
  error: string | null;
  progress: string;
  generate: (request: VideoRequest) => Promise<void>;
  imageToVideo: (request: ImageToVideoRequest) => Promise<void>;
  clearVideo: () => void;
}

export function useVideoGeneration(): UseVideoGenerationReturn {
  const [video, setVideo] = useState<VideoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');

  const generate = useCallback(async (request: VideoRequest) => {
    setIsLoading(true);
    setError(null);
    setProgress('Generating video... This may take 1-2 minutes.');

    try {
      const response = await videoApi.generate(request);

      if (response.success) {
        setVideo(response);
        setProgress('Video generated successfully!');
      } else {
        throw new Error('Video generation failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
      setProgress('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const imageToVideo = useCallback(async (request: ImageToVideoRequest) => {
    setIsLoading(true);
    setError(null);
    setProgress('Converting image to video...');

    try {
      const response = await videoApi.imageToVideo(request);

      if (response.success) {
        setVideo(response);
        setProgress('Video generated successfully!');
      } else {
        throw new Error('Image-to-video conversion failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Conversion failed';
      setError(message);
      setProgress('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearVideo = useCallback(() => {
    setVideo(null);
    setError(null);
    setProgress('');
  }, []);

  return {
    video,
    isLoading,
    error,
    progress,
    generate,
    imageToVideo,
    clearVideo,
  };
}

export default useVideoGeneration;
```

### 3. VideoGenerator Component (`src/components/Video/VideoGenerator.tsx`)

```tsx
import React, { useState, useRef } from 'react';
import { useVideoGeneration } from '../../hooks/useVideoGeneration';
import './VideoGenerator.css';

type Mode = 'text' | 'image';

export const VideoGenerator: React.FC = () => {
  const [mode, setMode] = useState<Mode>('text');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [duration, setDuration] = useState(8);
  const [generateAudio, setGenerateAudio] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { video, isLoading, error, progress, generate, imageToVideo, clearVideo } =
    useVideoGeneration();

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setImageBase64(base64);
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    if (mode === 'text') {
      await generate({
        prompt,
        negativePrompt: negativePrompt || undefined,
        aspectRatio,
        durationSeconds: duration,
        generateAudio,
      });
    } else if (imageBase64) {
      await imageToVideo({
        prompt,
        image: {
          bytesBase64Encoded: imageBase64,
          mimeType: 'image/png',
        },
        durationSeconds: duration,
        generateAudio,
        aspectRatio,
      });
    }
  };

  return (
    <div className="video-generator">
      <h2>Video Generator</h2>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          className={mode === 'text' ? 'active' : ''}
          onClick={() => setMode('text')}
        >
          Text-to-Video
        </button>
        <button
          className={mode === 'image' ? 'active' : ''}
          onClick={() => setMode('image')}
        >
          Image-to-Video
        </button>
      </div>

      <form onSubmit={handleSubmit} className="generator-form">
        {/* Image Upload (for image mode) */}
        {mode === 'image' && (
          <div className="form-group">
            <label>Source Image *</label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            )}
          </div>
        )}

        {/* Prompt */}
        <div className="form-group">
          <label>
            {mode === 'text' ? 'Video Description *' : 'Motion Description *'}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              mode === 'text'
                ? 'Describe the video you want to generate...'
                : 'Describe how the image should animate...'
            }
            rows={3}
            required
          />
        </div>

        {/* Negative Prompt (text mode only) */}
        {mode === 'text' && (
          <div className="form-group">
            <label>Negative Prompt</label>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="What to avoid..."
            />
          </div>
        )}

        {/* Settings */}
        <div className="settings-row">
          <div className="form-group">
            <label>Aspect Ratio</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16')}
            >
              <option value="16:9">16:9 (Landscape)</option>
              <option value="9:16">9:16 (Portrait)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Duration (seconds)</label>
            <input
              type="number"
              min={5}
              max={8}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 8)}
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={generateAudio}
                onChange={(e) => setGenerateAudio(e.target.checked)}
              />
              Generate Audio
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={
            isLoading || !prompt.trim() || (mode === 'image' && !imageBase64)
          }
        >
          {isLoading ? 'Generating...' : 'Generate Video'}
        </button>
      </form>

      {/* Progress */}
      {progress && <div className="progress">{progress}</div>}

      {/* Error */}
      {error && <div className="error">{error}</div>}

      {/* Generated Video */}
      {video && (
        <div className="video-result">
          <div className="video-header">
            <h3>Generated Video</h3>
            <button onClick={clearVideo} className="clear-btn">
              Clear
            </button>
          </div>
          <video controls autoPlay loop className="video-player">
            <source src={video.url} type="video/mp4" />
          </video>
          <div className="video-info">
            <p>
              <strong>Model:</strong> {video.model}
            </p>
            <p>
              <strong>Duration:</strong> {video.duration}s
            </p>
            <p>
              <strong>Aspect Ratio:</strong> {video.aspectRatio}
            </p>
            <p>
              <strong>Audio:</strong> {video.hasAudio ? 'Yes' : 'No'}
            </p>
          </div>
          <a href={video.url} download={video.filename} className="download-btn">
            Download Video
          </a>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;
```

### 4. CSS Styles (`src/components/Video/VideoGenerator.css`)

```css
.video-generator {
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
  transition: all 0.2s;
}

.mode-toggle button.active {
  background: #007bff;
  color: white;
}

.generator-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.checkbox {
  flex-direction: row;
  align-items: center;
}

.form-group.checkbox label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.image-preview {
  max-width: 300px;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.settings-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  align-items: end;
}

.video-result {
  margin-top: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
}

.video-player {
  width: 100%;
  display: block;
}

.video-info {
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.download-btn {
  display: block;
  text-align: center;
  padding: 1rem;
  background: #28a745;
  color: white;
  text-decoration: none;
}
```

---

## Models

| Model | Duration | Audio | Description |
|-------|----------|-------|-------------|
| `veo-3.1-generate-preview` | 8s | ✅ | Latest, best quality |
| `veo-3.0-generate-preview` | 8s | ✅ | Stable |
| `veo-2.0-generate-001` | 8s | ❌ | Legacy |

---

## Example Requests

### Text-to-Video
```typescript
await videoApi.generate({
  prompt: 'A drone flying over a mountain landscape at sunset',
  aspectRatio: '16:9',
  durationSeconds: 8,
  generateAudio: true,
});
```

### Image-to-Video
```typescript
await videoApi.imageToVideo({
  prompt: 'The camera slowly zooms out, clouds move across the sky',
  image: {
    bytesBase64Encoded: base64ImageData,
    mimeType: 'image/png',
  },
  durationSeconds: 8,
  generateAudio: true,
});
```
