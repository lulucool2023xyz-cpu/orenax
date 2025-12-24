# OrenaX Backend API V2 - Frontend Integration Documentation

> **Last Updated:** 2025-12-24  
> **Base URL:** `https://artificial-production.up.railway.app` (Production) | `http://localhost:3001` (Development)  
> **API Version:** v2

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Common Response Format](#2-common-response-format)
3. [Error Codes Reference](#3-error-codes-reference)
4. [Payment & Subscription API](#4-payment--subscription-api)
5. [Media History API](#5-media-history-api)
6. [User API Keys](#6-user-api-keys)
7. [Chat Sharing API](#7-chat-sharing-api)
8. [Prompts Marketplace API](#8-prompts-marketplace-api)
9. [Email Verification API](#9-email-verification-api)
10. [TypeScript Interfaces](#10-typescript-interfaces)

---

## 1. Authentication

### 1.1 Overview

All protected endpoints require a valid JWT token in the Authorization header.

```http
Authorization: Bearer <access_token>
```

### 1.2 Getting Access Token

After login/register, you receive:

```typescript
interface AuthResponse {
  user: {
    id: string;
    email: string;
    user_metadata: {
      name?: string;
      avatar_url?: string;
    };
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;      // seconds until expiration
  expiresAt: number;      // Unix timestamp
}
```

### 1.3 Token Refresh

```http
POST /api/v2/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

### 1.4 Which Endpoints Need Auth?

| Endpoint Pattern | Auth Required |
|------------------|---------------|
| `POST /api/v2/payment/*` | ✅ Yes |
| `GET /api/v2/subscription/*` | ✅ Yes |
| `GET /api/v2/media/*` | ✅ Yes |
| `DELETE /api/v2/media/*` | ✅ Yes |
| `GET /api/v2/user/*` | ✅ Yes |
| `POST /api/v2/user/*` | ✅ Yes |
| `DELETE /api/v2/user/*` | ✅ Yes |
| `POST /api/v2/chat/share` | ✅ Yes |
| `DELETE /api/v2/chat/share/*` | ✅ Yes |
| `GET /api/v2/shared/:shareId` | ❌ No (Public) |
| `GET /api/v2/prompts/marketplace` | ✅ Yes |
| `GET /api/v2/prompts/mine` | ✅ Yes |
| `POST /api/v2/prompts` | ✅ Yes |
| `PUT /api/v2/prompts/:id` | ✅ Yes |
| `DELETE /api/v2/prompts/:id` | ✅ Yes |
| `POST /api/v2/prompts/:id/save` | ✅ Yes |
| `POST /api/v2/prompts/:id/use` | ✅ Yes |
| `POST /api/v2/auth/resend-verification` | ❌ No |
| `GET /api/v2/auth/verify-email` | ❌ No |

---

## 2. Common Response Format

### 2.1 Success Response

```typescript
// Direct data return (most endpoints)
{
  "id": "...",
  "data": "..."
}

// Or with wrapper
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### 2.2 Error Response

```typescript
{
  "error": true,
  "code": "ERROR_CODE",       // Machine-readable error code
  "message": "Human readable message",
  "statusCode": 400           // HTTP status code
}
```

### 2.3 Paginated Response

```typescript
interface PaginatedResponse<T> {
  items: T[];                 // Array of items
  total: number;              // Total count
  page: number;               // Current page (1-indexed)
  limit: number;              // Items per page
  hasMore: boolean;           // True if more pages exist
}
```

---

## 3. Error Codes Reference

### 3.1 Authentication Errors (401, 403)

| Code | Message | Description |
|------|---------|-------------|
| `UNAUTHORIZED` | Token tidak valid | Invalid or expired JWT |
| `FORBIDDEN` | Akses ditolak | User doesn't have permission |
| `TOKEN_EXPIRED` | Token sudah kadaluarsa | Need to refresh token |

### 3.2 Validation Errors (400)

| Code | Message | Description |
|------|---------|-------------|
| `VALIDATION_ERROR` | Data tidak valid | Request body validation failed |
| `INVALID_PLAN` | Plan tidak valid | Invalid subscription plan ID |
| `EMAIL_REQUIRED` | Email wajib diisi | Missing email field |
| `NAME_REQUIRED` | Nama wajib diisi | Missing name field |

### 3.3 Resource Errors (404, 410)

| Code | Message | Description |
|------|---------|-------------|
| `NOT_FOUND` | Resource tidak ditemukan | Generic not found |
| `MEDIA_NOT_FOUND` | Media tidak ditemukan | Media item doesn't exist |
| `KEY_NOT_FOUND` | API key tidak ditemukan | API key doesn't exist |
| `PROMPT_NOT_FOUND` | Prompt tidak ditemukan | Prompt doesn't exist |
| `SHARE_NOT_FOUND` | Link tidak ditemukan | Share link doesn't exist |
| `SHARE_EXPIRED` | Link sudah kadaluarsa | Share link has expired |
| `USER_NOT_FOUND` | User tidak ditemukan | User doesn't exist |

### 3.4 Business Logic Errors (400, 403)

| Code | Message | Description |
|------|---------|-------------|
| `ALREADY_SUBSCRIBED` | Sudah memiliki subscription aktif | User already has active plan |
| `KEY_LIMIT_REACHED` | Batas maksimal API key tercapai | Max 5 API keys per user |
| `RATE_LIMITED` | Tunggu X detik... | Too many requests |
| `ALREADY_VERIFIED` | Email sudah terverifikasi | Email already verified |
| `PAYMENT_PENDING` | Pembayaran belum selesai | Payment not yet completed |
| `PAYMENT_FAILED` | Pembayaran gagal | Payment failed or cancelled |

---

## 4. Payment & Subscription API

### 4.1 Pricing Plans

```typescript
const PRICING = {
  pro: {
    monthly: 99000,     // IDR Rp 99.000
    yearly: 950400,     // IDR Rp 950.400 (20% discount)
  },
  enterprise: {
    monthly: 499000,    // IDR Rp 499.000
    yearly: 4790400,    // IDR Rp 4.790.400 (20% discount)
  },
};
```

### 4.2 Create Payment Order

Creates a Midtrans Snap token for payment.

```http
POST /api/v2/payment/create-order
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```typescript
{
  "planId": "pro" | "enterprise",
  "billingCycle": "monthly" | "yearly"
}
```

**Success Response (200):**

```typescript
{
  "orderId": "ORD-1703404800000ABCDE",   // Unique order ID
  "snapToken": "abc123...",               // Midtrans Snap token
  "amount": 99000,                        // Amount in IDR
  "currency": "IDR",
  "expiresAt": "2024-12-25T12:00:00.000Z" // Token expiry (24 hours)
}
```

**Error Responses:**

| Status | Code | When |
|--------|------|------|
| 400 | `INVALID_PLAN` | Invalid planId or billingCycle |
| 400 | `ALREADY_SUBSCRIBED` | User has active subscription |
| 401 | `UNAUTHORIZED` | Missing or invalid token |

**Frontend Implementation:**

```typescript
// 1. Create order
const response = await fetch('/api/v2/payment/create-order', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    planId: 'pro',
    billingCycle: 'monthly',
  }),
});

const { orderId, snapToken } = await response.json();

// 2. Open Midtrans Snap popup
window.snap.pay(snapToken, {
  onSuccess: async (result) => {
    // 3. Verify payment
    await verifyPayment(orderId, result.transaction_id);
  },
  onPending: (result) => {
    console.log('Payment pending:', result);
  },
  onError: (result) => {
    console.error('Payment error:', result);
  },
  onClose: () => {
    console.log('Popup closed without payment');
  },
});
```

### 4.3 Verify Payment

Verifies payment status with Midtrans and activates subscription.

```http
POST /api/v2/payment/verify
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```typescript
{
  "orderId": "ORD-1703404800000ABCDE",
  "transactionId": "midtrans_txn_123..."  // Optional, from Midtrans callback
}
```

**Success Response (200):**

```typescript
{
  "success": true,
  "subscription": {
    "planId": "pro",
    "expiresAt": "2025-01-24T12:00:00.000Z",
    "status": "active"
  },
  "message": "Pembayaran berhasil! Subscription aktif."
}
```

**Error Responses:**

| Status | Code | When |
|--------|------|------|
| 400 | `PAYMENT_PENDING` | Payment not yet completed |
| 400 | `PAYMENT_FAILED` | Payment was denied/cancelled |
| 404 | `ORDER_NOT_FOUND` | Invalid orderId |

### 4.4 Get Subscription Status

Returns the current user's subscription details.

```http
GET /api/v2/subscription/status
Authorization: Bearer <token>
```

**Success Response (200):**

```typescript
{
  "isActive": true,
  "plan": "pro" | "enterprise" | "free",
  "expiresAt": "2025-01-24T12:00:00.000Z" | null,
  "features": [
    "unlimited_messages",
    "all_models",
    "50_images_daily",
    "10_videos_daily",
    "voice_unlimited",
    "deep_thinking",
    "priority_support"
  ],
  "daysRemaining": 30 | null  // null if no active subscription
}
```

**Plan Features Matrix:**

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| `10_messages_daily` | ✅ | - | - |
| `unlimited_messages` | - | ✅ | ✅ |
| `basic_models` | ✅ | - | - |
| `all_models` | - | ✅ | ✅ |
| `3_images_daily` | ✅ | - | - |
| `50_images_daily` | - | ✅ | - |
| `unlimited_images` | - | - | ✅ |
| `0_videos_daily` | ✅ | - | - |
| `10_videos_daily` | - | ✅ | - |
| `unlimited_videos` | - | - | ✅ |
| `limited_voice` | ✅ | - | - |
| `voice_unlimited` | - | ✅ | ✅ |
| `deep_thinking` | - | ✅ | ✅ |
| `priority_support` | - | ✅ | ✅ |
| `custom_models` | - | - | ✅ |
| `api_access` | - | - | ✅ |
| `dedicated_support` | - | - | ✅ |

### 4.5 Cancel Subscription

Cancels the subscription. The subscription remains active until the end of the current billing period.

```http
POST /api/v2/subscription/cancel
Authorization: Bearer <token>
```

**Success Response (200):**

```typescript
{
  "success": true,
  "message": "Subscription akan berakhir pada akhir periode",
  "endsAt": "2025-01-24T12:00:00.000Z"  // Subscription stays active until this date
}
```

**Error Responses:**

| Status | Code | When |
|--------|------|------|
| 400 | `NO_ACTIVE_SUBSCRIPTION` | User has no active subscription |
| 401 | `UNAUTHORIZED` | Missing or invalid token |

### 4.6 Midtrans Webhook (Server-to-Server)

Receives payment notifications from Midtrans. **No authentication** - uses signature verification.

```http
POST /api/v2/payment/webhook
Content-Type: application/json
X-Signature-Key: <midtrans_signature>
```

**Request Body (from Midtrans):**

```typescript
{
  "transaction_status": "capture" | "settlement" | "pending" | "deny" | "cancel" | "expire",
  "order_id": "ORD-1703404800000ABCDE",
  "gross_amount": "99000",
  "status_code": "200",
  "payment_type": "credit_card" | "bank_transfer" | "gopay" | etc,
  "transaction_id": "midtrans_txn_123...",
  "fraud_status": "accept" | "deny" | null
}
```

**Success Response (200):**

```typescript
{
  "success": true
}
```

**Notes:**
- This endpoint is called by Midtrans servers, not by the frontend
- Signature verification uses SHA-512: `order_id + status_code + gross_amount + server_key`
- Set this URL in your Midtrans Dashboard: `https://your-backend.com/api/v2/payment/webhook`

### 4.7 Get Payment History

Returns the payment history for the authenticated user.

```http
GET /api/v2/payment/history
Authorization: Bearer <token>
```

**Success Response (200):**

```typescript
[
  {
    "id": "uuid-here",
    "orderId": "ORD-1703404800000ABCDE",
    "amount": 99000,
    "paymentMethod": "credit_card",
    "status": "success",
    "invoiceUrl": "https://..." | null,
    "createdAt": "2024-12-24T10:00:00.000Z"
  }
]
```

---


## 5. Media History API

### 5.1 Get Media History

Returns paginated list of user's generated media (images, videos, music).

```http
GET /api/v2/media/history
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | `image` \| `video` \| `music` | all | Filter by media type |
| `page` | number | 1 | Page number (1-indexed) |
| `limit` | number | 20 | Items per page (max 50) |

**Example:**

```http
GET /api/v2/media/history?type=image&page=1&limit=10
```

**Success Response (200):**

```typescript
{
  "items": [
    {
      "id": "uuid-here",
      "type": "image",
      "url": "https://storage.supabase.co/...",
      "thumbnailUrl": "https://storage.supabase.co/.../thumb_...",
      "prompt": "A beautiful sunset over mountains",
      "model": "imagen-3.0-generate-001",
      "createdAt": "2024-12-24T10:00:00.000Z",
      "metadata": {
        "width": 1024,
        "height": 1024,
        "format": "png",
        "size": 524288
      }
    },
    {
      "id": "uuid-here-2",
      "type": "video",
      "url": "https://storage.supabase.co/...",
      "thumbnailUrl": "https://storage.supabase.co/.../thumb_...",
      "prompt": "A cat playing with yarn",
      "model": "veo-2.0-generate-001",
      "createdAt": "2024-12-23T15:30:00.000Z",
      "metadata": {
        "width": 1280,
        "height": 720,
        "format": "mp4",
        "size": 5242880,
        "duration": 5.0
      }
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10,
  "hasMore": true
}
```

**TypeScript Interface:**

```typescript
interface MediaHistoryItem {
  id: string;
  type: 'image' | 'video' | 'music';
  url: string;
  thumbnailUrl: string | null;
  prompt: string;
  model: string;
  createdAt: string;  // ISO 8601
  metadata: {
    width?: number;
    height?: number;
    format?: string;
    size?: number;      // bytes
    duration?: number;  // seconds (for video/music)
  };
}

interface MediaHistoryResponse {
  items: MediaHistoryItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
```

### 5.2 Delete Media

Deletes a specific media item. Only the owner can delete.

```http
DELETE /api/v2/media/:id
Authorization: Bearer <token>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Media item ID |

**Success Response (200):**

```typescript
{
  "success": true,
  "message": "Media berhasil dihapus"
}
```

**Error Responses:**

| Status | Code | When |
|--------|------|------|
| 404 | `MEDIA_NOT_FOUND` | Media doesn't exist |
| 403 | `FORBIDDEN` | User is not the owner |

---

## 6. User API Keys

### 6.1 Overview

- Each user can have up to **5 API keys**
- Keys are shown only once upon creation (store securely!)
- Keys are prefixed with `sk-prod-` followed by 32 random characters
- Only the key prefix (last 6 characters) is shown in the list

### 6.2 List API Keys

Returns all API keys for the authenticated user.

```http
GET /api/v2/user/api-keys
Authorization: Bearer <token>
```

**Success Response (200):**

```typescript
{
  "keys": [
    {
      "id": "uuid-here",
      "name": "Production Key",
      "prefix": "sk-prod-...abc123",  // Only last 6 chars shown
      "createdAt": "2024-12-20T10:00:00.000Z",
      "lastUsed": "2024-12-24T09:30:00.000Z",
      "usageCount": 1523
    },
    {
      "id": "uuid-here-2",
      "name": "Development Key",
      "prefix": "sk-prod-...xyz789",
      "createdAt": "2024-12-15T14:00:00.000Z",
      "lastUsed": null,
      "usageCount": 0
    }
  ],
  "limit": 5,
  "remaining": 3
}
```

**TypeScript Interface:**

```typescript
interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string | null;
  usageCount: number;
}

interface ApiKeysListResponse {
  keys: ApiKeyItem[];
  limit: number;       // Max keys allowed (5)
  remaining: number;   // Slots remaining
}
```

### 6.3 Create API Key

Generates a new API key. **The full key is only returned once!**

```http
POST /api/v2/user/api-keys
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```typescript
{
  "name": "My Production Key"  // 1-100 characters
}
```

**Success Response (201):**

```typescript
{
  "id": "uuid-here",
  "name": "My Production Key",
  "key": "sk-prod-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",  // ONLY SHOWN ONCE!
  "prefix": "sk-prod-...o5p6",
  "message": "⚠️ Simpan key ini sekarang! Tidak akan ditampilkan lagi."
}
```

**Error Responses:**

| Status | Code | When |
|--------|------|------|
| 400 | `NAME_REQUIRED` | Missing or empty name |
| 403 | `KEY_LIMIT_REACHED` | Already have 5 keys |

**Frontend Implementation:**

```typescript
const createApiKey = async (name: string) => {
  const response = await fetch('/api/v2/user/api-keys', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  const data = await response.json();
  
  // IMPORTANT: Show this key to user with copy button
  // and warn them to save it immediately!
  showKeyModal(data.key, data.message);
  
  return data;
};
```

### 6.4 Delete API Key

Revokes an API key. Cannot be undone.

```http
DELETE /api/v2/user/api-keys/:id
Authorization: Bearer <token>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | API key ID |

**Success Response (200):**

```typescript
{
  "success": true,
  "message": "API key berhasil dihapus"
}
```

**Error Responses:**

| Status | Code | When |
|--------|------|------|
| 404 | `KEY_NOT_FOUND` | Key doesn't exist |
| 403 | `FORBIDDEN` | User is not the owner |

### 6.5 Get API Usage

Returns usage statistics for the current period.

```http
GET /api/v2/user/api-usage
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | `daily` \| `monthly` | `daily` | Usage period |

**Success Response (200):**

```typescript
{
  "period": "daily",
  "date": "2024-12-24",  // or "2024-12" for monthly
  "usage": {
    "chat": 45,
    "image": 12,
    "video": 3,
    "music": 1,
    "tts": 8
  },
  "limits": {
    "chat": 100,
    "image": 50,
    "video": 10,
    "music": 5,
    "tts": 20
  },
  "percentUsed": {
    "chat": 45,
    "image": 24,
    "video": 30,
    "music": 20,
    "tts": 40
  }
}
```

---

## 7. Chat Sharing API

### 7.1 Create Share Link

Creates a public shareable link for a conversation.

```http
POST /api/v2/chat/share
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```typescript
{
  "conversationId": "uuid-of-conversation",
  "expiresIn": 24  // Optional, hours (1-8760). null = never expires
}
```

**Success Response (201):**

```typescript
{
  "shareId": "sh_a1b2c3d4e5f6",
  "shareUrl": "https://orenax.ai/shared/sh_a1b2c3d4e5f6",
  "expiresAt": "2024-12-25T10:00:00.000Z" | null,
  "isPublic": true
}
```

### 7.2 Get Shared Chat (Public)

Retrieves a shared conversation. **No authentication required.**

```http
GET /api/v2/shared/:shareId
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `shareId` | string | Share ID (e.g., `sh_a1b2c3d4e5f6`) |

**Success Response (200):**

```typescript
{
  "id": "sh_a1b2c3d4e5f6",
  "title": "Discussion about AI",
  "messages": [
    {
      "role": "user",
      "content": "What is artificial intelligence?",
      "timestamp": "2024-12-24T09:00:00.000Z"
    },
    {
      "role": "model",
      "content": "Artificial intelligence (AI) refers to...",
      "timestamp": "2024-12-24T09:00:05.000Z"
    }
  ],
  "messageCount": 12,
  "createdAt": "2024-12-24T09:00:00.000Z",
  "author": {
    "name": "John Doe",
    "avatar": "https://storage.supabase.co/avatars/..."
  }
}
```

**Error Responses:**

| Status | Code | When |
|--------|------|------|
| 404 | `SHARE_NOT_FOUND` | Share doesn't exist |
| 410 | `SHARE_EXPIRED` | Share link has expired |

**TypeScript Interface:**

```typescript
interface SharedMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface SharedChatResponse {
  id: string;
  title: string;
  messages: SharedMessage[];
  messageCount: number;
  createdAt: string;
  author: {
    name: string;
    avatar: string | null;
  };
}
```

### 7.3 Delete Share Link

Revokes a share link. Only the owner can delete.

```http
DELETE /api/v2/chat/share/:shareId
Authorization: Bearer <token>
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `shareId` | string | Share ID |

**Success Response (200):**

```typescript
{
  "success": true,
  "message": "Link share berhasil dihapus"
}
```

**Error Responses:**

| Status | Code | When |
|--------|------|------|
| 404 | `SHARE_NOT_FOUND` | Share doesn't exist |
| 403 | `FORBIDDEN` | User is not the owner |

---

## 8. Prompts Marketplace API

### 8.1 Categories

Available prompt categories:

```typescript
type PromptCategory = 
  | 'writing'     // Writing & Content
  | 'coding'      // Programming & Development
  | 'marketing'   // Marketing & Sales
  | 'education'   // Education & Learning
  | 'creative'    // Creative & Art
  | 'business';   // Business & Productivity
```

### 8.2 Browse Marketplace

Returns public prompts from all users.

```http
GET /api/v2/prompts/marketplace
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | all | Filter by category |
| `search` | string | - | Search in title/description |
| `sort` | `popular` \| `recent` \| `rating` | `popular` | Sort order |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 50) |

**Example:**

```http
GET /api/v2/prompts/marketplace?category=coding&sort=popular&page=1&limit=10
```

**Success Response (200):**

```typescript
{
  "prompts": [
    {
      "id": "uuid-here",
      "title": "Code Review Assistant",
      "description": "Get detailed code review with suggestions",
      "prompt": "Review the following code and provide:\n1. Bug analysis\n2. Performance suggestions\n3. Best practices\n\nCode:\n{code}",
      "category": "coding",
      "author": {
        "id": "author-uuid",
        "name": "Jane Developer",
        "avatar": "https://..."
      },
      "uses": 1523,
      "rating": 4.8,
      "ratingCount": 127,
      "isPublic": true,
      "isSaved": false,
      "createdAt": "2024-12-01T10:00:00.000Z"
    }
  ],
  "total": 156,
  "page": 1,
  "hasMore": true,
  "categories": ["writing", "coding", "marketing", "education", "creative", "business"]
}
```

**TypeScript Interface:**

```typescript
interface PromptAuthor {
  id: string;
  name: string;
  avatar: string | null;
}

interface PromptItem {
  id: string;
  title: string;
  description: string | null;
  prompt: string;
  category: string | null;
  author: PromptAuthor;
  uses: number;
  rating: number;          // 0-5
  ratingCount: number;
  isPublic: boolean;
  isSaved: boolean;        // True if current user has saved this
  createdAt: string;
}

interface PromptsListResponse {
  prompts: PromptItem[];
  total: number;
  page: number;
  hasMore: boolean;
  categories: string[];
}
```

### 8.3 Get My Prompts

Returns prompts created by the authenticated user.

```http
GET /api/v2/prompts/mine
Authorization: Bearer <token>
```

**Query Parameters:** Same as marketplace.

**Success Response (200):** Same structure as marketplace, but includes both public and private prompts.

### 8.4 Create Prompt

Creates a new prompt.

```http
POST /api/v2/prompts
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```typescript
{
  "title": "My Awesome Prompt",              // Required, 1-200 chars
  "description": "A helpful prompt for...",  // Optional, max 500 chars
  "prompt": "You are a helpful assistant that...\n\nTask: {task}\nContext: {context}",  // Required
  "category": "writing",                     // Optional
  "isPublic": false                          // Optional, default false
}
```

**Success Response (201):**

```typescript
{
  "id": "uuid-here",
  "title": "My Awesome Prompt",
  "message": "Prompt berhasil dibuat"
}
```

**Notes on Variables:**

Prompts can include variables using `{variableName}` syntax. These will be extracted when using the prompt:

```
Input: "Write a blog post about {topic} for {audience}"
Variables extracted: ["topic", "audience"]
```

### 8.5 Update Prompt

Updates an existing prompt. Only the owner can update.

```http
PUT /api/v2/prompts/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Prompt ID |

**Request Body:** All fields optional:

```typescript
{
  "title": "Updated Title",
  "description": "Updated description",
  "prompt": "Updated prompt content",
  "category": "coding",
  "isPublic": true
}
```

**Success Response (200):**

```typescript
{
  "success": true,
  "message": "Prompt berhasil diupdate"
}
```

**Error Responses:**

| Status | Code | When |
|--------|------|------|
| 404 | `PROMPT_NOT_FOUND` | Prompt doesn't exist |
| 403 | `FORBIDDEN` | User is not the owner |

### 8.6 Delete Prompt

Deletes a prompt. Only the owner can delete.

```http
DELETE /api/v2/prompts/:id
Authorization: Bearer <token>
```

**Success Response (200):**

```typescript
{
  "success": true,
  "message": "Prompt berhasil dihapus"
}
```

### 8.7 Save/Unsave Prompt (Toggle)

Bookmarks or un-bookmarks a prompt. Calling twice toggles the state.

```http
POST /api/v2/prompts/:id/save
Authorization: Bearer <token>
```

**Success Response (200):**

```typescript
{
  "success": true,
  "isSaved": true   // or false if unsaved
}
```

### 8.8 Use Prompt

Records usage and returns the prompt content with extracted variables.

```http
POST /api/v2/prompts/:id/use
Authorization: Bearer <token>
```

**Success Response (200):**

```typescript
{
  "success": true,
  "prompt": "You are a helpful assistant...\n\nTopic: {topic}\nAudience: {audience}",
  "variables": ["topic", "audience"]  // Variables that need to be filled
}
```

**Frontend Implementation:**

```typescript
const usePrompt = async (promptId: string) => {
  const response = await fetch(`/api/v2/prompts/${promptId}/use`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  
  const { prompt, variables } = await response.json();
  
  // If there are variables, show a form to fill them
  if (variables.length > 0) {
    const filledValues = await showVariableForm(variables);
    
    // Replace variables in prompt
    let finalPrompt = prompt;
    for (const [key, value] of Object.entries(filledValues)) {
      finalPrompt = finalPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    
    return finalPrompt;
  }
  
  return prompt;
};
```

---

## 9. Email Verification API

### 9.1 Resend Verification Email

Resends the verification email with rate limiting (60 seconds).

```http
POST /api/v2/auth/resend-verification
Content-Type: application/json
```

**Request Body:**

```typescript
{
  "email": "user@example.com"
}
```

**Success Response (200):**

```typescript
{
  "success": true,
  "message": "Email verifikasi telah dikirim",
  "retryAfter": 60  // Seconds until next retry allowed
}
```

**Error Responses:**

| Status | Code | When |
|--------|------|------|
| 400 | `EMAIL_REQUIRED` | Missing email |
| 400 | `USER_NOT_FOUND` | Email not registered |
| 400 | `ALREADY_VERIFIED` | Email already verified |
| 400 | `RATE_LIMITED` | Must wait before retrying |

### 9.2 Verify Email

Handles the email verification link click. Redirects to frontend.

```http
GET /api/v2/auth/verify-email?token=<verification_token>
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `token` | string | Token from email link |

**Behavior:**

This endpoint redirects to the frontend:

- **Success:** `https://orenax.ai/auth/callback?verified=true`
- **Invalid Token:** `https://orenax.ai/auth/callback?verified=false&error=INVALID_TOKEN`
- **Server Error:** `https://orenax.ai/auth/callback?verified=false&error=SERVER_ERROR`

**Frontend Handling:**

```typescript
// In your /auth/callback page
const params = new URLSearchParams(window.location.search);
const verified = params.get('verified');
const error = params.get('error');

if (verified === 'true') {
  showToast('Email berhasil diverifikasi!', 'success');
  navigate('/login');
} else {
  const message = error === 'INVALID_TOKEN' 
    ? 'Link verifikasi tidak valid atau sudah kadaluarsa'
    : 'Terjadi kesalahan, silakan coba lagi';
  showToast(message, 'error');
}
```

---

## 10. TypeScript Interfaces

Complete TypeScript interfaces for frontend implementation:

```typescript
// ===============================
// Common Types
// ===============================

interface ApiError {
  error: true;
  code: string;
  message: string;
  statusCode?: number;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

// ===============================
// Payment & Subscription
// ===============================

type PlanId = 'pro' | 'enterprise';
type BillingCycle = 'monthly' | 'yearly';
type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

interface CreateOrderRequest {
  planId: PlanId;
  billingCycle: BillingCycle;
}

interface CreateOrderResponse {
  orderId: string;
  snapToken: string;
  amount: number;
  currency: 'IDR';
  expiresAt: string;
}

interface VerifyPaymentRequest {
  orderId: string;
  transactionId?: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  subscription: {
    planId: PlanId;
    expiresAt: string;
    status: SubscriptionStatus;
  };
  message: string;
}

interface SubscriptionStatusResponse {
  isActive: boolean;
  plan: SubscriptionPlan;
  expiresAt: string | null;
  features: string[];
  daysRemaining: number | null;
}

// ===============================
// Media History
// ===============================

type MediaType = 'image' | 'video' | 'music';

interface MediaMetadata {
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  duration?: number;
}

interface MediaHistoryItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl: string | null;
  prompt: string;
  model: string;
  createdAt: string;
  metadata: MediaMetadata;
}

interface MediaHistoryParams extends PaginationParams {
  type?: MediaType;
}

interface MediaHistoryResponse {
  items: MediaHistoryItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ===============================
// API Keys
// ===============================

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string | null;
  usageCount: number;
}

interface ApiKeysListResponse {
  keys: ApiKeyItem[];
  limit: number;
  remaining: number;
}

interface CreateApiKeyRequest {
  name: string;
}

interface CreateApiKeyResponse {
  id: string;
  name: string;
  key: string;  // Full key, shown only once!
  prefix: string;
  message: string;
}

type UsagePeriod = 'daily' | 'monthly';

interface UsageStats {
  chat: number;
  image: number;
  video: number;
  music: number;
  tts: number;
}

interface ApiUsageResponse {
  period: UsagePeriod;
  date: string;
  usage: UsageStats;
  limits: UsageStats;
  percentUsed: UsageStats;
}

// ===============================
// Chat Sharing
// ===============================

interface CreateShareRequest {
  conversationId: string;
  expiresIn?: number;  // hours
}

interface CreateShareResponse {
  shareId: string;
  shareUrl: string;
  expiresAt: string | null;
  isPublic: boolean;
}

interface SharedMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface SharedChatResponse {
  id: string;
  title: string;
  messages: SharedMessage[];
  messageCount: number;
  createdAt: string;
  author: {
    name: string;
    avatar: string | null;
  };
}

// ===============================
// Prompts Marketplace
// ===============================

type PromptCategory = 
  | 'writing' 
  | 'coding' 
  | 'marketing' 
  | 'education' 
  | 'creative' 
  | 'business';

type PromptSortBy = 'popular' | 'recent' | 'rating';

interface PromptAuthor {
  id: string;
  name: string;
  avatar: string | null;
}

interface PromptItem {
  id: string;
  title: string;
  description: string | null;
  prompt: string;
  category: PromptCategory | null;
  author: PromptAuthor;
  uses: number;
  rating: number;
  ratingCount: number;
  isPublic: boolean;
  isSaved: boolean;
  createdAt: string;
}

interface PromptsQueryParams extends PaginationParams {
  category?: PromptCategory;
  search?: string;
  sort?: PromptSortBy;
}

interface PromptsListResponse {
  prompts: PromptItem[];
  total: number;
  page: number;
  hasMore: boolean;
  categories: PromptCategory[];
}

interface CreatePromptRequest {
  title: string;
  description?: string;
  prompt: string;
  category?: PromptCategory;
  isPublic?: boolean;
}

interface UpdatePromptRequest {
  title?: string;
  description?: string;
  prompt?: string;
  category?: PromptCategory;
  isPublic?: boolean;
}

interface UsePromptResponse {
  success: boolean;
  prompt: string;
  variables: string[];
}

// ===============================
// Email Verification
// ===============================

interface ResendVerificationRequest {
  email: string;
}

interface ResendVerificationResponse {
  success: boolean;
  message: string;
  retryAfter: number;
}
```

---

## Appendix A: Environment Variables

Required backend environment variables for these features:

```env
# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false  # true for production

# Frontend URL (for redirects)
FRONTEND_URL=https://orenax.ai

# Supabase (already configured)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Appendix B: Database Tables Required

Run the SQL script at `src/database/migrations/frontend-integration-schema.sql` to create:

1. `subscriptions` - User subscription data
2. `payment_orders` - Midtrans order tracking
3. `user_api_keys` - User API key storage (hashed)
4. `shared_chats` - Chat share links
5. `conversations` - Chat conversation data
6. `prompts` - User-created prompts
7. `prompt_saves` - Prompt bookmarks

---

## Appendix C: Midtrans Integration

### Frontend Setup

1. Include Midtrans Snap.js:

```html
<!-- Sandbox (Development) -->
<script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="YOUR_CLIENT_KEY"></script>

<!-- Production -->
<script src="https://app.midtrans.com/snap/snap.js" data-client-key="YOUR_CLIENT_KEY"></script>
```

2. Call Snap.pay with the token:

```typescript
window.snap.pay(snapToken, {
  onSuccess: function(result) {
    console.log('Payment success:', result);
    // Call verify endpoint
  },
  onPending: function(result) {
    console.log('Payment pending:', result);
  },
  onError: function(result) {
    console.error('Payment error:', result);
  },
  onClose: function() {
    console.log('Popup closed');
  }
});
```

---

## Appendix D: Rate Limits

| Endpoint | Limit |
|----------|-------|
| `POST /auth/resend-verification` | 1 per 60 seconds per email |
| `POST /payment/create-order` | 10 per minute per user |
| `POST /user/api-keys` | 5 total keys per user |

---

*End of Documentation*
