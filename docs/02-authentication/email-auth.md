# Email/Password Authentication

Autentikasi standar menggunakan email dan password via Supabase.

## Endpoints

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (Success):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "user_metadata": {
      "name": "John Doe"
    },
    "created_at": "2024-12-04T10:00:00.000Z"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "refresh_token_here",
    "expires_in": 3600,
    "token_type": "bearer"
  }
}
```

---

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "refresh_token_here",
    "expires_in": 3600
  }
}
```

---

### Get Current User

```http
GET /auth/me
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "user_metadata": {
    "name": "John Doe"
  },
  "created_at": "2024-12-04T10:00:00.000Z"
}
```

---

### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

**Response:**
```json
{
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token",
  "expires_in": 3600
}
```

---

### Logout

```http
POST /auth/logout
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

## Password Requirements

- Minimum 6 characters
- Recommended: mix of uppercase, lowercase, numbers, and symbols

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Invalid email format | Email tidak valid |
| 400 | Password too short | Password kurang dari 6 karakter |
| 401 | Invalid credentials | Email atau password salah |
| 409 | User already exists | Email sudah terdaftar |
| 500 | Internal server error | Error di server |

---

## cURL Examples

### Register
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

### Get Current User
```bash
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
