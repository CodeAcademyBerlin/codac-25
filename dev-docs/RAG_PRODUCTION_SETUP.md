# RAG System Production Setup Guide

This guide covers the production deployment and optimization of the RAG-based chat assistant.

## 🚀 Production Deployment Checklist

### Environment Configuration

#### Required Environment Variables
```bash
# Core Configuration
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://yourdomain.com

# AI/ML Configuration
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key  # For production embeddings
EMBEDDING_PROVIDER=gemini  # Use 'local' for development

# RAG System Configuration
RAG_CACHE_TTL=3600000  # 1 hour in milliseconds
RAG_MAX_CACHE_SIZE=2000
RAG_SIMILARITY_THRESHOLD=0.7
RAG_MAX_RETRIEVAL_RESULTS=5

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
RAG_QUERY_RATE_LIMIT=10  # per minute

# Monitoring
ENABLE_ANALYTICS=true
LOG_LEVEL=info
```

### Database Setup

#### PostgreSQL with pgvector Extension

1. **Install pgvector extension:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

2. **Update content_embeddings table:**
```sql
-- Migrate from JSONB to proper vector column
ALTER TABLE content_embeddings 
ADD COLUMN embedding_vector vector(768);

-- Migrate existing data (if any)
UPDATE content_embeddings 
SET embedding_vector = embedding::text::vector(768)
WHERE embedding IS NOT NULL;

-- Create optimized index
CREATE INDEX CONCURRENTLY content_embeddings_vector_idx 
ON content_embeddings 
USING hnsw (embedding_vector vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- Drop old JSONB column after migration
ALTER TABLE content_embeddings DROP COLUMN embedding;
ALTER TABLE content_embeddings RENAME COLUMN embedding_vector TO embedding;
```

3. **Database Performance Tuning:**
```sql
-- Optimize for vector operations
SET shared_preload_libraries = 'vector';
SET max_connections = 200;
SET shared_buffers = '256MB';
SET effective_cache_size = '1GB';
SET work_mem = '16MB';
SET maintenance_work_mem = '64MB';
```

### Application Optimizations

#### 1. Caching Strategy

**Redis Integration (Recommended for Production):**
```typescript
// lib/rag/redis-cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export class RedisRAGCache {
  async set(key: string, data: any, ttl: number = 3600): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(data));
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }
}
```

#### 2. Connection Pooling

**Database Connection Pool:**
```typescript
// lib/db/connection-pool.ts
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### 3. Load Balancing

**API Route Load Balancing:**
```nginx
# nginx.conf
upstream rag_api {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name yourdomain.com;

    location /api/chat/rag {
        proxy_pass http://rag_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Performance Monitoring

#### 1. Application Performance Monitoring (APM)

**Integrate with monitoring service:**
```typescript
// lib/monitoring/apm.ts
import { trace, metrics } from '@opentelemetry/api';

export const ragTracer = trace.getTracer('rag-system');
export const ragMeter = metrics.getMeter('rag-system');

export const queryDuration = ragMeter.createHistogram('rag_query_duration', {
  description: 'RAG query processing time',
  unit: 'ms'
});

export const cacheHitRate = ragMeter.createCounter('rag_cache_hits', {
  description: 'RAG cache hit count'
});
```

#### 2. Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = await Promise.allSettled([
    // Database connectivity
    prisma.$queryRaw`SELECT 1`,
    
    // Redis connectivity
    redis.ping(),
    
    // OpenAI API
    fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
    }),
    
    // Vector search
    prisma.contentEmbedding.count()
  ]);

  const status = checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'unhealthy';
  
  return Response.json({
    status,
    timestamp: new Date().toISOString(),
    checks: checks.map((check, index) => ({
      name: ['database', 'redis', 'openai', 'embeddings'][index],
      status: check.status
    }))
  });
}
```

### Security Configuration

#### 1. API Security

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters } from '@/lib/rag/rate-limiter';

export async function middleware(request: NextRequest) {
  // Rate limiting
  if (request.nextUrl.pathname.startsWith('/api/chat/rag')) {
    const userId = getUserIdFromRequest(request);
    const rateLimitResult = await rateLimiters.ragQuery.checkLimit(userId);
    
    if (!rateLimitResult.allowed) {
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }
  }

  // CORS headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}
```

#### 2. Input Validation & Sanitization

```typescript
// lib/validation/rag-input.ts
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

export const RAGQuerySchema = z.object({
  query: z.string()
    .min(1, 'Query is required')
    .max(1000, 'Query too long')
    .refine(query => {
      // Prevent injection attempts
      const dangerous = ['<script', 'javascript:', 'data:', 'vbscript:'];
      return !dangerous.some(pattern => query.toLowerCase().includes(pattern));
    }, 'Invalid query content'),
  
  sessionId: z.string().uuid().optional(),
  maxSources: z.number().min(1).max(10).optional(),
});

export function sanitizeQuery(query: string): string {
  return DOMPurify.sanitize(query, { ALLOWED_TAGS: [] });
}
```

### Scaling Considerations

#### 1. Horizontal Scaling

**Container Deployment (Docker):**
```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
COPY . .
RUN npm run build

FROM base AS runtime
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

**Kubernetes Deployment:**
```yaml
# k8s/rag-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rag-chat-assistant
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rag-chat-assistant
  template:
    metadata:
      labels:
        app: rag-chat-assistant
    spec:
      containers:
      - name: app
        image: your-registry/rag-chat-assistant:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

#### 2. Database Scaling

**Read Replicas for Analytics:**
```typescript
// lib/db/read-replica.ts
export const analyticsDb = new Pool({
  connectionString: process.env.ANALYTICS_DATABASE_URL,
  max: 10,
});

// Use read replica for heavy analytics queries
export async function getUsageMetrics() {
  return analyticsDb.query(/* complex analytics query */);
}
```

### Monitoring & Alerting

#### 1. Metrics Collection

```typescript
// lib/monitoring/metrics.ts
export const metrics = {
  // Query metrics
  queryDuration: new Histogram('rag_query_duration_seconds'),
  queryCount: new Counter('rag_queries_total'),
  queryErrors: new Counter('rag_query_errors_total'),
  
  // Cache metrics
  cacheHits: new Counter('rag_cache_hits_total'),
  cacheMisses: new Counter('rag_cache_misses_total'),
  
  // System metrics
  embeddingCount: new Gauge('rag_embeddings_total'),
  activeUsers: new Gauge('rag_active_users'),
};
```

#### 2. Alerting Rules

```yaml
# alerting/rules.yml
groups:
- name: rag-system
  rules:
  - alert: HighErrorRate
    expr: rate(rag_query_errors_total[5m]) > 0.1
    for: 2m
    annotations:
      summary: "High error rate in RAG system"
      
  - alert: SlowQueries
    expr: histogram_quantile(0.95, rag_query_duration_seconds) > 5
    for: 5m
    annotations:
      summary: "95th percentile query time exceeds 5 seconds"
      
  - alert: LowCacheHitRate
    expr: rate(rag_cache_hits_total[10m]) / (rate(rag_cache_hits_total[10m]) + rate(rag_cache_misses_total[10m])) < 0.7
    for: 5m
    annotations:
      summary: "Cache hit rate below 70%"
```

### Backup & Recovery

#### 1. Database Backups

```bash
#!/bin/bash
# scripts/backup-embeddings.sh

# Backup embeddings table
pg_dump $DATABASE_URL \
  --table=content_embeddings \
  --data-only \
  --file=embeddings-$(date +%Y%m%d).sql

# Upload to cloud storage
aws s3 cp embeddings-$(date +%Y%m%d).sql \
  s3://your-backup-bucket/rag-backups/
```

#### 2. Disaster Recovery

```typescript
// scripts/restore-embeddings.ts
export async function restoreFromBackup(backupFile: string) {
  console.log('Starting embedding restoration...');
  
  // Clear existing embeddings
  await prisma.contentEmbedding.deleteMany({});
  
  // Restore from backup
  await exec(`psql ${process.env.DATABASE_URL} -f ${backupFile}`);
  
  // Verify restoration
  const count = await prisma.contentEmbedding.count();
  console.log(`Restored ${count} embeddings`);
}
```

### Cost Optimization

#### 1. Embedding Costs

- **Cache embeddings aggressively** (1-4 hour TTL)
- **Batch similar queries** to reduce API calls
- **Use cheaper models** for follow-up suggestions
- **Implement query deduplication**

#### 2. Database Costs

- **Archive old chat sessions** after 90 days
- **Compress embedding storage** using quantization
- **Use connection pooling** to reduce overhead

#### 3. Infrastructure Costs

- **Auto-scaling** based on usage patterns
- **Spot instances** for non-critical workloads
- **CDN caching** for static assets

### Maintenance Procedures

#### 1. Content Reindexing

```bash
# Automated reindexing script
#!/bin/bash
echo "Starting scheduled reindexing..."

# Run indexing with monitoring
npm run rag:index 2>&1 | tee /var/log/rag-indexing.log

# Check for errors
if [ $? -ne 0 ]; then
    echo "Indexing failed, sending alert..."
    curl -X POST "$SLACK_WEBHOOK" \
         -H 'Content-type: application/json' \
         --data '{"text":"RAG indexing failed - check logs"}'
fi
```

#### 2. Cache Warming

```typescript
// scripts/warm-cache.ts
export async function warmCache() {
  const popularQueries = [
    "What courses are available?",
    "How do I get started?",
    "What are the prerequisites?",
    // ... more popular queries
  ];

  for (const query of popularQueries) {
    await ragEngine.query(query, 'cache-warming', 'system');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
```

## 📊 Production Metrics

### Key Performance Indicators (KPIs)

- **Query Response Time**: < 2s (95th percentile)
- **Cache Hit Rate**: > 75%
- **Error Rate**: < 1%
- **Uptime**: > 99.9%
- **User Satisfaction**: > 4.5/5 stars

### Success Metrics

- **Daily Active Users**: Track engagement
- **Queries per Session**: Measure usefulness
- **Source Citation Rate**: Measure accuracy
- **Follow-up Question Usage**: Measure engagement

This production setup ensures your RAG chat assistant is scalable, reliable, and cost-effective in a production environment.
