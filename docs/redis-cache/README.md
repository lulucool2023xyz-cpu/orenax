# Redis Cache Setup Guide

## Overview

Redis is used in OrenaX for:
- **Rate Limiting** - Persistent rate limit counters across server restarts
- **Caching** - Cache expensive AI model calls and responses
- **Session Storage** - (Future) User session management

> **Development Mode**: If `REDIS_URL` is not set, the system automatically uses an in-memory cache. This is suitable for local development but not for production.

---

## Setup Options

### Option 1: Railway Redis Add-on (Recommended for Production)

1. Go to your Railway project dashboard
2. Click "New" → "Database" → "Add Redis"
3. Railway automatically sets `REDIS_URL` environment variable
4. No additional configuration needed

### Option 2: Upstash (Serverless Redis)

[Upstash](https://upstash.com/) provides serverless Redis with a generous free tier.

1. Sign up at https://upstash.com
2. Create a new Redis database
3. Copy the connection string (Redis URL)
4. Set in Railway/environment:

```bash
REDIS_URL=redis://default:your_password@your_endpoint.upstash.io:6379
```

**Pros**: 
- Free tier (10,000 requests/day)
- Pay-per-use pricing
- Global replication available

### Option 3: Redis Cloud

1. Sign up at https://redis.io/cloud
2. Create a free 30MB database
3. Copy the connection URL
4. Set in environment:

```bash
REDIS_URL=redis://default:password@redis-xxxxx.c1.us-east-1-2.ec2.cloud.redislabs.com:xxxxx
```

### Option 4: Local Docker (Development)

```bash
# Run Redis locally
docker run -d --name redis -p 6379:6379 redis:alpine

# Set environment variable
REDIS_URL=redis://localhost:6379
```

---

## Environment Variables

```bash
# Required for production
REDIS_URL=redis://user:password@host:port

# Optional
REDIS_PASSWORD=            # If separate from URL
REDIS_TTL_DEFAULT=3600     # Default cache TTL (seconds)
```

---

## Usage in Code

The `RedisService` is globally available and can be injected into any service:

```typescript
import { RedisService } from '../redis/redis.service';

@Injectable()
export class MyService {
    constructor(private readonly redis: RedisService) {}

    async getCachedData(key: string) {
        // Try cache first
        const cached = await this.redis.get<MyData>(key);
        if (cached) return cached;

        // Fetch from source
        const data = await this.fetchData();

        // Cache for 1 hour
        await this.redis.set(key, data, 3600);

        return data;
    }
}
```

---

## API Reference

### Basic Operations

| Method | Description |
|--------|-------------|
| `get<T>(key)` | Get cached value |
| `set(key, value, ttl?)` | Set value with optional TTL |
| `del(key)` | Delete a key |
| `exists(key)` | Check if key exists |
| `ttl(key)` | Get remaining TTL |

### Rate Limiting

| Method | Description |
|--------|-------------|
| `incr(key, ttl?)` | Increment counter (for rate limiting) |
| `getCount(key)` | Get current count |

### Hash Operations

| Method | Description |
|--------|-------------|
| `hset(key, field, value)` | Set hash field |
| `hget(key, field)` | Get hash field |
| `hgetall(key)` | Get all hash fields |

### Utility

| Method | Description |
|--------|-------------|
| `getStatus()` | Get connection status |
| `getInfo()` | Get cache statistics |
| `flushAll()` | Clear all cache (use carefully!) |

---

## Health Check

Redis connection status is included in the health check endpoint:

```bash
GET /health/ready
```

Response:
```json
{
    "status": "ok",
    "details": {
        "redis": {
            "status": "up",
            "type": "redis"  // or "memory" for fallback
        }
    }
}
```

---

## Troubleshooting

### "ECONNREFUSED" Error
- Redis server is not running or unreachable
- Check the `REDIS_URL` is correct
- Verify firewall allows connection

### "NOAUTH Authentication required"
- Password is missing from URL
- Use format: `redis://:password@host:port`

### High Memory Usage
- Set appropriate TTL values
- Monitor with `redis.getInfo()`
- Consider Upstash for automatic eviction

### Connection Timeout
- Increase timeout in Redis URL: `redis://host:port?connectTimeout=10000`
- Check network latency
