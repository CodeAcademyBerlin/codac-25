// Main RAG service exports
export { VectorStore } from './vector-store';
export { ChatService } from './chat-service';
export { TextChunker } from './text-chunker';
export { ContentIndexer } from './content-indexer';
export { RAGEngine } from './rag-engine';
export { OptimizedRAGEngine } from './optimized-rag-engine';
export { createEmbeddingProvider, LocalEmbeddingProvider, GeminiEmbeddingProvider } from './embedding-providers';
export { RAG_CONFIG, SYSTEM_PROMPTS } from './config';

// Production utilities
export { ragCache } from './cache';
export { RAGAnalytics } from './analytics';
export { RateLimiter, rateLimiters, withRateLimit } from './rate-limiter';

// Re-export types
export type {
    ContentChunk,
    EmbeddingResult,
    ChatMessage,
    ChatSession,
    ContentSource,
    RAGQueryResult,
    EmbeddingProvider,
    RAGConfig
} from '@/types/rag';
