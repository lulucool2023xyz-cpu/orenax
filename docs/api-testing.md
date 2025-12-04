# API Testing Guide

Panduan lengkap untuk testing semua endpoint autentikasi API.

## 🛠️ Tools

Anda dapat menggunakan:
- **cURL** (command line)
- **Postman** (GUI)
- **Thunder Client** (VS Code extension)
- **REST Client** (VS Code extension)

## 📝 Testing Endpoints

### 1. Register (Email/Password)

**Endpoint:** `POST /auth/register`

**Request:**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "John Doe"
  }'
```

**Expected Response (201):**
```json
{
  "message": "Registration successful. Please check your email for verification.",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600,
    "token_type": "bearer",
    "user": { ... }
  }
}
```

**Error Scenarios:**
- Email sudah terdaftar: `400 Bad Request`
- Password terlalu lemah: `400 Bad Request`
- Invalid email format: `400 Bad Request`

---

### 2. Login (Email/Password)

**Endpoint:** `POST /auth/login`

**Request:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600,
    "token_type": "bearer"
  }
}
```

**Error Scenarios:**
- Invalid credentials: `401 Unauthorized`
- Email not verified: Tergantung konfigurasi Supabase

---

### 3. Google OAuth Login

**Endpoint:** `POST /auth/google`

**Request:**
```bash
curl -X POST http://localhost:3001/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "google-access-token-here"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Google login successful",
  "user": {
    "id": "uuid-here",
    "email": "user@gmail.com",
    "name": "John Doe"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600,
    "token_type": "bearer"
  }
}
```

**Note:** Untuk mendapatkan Google access token, Anda perlu implement OAuth flow di frontend atau menggunakan Google OAuth Playground.

---

### 4. Facebook OAuth Login

**Endpoint:** `POST /auth/facebook`

**Request:**
```bash
curl -X POST http://localhost:3001/auth/facebook \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "facebook-access-token-here"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Facebook login successful",
  "user": {
    "id": "uuid-here",
    "email": "user@facebook.com",
    "name": "John Doe"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600,
    "token_type": "bearer"
  }
}
```

---

### 5. Get Current User

**Endpoint:** `GET /auth/me`

**Request:**
```bash
curl -X GET http://localhost:3001/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Expected Response (200):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true
  }
}
```

**Error Scenarios:**
- No authorization header: `401 Unauthorized`
- Invalid token: `401 Unauthorized`
- Expired token: `401 Unauthorized`

---

### 6. Logout

**Endpoint:** `POST /auth/logout`

**Request:**
```bash
curl -X POST http://localhost:3001/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Expected Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

### 7. Refresh Token

**Endpoint:** `POST /auth/refresh`

**Request:**
```bash
curl -X POST http://localhost:3001/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Token refreshed successfully",
  "session": {
    "access_token": "new-access-token",
    "refresh_token": "new-refresh-token",
    "expires_in": 3600,
    "token_type": "bearer"
  }
}
```

---

## 🔄 Testing Flow

### Complete Authentication Flow

1. **Register**
   ```bash
   # Save the access_token and refresh_token dari response
   ```

2. **Verify Email** (jika enabled di Supabase)
   - Check email dan klik verification link

3. **Login**
   ```bash
   # Login dengan email/password yang sudah diverifikasi
   # Simpan access_token untuk request berikutnya
   ```

4. **Access Protected Route**
   ```bash
   # GET /auth/me dengan Authorization header
   ```

5. **Refresh Token** (setelah token expired)
   ```bash
   # POST /auth/refresh dengan refresh_token
   ```

6. **Logout**
   ```bash
   # POST /auth/logout dengan Authorization header
   ```

---

## 📊 Postman Collection

Untuk kemudahan testing, Anda bisa import Postman collection berikut:

### Environment Variables
Buat environment di Postman dengan variables:
- `base_url`: `http://localhost:3001`
- `access_token`: (akan diisi otomatis dari response)
- `refresh_token`: (akan diisi otomatis dari response)

### Auto-set Token Script

Tambahkan di **Tests** tab untuk endpoint login/register:

```javascript
// Parse response
const response = pm.response.json();

// Set environment variables
if (response.session) {
    pm.environment.set("access_token", response.session.access_token);
    pm.environment.set("refresh_token", response.session.refresh_token);
}
```

---

## ✅ Test Checklist

- [ ] Register dengan email valid berhasil
- [ ] Register dengan email duplikat gagal
- [ ] Login dengan credentials benar berhasil
- [ ] Login dengan credentials salah gagal
- [ ] GET /auth/me dengan token valid berhasil
- [ ] GET /auth/me tanpa token gagal (401)
- [ ] GET /auth/me dengan invalid token gagal (401)
- [ ] Refresh token berhasil mendapatkan token baru
- [ ] Logout berhasil invalidate session
- [ ] Google OAuth berhasil (dengan valid token)
- [ ] Facebook OAuth berhasil (dengan valid token)

---

## 🐛 Common Issues

### Issue: "Supabase URL and Key must be provided"
**Solution:** Pastikan file `.env` sudah dikonfigurasi dengan benar

### Issue: "Invalid login credentials"
**Solution:** 
- Pastikan email sudah terdaftar
- Pastikan password benar
- Check apakah email verification required di Supabase

### Issue: OAuth token invalid
**Solution:**
- Pastikan OAuth provider sudah dikonfigurasi di Supabase
- Pastikan access token masih valid
- Check redirect URLs sudah benar

---

## 📚 Next Steps

Setelah API testing berhasil:
1. Integrate dengan frontend
2. Test OAuth flow end-to-end
3. Setup email templates di Supabase
4. Configure production environment
