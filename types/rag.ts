export interface ContentChunk {
    id: string;
    contentType: 'lesson' | 'assignment' | 'resource' | 'course' | 'project';
    contentId: string;
    chunkIndex: number;
    chunkText: string;
    metadata: {
        courseId?: string;
        projectId?: string;
        lessonId?: string;
        title?: string;
        description?: string;
        category?: string;
        difficulty?: string;
        [key: string]: any;
    };
    tokenCount?: number;
}

export interface EmbeddingResult {
    embedding: number[];
    tokenCount: number;
}

export interface ChatMessage {
    id: string;
    sessionId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    sources?: ContentSource[];
    tokenCount?: number;
    createdAt: Date;
}

export interface ChatSession {
    id: string;
    userId: string;
    title?: string;
    messages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ContentSource {
    id: string;
    contentType: string;
    contentId: string;
    chunkText: string;
    metadata: Record<string, any>;
    similarity: number;
    priorityScore?: number;
}

export interface RAGQueryResult {
    sources: ContentSource[];
    response: string;
    tokenCount: number;
    suggestions?: string[];
    metadata?: {
        intent?: string;
        confidence?: number;
        searchStrategy?: string;
        expandedQuery?: string;
        conversationTopics?: string[];
    };
}

export interface EmbeddingProvider {
    generateEmbedding(text: string): Promise<EmbeddingResult>;
    generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]>;
}

export interface RAGConfig {
    embeddingProvider: 'local' | 'gemini';
    vectorDimensions: number;
    chunkSize: number;
    chunkOverlap: number;
    maxRetrievalResults: number;
    similarityThreshold: number;
}
