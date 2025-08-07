import { ChatMessage } from '@/types/rag';
import { createEmbeddingProvider } from './embedding-providers';
import { logger } from '@/lib/logger';

export interface ConversationContext {
    recentMessages: ChatMessage[];
    topics: string[];
    userIntent: string[];
    followUpContext: string | null;
    semanticSummary: string;
}

export interface MemoryEntry {
    message: ChatMessage;
    embedding: number[];
    topics: string[];
    importance: number;
    timestamp: Date;
}

export class ConversationMemory {
    private embeddingProvider;
    private memoryStore: Map<string, MemoryEntry[]> = new Map();
    private maxMemoryEntries = 20;
    private semanticSearchThreshold = 0.75;

    constructor() {
        this.embeddingProvider = createEmbeddingProvider();
    }

    /**
     * Add a message to conversation memory
     */
    async addMessage(sessionId: string, message: ChatMessage): Promise<void> {
        try {
            // Generate embedding for semantic search
            const embedding = await this.embeddingProvider.generateEmbedding(message.content);

            // Extract topics and calculate importance
            const topics = this.extractTopics(message.content);
            const importance = this.calculateMessageImportance(message);

            const memoryEntry: MemoryEntry = {
                message,
                embedding: embedding.embedding,
                topics,
                importance,
                timestamp: new Date(message.createdAt)
            };

            // Add to memory store
            if (!this.memoryStore.has(sessionId)) {
                this.memoryStore.set(sessionId, []);
            }

            const sessionMemory = this.memoryStore.get(sessionId)!;
            sessionMemory.push(memoryEntry);

            // Maintain memory size limit
            if (sessionMemory.length > this.maxMemoryEntries) {
                // Remove least important older messages
                sessionMemory.sort((a, b) => {
                    const importanceDiff = b.importance - a.importance;
                    if (Math.abs(importanceDiff) < 0.1) {
                        // If importance is similar, prefer newer messages
                        return b.timestamp.getTime() - a.timestamp.getTime();
                    }
                    return importanceDiff;
                });

                this.memoryStore.set(sessionId, sessionMemory.slice(0, this.maxMemoryEntries));
            }

        } catch (error) {
            logger.error('Failed to add message to memory:', error instanceof Error ? error : undefined);
        }
    }

    /**
     * Get enhanced conversation context
     */
    async getEnhancedContext(
        sessionId: string,
        currentQuery: string,
        options: {
            includeSemanticSimilar?: boolean;
            maxMessages?: number;
            focusOnTopics?: string[];
        } = {}
    ): Promise<ConversationContext> {
        const sessionMemory = this.memoryStore.get(sessionId) || [];
        const maxMessages = options.maxMessages || 10;

        if (sessionMemory.length === 0) {
            return {
                recentMessages: [],
                topics: [],
                userIntent: [],
                followUpContext: null,
                semanticSummary: ''
            };
        }

        try {
            let relevantMessages: MemoryEntry[] = [];

            if (options.includeSemanticSimilar) {
                // Find semantically similar messages
                const queryEmbedding = await this.embeddingProvider.generateEmbedding(currentQuery);
                relevantMessages = await this.findSemanticallySimilar(
                    sessionMemory,
                    queryEmbedding.embedding,
                    maxMessages
                );
            } else {
                // Get recent messages with importance weighting
                relevantMessages = sessionMemory
                    .sort((a, b) => {
                        const recencyScore = (b.timestamp.getTime() - a.timestamp.getTime()) / (1000 * 60 * 60); // hours
                        const bScore = b.importance + (recencyScore * 0.1);
                        const aScore = a.importance + (recencyScore * 0.1);
                        return bScore - aScore;
                    })
                    .slice(0, maxMessages);
            }

            // Focus on specific topics if requested
            if (options.focusOnTopics && options.focusOnTopics.length > 0) {
                relevantMessages = relevantMessages.filter(entry =>
                    entry.topics.some(topic =>
                        options.focusOnTopics!.some(focusTopic =>
                            topic.toLowerCase().includes(focusTopic.toLowerCase())
                        )
                    )
                );
            }

            // Extract context information
            const recentMessages = relevantMessages.map(entry => entry.message);
            const allTopics = relevantMessages.flatMap(entry => entry.topics);
            const topics = [...new Set(allTopics)];

            const userIntent = this.extractUserIntent(relevantMessages);
            const followUpContext = this.detectFollowUpContext(relevantMessages);
            const semanticSummary = this.generateSemanticSummary(relevantMessages);

            return {
                recentMessages,
                topics,
                userIntent,
                followUpContext,
                semanticSummary
            };

        } catch (error) {
            logger.error('Failed to get enhanced context:', error instanceof Error ? error : undefined);

            // Fallback to simple recent messages
            const recentMessages = sessionMemory
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, maxMessages)
                .map(entry => entry.message);

            return {
                recentMessages,
                topics: [],
                userIntent: [],
                followUpContext: null,
                semanticSummary: ''
            };
        }
    }

    /**
     * Find semantically similar messages in memory
     */
    private async findSemanticallySimilar(
        sessionMemory: MemoryEntry[],
        queryEmbedding: number[],
        maxResults: number
    ): Promise<MemoryEntry[]> {
        const similarities = sessionMemory.map(entry => ({
            entry,
            similarity: this.cosineSimilarity(queryEmbedding, entry.embedding)
        }));

        return similarities
            .filter(item => item.similarity > this.semanticSearchThreshold)
            .sort((a, b) => {
                // Combine similarity with importance and recency
                const aScore = a.similarity * 0.6 + a.entry.importance * 0.3 +
                    (a.entry.timestamp.getTime() / (1000 * 60 * 60 * 24)) * 0.1;
                const bScore = b.similarity * 0.6 + b.entry.importance * 0.3 +
                    (b.entry.timestamp.getTime() / (1000 * 60 * 60 * 24)) * 0.1;
                return bScore - aScore;
            })
            .slice(0, maxResults)
            .map(item => item.entry);
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Extract topics from message content
     */
    private extractTopics(content: string): string[] {
        // Simple topic extraction - in production, use more sophisticated NLP
        const topicPatterns = {
            'web-development': /web|html|css|javascript|react|node|frontend|backend|website/i,
            'data-science': /data|python|analysis|machine learning|statistics|pandas|numpy|visualization/i,
            'career': /career|job|interview|resume|portfolio|networking|professional/i,
            'programming': /code|coding|programming|algorithm|function|variable|syntax|debug/i,
            'design': /design|ui|ux|user interface|user experience|wireframe|prototype/i,
            'database': /database|sql|query|table|schema|mysql|postgresql/i,
            'testing': /test|testing|unit test|integration|qa|quality assurance/i,
            'deployment': /deploy|deployment|hosting|server|production|aws|cloud/i
        };

        const topics: string[] = [];
        for (const [topic, pattern] of Object.entries(topicPatterns)) {
            if (pattern.test(content)) {
                topics.push(topic);
            }
        }

        // Also extract specific technical terms
        const technicalTerms = content.match(/\b[A-Z][a-z]+(?:[A-Z][a-z]+)*\b/g) || [];
        const relevantTerms = technicalTerms.filter(term =>
            term.length > 3 && !['The', 'This', 'That', 'What', 'How', 'Why'].includes(term)
        );

        return [...topics, ...relevantTerms.slice(0, 3)];
    }

    /**
     * Calculate the importance of a message
     */
    private calculateMessageImportance(message: ChatMessage): number {
        let importance = 0.5; // Base importance

        // User questions are generally more important
        if (message.role === 'user') {
            importance += 0.2;

            // Question patterns indicate higher importance
            if (message.content.includes('?') ||
                message.content.toLowerCase().match(/^(what|how|why|when|where|which|who)/)) {
                importance += 0.1;
            }
        }

        // Assistant responses with sources are important
        if (message.role === 'assistant' && message.sources && message.sources.length > 0) {
            importance += 0.2;
        }

        // Longer messages tend to be more important
        const wordCount = message.content.split(/\s+/).length;
        if (wordCount > 20) {
            importance += Math.min(0.2, (wordCount - 20) * 0.005);
        }

        // Messages with technical terms or specific topics
        const topics = this.extractTopics(message.content);
        if (topics.length > 0) {
            importance += Math.min(0.15, topics.length * 0.05);
        }

        // Messages with code or examples
        if (message.content.includes('```') ||
            message.content.toLowerCase().includes('example')) {
            importance += 0.1;
        }

        return Math.min(1.0, importance);
    }

    /**
     * Extract user intent patterns from conversation history
     */
    private extractUserIntent(memoryEntries: MemoryEntry[]): string[] {
        const userMessages = memoryEntries
            .filter(entry => entry.message.role === 'user')
            .map(entry => entry.message.content.toLowerCase());

        const intentPatterns = {
            'learning': /learn|understand|study|explain|teach|know about/,
            'problem-solving': /help|solve|fix|issue|problem|error|bug/,
            'guidance': /how to|guide|step|instruction|tutorial|process/,
            'comparison': /compare|difference|better|versus|vs|which/,
            'examples': /example|sample|show|demonstrate|instance/,
            'clarification': /clarify|clear|confused|understand better/
        };

        const intents: string[] = [];
        for (const [intent, pattern] of Object.entries(intentPatterns)) {
            if (userMessages.some(message => pattern.test(message))) {
                intents.push(intent);
            }
        }

        return intents;
    }

    /**
     * Detect follow-up context from recent messages
     */
    private detectFollowUpContext(memoryEntries: MemoryEntry[]): string | null {
        if (memoryEntries.length < 2) return null;

        const recent = memoryEntries.slice(0, 3); // Last 3 messages
        const userMessages = recent.filter(entry => entry.message.role === 'user');

        if (userMessages.length === 0) return null;

        const lastUserMessage = userMessages[0].message.content.toLowerCase();

        // Detect follow-up patterns
        const followUpPatterns = [
            /can you (also|additionally|further|more)/,
            /what about/,
            /how about/,
            /and what/,
            /tell me more/,
            /explain (that|this) (more|further|better)/,
            /give me (another|more) example/
        ];

        for (const pattern of followUpPatterns) {
            if (pattern.test(lastUserMessage)) {
                // Find the topic they're following up on
                const previousTopics = recent
                    .slice(1) // Skip current message
                    .flatMap(entry => entry.topics)
                    .slice(0, 3);

                if (previousTopics.length > 0) {
                    return `Follow-up question about: ${previousTopics.join(', ')}`;
                }
            }
        }

        return null;
    }

    /**
     * Generate a semantic summary of the conversation
     */
    private generateSemanticSummary(memoryEntries: MemoryEntry[]): string {
        if (memoryEntries.length === 0) return '';

        const allTopics = memoryEntries.flatMap(entry => entry.topics);
        const uniqueTopics = [...new Set(allTopics)];

        const userMessages = memoryEntries.filter(entry => entry.message.role === 'user');
        const questionCount = userMessages.filter(entry =>
            entry.message.content.includes('?') ||
            entry.message.content.toLowerCase().match(/^(what|how|why|when|where|which|who)/)
        ).length;

        let summary = '';

        if (uniqueTopics.length > 0) {
            summary += `Topics discussed: ${uniqueTopics.slice(0, 5).join(', ')}. `;
        }

        if (questionCount > 0) {
            summary += `${questionCount} questions asked. `;
        }

        const recentUserQuery = userMessages[0]?.message.content;
        if (recentUserQuery && recentUserQuery.length < 100) {
            summary += `Latest query: "${recentUserQuery.substring(0, 80)}..."`;
        }

        return summary.trim();
    }

    /**
     * Clear memory for a session
     */
    clearSession(sessionId: string): void {
        this.memoryStore.delete(sessionId);
    }

    /**
     * Get memory statistics
     */
    getMemoryStats(): {
        totalSessions: number;
        totalMessages: number;
        averageMessagesPerSession: number;
    } {
        const totalSessions = this.memoryStore.size;
        const totalMessages = Array.from(this.memoryStore.values())
            .reduce((sum, entries) => sum + entries.length, 0);

        return {
            totalSessions,
            totalMessages,
            averageMessagesPerSession: totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0
        };
    }
}
