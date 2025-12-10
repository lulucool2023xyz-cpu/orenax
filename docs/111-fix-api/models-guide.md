# Models Reference - API V1 (Vertex AI)

Complete model capabilities matrix for all V1 endpoints.

---

## Chat Models

| Model | Thinking | Grounding | Max Tokens | Best For |
|-------|----------|-----------|------------|----------|
| `gemini-2.5-flash` | ✅ budget | ✅ | 1M | Fast, balanced |
| `gemini-2.5-pro` | ✅ budget | ✅ | 1M | Complex tasks |
| `gemini-3-pro-preview` | ✅ level | ✅ | 1M | Latest, advanced |
| `gemini-2.0-flash` | ❌ | ✅ | 1M | Speed-focused |
| `gemini-1.5-pro` | ❌ | ✅ | 2M | Long context |
| `gemini-1.5-flash` | ❌ | ✅ | 1M | Fast, efficient |

### Thinking Configuration

**Gemini 2.5 (Budget):**
- `thinkingBudget`: 0-24576 tokens
- Default: 8192

**Gemini 3 (Level):**
- `thinkingLevel`: 'low' | 'high'
- Default: 'low'

---

## Image Models (Imagen)

| Model | Use Case | Formats |
|-------|----------|---------|
| `imagen-4.0-generate-001` | Latest generation | PNG |
| `imagen-3.0-generate-001` | Default, stable | PNG |
| `imagen-4.0-upscale-preview` | 2x/4x upscaling | PNG |
| `imagen-3.0-capability-001` | Edit, customize | PNG |
| `virtual-try-on-preview-08-04` | Clothing try-on | PNG |
| `imagen-product-recontext-preview` | Product scenes | PNG |

### Aspect Ratios
`1:1`, `16:9`, `9:16`, `4:3`, `3:4`

---

## Video Models (Veo)

| Model | Duration | Audio | Resolution |
|-------|----------|-------|------------|
| `veo-3.1-generate-preview` | 8s | ✅ | 1080p |
| `veo-3.0-generate-preview` | 8s | ✅ | 1080p |
| `veo-2.0-generate-001` | 8s | ❌ | 1080p |

### Features
- Text-to-Video
- Image-to-Video
- Video Extension
- Frame Interpolation

---

## Music Model (Lyria)

| Model | Duration | Format | Sample Rate |
|-------|----------|--------|-------------|
| `lyria-002` | 32.8s | WAV | 48kHz stereo |

### Notes
- Instrumental only
- Fixed duration
- Up to 4 variations per request

---

## TTS Voices (Cloud TTS)

| Voice | Style | Languages |
|-------|-------|-----------|
| Kore | Warm female | en-US |
| Puck | Energetic male | en-US |
| Charon | Deep male | en-US |
| Fenrir | Authoritative | en-US |
| Aoede | Melodic female | en-US |
| Zephyr | Calm neutral | en-US |
| Harmony | Balanced | en-US |
| Aurora | Bright | en-US |
| Ember | Warm | en-US |

### Parameters
- `speakingRate`: 0.25-4.0
- `pitch`: -20 to 20
- `volumeGainDb`: -96 to 16

---

## V1 vs V2 Comparison

| Feature | V1 (Vertex AI) | V2 (Gemini API) |
|---------|----------------|-----------------|
| Backend | Vertex AI SDK | Gemini API |
| Streaming | Simulated chunks | Native SSE |
| Music | Lyria-002 (32.8s fixed) | Lyria RealTime (configurable) |
| TTS | Cloud TTS (MP3) | Gemini TTS (WAV) |
| Function Calling | ❌ | ✅ |
| Code Execution | ❌ | ✅ |

---

## TypeScript Model Types

```typescript
// Chat Models
type ChatModelV1 = 
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro'
  | 'gemini-3-pro-preview'
  | 'gemini-2.0-flash'
  | 'gemini-1.5-pro';

// Image Models
type ImageModelV1 = 
  | 'imagen-4.0-generate-001'
  | 'imagen-3.0-generate-001'
  | 'imagen-4.0-upscale-preview';

// Video Models
type VideoModelV1 = 
  | 'veo-3.1-generate-preview'
  | 'veo-3.0-generate-preview'
  | 'veo-2.0-generate-001';

// TTS Voices
type TtsVoiceV1 = 
  | 'Kore' | 'Puck' | 'Charon' 
  | 'Fenrir' | 'Aoede' | 'Zephyr';
```
