# Vertex AI Chat API - Testing Guide

Panduan lengkap untuk testing API endpoints menggunakan cURL dan Postman.

## Prerequisites

- Backend server running (`npm run start:dev`)
- Valid JWT token dari [Authentication API](./README.md)
- Google Cloud credentials configured

---

## Get JWT Token

First, dapatkan JWT token via authentication:

```bash
# Register atau Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "arieffajarmarhas@gmail.com",
    "password": "123456"
  }'
```

Response:
```json
{
  "user": { ... },
  "session": {
    "access_token": "YOUR_JWT_TOKEN_HERE",
    "refresh_token": "..."
  }
}
```

**Copy** `access_token` untuk use di request berikutnya.

---

## Test Scenarios

### 1. Basic Chat Request

**cURL**:
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Halo! Siapa kamu?"}]}'
```

**Expected Response**:
```json
{
  "message": {
    "role": "model",
    "content": "Halo! Saya OrenaX Agent, asisten AI yang dikembangkan dengan teknologi Google Cloud Vertex AI...",
    "finishReason": "STOP"
  },
  "usageMetadata": {
    "promptTokenCount": 25,
    "candidatesTokenCount": 45,
    "totalTokenCount": 70
  },
  "model": "gemini-2.5-flash",
  "conversationId": "uuid-generated"
}
```

📋 **Save** `conversationId` untuk multi-turn testing.

---

### 2. Multi-Turn Conversation

```bash
# First message
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role":"user","content":"Jelaskan tentang machine learning"}
    ]
  }'

# Continue conversation with conversation_id
CONV_ID="paste-uuid-from-previous-response"

curl -X POST "http://localhost:3001/api/v1/chat?conversation_id=${CONV_ID}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role":"user","content":"Apa perbedaannya dengan deep learning?"}
    ]
  }'
```

✅ **Verify**: Response should relate to previous context about machine learning.

---

### 3. Streaming Response

```bash
curl -X POST http://localhost 3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -N \
    -d '{
      "messages": [{"role":"user","content":"Ceritakan sebuah cerita pendek"}],
      "stream": true
    }'
```

**Expected Output** (Server-Sent Events):
```
data: {"content":"Suatu","done":false}

data: {"content":" hari","done":false}

data: {"content":" ada","done":false}

...

data: {"content":"!","done":true,"usageMetadata":{...}}

data: [DONE]
```

---

### 4. Count Tokens

```bash
curl -X POST http://localhost:3001/api/v1/chat/count-tokens \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role":"user","content":"Hello, how are you today?"}
    ]
  }'
```

**Expected Response**:
```json
{
  "totalTokens": 15,
  "model": "gemini-2.5-flash"
}
```

---

### 5. List Conversations

```bash
curl -X GET http://localhost:3001/api/v1/chat/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response**:
```json
[
  {
    "id": "uuid-1",
    "title": "Halo! Siapa kamu?",
    "model": "gemini-2.5-flash",
    "created_at": "2025-12-02T10:00:00Z",
    "updated_at": "2025-12-02T10:05:00Z"
  }
]
```

---

### 6. Get Conversation History

```bash
CONV_ID="paste-conversation-uuid"

curl -X GET "http://localhost:3001/api/v1/chat/conversations/${CONV_ID}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response**:
```json
[
  {
    "role": "user",
    "content": "Halo! Siapa kamu?"
  },
  {
    "role": "model",
    "content": "Halo! Saya OrenaX Agent..."
  }
]
```

---

### 7. Delete Conversation

```bash
CONV_ID="paste-conversation-uuid"

curl -X DELETE "http://localhost:3001/api/v1/chat/conversations/${CONV_ID}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response**: Status `204 No Content` (empty response)

---

## Advanced Testing

### Test Different Models

```bash
# Gemini 2.5 Pro (more capable)
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-pro",
    "messages": [{"role":"user","content":"Explain quantum computing"}]
  }'

# Gemini 2.5 Flash (faster, default)
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [{"role":"user","content":"Quick facts about AI"}]
  }'
```

### Test Generation Config

```bash
# Creative writing dengan high temperature
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role":"user","content":"Write a creative poem"}],
    "generationConfig": {
      "temperature": 1.5,
      "maxOutputTokens": 1024
    }
  }'

# Deterministic response dengan low temperature
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role":"user","content":"What is 2+2?"}],
    "generationConfig": {
      "temperature": 0.1,
      "maxOutputTokens": 512
    }
  }'
```

---

## Error Testing

### Test Without Authentication

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role":"user","content":"Hello"}]
  }'
```

**Expected**: `401 Unauthorized`

### Test Invalid Model

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "invalid-model",
    "messages": [{"role":"user","content":"Hello"}]
  }'
```

**Expected**: `400 Bad Request` or `500 Internal Server Error`

### Test Empty Messages

```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages":[]}'
```

**Expected**: `400 Bad Request`

---

## Postman Collection

### Import Collection

1. Open Postman
2. Click **"Import"**
3. Create new collection: **"Vertex AI Chat API"**

### Environment Variables

Setup environment:
```
BASE_URL: http://localhost:3001
JWT_TOKEN: <your-jwt-token>
CONV_ID: <conversation-uuid>
```

### Collection Structure

```
Vertex AI Chat API/
├── Auth/
│   ├── Login
│   └── Register
├── Chat/
│   ├── Basic Chat
│   ├── Multi-Turn Chat
│   ├── Streaming Chat
│   └── Count Tokens
└── Conversations/
    ├── List Conversations
    ├── Get History
    └── Delete Conversation
```

### Sample Request (Postman)

**POST {{BASE_URL}}/api/v1/chat**

Headers:
```
Authorization: Bearer {{JWT_TOKEN}}
Content-Type: application/json
```

Body (JSON):
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Halo! Siapa kamu?"
    }
  ]
}
```

---

## Automated Testing Script

Save as `test-chat-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3001"
JWT_TOKEN="YOUR_TOKEN_HERE"

echo "🧪 Testing Vertex AI Chat API..."

# Test 1: Basic Chat
echo "\n1️⃣ Basic Chat..."
curl -s -X POST ${BASE_URL}/api/v1/chat \
  -H "Authorization: Bearer  ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Test basic chat"}]}' \
  | jq '.message.content'

# Test 2: Count Tokens
echo "\n2️⃣ Count Tokens..."
curl -s -X POST ${BASE_URL}/api/v1/chat/count-tokens \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Test token counting"}]}' \
  | jq '.totalTokens'

# Test 3: List Conversations
echo "\n3️⃣ List Conversations..."
curl -s -X GET ${BASE_URL}/api/v1/chat/conversations \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  | jq 'length'

echo "\n✅ Tests Complete!"
```

Run:
```bash
chmod +x test-chat-api.sh
./test-chat-api.sh
```

---

## Monitoring & Debugging

### Check Logs

```bash
# Backend logs
npm run start:dev

# Look for:
# - "Generating content with model: ..."
# - "Tokens: X (prompt: Y, response: Z)"
# - Error messages with stack traces
```

### Check Supabase

1. Login ke Supabase Dashboard
2. Go to **Table Editor** → `conversations`
3. Verify conversations are being created
4. Check `messages` table for chat history

### Check Google Cloud Logs

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. **Navigation menu** → **Logging** → **Logs Explorer**
3. Filter: `resource.type="aiplatform.googleapis.com/Endpoint"`
4. View API requests dan responses

---

## Performance Benchmarks

Expected response times:

| Operation | Expected Time | Notes |
|-----------|---------------|-------|
| Basic Chat (non-streaming) | 2-5s | Depends on response length |
| Streaming (first chunk) | < 1s | Initial latency |
| Count Tokens | < 100ms | Estimation only |
| List Conversations | < 200ms | Database query |
| Get History | < 500ms | Depends on message count |

---

## Troubleshooting

### Issue: "GOOGLE_CLOUD_PROJECT not set"

**Solution**: Check `.env` file configuration

### Issue: "Permission denied"

**Solutions**:
- Verify Service Account permissions
- Check Vertex AI API enabled
- Wait for IAM propagation (up to 5 minutes)

### Issue: "Rate limit exceeded"

**Solutions**:
- Wait 60 seconds and retry
- Implement exponential backoff
- Request quota increase

### Issue: "Conversation not found"

**Solutions**:
- Verify `conversation_id` is valid UUID
- Check conversation belongs to authenticated user
- Verify Row Level Security policies in Supabase

---

## Next Steps

✅ API testing complete! Next:
- 📖 [API Documentation](./api-chat.md) - Full API reference
- 💾 [Conversation Storage](./conversation-storage.md) - Database schema
- 🔧 [Setup Guide](./vertex-ai-setup.md) - Google Cloud configuration
