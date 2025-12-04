# Troubleshooting Guide

## Frontend Error: require is not defined

### Error
```
ReferenceError: require is not defined
at useDeviceCapability (deviceCapability.ts:123:33)
```

### Penyebab
Error ini terjadi karena penggunaan `require()` di frontend code (React/Vite) yang tidak support CommonJS `require`. Frontend menggunakan ES modules.

### Quick Fix

**File: `client/utils/deviceCapability.ts` (baris 123)**

Ganti penggunaan `require()` dengan `import`:

**❌ Sebelum (Salah):**
```typescript
const someModule = require('some-module');
```

**✅ Sesudah (Benar):**
```typescript
// Di bagian atas file
import someModule from 'some-module';
// atau
import * as someModule from 'some-module';
```

### Langkah-langkah Fix

1. Buka file `client/utils/deviceCapability.ts`
2. Cari baris 123 yang menggunakan `require()`
3. Ganti dengan `import` statement di bagian atas file
4. Pastikan module yang di-import sudah terinstall di `package.json`
5. Restart dev server

### Dokumentasi Lengkap

Untuk panduan lengkap dengan contoh-contoh, lihat: **[Frontend Fix Require Error](./FRONTEND-FIX-REQUIRE-ERROR.md)**

### Catatan
- Backend (NestJS) boleh menggunakan `require()` karena berjalan di Node.js
- Frontend (React/Vite) harus menggunakan ES modules (`import/export`)

