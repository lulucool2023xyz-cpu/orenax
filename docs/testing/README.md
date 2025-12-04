# Testing Documentation

Panduan testing untuk semua fitur OrenaX Backend.

## 📄 Testing Guides

### [TESTING-GUIDE.md](./TESTING-GUIDE.md) ⭐ **NEW!**
**Panduan testing lengkap untuk semua fitur Vertex AI:**

#### Fitur yang Dicakup:
1. **🧠 Thinking Mode**
   - Gemini 2.5 dengan `thinkingBudget`
   - Gemini 3 dengan `thinkingLevel`
   - Thinking + Streaming
   - 5 test cases dengan contoh lengkap

2. **🌐 Grounding**
   - Google Search grounding
   - Google Maps grounding
   - Combined grounding
   - 5 test cases dengan expected outputs

3. **🌊 Streaming**
   - Server-Sent Events (SSE)
   - Streaming + Thinking
   - Streaming + Grounding
   - 3 test cases

4. **💬 Conversation Management**
   - Multi-turn conversations
   - Conversation history
   - List conversations
   - 3 test cases

5. **🔢 Token Counting**
   - Estimate costs
   - Validate inputs
   - 1 test case

**Total: 17 detailed test cases!**

### [api-testing-chat.md](./api-testing-chat.md)
Testing untuk chat API endpoints (legacy, lihat TESTING-GUIDE.md untuk versi terbaru)

---

## Quick Start Testing

### 1. Get Authentication Token
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "password": "password"}'

# Save the access_token
export TOKEN="your-token-here"
```

### 2. Test Basic Chat
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'
```

### 3. Test Thinking Mode
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [{"role": "user", "content": "Solve: 2x + 5 = 15"}],
    "thinkingConfig": {"thinkingBudget": 1000},
    "stream": true
  }'
```

### 4. Test Grounding
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Latest AI news?"}],
    "groundingConfig": {"googleSearch": {}}
  }'
```

Lihat [TESTING-GUIDE.md](./TESTING-GUIDE.md) untuk 17 test cases lengkap!

---

## Testing Checklist

- [ ] Authentication (login, register)
- [ ] Basic chat
- [ ] Thinking Mode (Gemini 2.5 & 3)
- [ ] Google Search grounding
- [ ] Google Maps grounding
- [ ] Streaming responses
- [ ] Multi-turn conversations
- [ ] Token counting

---

## Quick Links

- [Back to Main Documentation](../README.md)
- [API Chat Documentation](../api/chat/api-chat.md)
- [Database Schema](../database/schema.sql)
