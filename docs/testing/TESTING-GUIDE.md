# Feature Testing Guide - OrenaX Backend

Panduan lengkap untuk testing semua fitur Vertex AI di OrenaX Backend.

## 📋 Prerequisites

1. **Server Running**
   ```bash
   cd back_end
   npm run start:dev
   ```

2. **Authentication Token**
   ```bash
   # Login untuk mendapatkan token
   curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "your-email@example.com",
       "password": "your-password"
     }'
   
   # Simpan access_token dari response
   export TOKEN="your-access-token-here"
   ```

3. **Tools**
   - cURL (command line)
   - Postman (GUI)
   - Thunder Client (VS Code)

---

## 🧠 Testing Thinking Mode

Thinking Mode memungkinkan AI untuk "berpikir" sebelum menjawab, menampilkan proses reasoning.

### Gemini 2.5 - Thinking Budget

Gemini 2.5 menggunakan `thinkingBudget` (jumlah token untuk thinking).

#### Test 1: Basic Thinking Mode

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [
      {
        "role": "user",
        "content": "Solve this math problem step by step: If 2x + 5 = 15, what is x?"
      }
    ],
    "thinkingConfig": {
      "thinkingBudget": 1000
    }
  }'
```

**Expected Response:**
```json
{
  "message": {
    "role": "model",
    "content": "Let me solve this step by step:\n\n1. Start with: 2x + 5 = 15\n2. Subtract 5 from both sides: 2x = 10\n3. Divide by 2: x = 5\n\nTherefore, x = 5",
    "finishReason": "STOP"
  },
  "usageMetadata": {
    "promptTokenCount": 25,
    "candidatesTokenCount": 45,
    "totalTokenCount": 70
  },
  "model": "gemini-2.5-flash"
}
```

#### Test 2: Thinking Mode dengan Streaming

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -N \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [
      {
        "role": "user",
        "content": "Explain quantum computing in simple terms"
      }
    ],
    "thinkingConfig": {
      "thinkingBudget": 2000
    },
    "stream": true
  }'
```

**Expected Output (SSE):**
```
data: {"content":"Let","done":false}

data: {"content":" me","done":false}

data: {"content":" think","done":false}

data: {"content":" about","done":false}

data: {"content":" this...","done":false}

data: {"content":"\n\nQuantum","done":false}

data: {"content":" computing","done":false}

...

data: {"content":"","done":true,"usageMetadata":{...}}

data: [DONE]
```

**Verification:**
- ✅ Response menunjukkan proses thinking
- ✅ Streaming berjalan lancar
- ✅ Token usage tercatat

#### Test 3: Different Thinking Budgets

**Low Budget (500 tokens):**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [{"role": "user", "content": "What is 2+2?"}],
    "thinkingConfig": {"thinkingBudget": 500}
  }'
```

**High Budget (5000 tokens):**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-pro",
    "messages": [{"role": "user", "content": "Explain the theory of relativity"}],
    "thinkingConfig": {"thinkingBudget": 5000}
  }'
```

**Observation:**
- Low budget: Jawaban lebih cepat, thinking minimal
- High budget: Reasoning lebih detail, thinking lebih dalam

---

### Gemini 3 - Thinking Level

Gemini 3 Preview menggunakan `thinkingLevel` (LOW atau HIGH).

#### Test 4: Gemini 3 with LOW Thinking

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3-pro-preview",
    "messages": [
      {
        "role": "user",
        "content": "What are the benefits of exercise?"
      }
    ],
    "thinkingConfig": {
      "thinkingLevel": "LOW"
    }
  }'
```

#### Test 5: Gemini 3 with HIGH Thinking

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3-pro-preview",
    "messages": [
      {
        "role": "user",
        "content": "Analyze the economic impact of artificial intelligence"
      }
    ],
    "thinkingConfig": {
      "thinkingLevel": "HIGH"
    },
    "stream": true
  }'
```

**Comparison:**
- `LOW`: Faster response, basic reasoning
- `HIGH`: Deeper analysis, more comprehensive thinking

---

## 🌐 Testing Grounding

Grounding memungkinkan AI mengakses data real-time dari Google Search dan Maps.

### Google Search Grounding

#### Test 6: Basic Google Search

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What are the latest news about artificial intelligence in 2025?"
      }
    ],
    "groundingConfig": {
      "googleSearch": {}
    }
  }'
```

**Expected Response:**
```json
{
  "message": {
    "role": "model",
    "content": "Based on recent news, here are the latest AI developments in 2025:\n\n1. ...\n2. ...\n\n[Sources: ...]",
    "finishReason": "STOP"
  },
  "groundingMetadata": {
    "searchUrls": [
      "https://example.com/ai-news-1",
      "https://example.com/ai-news-2"
    ],
    "groundingChunks": [...]
  }
}
```

**Verification:**
- ✅ Response includes current information
- ✅ `groundingMetadata` contains search URLs
- ✅ Sources are cited

#### Test 7: Google Search with Domain Exclusion

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Latest technology trends"
      }
    ],
    "groundingConfig": {
      "googleSearch": {
        "excludeDomains": ["wikipedia.org", "reddit.com"]
      }
    }
  }'
```

**Verification:**
- ✅ Search results exclude specified domains
- ✅ Sources are from other websites

---

### Google Maps Grounding

#### Test 8: Basic Google Maps

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Find the best Italian restaurants near Times Square, New York"
      }
    ],
    "groundingConfig": {
      "googleMaps": {
        "enableWidget": true
      }
    }
  }'
```

**Expected Response:**
```json
{
  "message": {
    "role": "model",
    "content": "Here are some top Italian restaurants near Times Square:\n\n1. Carmine's Italian Restaurant\n   - Address: 200 W 44th St, New York\n   - Rating: 4.5/5\n\n2. Becco\n   - Address: 355 W 46th St, New York\n   - Rating: 4.4/5\n\n...",
    "finishReason": "STOP"
  },
  "groundingMetadata": {
    "mapWidget": {...},
    "locations": [...]
  }
}
```

**Verification:**
- ✅ Response includes real restaurant data
- ✅ Addresses and ratings are current
- ✅ Map widget data available

#### Test 9: Location-based Query

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What are the tourist attractions in Paris?"
      }
    ],
    "groundingConfig": {
      "googleMaps": {
        "enableWidget": false
      }
    }
  }'
```

**Verification:**
- ✅ Real tourist attractions listed
- ✅ Location information accurate

---

### Combined Grounding

#### Test 10: Google Search + Maps Together

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I want to visit the best coffee shops in Seattle. Tell me about them and their locations."
      }
    ],
    "groundingConfig": {
      "googleSearch": {},
      "googleMaps": {
        "enableWidget": true
      }
    }
  }'
```

**Expected:**
- ✅ Search results for coffee shop reviews
- ✅ Map data with locations
- ✅ Combined information in response

---

## 🌊 Testing Streaming Responses

Streaming menggunakan Server-Sent Events (SSE) untuk real-time responses.

#### Test 11: Basic Streaming

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -N \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Write a short story about a robot"
      }
    ],
    "stream": true
  }'
```

**Expected Output:**
```
data: {"content":"Once","done":false}

data: {"content":" upon","done":false}

data: {"content":" a","done":false}

data: {"content":" time","done":false}

...

data: {"content":"The End.","done":true,"usageMetadata":{...}}

data: [DONE]
```

**Verification:**
- ✅ Content streams word by word
- ✅ `done: false` until completion
- ✅ Final chunk has `done: true` with metadata
- ✅ `[DONE]` signal at end

#### Test 12: Streaming + Thinking Mode

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -N \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [
      {
        "role": "user",
        "content": "Explain blockchain technology step by step"
      }
    ],
    "thinkingConfig": {
      "thinkingBudget": 2000
    },
    "stream": true
  }'
```

**Verification:**
- ✅ Thinking process visible in stream
- ✅ Step-by-step explanation streams
- ✅ Token usage in final chunk

#### Test 13: Streaming + Grounding

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -N \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What is happening in the world today?"
      }
    ],
    "groundingConfig": {
      "googleSearch": {}
    },
    "stream": true
  }'
```

**Verification:**
- ✅ Real-time news streams
- ✅ Sources included in stream
- ✅ Grounding metadata in final chunk

---

## 💬 Testing Conversation Management

#### Test 14: Multi-turn Conversation

**Step 1: Start Conversation**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "My name is John and I love pizza"
      }
    ]
  }'

# Save conversation_id from response
```

**Step 2: Continue Conversation**
```bash
curl -X POST "http://localhost:3001/api/v1/chat?conversation_id=CONVERSATION_ID_HERE" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What is my name and what do I like?"
      }
    ]
  }'
```

**Expected:**
AI should remember: "Your name is John and you love pizza"

**Verification:**
- ✅ AI remembers previous context
- ✅ Conversation ID links messages
- ✅ History maintained

#### Test 15: Get Conversation History

**Request:**
```bash
curl -X GET "http://localhost:3001/api/v1/chat/conversations/CONVERSATION_ID" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
[
  {
    "role": "user",
    "content": "My name is John and I love pizza"
  },
  {
    "role": "model",
    "content": "Nice to meet you, John! Pizza is delicious..."
  },
  {
    "role": "user",
    "content": "What is my name and what do I like?"
  },
  {
    "role": "model",
    "content": "Your name is John and you love pizza!"
  }
]
```

#### Test 16: List All Conversations

**Request:**
```bash
curl -X GET http://localhost:3001/api/v1/chat/conversations \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
[
  {
    "id": "uuid-1",
    "title": "My name is John and I love pizza",
    "model": "gemini-2.5-flash",
    "created_at": "2025-12-03T10:00:00Z",
    "updated_at": "2025-12-03T10:05:00Z"
  },
  {
    "id": "uuid-2",
    "title": "Explain quantum computing",
    "model": "gemini-2.5-pro",
    "created_at": "2025-12-02T15:30:00Z",
    "updated_at": "2025-12-02T15:45:00Z"
  }
]
```

---

## 🔢 Testing Token Counting

#### Test 17: Count Tokens

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/chat/count-tokens \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you today?"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "totalTokens": 8,
  "model": "gemini-2.5-flash"
}
```

**Use Cases:**
- Estimate API costs before sending
- Validate input doesn't exceed limits
- Optimize prompt engineering

---

## 🧪 Advanced Testing Scenarios

### Scenario 1: Complex Query with All Features

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -N \
  -d '{
    "model": "gemini-2.5-pro",
    "messages": [
      {
        "role": "user",
        "content": "Find the best sushi restaurants in Tokyo and explain why Japanese cuisine is popular worldwide"
      }
    ],
    "thinkingConfig": {
      "thinkingBudget": 3000
    },
    "groundingConfig": {
      "googleSearch": {},
      "googleMaps": {
        "enableWidget": true
      }
    },
    "stream": true,
    "generationConfig": {
      "temperature": 1.2,
      "maxOutputTokens": 4096
    }
  }'
```

**Features Tested:**
- ✅ Thinking mode (reasoning about cuisine)
- ✅ Google Search (why cuisine is popular)
- ✅ Google Maps (restaurant locations)
- ✅ Streaming (real-time response)
- ✅ Custom generation config

---

## ✅ Testing Checklist

### Thinking Mode
- [ ] Gemini 2.5 with low budget (500)
- [ ] Gemini 2.5 with high budget (5000)
- [ ] Gemini 3 with LOW level
- [ ] Gemini 3 with HIGH level
- [ ] Thinking + Streaming
- [ ] Thinking process visible in response

### Grounding
- [ ] Google Search basic
- [ ] Google Search with domain exclusion
- [ ] Google Maps basic
- [ ] Google Maps with widget
- [ ] Combined Search + Maps
- [ ] Grounding metadata present

### Streaming
- [ ] Basic streaming works
- [ ] Streaming + Thinking
- [ ] Streaming + Grounding
- [ ] SSE format correct
- [ ] [DONE] signal received

### Conversation Management
- [ ] Create new conversation
- [ ] Continue existing conversation
- [ ] Get conversation history
- [ ] List all conversations
- [ ] Delete conversation
- [ ] Context maintained across turns

### Token Counting
- [ ] Count tokens for simple message
- [ ] Count tokens for complex message
- [ ] Token count accurate

---

## 🐛 Troubleshooting

### Issue: "Unauthorized"
**Solution:** Check JWT token is valid and not expired

### Issue: Streaming not working
**Solution:** Use `-N` flag with cURL or ensure client supports SSE

### Issue: Grounding returns no results
**Solution:** 
- Check internet connection
- Verify Google Cloud APIs enabled
- Try different search queries

### Issue: Thinking mode not visible
**Solution:**
- Ensure `thinkingConfig` is in request
- Use correct model (2.5 or 3)
- Check streaming is enabled to see process

---

## 📊 Performance Benchmarks

| Feature | Avg Response Time | Token Usage |
|---------|------------------|-------------|
| Basic Chat | 1-2s | 50-200 |
| Thinking (Low) | 2-4s | 200-500 |
| Thinking (High) | 5-10s | 1000-5000 |
| Grounding | 3-6s | 300-800 |
| Streaming | Real-time | Varies |

---

## 📝 Notes

- **Rate Limits**: 60 requests/minute per project
- **Token Limits**: 1M input, 8K output per request
- **Streaming**: Use SSE-compatible clients
- **Grounding**: Requires internet connection
- **Thinking**: Higher budgets = slower but deeper reasoning

---

## 🎯 Next Steps

1. Test each feature individually
2. Combine features for complex scenarios
3. Monitor token usage and costs
4. Optimize prompts based on results
5. Integrate with frontend

Untuk pertanyaan lebih lanjut, lihat [API Chat Documentation](../api/chat/api-chat.md).
