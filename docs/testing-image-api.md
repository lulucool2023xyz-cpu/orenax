# Testing Image API - Quick Start

## Setup GCS Bucket (REQUIRED)

Sebelum testing, Anda harus membuat GCS bucket terlebih dahulu. Pilih salah satu metode:

### Metode 1: Via Google Cloud Console (Dashboard Web)

#### Step 1: Buka Cloud Storage
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pastikan project yang benar sudah dipilih: **gen-lang-client-0353058458**
3. Buka menu ☰ (hamburger) di kiri atas
4. Navigasi ke **Cloud Storage** → **Buckets**
5. Atau langsung ke: https://console.cloud.google.com/storage/browser

#### Step 2: Create Bucket
1. Click tombol **CREATE BUCKET** (biru, di atas)
2. Isi konfigurasi bucket:

   **Name your bucket:**
   - Bucket name: `orenax-vertex-ai-images`
   - ✅ Pastikan nama unik dan available (centang hijau muncul)

   **Choose where to store your data:**
   - Location type: Pilih **Region**
   - Location: Pilih **us-central1 (Iowa)**
   
   **Choose a storage class for your data:**
   - Storage class: Pilih **Standard**
   
   **Choose how to control access to objects:**
   - ⚠️ IMPORTANT: **UNCHECK** (hilangkan centang) pada:
     - ❌ "Enforce public access prevention on this bucket"
   - Access control: Pilih **Fine-grained** (individual object-level permissions)
   
   **Choose how to protect object data:**
   - Protection tools: Biarkan default (None)

3. Click **CREATE**

#### Step 3: Make Bucket Public
1. Setelah bucket dibuat, Anda akan diarahkan ke halaman bucket
2. Click tab **PERMISSIONS** (di bagian atas)
3. Click **GRANT ACCESS**
4. Isi form:
   - New principals: `allUsers`
   - Select a role: **Cloud Storage** → **Storage Object Viewer**
5. Click **SAVE**
6. Akan muncul warning "This resource is public and can be accessed by anyone" - click **ALLOW PUBLIC ACCESS**

#### Step 4: Create Folder Structure
1. Masih di halaman bucket, click tab **OBJECTS**
2. Click **CREATE FOLDER**
3. Buat folder berikut satu per satu:
   - Folder name: `images` → Click **CREATE**
   - Masuk ke folder `images`, lalu create sub-folders:
     - `generated`
   - Masuk ke folder `generated`, lalu create sub-folders:
     - `text-to-image`
     - `upscale`
     - `edit`
     - `customize`
     - `virtual-try-on`
     - `product-recontext`

#### Step 5: Verify Setup
1. Kembali ke root bucket
2. Pastikan struktur folder seperti ini:
   ```
   orenax-vertex-ai-images/
   └── images/
       └── generated/
           ├── text-to-image/
           ├── upscale/
           ├── edit/
           ├── customize/
           ├── virtual-try-on/
           └── product-recontext/
   ```

3. Verify public access:
   - Tab **PERMISSIONS** → lihat "Public Access": **Public to internet** ✅

✅ **Setup Complete!** Bucket sudah siap digunakan.

---

### Metode 2: Via Command Line (gcloud CLI)

Jika Anda prefer menggunakan command line:

```bash
# Set variables
export PROJECT_ID=gen-lang-client-0353058458
export BUCKET_NAME=orenax-vertex-ai-images
export REGION=us-central1

# Create bucket
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME/

# Enable public access
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Create folder structure
gsutil -m mkdir gs://$BUCKET_NAME/images/generated/text-to-image/
gsutil -m mkdir gs://$BUCKET_NAME/images/generated/upscale/
gsutil -m mkdir gs://$BUCKET_NAME/images/generated/edit/
gsutil -m mkdir gs://$BUCKET_NAME/images/generated/customize/
gsutil -m mkdir gs://$BUCKET_NAME/images/generated/virtual-try-on/
gsutil -m mkdir gs://$BUCKET_NAME/images/generated/product-recontext/
```

---

## 1. Get JWT Token

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_email@example.com",
    "password": "your_password"
  }'
```

Save the `access_token` dari response.

## 2. Test Text-to-Image (Minimal)

```bash
curl -X POST http://localhost:3001/api/v1/image/text-to-image \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset over mountains"
  }'
```

## 3. Test Text-to-Image (Complete)

```bash
curl -X POST http://localhost:3001/api/v1/image/text-to-image \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "imagen-3.0-generate-001",
    "prompt": "A beautiful sunset over a mountain landscape with vibrant colors",
    "sampleCount": 2,
    "addWatermark": true,
    "negativePrompt": "blurry, low quality",
    "outputOptions": {
      "mimeType": "image/png",
      "compressionQuality": 75
    },
    "safetySetting": "block_medium_and_above",
    "personGeneration": "allow_adult"
  }'
```

> [!NOTE]
> Parameter `language` telah dihapus karena TIDAK didukung oleh Vertex AI Imagen API.

## Expected Response

```json
{
  "success": true,
  "model": "imagen-3.0-generate-001",
  "images": [
    {
      "url": "https://storage.googleapis.com/orenax-vertex-ai-images/images/generated/text-to-image/20251204_062329_img3_text-to-image_abc123.png",
      "filename": "20251204_062329_img3_text-to-image_abc123.png",
      "mimeType": "image/png",
      "generatedAt": "2025-12-04T06:23:29.000Z"
    }
  ]
}
```

## Troubleshooting

### Error: "property model should not exist"

**Cause**: Backend tidak restart dengan kode baru, atau masih menggunakan DTO lama.

**Solution**:
```bash
# Stop backend (Ctrl+C)
# Then restart
npm start
```

### Error: "Failed to upload image to storage"

**Cause**: GCS bucket belum dibuat atau permissions salah.

**Solution**:
1. Buat GCS bucket (lihat Setup di atas)
2. Verify permissions:
```bash
gsutil iam get gs://orenax-vertex-ai-images
```

### Error: "Safety filter blocked"

**Cause**: Prompt mengandung konten yang di-block oleh safety filters.

**Solution**: Modifikasi prompt untuk menghindari konten yang sensitive.

## All Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/image/text-to-image` | POST | Generate dari text prompt |
| `/api/v1/image/image-upscale` | POST | Upscale images (x2, x3, x4) |
| `/api/v1/image/image-edit` | POST | Edit dengan masks |
| `/api/v1/image/image-customize` | POST | Customize dengan reference images |
| `/api/v1/image/virtual-try-on` | POST | Virtual try-on clothing |
| `/api/v1/image/product-recontext` | POST | Product recontextualization |

Lihat dokumentasi lengkap di `docs/api/image/api-image.md`
