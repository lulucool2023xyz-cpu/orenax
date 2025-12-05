# Setup OAuth Providers (Google & Facebook)

Panduan lengkap untuk mengkonfigurasi Google dan Facebook OAuth di Supabase.

## 🔵 Google OAuth Setup

### 1. Buat Project di Google Cloud Console

1. Kunjungi [Google Cloud Console](https://console.cloud.google.com)
2. Buat project baru atau pilih project yang ada
3. Enable **Google+ API**

### 2. Create OAuth Credentials

1. Pergi ke **APIs & Services** > **Credentials**
2. Klik **Create Credentials** > **OAuth client ID**
3. Pilih **Application type**: Web application
4. Tambahkan **Authorized redirect URIs**:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
5. Copy **Client ID** dan **Client Secret**

### 3. Configure di Supabase

1. Login ke Supabase Dashboard
2. Pergi ke **Authentication** > **Providers**
3. Enable **Google**
4. Paste **Client ID** dan **Client Secret**
5. Save

### 4. Testing Google OAuth

Google OAuth memerlukan frontend untuk handle OAuth flow. Flow-nya:

1. Frontend redirect user ke Google login
2. User authorize aplikasi
3. Google redirect kembali dengan authorization code
4. Frontend exchange code untuk access token
5. Frontend kirim access token ke backend endpoint `/auth/google`

## 🔷 Facebook OAuth Setup

### 1. Buat App di Facebook Developers

1. Kunjungi [Facebook Developers](https://developers.facebook.com)
2. Klik **My Apps** > **Create App**
3. Pilih **Consumer** dan next
4. Isi nama app dan email

### 2. Configure Facebook Login

1. Di dashboard app, tambahkan **Facebook Login** product
2. Pergi ke **Settings** > **Basic**
3. Copy **App ID** dan **App Secret**

### 3. Add OAuth Redirect URIs

1. Pergi ke **Facebook Login** > **Settings**
2. Tambahkan **Valid OAuth Redirect URIs**:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
3. Save

### 4. Configure di Supabase

1. Login ke Supabase Dashboard
2. Pergi ke **Authentication** > **Providers**
3. Enable **Facebook**
4. Paste **Facebook App ID** dan **Facebook App Secret**
5. Save

### 5. Testing Facebook OAuth

Facebook OAuth juga memerlukan frontend untuk handle OAuth flow:

1. Frontend redirect user ke Facebook login
2. User authorize aplikasi
3. Facebook redirect kembali dengan authorization code
4. Frontend exchange code untuk access token
5. Frontend kirim access token ke backend endpoint `/auth/facebook`

## 🔄 OAuth Flow Diagram

```
┌─────────┐           ┌──────────┐           ┌─────────────┐           ┌─────────┐
│         │           │          │           │             │           │         │
│ Frontend├──────────►│  Google  ├──────────►│   Supabase  ├──────────►│ Backend │
│         │  Redirect │    or    │  Callback │    Auth     │  Token    │   API   │
│         │◄──────────┤ Facebook │◄──────────┤             │◄──────────┤         │
└─────────┘   Token   └──────────┘           └─────────────┘   User    └─────────┘
                                                                Info
```

## 📝 Important Notes

> **⚠️ Production Considerations**
> 
> - Untuk production, tambahkan domain production Anda ke authorized redirect URIs
> - Jangan expose Client Secret di frontend
> - Backend endpoint hanya menerima access token yang sudah valid
> - Gunakan HTTPS untuk production

## 🧪 Testing OAuth Without Frontend

Untuk testing tanpa frontend, Anda bisa menggunakan Supabase client library di Node.js atau test tools seperti Postman dengan OAuth 2.0 authentication flow.

Namun, cara paling mudah adalah membuat simple frontend page untuk handle OAuth redirect dan send token ke backend API.

## 🔗 Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook OAuth Documentation](https://developers.facebook.com/docs/facebook-login)
- [Supabase OAuth Guide](https://supabase.com/docs/guides/auth/social-login)
