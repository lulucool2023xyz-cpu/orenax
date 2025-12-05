# API v1 Complete Reference

> **Base URL**: `http://localhost:3001`  
> **Auth**: All endpoints require `Authorization: Bearer <JWT_TOKEN>`

---

## 🔐 Authentication

```bash
# Login to get JWT token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"yourpassword"}'
```

---

## 💬 Chat API `/api/v1/chat`

### POST /api/v1/chat
Send chat message with optional thinking mode and grounding.

```json
{
  "messages": [
    {"role": "user", "content": "What's the latest AI news?"}
  ],
  "model": "gemini-2.5-flash",
  "thinkingConfig": {
    "thinkingBudget": 8192,
    "includeThoughts": true
  },
  "groundingConfig": {
    "googleSearch": true
  }
}
```

**Models**: `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.0-flash`

### POST /api/v1/chat/count-tokens
```json
{
  "messages": [{"role": "user", "content": "Hello world"}],
  "model": "gemini-2.5-flash"
}
```

### GET /api/v1/chat/conversations
List all conversations for current user.

### GET /api/v1/chat/conversations/:id
Get specific conversation history.

### DELETE /api/v1/chat/conversations/:id
Delete a conversation.

---

## 🖼️ Image API `/api/v1/image`

### POST /api/v1/image/text-to-image
Generate images from text prompt.

```json
{
  "model": "imagen-4.0-generate-001",
  "prompt": "A beautiful sunset over mountains",
  "sampleCount": 1,
  "negativePrompt": "blurry, low quality",
  "addWatermark": true,
  "outputOptions": {
    "mimeType": "image/png"
  },
  "safetySetting": "block_medium_and_above",
  "personGeneration": "allow_adult"
}
```

**Models**: 
- `imagen-4.0-generate-001` (recommended)
- `imagen-4.0-ultra-generate-001`
- `imagen-3.0-generate-002`

### POST /api/v1/image/image-upscale
Upscale an image to higher resolution.

```json
{
  "image": "base64_encoded_image_data",
  "upscaleFactor": "x2",
  "prompt": "Upscale with high detail",
  "addWatermark": true
}
```

**Factors**: `x2`, `x3`, `x4`

### POST /api/v1/image/image-edit
Edit image using masks.

```json
{
  "prompt": "Add a rainbow in the sky",
  "editMode": "EDIT_MODE_INPAINT_INSERTION",
  "referenceImages": [
    {
      "referenceType": "REFERENCE_TYPE_RAW",
      "referenceId": 0,
      "bytesBase64Encoded": "base64_image_data",
      "maskImageConfig": {
        "maskMode": "MASK_MODE_USER_PROVIDED"
      }
    }
  ],
  "sampleCount": 4
}
```

**Edit Modes**: `EDIT_MODE_INPAINT_REMOVAL`, `EDIT_MODE_INPAINT_INSERTION`, `EDIT_MODE_OUTPAINT`

### POST /api/v1/image/image-customize
Customize with reference images.

```json
{
  "prompt": "A cat in the same style",
  "referenceImages": [
    {
      "referenceType": "REFERENCE_TYPE_STYLE",
      "referenceId": 0,
      "bytesBase64Encoded": "base64_style_reference"
    }
  ],
  "sampleCount": 2
}
```

### POST /api/v1/image/virtual-try-on
Virtual try-on for clothing.

```json
{
  "personImage": "base64_person_image",
  "productImages": ["base64_clothing_image"],
  "sampleCount": 1
}
```

### POST /api/v1/image/product-recontext
Recontextualize product in different scenes.

```json
{
  "prompt": "Product on a beach at sunset",
  "productImages": ["base64_product_image"],
  "sampleCount": 2,
  "enhancePrompt": true
}
```

### POST /api/v1/image/gemini-generate
⚠️ **Status: Coming Soon** - Use Imagen models instead.

### GET /api/v1/image/gemini-status
Check Gemini image feature availability.

---

## 🎬 Video API `/api/v1/video`

### POST /api/v1/video/text-to-video
Generate video from text prompt.

```json
{
  "prompt": "A cat playing with yarn, cinematic quality",
  "model": "veo-3.1-generate-preview",
  "durationSeconds": 8,
  "aspectRatio": "16:9",
  "resolution": "1080p",
  "generateAudio": true,
  "negativePrompt": "blurry, low quality"
}
```

**Models**: `veo-3.1-generate-001`, `veo-3.1-fast-generate-001`, `veo-3.0-generate-001`, `veo-2.0-generate-001`

**Duration**: 4-8 seconds  
**Aspect Ratios**: `16:9`, `9:16`, `1:1`  
**Resolutions**: `720p`, `1080p`, `4k`

### POST /api/v1/video/image-to-video
Generate video from an image.

```json
{
  "prompt": "The person walks forward slowly",
  "image": {
    "bytesBase64Encoded": "base64_image_data"
  },
  "durationSeconds": 6,
  "resizeMode": "fit",
  "generateAudio": true
}
```

### POST /api/v1/video/extend
Extend an existing video.

```json
{
  "prompt": "Continue the scene with more action",
  "video": {
    "gcsUri": "gs://bucket/path/video.mp4"
  },
  "extensionSeconds": 4
}
```

### POST /api/v1/video/interpolate
Generate video between first and last frame.

```json
{
  "prompt": "Smooth transition between frames",
  "firstFrame": {
    "bytesBase64Encoded": "base64_first_frame"
  },
  "lastFrame": {
    "bytesBase64Encoded": "base64_last_frame"
  },
  "durationSeconds": 4
}
```

### POST /api/v1/video/with-references
Generate video with style/asset references.

```json
{
  "prompt": "A landscape in impressionist style",
  "referenceImages": [
    {
      "image": {"bytesBase64Encoded": "base64_style_image"},
      "referenceType": "REFERENCE_TYPE_STYLE"
    }
  ],
  "durationSeconds": 6
}
```

### GET /api/v1/video/operation?id=xxx
Check video generation operation status.

### GET /api/v1/video/status
Check video service availability.

### GET /api/v1/video/models
List supported video models.

---

## 🎵 Music API `/api/v1/music`

### POST /api/v1/music/generate
Generate instrumental music from text.

```json
{
  "prompt": "An uplifting orchestral piece with soaring strings and triumphant brass",
  "negativePrompt": "drums, heavy bass, electronic sounds",
  "seed": 12345,
  "sampleCount": 1
}
```

**Model**: `lyria-002`  
**Output**: WAV, 48kHz, 32.8 seconds  
**Type**: Instrumental only

### GET /api/v1/music/status
Check music service availability.

---

## 🎙️ Audio/TTS API `/api/v1/audio`

### POST /api/v1/audio/tts/single
Single speaker text-to-speech.

```json
{
  "text": "Hello, welcome to OrenaX platform!",
  "voiceName": "Kore",
  "speakingRate": 1.0,
  "pitch": 0,
  "volumeGainDb": 0,
  "languageCode": "en-US"
}
```

**Voices**: `Aoede`, `Charon`, `Fenrir`, `Kore` (default), `Puck`, `Zephyr`, `Harmony`, `Aurora`, `Ember`

**Parameters**:
- `speakingRate`: 0.25 - 4.0
- `pitch`: -20.0 - 20.0
- `volumeGainDb`: -96.0 - 16.0

### POST /api/v1/audio/tts/multi
Multi-speaker text-to-speech.

```json
{
  "text": "[Speaker1] Hello there! [Speaker2] Hi, how are you?",
  "speakerConfigs": [
    {"speaker": "Speaker1", "voiceName": "Kore"},
    {"speaker": "Speaker2", "voiceName": "Puck"}
  ],
  "speakingRate": 1.0
}
```

### GET /api/v1/audio/tts/voices
List available TTS voices.

### GET /api/v1/audio/tts/status
Check TTS service availability.

---

## ⚠️ Known Issues

| Endpoint | Issue | Workaround |
|----------|-------|------------|
| `/image/gemini-generate` | Coming Soon | Use Imagen models |
| `/image/text-to-image` | `INVALID_ARGUMENT` with algunos models | Use `imagen-4.0-generate-001` |

---

## 📊 Response Format

All media endpoints return:
```json
{
  "success": true,
  "model": "model-name",
  "url": "https://storage.googleapis.com/...",
  "publicUrl": "https://storage.googleapis.com/...",
  "gcsUri": "gs://bucket/path/file",
  "filename": "generated-file.ext",
  "mimeType": "type/subtype"
}
```
