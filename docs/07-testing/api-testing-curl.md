# API Testing Guide

Complete guide for testing OrenaX V1 API endpoints.

---

## 🏥 Health Check

```bash
# Check API status
curl http://localhost:3001/v1/health

# List available models
curl http://localhost:3001/v1/models
```

---

## 💬 Chat API

```bash
# Basic chat
curl -X POST http://localhost:3001/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello!"}],
    "model": "gemini-2.5-flash"
  }'

# Chat with grounding
curl -X POST http://localhost:3001/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Latest AI news?"}],
    "grounding": {"googleSearch": true}
  }'

# Chat with thinking mode
curl -X POST http://localhost:3001/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Solve this math problem"}],
    "thinking": {"thinkingLevel": "HIGH"}
  }'
```

---

## 🖼️ Image API

```bash
# Generate image
curl -X POST http://localhost:3001/v1/image/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "model": "imagen-4.0-generate-001"
  }'

# Upscale image
curl -X POST http://localhost:3001/v1/image/upscale \
  -H "Content-Type: application/json" \
  -d '{
    "image": "BASE64_IMAGE_DATA",
    "upscaleFactor": "x2"
  }'
```

---

## 🎬 Video API

```bash
# Generate video
curl -X POST http://localhost:3001/v1/video/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cat playing with yarn",
    "durationSeconds": 8,
    "generateAudio": true
  }'

# Check status
curl "http://localhost:3001/v1/video/status?operationId=YOUR_OPERATION_ID"
```

---

## 🎵 Music API

```bash
curl -X POST http://localhost:3001/v1/music/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "An uplifting orchestral piece",
    "sampleCount": 1
  }'
```

---

## 🎙️ TTS API

```bash
# List voices
curl http://localhost:3001/v1/tts/voices

# Synthesize speech
curl -X POST http://localhost:3001/v1/tts/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, welcome to OrenaX!",
    "voiceName": "Kore"
  }'
```

---

## 📄 Document API

```bash
# Analyze document
curl -X POST http://localhost:3001/v1/document/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "document": {"mimeType": "text/plain", "bytesBase64Encoded": "SGVsbG8gV29ybGQ="},
    "prompt": "What does this say?"
  }'
```

---

## ⚙️ Configuration

```bash
# List prompts
curl http://localhost:3001/v1/prompts

# Get safety presets
curl http://localhost:3001/v1/safety/presets
```

---

## 🧪 Run Automated Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

*Last Updated: December 2024*
