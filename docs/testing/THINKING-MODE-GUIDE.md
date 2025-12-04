# Testing Guide - Updated for Gemini 2.0

**IMPORTANT UPDATE**: Model Thinking sekarang menggunakan `gemini-2.0-flash-thinking-exp` - model khusus dengan built-in reasoning!

## 🧠 Cara Kerja Thinking Mode Yang Benar

### Konsep
Ketika Anda menggunakan model `gemini-2.0-flash-thinking-exp`:
1. **AI berpikir internal dulu** - Proses reasoning tidak langsung dikirim ke user
2. **AI evaluasi sendiri** - Seperti "debat dengan diri sendiri"
3. **Hasilkan jawaban final** - Baru dikirim response yang sudah di-refine

### Model yang Tersedia

| Model | Purpose | Thinking Mode |
|-------|---------|---------------|
| `gemini-2.0-flash-exp` | Standard, fastest | ❌ No |
| `gemini-2.0-flash-thinking-exp` | **Built-in reasoning** | ✅ Yes |
| `gemini-1.5-pro` | Stable, production | ❌ No |
| `gemini-1.5-flash` | Stable, fast | ❌ No |

---

## ✅ Test Yang Benar - Thinking Mode

### Test 1: Basic Thinking Mode

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.0-flash-thinking-exp",
    "messages": [
      {
        "role": "user",
        "content": "Solve: If 2x + 5 = 15, what is x? Show your thinking process."
      }
    ]
  }'
```

**Yang Diharapkan:**
- Response menunjukkan **proses berpikir** AI
- AI memecah masalah step-by-step
- Final answer yang sudah di-refine

**Example Response:**
```json
{
  "message": {
    "role": "model",
    "content": "Let me work through this:\n\nFirst, I need to isolate x...\n2x + 5 = 15\n\nSubtracting 5 from both sides:\n2x = 10\n\nDividing by 2:\nx = 5\n\nLet me verify: 2(5) + 5 = 10 + 5 = 15 ✓\n\nTherefore, x = 5",
    "finishReason": "STOP"
  }
}
```

### Test 2: Thinking with Streaming

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -N \
  -d '{
    "model": "gemini-2.0-flash-thinking-exp",
    "messages": [
      {
        "role": "user",
        "content": "Explain quantum computing. Think carefully about the best way to explain this."
      }
    ],
    "stream": true
  }'
```

**Yang Diharapkan:**
- Streaming response dengan thinking process
- Melihat AI "berpikir" secara real-time
- Final answer yang comprehensive

### Test 3: Complex Reasoning

**Request:**
```bash
curl -X POST http://localhost:3001/api/v1/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.0-flash-thinking-exp",
    "messages": [
      {
        "role": "user",
        "content": "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost? Think through this carefully."
      }
    ]
  }'
```

**Yang Diharapkan:**
- AI menghindari jawaban intuitif yang salah ($0.10)
- Menunjukkan proses reasoning yang benar
- Jawaban final: $0.05

---

## ❌ Yang TIDAK Perlu Lagi

### Deprecated: thinkingConfig
```bash
# INI TIDAK PERLU LAGI!
{
  "thinkingConfig": {
    "thinkingBudget": 1000  // ❌ Deprecated
  }
}
```

**Mengapa?**
- Model `gemini-2.0-flash-thinking-exp` sudah punya thinking built-in
- Tidak perlu config tambahan
- Tinggal pilih model yang tepat

---

## 🚀 Testing Checklist

### Thinking Mode
- [ ] Test dengan `gemini-2.0-flash-thinking-exp`
- [ ] Verify reasoning process muncul
- [ ] Test dengan pertanyaan kompleks
- [ ] Test streaming thinking
- [ ] Compare dengan model standard

### Model Standard (No Thinking)
- [ ] Test `gemini-2.0-flash-exp` (fastest)
- [ ] Test `gemini-1.5-pro` (stable)
- [ ] Test `gemini-1.5-flash` (balanced)

---

## 🐛 Troubleshooting

### Issue: "Model not found"
**Cek:**
1. Apakah nama model benar? `gemini-2.0-flash-thinking-exp`
2. Apakah project punya akses ke model experimental?
3. Apakah region sudah benar? (us-central1)

### Issue: "Thinking tidak muncul"
**Cek:**
1. Apakah menggunakan model thinking? Bukan yang standard
2. Apakah pertanyaan cukup kompleks untuk trigger thinking?
3. Coba tambahkan "Think carefully" atau "Show your reasoning" di prompt

---

## 📊 Performance Comparison

| Model | Speed | Thinking | Best For |
|-------|-------|----------|----------|
| gemini-2.0-flash-exp | ⚡⚡⚡ Fastest | ❌ | Quick answers, simple tasks |
| gemini-2.0-flash-thinking-exp | ⚡⚡ Fast | ✅ | Complex reasoning, math, logic |
| gemini-1.5-pro | ⚡ Slower | ❌ | Production, stable |

---

## 📝 Examples

### Question Requiring Thinking
```
"A farmer has 17 sheep. All but 9 die. How many are left?"
```
**Standard Model**: Might answer 8 (incorrect intuition)
**Thinking Model**: Shows reasoning → Answer: 9

### Question NOT Requiring Thinking
```
"What is 2+2?"
```
**Use**: `gemini-2.0-flash-exp` (faster, no thinking needed)

---

## 🎯 Best Practices

1. **Use Thinking Model When:**
   - Math problems
   - Logic puzzles
   - Complex reasoning
   - Code debugging
   - Strategic planning

2. **Use Standard Model When:**
   - Simple questions
   - Fast responses needed
   - General chat
   - Creative writing

3. **Prompt Tips for Thinking:**
   - Add "Think step by step"
   - Add "Show your reasoning"
   - Add "Let's work through this carefully"

---

Untuk dokumentasi API lengkap, lihat: `docs/api/chat/api-chat.md`
