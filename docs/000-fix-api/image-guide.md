# Image Generation Guide (API V2)

Complete image generation implementation for Vite + React + TypeScript.

## Endpoint

```
POST /api/v2/image/generate
```

## Request Format

```typescript
interface ImageRequest {
  prompt: string;                     // Required: Image description
  model?: string;                     // Default: 'imagen-4.0-generate-001'
  negativePrompt?: string;            // What to avoid
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  numberOfImages?: number;            // 1-8
  outputFormat?: 'png' | 'jpeg' | 'webp';
}
```

## Response Format

```typescript
interface ImageResponse {
  success: boolean;
  model: string;
  images: GeneratedImage[];
}

interface GeneratedImage {
  url: string;                        // Public URL
  gcsUri?: string;                    // GCS URI
  filename?: string;
  mimeType?: string;
}
```

---

## Complete Vite + TSX Implementation

### 1. Image API Service (`src/api/image.ts`)

```typescript
import apiClient from './client';

export interface ImageRequest {
  prompt: string;
  model?: string;
  negativePrompt?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  numberOfImages?: number;
  outputFormat?: 'png' | 'jpeg' | 'webp';
}

export interface GeneratedImage {
  url: string;
  gcsUri?: string;
  filename?: string;
  mimeType?: string;
}

export interface ImageResponse {
  success: boolean;
  model: string;
  images: GeneratedImage[];
}

export const imageApi = {
  /**
   * Generate images from text prompt
   */
  async generate(request: ImageRequest): Promise<ImageResponse> {
    return apiClient.post<ImageResponse>('/image/generate', request);
  },
};

export default imageApi;
```

### 2. useImageGeneration Hook (`src/hooks/useImageGeneration.ts`)

```typescript
import { useState, useCallback } from 'react';
import imageApi, { ImageRequest, ImageResponse, GeneratedImage } from '../api/image';

interface UseImageGenerationReturn {
  images: GeneratedImage[];
  isLoading: boolean;
  error: string | null;
  progress: string;
  generate: (request: ImageRequest) => Promise<void>;
  clearImages: () => void;
}

export function useImageGeneration(): UseImageGenerationReturn {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');

  const generate = useCallback(async (request: ImageRequest) => {
    setIsLoading(true);
    setError(null);
    setProgress('Generating images...');

    try {
      const response = await imageApi.generate(request);

      if (response.success) {
        setImages(response.images);
        setProgress(`Generated ${response.images.length} image(s)`);
      } else {
        throw new Error('Image generation failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
      setProgress('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearImages = useCallback(() => {
    setImages([]);
    setError(null);
    setProgress('');
  }, []);

  return {
    images,
    isLoading,
    error,
    progress,
    generate,
    clearImages,
  };
}

export default useImageGeneration;
```

### 3. ImageGenerator Component (`src/components/Image/ImageGenerator.tsx`)

```tsx
import React, { useState } from 'react';
import { useImageGeneration } from '../../hooks/useImageGeneration';
import './ImageGenerator.css';

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'] as const;
const MODELS = [
  { id: 'imagen-4.0-generate-001', name: 'Imagen 4.0' },
  { id: 'imagen-3.0-generate-001', name: 'Imagen 3.0' },
  { id: 'gemini-2.5-flash-image', name: 'Gemini Flash Image' },
];

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<typeof ASPECT_RATIOS[number]>('1:1');
  const [model, setModel] = useState(MODELS[0].id);
  const [numberOfImages, setNumberOfImages] = useState(1);

  const { images, isLoading, error, progress, generate, clearImages } = useImageGeneration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    await generate({
      prompt,
      negativePrompt: negativePrompt || undefined,
      aspectRatio,
      model,
      numberOfImages,
    });
  };

  return (
    <div className="image-generator">
      <h2>Image Generator</h2>

      <form onSubmit={handleSubmit} className="generator-form">
        {/* Prompt */}
        <div className="form-group">
          <label>Prompt *</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            rows={3}
            required
          />
        </div>

        {/* Negative Prompt */}
        <div className="form-group">
          <label>Negative Prompt</label>
          <textarea
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="What to avoid in the image..."
            rows={2}
          />
        </div>

        {/* Settings Row */}
        <div className="settings-row">
          {/* Model */}
          <div className="form-group">
            <label>Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Aspect Ratio */}
          <div className="form-group">
            <label>Aspect Ratio</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as typeof ASPECT_RATIOS[number])}
            >
              {ASPECT_RATIOS.map((ratio) => (
                <option key={ratio} value={ratio}>
                  {ratio}
                </option>
              ))}
            </select>
          </div>

          {/* Number of Images */}
          <div className="form-group">
            <label>Images</label>
            <input
              type="number"
              min={1}
              max={8}
              value={numberOfImages}
              onChange={(e) => setNumberOfImages(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={isLoading || !prompt.trim()}>
          {isLoading ? 'Generating...' : 'Generate Images'}
        </button>
      </form>

      {/* Progress */}
      {progress && <div className="progress">{progress}</div>}

      {/* Error */}
      {error && <div className="error">{error}</div>}

      {/* Generated Images */}
      {images.length > 0 && (
        <div className="images-container">
          <div className="images-header">
            <h3>Generated Images</h3>
            <button onClick={clearImages} className="clear-btn">
              Clear
            </button>
          </div>
          <div className="images-grid">
            {images.map((img, i) => (
              <div key={i} className="image-card">
                <img src={img.url} alt={`Generated ${i + 1}`} />
                <a href={img.url} download={img.filename} className="download-btn">
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
```

### 4. CSS Styles (`src/components/Image/ImageGenerator.css`)

```css
.image-generator {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.generator-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  font-size: 0.875rem;
}

.form-group textarea,
.form-group select,
.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.settings-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.generator-form button {
  padding: 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

.generator-form button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.images-container {
  margin-top: 2rem;
}

.images-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.image-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-card img {
  width: 100%;
  height: auto;
  display: block;
}

.image-card .download-btn {
  display: block;
  text-align: center;
  padding: 0.75rem;
  background: #f8f9fa;
  text-decoration: none;
  color: #333;
}

.error {
  color: #dc3545;
  padding: 1rem;
  background: #f8d7da;
  border-radius: 8px;
}

.progress {
  color: #0c5460;
  padding: 1rem;
  background: #d1ecf1;
  border-radius: 8px;
}
```

---

## Models

| Model | Description |
|-------|-------------|
| `imagen-4.0-generate-001` | Latest Imagen, best quality |
| `imagen-4.0-fast-generate-001` | Faster generation |
| `imagen-3.0-generate-001` | Stable, production-ready |
| `gemini-2.5-flash-image` | Gemini native image gen |

---

## Example Requests

### Basic Generation
```typescript
await imageApi.generate({
  prompt: 'A serene mountain landscape at sunset with snow-capped peaks',
});
```

### With All Options
```typescript
await imageApi.generate({
  prompt: 'A futuristic city with flying cars and neon lights',
  negativePrompt: 'blurry, low quality, text, watermark',
  model: 'imagen-4.0-generate-001',
  aspectRatio: '16:9',
  numberOfImages: 4,
  outputFormat: 'png',
});
```
