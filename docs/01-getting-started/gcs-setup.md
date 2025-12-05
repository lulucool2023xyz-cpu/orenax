# Google Cloud Storage Setup untuk Image Generation

## Overview

Panduan lengkap untuk setup Google Cloud Storage bucket untuk menyimpan generated images dari Vertex AI Imagen.

## Prerequisites

- Google Cloud Project dengan Vertex AI API enabled
- Service Account dengan permissions:
  - Storage Object Creator
  - Storage Object Viewer
  - Vertex AI User

## Step 1: Create GCS Bucket

### Via Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate ke **Cloud Storage** > **Buckets**
3. Click **CREATE BUCKET**
4. Configure bucket:
   - **Name**: `your-project-images` (ganti dengan nama unik)
   - **Location type**: Region
   - **Location**: Pilih region yang sama dengan Vertex AI (e.g., `us-central1`)
   - **Storage class**: Standard
   - **Access control**: Fine-grained
   - **Public access**: Allow public access (untuk public URLs)
5. Click **CREATE**

### Via gcloud CLI

```bash
# Set project ID
export PROJECT_ID=your-project-id
export BUCKET_NAME=your-project-images
export REGION=us-central1

# Create bucket
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME/

# Enable public access
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Create folder structure
gsutil -m mkdir gs://$BUCKET_NAME/images/
gsutil -m mkdir gs://$BUCKET_NAME/images/generated/
```

## Step 2: Set Bucket Permissions

### Make Bucket Publicly Readable

```bash
# Set bucket-level IAM
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Or set individual object public when uploading (recommended)
# This will be handled by the GcsStorageService
```

### Service Account Permissions

Ensure your service account has:

```bash
# Grant Storage Object Admin role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

## Step 3: Configure CORS (Optional)

Jika ingin akses images dari web browser dengan domain berbeda:

```bash
# Create cors.json
cat > cors.json << EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Apply CORS
gsutil cors set cors.json gs://$BUCKET_NAME
```

## Step 4: Update Environment Variables

Edit `.env` file:

```bash
# Google Cloud Storage Configuration
GCS_BUCKET_NAME=your-project-images
GCS_IMAGE_PATH=images/generated
GCS_ENABLE_PUBLIC_ACCESS=true
GCS_PROJECT_ID=your-project-id
```

## Step 5: Test Configuration

### Test Upload

```bash
# Create test image
echo "test" > test.txt

# Upload to bucket
gsutil cp test.txt gs://$BUCKET_NAME/images/generated/test.txt

# Make it public
gsutil acl ch -u AllUsers:R gs://$BUCKET_NAME/images/generated/test.txt

# Get public URL
echo "https://storage.googleapis.com/$BUCKET_NAME/images/generated/test.txt"

# Test access
curl https://storage.googleapis.com/$BUCKET_NAME/images/generated/test.txt

# Cleanup
gsutil rm gs://$BUCKET_NAME/images/generated/test.txt
```

## Folder Structure

Recommended folder structure di GCS bucket:

```
gs://your-project-images/
├── images/
│   ├── generated/          # Generated images dari Imagen
│   │   ├── text-to-image/
│   │   ├── upscale/
│   │   ├── edit/
│   │   ├── customize/
│   │   ├── virtual-try-on/
│   │   └── product-recontext/
│   └── uploads/            # User uploaded images (optional)
└── metadata/               # Metadata files (optional)
```

## Filename Convention

Images akan disimpan dengan format:

```
YYYYMMDD_HHMMSS_modelId_feature_uuid.extension

Example:
20251204_062329_imagen3_text-to-image_abc123.png
20251204_062330_imagen4_upscale_def456.png
```

## Public URL Format

```
https://storage.googleapis.com/BUCKET_NAME/images/generated/FILENAME

Example:
https://storage.googleapis.com/your-project-images/images/generated/20251204_imagen3_abc123.png
```

## Cost Estimation

### Storage Costs
- **Storage**: ~$0.020 per GB/month (Standard class, us-central1)
- **Class A Operations** (upload): $0.05 per 10,000 operations
- **Class B Operations** (read/list): $0.004 per 10,000 operations
- **Network Egress**: 
  - First 1 GB/month: Free
  - 1-10 TB: $0.12 per GB

### Example Calculation

Jika generate 1,000 images per day:
- Average image size: 500 KB
- Total storage: 500 MB/day = 15 GB/month
- Storage cost: 15 GB × $0.020 = **$0.30/month**
- Upload operations: 1,000 × 30 = 30,000/month = **$0.15/month**
- Egress (assuming 50% viewed): 7.5 GB × $0.12 = **$0.90/month**

**Total**: ~$1.35/month untuk 1,000 images/day

## Security Best Practices

### 1. Object Lifecycle Management

Set lifecycle rules untuk auto-delete old images:

```bash
# Create lifecycle.json
cat > lifecycle.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "age": 90,
          "matchesPrefix": ["images/generated/"]
        }
      }
    ]
  }
}
EOF

# Apply lifecycle
gsutil lifecycle set lifecycle.json gs://$BUCKET_NAME
```

### 2. Bucket Lock (Optional)

Prevent accidental bucket deletion:

```bash
gsutil retention set 1s gs://$BUCKET_NAME
gsutil retention lock gs://$BUCKET_NAME
```

### 3. Access Logging

Enable access logging untuk monitoring:

```bash
# Create log bucket
gsutil mb gs://$BUCKET_NAME-logs

# Enable logging
gsutil logging set on -b gs://$BUCKET_NAME-logs gs://$BUCKET_NAME
```

## Troubleshooting

### Issue: "403 Forbidden" saat akses public URL

**Solution:**
```bash
# Check bucket permissions
gsutil iam get gs://$BUCKET_NAME

# Make sure allUsers has objectViewer role
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Or make individual file public
gsutil acl ch -u AllUsers:R gs://$BUCKET_NAME/path/to/file.png
```

### Issue: "Upload failed: Insufficient permissions"

**Solution:**
```bash
# Check service account permissions
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:YOUR_SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com"

# Grant required role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

### Issue: CORS errors di browser

**Solution:**
```bash
# Get current CORS configuration
gsutil cors get gs://$BUCKET_NAME

# Update CORS to allow your domain
cat > cors.json << EOF
[
  {
    "origin": ["https://yourdomain.com", "http://localhost:3000"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://$BUCKET_NAME
```

## Monitoring

### View Storage Usage

```bash
# Get bucket size
gsutil du -s -h gs://$BUCKET_NAME

# List recent uploads
gsutil ls -l gs://$BUCKET_NAME/images/generated/ | tail -20
```

### Set Up Alerts

Via Google Cloud Console:
1. **Monitoring** > **Alerting** > **Create Policy**
2. Select metric: `storage.googleapis.com/storage/total_bytes`
3. Set threshold (e.g., > 100 GB)
4. Configure notification channels

## Next Steps

1. ✅ Bucket created dan configured
2. ✅ Public access enabled
3. ✅ Environment variables set
4. ⏳ Test dengan backend service
5. ⏳ Monitor usage dan costs

## References

- [Cloud Storage Documentation](https://cloud.google.com/storage/docs)
- [Making Data Public](https://cloud.google.com/storage/docs/access-control/making-data-public)
- [Pricing Calculator](https://cloud.google.com/products/calculator)
