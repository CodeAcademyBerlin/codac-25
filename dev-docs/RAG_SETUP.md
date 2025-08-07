# RAG Chat Assistant Setup

This document explains how to set up and configure the RAG (Retrieval-Augmented Generation) chat assistant for the LMS platform.

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
# RAG Configuration
EMBEDDING_PROVIDER=local  # 'local' for development, 'gemini' for production
GEMINI_API_KEY=your_gemini_api_key_here  # Required when EMBEDDING_PROVIDER=gemini

# OpenAI Configuration (existing - used for LLM responses)
OPENAI_API_KEY=your_openai_api_key_here
```

## Database Setup

The RAG system requires PostgreSQL with the following tables:
- `content_embeddings` - Stores text chunks and their vector embeddings
- `chat_sessions` - Stores user chat sessions
- `chat_messages` - Stores individual chat messages

### With pgvector (Production)

For optimal performance in production, install the pgvector extension:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Then update the `content_embeddings` table to use proper vector columns:

```sql
ALTER TABLE content_embeddings 
ALTER COLUMN embedding TYPE vector(768);

CREATE INDEX content_embeddings_embedding_idx 
ON content_embeddings 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);
```

### Without pgvector (Development)

The current setup uses JSONB columns for embeddings, which works for development but is less efficient for large datasets.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   LMS Content   │───▶│  Content Indexer │───▶│  Vector Store   │
│ (Courses/Lessons)│    │   (TextChunker)  │    │   (PostgreSQL)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌──────────────────┐           │
│   Chat UI       │───▶│   RAG Engine     │◀──────────┘
│  (/lms/chat)    │    │ (Query + LLM)    │
└─────────────────┘    └──────────────────┘
                                │
                       ┌──────────────────┐
                       │  LLM Provider    │
                       │ (OpenAI/Local)   │
                       └──────────────────┘
```

## Components

### 1. Content Indexing
- **TextChunker**: Splits content into overlapping chunks (800 tokens with 100 token overlap)
- **EmbeddingProvider**: Generates vector embeddings (local mock or Gemini)
- **VectorStore**: Manages embedding storage and similarity search

### 2. Chat System
- **ChatService**: Manages chat sessions and message history
- **RAG Engine**: Combines retrieval with generation for contextual responses

### 3. Content Types Indexed
- **Courses**: Title, description, category information
- **Projects**: Project descriptions and overviews  
- **Lessons**: Full lesson content and materials
- **Assignments**: Instructions and requirements
- **Resources**: Resource descriptions and metadata

## Usage

### Phase 1 Status: ✅ COMPLETED
- ✅ Database schema with vector support (JSON fallback)
- ✅ Embedding providers (Local + Gemini)
- ✅ Text chunking with hierarchical approach
- ✅ Vector storage and similarity search
- ✅ Chat session management
- ✅ Configuration and utilities

### Phase 2 Status: ✅ COMPLETED
- ✅ Content indexing service (`ContentIndexer`)
- ✅ Batch embedding generation for all LMS content
- ✅ Admin server actions for manual reindexing
- ✅ Command-line scripts for content indexing
- ✅ Hierarchical content chunking (courses → projects → lessons → assignments)
- ✅ Resource indexing (lesson and assignment resources)

### Phase 3 Status: ✅ COMPLETED
- ✅ RAG query engine (`RAGEngine`) with context retrieval
- ✅ OpenAI LLM integration for response generation
- ✅ Streaming and regular response modes
- ✅ Context-aware prompt engineering with conversation history
- ✅ Source citation and similarity scoring
- ✅ Follow-up question suggestions
- ✅ Complete REST API endpoints (`/api/chat/rag`, `/api/chat/sessions`)
- ✅ React hooks for chat functionality (`useRAGChat`, `useChatSessions`)
- ✅ Error handling and request validation

### Phase 4 Status: ✅ COMPLETED
- ✅ Beautiful, responsive chat interface (`/lms/chat`)
- ✅ Real-time streaming message display with typing animations
- ✅ Session management sidebar with CRUD operations
- ✅ Welcome screen with suggested starter questions
- ✅ Source citation display with expandable details
- ✅ Follow-up suggestion chips
- ✅ Mobile-responsive design with collapsible sidebar
- ✅ Integration with existing LMS navigation
- ✅ Admin panel for RAG system management (`/lms/admin/rag`)

### Phase 5 Status: ✅ COMPLETED
- ✅ Production-ready optimized RAG engine with caching
- ✅ Comprehensive analytics and usage tracking system
- ✅ Advanced rate limiting and security measures
- ✅ Real-time monitoring dashboard with system health metrics
- ✅ Performance optimization with intelligent caching strategies
- ✅ Production deployment guide and scaling documentation
- ✅ Backup and disaster recovery procedures
- ✅ Cost optimization and resource management strategies

## 🎉 RAG Chat Assistant - PRODUCTION READY!

## Content Indexing

### Command Line Usage

```bash
# Index all LMS content
pnpm rag:index

# Show indexing statistics
pnpm rag:stats

# Full script with options
npx tsx scripts/index-rag-content.ts --full
npx tsx scripts/index-rag-content.ts --stats
```

### Programmatic Usage

```typescript
import { ContentIndexer, createEmbeddingProvider, TextChunker } from '@/lib/rag';

// Index all content
const indexer = new ContentIndexer();
const result = await indexer.indexAllContent();
console.log(`Indexed ${result.indexed} chunks with ${result.errors.length} errors`);

// Reindex specific content
await indexer.reindexContent('lesson', 'lesson-id-here');

// Get indexing statistics
const stats = await indexer.getIndexingStats();
console.log('Total embeddings:', stats.totalEmbeddings);
```

### Server Actions (Admin/Mentor only)

```typescript
import { indexAllContent, reindexContent, getIndexingStats } from '@/actions/rag/index-content';

// Trigger full reindexing
const result = await indexAllContent();
if (result.success) {
  console.log(`Indexed ${result.data.indexed} items`);
}
```

## RAG Query API

### REST API Endpoints

#### POST `/api/chat/rag`
Query the RAG system with a user question.

```typescript
// Regular response
const response = await fetch('/api/chat/rag', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "How do I get started with data science?",
    sessionId: "session-123", // optional
    maxSources: 5, // optional, default 5
    includeContext: true, // optional, default true
    model: "gpt-4o-mini", // optional, default gpt-4o-mini
    stream: false // optional, default false
  })
});

const data = await response.json();
// Returns: { sessionId, response, sources, suggestions, tokenCount }
```

#### Streaming Response
```typescript
// Streaming response
const response = await fetch('/api/chat/rag', {
  method: 'POST',
  body: JSON.stringify({ query: "...", stream: true })
});

const reader = response.body?.getReader();
// Receives: { type: 'sources'|'content'|'done', data: ... }
```

#### GET `/api/chat/sessions`
Get user's chat sessions.

```typescript
const response = await fetch('/api/chat/sessions?limit=20');
const { sessions } = await response.json();
```

#### GET `/api/chat/sessions/[sessionId]`
Get specific session with full message history.

### React Hooks

#### useRAGChat
```typescript
import { useRAGChat } from '@/hooks/use-rag-chat';

const {
  messages,
  isLoading,
  sessionId,
  suggestions,
  sendMessage,
  stopGeneration,
  clearMessages
} = useRAGChat({
  maxSources: 5,
  includeContext: true,
  model: 'gpt-4o-mini'
});

// Send a message
await sendMessage("What is machine learning?", true); // streaming = true
```

#### useChatSessions
```typescript
import { useChatSessions } from '@/hooks/use-chat-sessions';

const {
  sessions,
  isLoading,
  createSession,
  deleteSession,
  updateSessionTitle
} = useChatSessions();

// Create new session
const newSession = await createSession("My Chat");
```

## Performance Considerations

### Development (Current)
- JSON-based embeddings with application-level similarity calculation
- Suitable for small datasets (< 1000 documents)
- Easy to set up and test

### Production (Future)
- pgvector extension for optimized vector operations
- HNSW indexing for fast similarity search
- Batch processing for large content updates
- Caching layer for frequently accessed embeddings

## Security

- Chat sessions are user-scoped (users can only access their own chats)
- Content embeddings include metadata for access control
- API keys are environment-variable based
- Rate limiting should be implemented for embedding generation
