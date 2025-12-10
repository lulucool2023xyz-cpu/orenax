# Image Generation - API V1 (Vertex AI Imagen)

Complete image generation implementation using Vertex AI Imagen models.

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/image/text-to-image` | Generate images from text |
| POST | `/api/v1/image/image-upscale` | Upscale images x2/x4 |
| POST | `/api/v1/image/image-edit` | Edit images with mask |
| POST | `/api/v1/image/image-customize` | Style transfer |
| POST | `/api/v1/image/virtual-try-on` | Clothing try-on |
| POST | `/api/v1/image/product-recontext` | Product scene generation |
| POST | `/api/v1/image/gemini-generate` | Gemini native image gen |

---

## Request Format

### Text-to-Image
```typescript
interface TextToImageRequestV1 {
  prompt: string;
  model?: string;                 // Default: 'imagen-3.0-generate-001'
  sampleCount?: number;           // 1-8
  negativePrompt?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  enhancePrompt?: boolean;
  seed?: number;
  addWatermark?: boolean;
  personGeneration?: 'allow_adult' | 'dont_allow';
}
```

### Image Upscale
```typescript
interface ImageUpscaleRequestV1 {
  image: string;                  // Base64 image
  upscaleFactor?: 'x2' | 'x4';
  prompt?: string;                // Optional guidance
}
```

---

## Response Format

```json
{
  "success": true,
  "model": "imagen-3.0-generate-001",
  "images": [
    {
      "url": "https://storage.googleapis.com/...",
      "gcsUri": "gs://bucket/image.png",
      "filename": "imagen_abc123.png",
      "mimeType": "image/png"
    }
  ]
}
```

---

## Vite + TSX Implementation

### 1. Image API Service (`src/api/imageApiV1.ts`)

```typescript
import { apiClientV1 } from './clientV1';
import type {
  TextToImageRequestV1,
  ImageResponseV1,
  ImageUpscaleRequestV1,
} from '../types/apiV1.types';

export const imageApiV1 = {
  // Text to Image
  async textToImage(request: TextToImageRequestV1): Promise<ImageResponseV1> {
    return apiClientV1.post('/image/text-to-image', request);
  },

  // Upscale Image
  async upscaleImage(request: ImageUpscaleRequestV1): Promise<ImageResponseV1> {
    return apiClientV1.post('/image/image-upscale', request);
  },

  // Image Edit
  async editImage(request: {
    image: string;
    mask: string;
    prompt: string;
    negativePrompt?: string;
  }): Promise<ImageResponseV1> {
    return apiClientV1.post('/image/image-edit', request);
  },

  // Gemini Native Image
  async geminiGenerate(request: {
    prompt: string;
    model?: string;
    aspectRatio?: string;
  }): Promise<ImageResponseV1> {
    return apiClientV1.post('/image/gemini-generate', request);
  },

  // Virtual Try-On
  async virtualTryOn(request: {
    personImage: string;
    garmentImage: string;
    garmentType: 'TOP' | 'BOTTOM' | 'DRESS';
  }): Promise<ImageResponseV1> {
    return apiClientV1.post('/image/virtual-try-on', request);
  },

  // Product Recontext
  async productRecontext(request: {
    productImage: string;
    scenePrompt: string;
  }): Promise<ImageResponseV1> {
    return apiClientV1.post('/image/product-recontext', request);
  },
};
```

### 2. useImageGeneration Hook (`src/hooks/useImageGenerationV1.ts`)

```typescript
import { useState, useCallback } from 'react';
import { imageApiV1 } from '../api/imageApiV1';
import type {
  TextToImageRequestV1,
  GeneratedImageV1,
} from '../types/apiV1.types';

export function useImageGenerationV1() {
  const [images, setImages] = useState<GeneratedImageV1[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState('imagen-3.0-generate-001');

  const generateImage = useCallback(async (
    prompt: string,
    options: Partial<TextToImageRequestV1> = {}
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await imageApiV1.textToImage({
        prompt,
        model: options.model || model,
        sampleCount: options.sampleCount || 1,
        aspectRatio: options.aspectRatio || '1:1',
        negativePrompt: options.negativePrompt,
        enhancePrompt: options.enhancePrompt,
        seed: options.seed,
      });

      setImages(response.images);
      setModel(response.model);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [model]);

  const upscaleImage = useCallback(async (
    imageBase64: string,
    factor: 'x2' | 'x4' = 'x2',
    prompt?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await imageApiV1.upscaleImage({
        image: imageBase64,
        upscaleFactor: factor,
        prompt,
      });

      setImages(response.images);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upscale failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearImages = useCallback(() => {
    setImages([]);
    setError(null);
  }, []);

  return {
    images,
    isLoading,
    error,
    model,
    generateImage,
    upscaleImage,
    clearImages,
  };
}
```

### 3. ImageGenerator Component (`src/components/ImageGeneratorV1.tsx`)

```tsx
import React, { useState } from 'react';
import { useImageGenerationV1 } from '../hooks/useImageGenerationV1';
import './ImageGeneratorV1.css';

const MODELS = [
  { id: 'imagen-4.0-generate-001', name: 'Imagen 4.0 (Latest)' },
  { id: 'imagen-3.0-generate-001', name: 'Imagen 3.0 (Default)' },
];

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];

export const ImageGeneratorV1: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('imagen-3.0-generate-001');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [sampleCount, setSampleCount] = useState(1);
  const [enhancePrompt, setEnhancePrompt] = useState(true);

  const {
    images,
    isLoading,
    error,
    generateImage,
    clearImages,
  } = useImageGenerationV1();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    await generateImage(prompt, {
      model: selectedModel,
      aspectRatio: aspectRatio as any,
      sampleCount,
      negativePrompt: negativePrompt || undefined,
      enhancePrompt,
    });
  };

  return (
    <div className="image-generator-v1">
      <div className="generator-header">
        <h2>🎨 Image Generator V1</h2>
        <span className="badge">Vertex AI Imagen</span>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="controls">
        {/* Model Selection */}
        <div className="control-group">
          <label>Model</label>
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Aspect Ratio */}
        <div className="control-group">
          <label>Aspect Ratio</label>
          <div className="button-group">
            {ASPECT_RATIOS.map(ratio => (
              <button
                key={ratio}
                className={aspectRatio === ratio ? 'active' : ''}
                onClick={() => setAspectRatio(ratio)}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Sample Count */}
        <div className="control-group">
          <label>Images: {sampleCount}</label>
          <input
            type="range"
            min="1"
            max="4"
            value={sampleCount}
            onChange={(e) => setSampleCount(Number(e.target.value))}
          />
        </div>

        {/* Enhance Prompt */}
        <div className="control-group checkbox">
          <input
            type="checkbox"
            id="enhance"
            checked={enhancePrompt}
            onChange={(e) => setEnhancePrompt(e.target.checked)}
          />
          <label htmlFor="enhance">Enhance Prompt</label>
        </div>
      </div>

      {/* Prompt Input */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your image..."
        rows={3}
      />

      {/* Negative Prompt */}
      <input
        type="text"
        value={negativePrompt}
        onChange={(e) => setNegativePrompt(e.target.value)}
        placeholder="Negative prompt (optional)"
      />

      {/* Action Buttons */}
      <div className="actions">
        <button 
          onClick={handleGenerate} 
          disabled={isLoading || !prompt.trim()}
          className="generate-btn"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
        <button onClick={clearImages} className="clear-btn">
          Clear
        </button>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="image-gallery">
          {images.map((img, idx) => (
            <div key={idx} className="image-card">
              <img src={img.url} alt={`Generated ${idx + 1}`} />
              <a href={img.url} download className="download-btn">
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 4. CSS Styles (`src/components/ImageGeneratorV1.css`)

```css
.image-generator-v1 {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  background: #1a1a1a;
  border-radius: 16px;
}

.generator-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.generator-header h2 { margin: 0; color: #fff; }

.badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.error-message {
  background: #ff4757;
  color: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  color: #b0b0b0;
  font-size: 14px;
}

.control-group select,
.control-group input[type="range"] {
  padding: 10px;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  background: #2a2a2a;
  color: white;
}

.button-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.button-group button {
  padding: 8px 16px;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  background: #2a2a2a;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.button-group button.active {
  background: #667eea;
  border-color: #667eea;
}

.control-group.checkbox {
  flex-direction: row;
  align-items: center;
}

textarea, input[type="text"] {
  width: 100%;
  padding: 14px;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  background: #2a2a2a;
  color: white;
  font-size: 14px;
  margin-bottom: 12px;
  resize: vertical;
}

.actions {
  display: flex;
  gap: 12px;
  margin: 20px 0;
}

.generate-btn {
  flex: 1;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn {
  padding: 14px 24px;
  background: #3a3a3a;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.image-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #2a2a2a;
}

.image-card img {
  width: 100%;
  height: auto;
  display: block;
}

.download-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 12px;
}
```

---

## Usage Example

```tsx
import { ImageGeneratorV1 } from './components/ImageGeneratorV1';

function App() {
  return <ImageGeneratorV1 />;
}
```

---

## Available Models

| Model | Use Case |
|-------|----------|
| `imagen-4.0-generate-001` | Latest, highest quality |
| `imagen-3.0-generate-001` | Default, stable |
| `imagen-4.0-upscale-preview` | 2x/4x upscaling |
| `imagen-3.0-capability-001` | Editing, customization |
| `virtual-try-on-preview-08-04` | Clothing try-on |
| `imagen-product-recontext-preview-06-30` | Product scenes |
