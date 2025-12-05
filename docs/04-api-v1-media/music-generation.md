# 🎵 Music Generation API (Lyria)

Generate instrumental music menggunakan Google Lyria model.

## Base URL
```
/api/v1/music
```

## Authentication
```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/generate` | Generate music from text |
| `GET` | `/status` | Check service availability |

---

## POST /api/v1/music/generate

### Request

```json
{
  "prompt": "An uplifting and hopeful orchestral piece with a soaring string melody and triumphant brass",
  "negativePrompt": "dissonant, minor key, drums",
  "seed": 12345
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | ✅ | Text description of music (US English) |
| `negativePrompt` | string | ❌ | Elements to avoid |
| `seed` | number | ❌ | For reproducibility (cannot use with sampleCount) |
| `sampleCount` | number | ❌ | Number of samples 1-4 (cannot use with seed) |

> **Note:** `seed` and `sampleCount` are mutually exclusive.

### Response

```json
{
  "success": true,
  "tracks": [
    {
      "url": "https://storage.googleapis.com/bucket/music/2024/12/05/lyria-music-xxx.wav",
      "publicUrl": "https://storage.googleapis.com/...",
      "gcsUri": "gs://bucket/music/2024/12/05/lyria-music-xxx.wav",
      "filename": "lyria-music-xxx.wav",
      "mimeType": "audio/wav",
      "duration": 32.8,
      "sampleRate": 48000,
      "prompt": "An uplifting..."
    }
  ],
  "model": "lyria-002",
  "generatedAt": "2024-12-05T12:34:56.789Z"
}
```

---

## GET /api/v1/music/status

### Response

```json
{
  "available": true,
  "model": "lyria-002",
  "features": {
    "textToMusic": true,
    "negativePrompt": true,
    "seedForReproducibility": true,
    "sampleCount": true
  },
  "output": {
    "format": "WAV",
    "sampleRate": "48kHz",
    "duration": "32.8 seconds",
    "type": "Instrumental only"
  },
  "limits": {
    "maxSampleCount": 4,
    "promptLanguage": "US English (en-us)"
  }
}
```

---

## Model Details

| Property | Value |
|----------|-------|
| Model ID | `lyria-002` |
| Output Format | WAV |
| Sample Rate | 48 kHz |
| Duration | 32.8 seconds (fixed) |
| Type | Instrumental only |

---

## Prompt Tips

### Good Prompts

```
"A calm acoustic folk song with a gentle guitar melody and soft strings"
"Energetic electronic dance track with fast synth beats"
"Cinematic orchestral trailer music with dramatic percussion"
"Relaxing lo-fi hip hop beat with jazzy piano"
"Epic fantasy adventure music with brass fanfare and choir"
```

### Bad Prompts

```
"A song" (too vague)
"Play Bohemian Rhapsody" (copyright content)
"Music with singing" (vocals not supported)
```

---

## cURL Example

### Basic Request
```bash
curl -X POST http://localhost:3001/api/v1/music/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "A calm acoustic folk song with gentle guitar"
  }'
```

### With Negative Prompt
```bash
curl -X POST http://localhost:3001/api/v1/music/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "Upbeat electronic dance music",
    "negativePrompt": "drums, vocals",
    "seed": 98765
  }'
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid prompt or safety violation |
| 400 | Cannot use seed and sampleCount together |
| 429 | Rate limit exceeded |
| 503 | Music service not configured |

---

## Pricing

Lyria 2: $0.06 per 30 seconds of output music generated.

---

## Related

- [Video Generation](video-generation.md)
- [TTS Audio](tts-audio.md)
- [Back to Media Overview](README.md)
