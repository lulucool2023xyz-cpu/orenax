# Database Documentation

Dokumentasi database schema dan conversation storage.

## 📄 Files

### [schema.sql](./schema.sql)
SQL schema untuk Supabase database:
- `conversations` table - Metadata percakapan
- `messages` table - Pesan individual
- Row Level Security (RLS) policies
- Indexes untuk performance
- Triggers untuk auto-update timestamps

### [conversation-storage.md](./conversation-storage.md)
Panduan lengkap conversation management:
- Database schema detail
- Query patterns
- RLS policies
- Analytics queries
- Performance optimization
- Security best practices

---

## Quick Start

### 1. Run Schema
```bash
# Copy schema.sql content
# Paste di Supabase SQL Editor
# Execute
```

### 2. Verify Tables
```sql
SELECT * FROM conversations LIMIT 1;
SELECT * FROM messages LIMIT 1;
```

### 3. Test RLS
```sql
-- Should only return your conversations
SELECT * FROM conversations;
```

---

## Quick Links

- [Back to Main Documentation](../README.md)
- [API Chat Documentation](../api/chat/api-chat.md)
- [Testing Guide](../testing/TESTING-GUIDE.md)
