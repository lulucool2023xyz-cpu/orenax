# Text-to-Speech (TTS) API

Generate high-quality audio from text using Gemini TTS models with 30 voice options.

## Models

| Model | Single Speaker | Multi-Speaker | Max Input |
|-------|----------------|---------------|-----------|
| `gemini-2.5-flash-preview-tts` | ✅ | ✅ (up to 2) | 32k tokens |
| `gemini-2.5-pro-preview-tts` | ✅ | ✅ (up to 2) | 32k tokens |

---

## Endpoints

### POST /api/v2/tts/single

Generate single-speaker audio from text.

**Request:**
```json
{
  "text": "Say cheerfully: Have a wonderful day!",
  "voiceName": "Kore",
  "model": "gemini-2.5-flash-preview-tts",
  "uploadToGcs": true
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | ✅ | Text to convert to speech |
| `voiceName` | string | ✅ | Voice name (see voice options below) |
| `model` | string | ❌ | TTS model (default: gemini-2.5-flash-preview-tts) |
| `uploadToGcs` | boolean | ❌ | Upload to GCS (default: true) |

**Response:**
```json
{
  "url": "https://storage.googleapis.com/orenax-vertex-ai-images/audio/tts/...",
  "filename": "20241204_123456_tts_single_abc123.wav",
  "text": "Say cheerfully: Have a wonderful day!",
  "voice": "Kore",
  "model": "gemini-2.5-flash-preview-tts",
  "duration": 3.5,
  "generatedAt": "2024-12-04T12:34:56.789Z"
}
```

---

### POST /api/v2/tts/multi

Generate multi-speaker audio (up to 2 speakers).

**Request:**
```json
{
  "text": "Speaker1: Hello there!\nSpeaker2: Hi, how are you?",
  "speakers": [
    {
      "name": "Speaker1",
      "voiceName": "Kore"
    },
    {
      "name": "Speaker2",
      "voiceName": "Puck"
    }
  ],
  "model": "gemini-2.5-flash-preview-tts",
  "uploadToGcs": true
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | ✅ | Multi-speaker script |
| `speakers` | array | ✅ | Speaker configurations (max 2) |
| `speakers[].name` | string | ✅ | Speaker name (must match names in text) |
| `speakers[].voiceName` | string | ✅ | Voice for this speaker |
| `model` | string | ❌ | TTS model |
| `uploadToGcs` | boolean | ❌ | Upload to GCS (default: true) |

**Response:**
```json
{
  "url": "https://storage.googleapis.com/orenax-vertex-ai-images/audio/tts/...",
  "filename": "20241204_123456_tts_multi_abc123.wav",
  "text": "Speaker1: Hello there!\nSpeaker2: Hi, how are you?",
  "speakers": [
    { "name": "Speaker1", "voiceName": "Kore" },
    { "name": "Speaker2", "voiceName": "Puck" }
  ],
  "model": "gemini-2.5-flash-preview-tts",
  "duration": 5.2,
  "generatedAt": "2024-12-04T12:34:56.789Z"
}
```

---

### GET /api/v2/tts/voices

Get list of available voices.

**Response:**
```json
{
  "voices": [
    { "name": "Zephyr", "tone": "Bright", "gender": "neutral" },
    { "name": "Puck", "tone": "Upbeat", "gender": "neutral" },
    { "name": "Kore", "tone": "Firm", "gender": "neutral" },
    { "name": "Charon", "tone": "Informative", "gender": "neutral" }
    // ... 26 more voices
  ],
  "total": 30
}
```

---

### GET /api/v2/tts/status

Check TTS service availability.

**Response:**
```json
{
  "available": true,
  "models": [
    "gemini-2.5-flash-preview-tts",
    "gemini-2.5-pro-preview-tts"
  ],
  "features": {
    "maxSpeakers": 2,
    "maxInputTokens": 32000,
    "outputFormat": "WAV (24kHz)",
    "languagesSupported": 24
  }
}
```

---

## Voice Options (30 Total)

| Voice Name | Tone | Voice Name | Tone |
|------------|------|------------|------|
| **Zephyr** | Bright | **Puck** | Upbeat |
| **Charon** | Informative | **Kore** | Firm |
| **Fenrir** | Excitable | **Leda** | Youthful |
| **Orus** | Firm | **Aoede** | Breezy |
| **Callirrhoe** | Easy-going | **Autonoe** | Bright |
| **Enceladus** | Breathy | **Iapetus** | Clear |
| **Umbriel** | Easy-going | **Algieba** | Smooth |
| **Despina** | Smooth | **Erinome** | Clear |
| **Rasalgethi** | Informative | **Laomedeia** | Upbeat |
| **Alnilam** | Firm | **Schedar** | Even |
| **Pulcherrima** | Forward | **Achird** | Friendly |
| **Gacrux** | Mature | **Vindemiatrix** | Gentle |
| **Zubenelgenubi** | Casual | **Sulafat** | Warm |
| **Sadachbia** | Lively | **Sadaltager** | Knowledgeable |
| **Achernar** | Soft | **Algenib** | Gravelly |

> [!TIP]
> Try voices in AI Studio first: [https://aistudio.google.com/](https://aistudio.google.com/)

---

## Supported Languages (24)

| Language | Code | Language | Code |
|----------|------|----------|------|
| Arabic (Egyptian) | ar-EG | German | de-DE |
| English (US) | en-US | Spanish (US) | es-US |
| French | fr-FR | Hindi | hi-IN |
| Indonesian | id-ID | Italian | it-IT |
| Japanese | ja-JP | Korean | ko-KR |
| Portuguese (BR) | pt-BR | Russian | ru-RU |
| Dutch | nl-NL | Polish | pl-PL |
| Thai | th-TH | Turkish | tr-TR |
| Vietnamese | vi-VN | Romanian | ro-RO |
| Ukrainian | uk-UA | Bengali | bn-BD |
| English (India) | en-IN | Marathi | mr-IN |
| Tamil | ta-IN | Telugu | te-IN |

---

## Controlling Speech Style

Use natural language in your text to control style, tone, accent, and pace:

### Style Examples

```json
{
  "text": "Say in a spooky whisper: By the pricking of my thumbs, something wicked this way comes"
}
```

```json
{
  "text": "Say cheerfully and energetically: What a beautiful day!"
}
```

```json
{
  "text": "Speak slowly and calmly: Take a deep breath and relax"
}
```

### Multi-Speaker Style

```json
{
  "text": "Make Speaker1 sound tired and bored, and Speaker2 sound excited and happy:\n\nSpeaker1: So... what's on the agenda today?\nSpeaker2: You're never going to guess!"
}
```

---

## Audio Format

- **Sample Rate**: 24kHz
- **Channels**: Mono
- **Format**: WAV (PCM)
- **Bit Depth**: 16-bit

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid text or safety violation |
| 400 | Voice name not found |
| 400 | Too many speakers (max 2) |
| 413 | Text too long (> 32k tokens) |
| 429 | Rate limit exceeded |
| 503 | TTS service not configured |

---

## cURL Examples

### Single Speaker
```bash
curl -X POST http://localhost:3001/api/v2/tts/single \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "text": "Hello! This is a test of the text-to-speech system.",
    "voiceName": "Kore"
  }'
```

### Multi-Speaker
```bash
curl -X POST http://localhost:3001/api/v2/tts/multi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "text": "Alice: Good morning!\nBob: How are you today?",
    "speakers": [
      {"name": "Alice", "voiceName": "Kore"},
      {"name": "Bob", "voiceName": "Puck"}
    ]
  }'
```

### Get Voices
```bash
curl http://localhost:3001/api/v2/tts/voices
```

---

## Best Practices

1. **Voice Selection**: Match voice tone to content (e.g., "Informative" for tutorials)
2. **Multi-Speaker**: Use distinct voice tones for clarity
3. **Style Control**: Be specific with style instructions
4. **Token Limit**: Keep text under 32k tokens
5. **Language**: Model auto-detects language, no need to specify

---

## Integration with Other APIs

Generate script first, then convert to speech:

```javascript
// 1. Generate podcast script
const scriptResponse = await fetch('/api/v2/chat/generate', {
  method: 'POST',
  body: JSON.stringify({
    prompt: 'Generate a 2-minute podcast script about AI with 2 hosts',
    model: 'gemini-2.0-flash'
  })
});

const { text: script } = await scriptResponse.json();

// 2. Convert to audio
const audioResponse = await fetch('/api/v2/tts/multi', {
  method: 'POST',
  body: JSON.stringify({
    text: script,
    speakers: [
      { name: 'Host1', voiceName: 'Kore' },
      { name: 'Host2', voiceName: 'Puck' }
    ]
  })
});

const { url } = await audioResponse.json();
```
