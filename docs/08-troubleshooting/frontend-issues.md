# Fix Frontend Error: require is not defined

## Error Details

```
ReferenceError: require is not defined
at useDeviceCapability (deviceCapability.ts:123:33)
```

## Lokasi Error

File: `client/utils/deviceCapability.ts` (baris 123)

## Penyebab

Frontend React/Vite tidak support CommonJS `require()`. Harus menggunakan ES modules (`import/export`).

## Solusi Lengkap

### Langkah 1: Buka File yang Error

Buka file: `client/utils/deviceCapability.ts`

### Langkah 2: Cari Baris yang Menggunakan `require()`

Cari baris sekitar 123 yang menggunakan `require()`. Contoh:

**❌ Kode yang Error (Sebelum):**
```typescript
// Di dalam useDeviceCapability hook atau function
const someModule = require('some-module');
// atau
const { someFunction } = require('some-module');
```

### Langkah 3: Ganti dengan `import`

**✅ Kode yang Benar (Sesudah):**

**Untuk default export:**
```typescript
// Di bagian atas file (setelah import lainnya)
import someModule from 'some-module';

// Kemudian gunakan di dalam function
// someModule sudah tersedia
```

**Untuk named export:**
```typescript
// Di bagian atas file
import { someFunction } from 'some-module';

// Atau import semua
import * as someModule from 'some-module';
```

**Untuk dynamic import (jika perlu):**
```typescript
// Di dalam function/hook
const loadModule = async () => {
  const module = await import('some-module');
  return module.default; // atau module.someFunction
};

// Gunakan dengan await
const module = await loadModule();
```

### Langkah 4: Contoh Fix Lengkap

**Sebelum (Error):**
```typescript
// deviceCapability.ts
export const useDeviceCapability = () => {
  // ... code lainnya
  
  // ❌ ERROR: require tidak tersedia di browser
  const deviceInfo = require('device-info-library');
  
  return {
    // ... return values
  };
};
```

**Sesudah (Fixed):**
```typescript
// deviceCapability.ts
// ✅ Import di bagian atas file
import deviceInfo from 'device-info-library';
// atau
import { getDeviceInfo } from 'device-info-library';

export const useDeviceCapability = () => {
  // ... code lainnya
  
  // ✅ Gunakan import yang sudah dideklarasikan
  const info = deviceInfo.getInfo();
  // atau
  const info = getDeviceInfo();
  
  return {
    // ... return values
  };
};
```

### Langkah 5: Jika Menggunakan Dynamic Import

Jika module perlu di-load secara dinamis:

```typescript
// deviceCapability.ts
export const useDeviceCapability = () => {
  const [deviceInfo, setDeviceInfo] = useState(null);
  
  useEffect(() => {
    // ✅ Dynamic import dengan async/await
    const loadDeviceInfo = async () => {
      const module = await import('device-info-library');
      setDeviceInfo(module.default);
    };
    
    loadDeviceInfo();
  }, []);
  
  return {
    deviceInfo,
    // ... return values
  };
};
```

### Langkah 6: Pastikan Package Terinstall

Pastikan package yang di-import sudah terinstall:

```bash
cd client  # atau direktori frontend Anda
npm install device-info-library  # ganti dengan nama package yang sebenarnya
```

### Langkah 7: Restart Dev Server

Setelah fix, restart dev server:

```bash
# Stop server (Ctrl+C)
# Kemudian start lagi
npm run dev
# atau
npm run start
```

## Common Patterns

### Pattern 1: Conditional Require (Salah)
```typescript
// ❌ SALAH
const module = process.env.NODE_ENV === 'production' 
  ? require('prod-module') 
  : require('dev-module');
```

**Fix:**
```typescript
// ✅ BENAR
import prodModule from 'prod-module';
import devModule from 'dev-module';

const module = process.env.NODE_ENV === 'production' ? prodModule : devModule;
```

### Pattern 2: Require dengan Path Dinamis
```typescript
// ❌ SALAH
const module = require(`./modules/${moduleName}`);
```

**Fix:**
```typescript
// ✅ BENAR - Dynamic import
const loadModule = async (moduleName: string) => {
  const module = await import(`./modules/${moduleName}`);
  return module.default;
};
```

## Checklist

- [ ] Buka file `client/utils/deviceCapability.ts`
- [ ] Cari semua penggunaan `require()`
- [ ] Ganti dengan `import` statement di bagian atas file
- [ ] Pastikan package sudah terinstall di `package.json`
- [ ] Restart dev server
- [ ] Test aplikasi

## Masih Error?

Jika masih error setelah fix:

1. **Cek apakah package terinstall:**
   ```bash
   npm list device-info-library  # ganti dengan nama package
   ```

2. **Cek apakah ada multiple `require()` di file yang sama:**
   - Cari semua `require(` di file tersebut
   - Ganti semuanya dengan `import`

3. **Cek apakah ada circular dependency:**
   - Pastikan tidak ada import circular

4. **Clear cache dan rebuild:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

## Catatan Penting

- ✅ **Backend (NestJS)** boleh menggunakan `require()` karena berjalan di Node.js
- ❌ **Frontend (React/Vite)** HARUS menggunakan ES modules (`import/export`)
- ✅ **Dynamic import** (`import()`) boleh digunakan di frontend untuk lazy loading

## Quick Reference

| Environment | require() | import | Dynamic import |
|------------|-----------|--------|----------------|
| Node.js (Backend) | ✅ Ya | ✅ Ya | ✅ Ya |
| Browser (Frontend) | ❌ Tidak | ✅ Ya | ✅ Ya |





