import { ContentSource } from '@/types/rag';
import { VectorStore } from './vector-store';
import { createEmbeddingProvider } from './embedding-providers';
import { logger } from '@/lib/logger';
import { RAG_CONFIG } from './config';

export interface QueryIntent {
    type: 'question' | 'explanation' | 'example' | 'instruction' | 'overview';
    confidence: number;
    keywords: string[];
    topics: string[];
}

export interface EnhancedRetrievalResult {
    sources: ContentSource[];
    intent: QueryIntent;
    expandedQuery: string;
    searchStrategy: string;
}

export class EnhancedRetrievalEngine {
    private vectorStore: VectorStore;
    private embeddingProvider;

    constructor() {
        this.vectorStore = new VectorStore();
        this.embeddingProvider = createEmbeddingProvider();
    }

    /**
     * Enhanced retrieval with query analysis and multi-stage search
     */
    async retrieveEnhanced(
        query: string,
        options: {
            maxSources?: number;
            includeIntent?: boolean;
            diversityBoost?: boolean;
        } = {}
    ): Promise<EnhancedRetrievalResult> {
        const maxSources = options.maxSources || RAG_CONFIG.maxRetrievalResults;

        try {
            // Stage 1: Analyze query intent
            const intent = this.analyzeQueryIntent(query);
            logger.debug('Query intent analysis');

            // Stage 2: Expand query based on intent
            const expandedQuery = await this.expandQuery(query, intent);
            logger.debug('Expanded query');

            // Stage 3: Multi-strategy retrieval
            const retrievalStrategy = this.selectRetrievalStrategy(intent);
            const sources = await this.executeRetrievalStrategy(
                query,
                expandedQuery,
                intent,
                retrievalStrategy,
                maxSources,
                options.diversityBoost || false
            );

            return {
                sources,
                intent,
                expandedQuery,
                searchStrategy: retrievalStrategy
            };

        } catch (error) {
            logger.error('Enhanced retrieval failed:', error instanceof Error ? error : undefined);

            // Fallback to basic retrieval
            const embedding = await this.embeddingProvider.generateEmbedding(query);
            const sources = await this.vectorStore.searchSimilarWithPriority(
                embedding.embedding,
                maxSources
            );

            return {
                sources,
                intent: { type: 'question', confidence: 0.5, keywords: [], topics: [] },
                expandedQuery: query,
                searchStrategy: 'fallback'
            };
        }
    }

    /**
     * Analyze the intent behind a user query
     */
    private analyzeQueryIntent(query: string): QueryIntent {
        const lowerQuery = query.toLowerCase();

        // Intent patterns
        const patterns = {
            question: /^(what|how|why|when|where|which|who|can|could|would|should|is|are|do|does|did)/,
            explanation: /(explain|describe|tell me about|what is|how does|understand)/,
            example: /(example|sample|show me|demonstrate|instance)/,
            instruction: /(how to|step|guide|tutorial|process|procedure)/,
            overview: /(overview|summary|introduction|about|general|basics)/
        };

        let bestMatch: QueryIntent['type'] = 'question';
        let maxConfidence = 0;

        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(lowerQuery)) {
                const confidence = this.calculateIntentConfidence(lowerQuery, type as QueryIntent['type']);
                if (confidence > maxConfidence) {
                    maxConfidence = confidence;
                    bestMatch = type as QueryIntent['type'];
                }
            }
        }

        // Extract keywords and topics
        const keywords = this.extractQueryKeywords(query);
        const topics = this.identifyTopics(query, keywords);

        return {
            type: bestMatch,
            confidence: Math.max(0.6, maxConfidence), // Minimum confidence
            keywords,
            topics
        };
    }

    /**
     * Calculate confidence for intent classification
     */
    private calculateIntentConfidence(query: string, intentType: QueryIntent['type']): number {
        let confidence = 0.7; // Base confidence

        // Boost confidence based on specific indicators
        const indicators = {
            question: ['?', 'what', 'how', 'why'],
            explanation: ['explain', 'describe', 'understand'],
            example: ['example', 'sample', 'show'],
            instruction: ['step', 'guide', 'tutorial'],
            overview: ['overview', 'summary', 'about']
        };

        const queryWords = query.toLowerCase().split(/\s+/);
        const relevantIndicators = indicators[intentType] || [];

        const matchCount = relevantIndicators.filter(indicator =>
            queryWords.some(word => word.includes(indicator))
        ).length;

        confidence += matchCount * 0.1;
        return Math.min(1.0, confidence);
    }

    /**
     * Extract meaningful keywords from query
     */
    private extractQueryKeywords(query: string): string[] {
        // Remove common question words and extract meaningful terms
        const stopWords = new Set([
            'what', 'how', 'why', 'when', 'where', 'which', 'who', 'can', 'could', 'would', 'should',
            'is', 'are', 'do', 'does', 'did', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at',
            'to', 'for', 'of', 'with', 'by', 'about', 'me', 'you', 'i'
        ]);

        return query.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word))
            .slice(0, 10); // Limit to top 10 keywords
    }

    /**
     * Identify topics from query and keywords
     */
    private identifyTopics(query: string, keywords: string[]): string[] {
        // Course/domain-specific topics
        const topicPatterns = {
            'web-development': /web|html|css|javascript|react|node|frontend|backend/i,
            'data-science': /data|python|analysis|machine learning|statistics|pandas|numpy/i,
            'career': /career|job|interview|resume|portfolio|networking/i,
            'programming': /code|coding|programming|algorithm|function|variable/i,
            'design': /design|ui|ux|user interface|user experience|wireframe/i
        };

        const topics: string[] = [];
        const fullText = query + ' ' + keywords.join(' ');

        for (const [topic, pattern] of Object.entries(topicPatterns)) {
            if (pattern.test(fullText)) {
                topics.push(topic);
            }
        }

        return topics;
    }

    /**
     * Expand query with related terms and context
     */
    private async expandQuery(query: string, intent: QueryIntent): Promise<string> {
        // Add intent-specific expansions
        const expansions: string[] = [query];

        // Add synonyms and related terms based on keywords
        for (const keyword of intent.keywords.slice(0, 3)) { // Limit to avoid over-expansion
            const synonyms = this.getSynonyms(keyword);
            expansions.push(...synonyms);
        }

        // Add topic-specific terms
        for (const topic of intent.topics) {
            const topicTerms = this.getTopicTerms(topic);
            expansions.push(...topicTerms);
        }

        return expansions.join(' ');
    }

    /**
     * Get synonyms for a word (simplified - in production use proper NLP)
     */
    private getSynonyms(word: string): string[] {
        const synonymMap: Record<string, string[]> = {
            'learn': ['study', 'understand', 'master'],
            'code': ['programming', 'development', 'coding'],
            'web': ['website', 'internet', 'online'],
            'data': ['information', 'dataset', 'analytics'],
            'design': ['create', 'build', 'develop'],
            'course': ['lesson', 'class', 'module'],
            'project': ['assignment', 'task', 'exercise']
        };

        return synonymMap[word.toLowerCase()] || [];
    }

    /**
     * Get topic-specific terms
     */
    private getTopicTerms(topic: string): string[] {
        const topicTerms: Record<string, string[]> = {
            'web-development': ['HTML', 'CSS', 'JavaScript', 'React', 'responsive'],
            'data-science': ['Python', 'pandas', 'analysis', 'visualization', 'statistics'],
            'career': ['portfolio', 'interview', 'networking', 'skills', 'resume'],
            'programming': ['algorithm', 'function', 'variable', 'loop', 'syntax'],
            'design': ['user experience', 'interface', 'wireframe', 'prototype', 'usability']
        };

        return topicTerms[topic] || [];
    }

    /**
     * Select appropriate retrieval strategy based on intent
     */
    private selectRetrievalStrategy(intent: QueryIntent): string {
        switch (intent.type) {
            case 'overview':
                return 'hierarchical-overview';
            case 'instruction':
                return 'step-by-step';
            case 'example':
                return 'example-focused';
            case 'explanation':
                return 'concept-explanation';
            default:
                return 'balanced';
        }
    }

    /**
     * Execute the selected retrieval strategy
     */
    private async executeRetrievalStrategy(
        originalQuery: string,
        expandedQuery: string,
        _intent: QueryIntent,
        strategy: string,
        maxSources: number,
        diversityBoost: boolean
    ): Promise<ContentSource[]> {
        // Get embeddings for both original and expanded queries
        const [originalEmbedding, expandedEmbedding] = await Promise.all([
            this.embeddingProvider.generateEmbedding(originalQuery),
            this.embeddingProvider.generateEmbedding(expandedQuery)
        ]);

        // Strategy-specific retrieval
        switch (strategy) {
            case 'hierarchical-overview':
                return this.retrieveHierarchical(originalEmbedding.embedding, maxSources);

            case 'step-by-step':
                return this.retrieveInstructional(originalEmbedding.embedding, maxSources);

            case 'example-focused':
                return this.retrieveExamples(originalEmbedding.embedding, maxSources);

            case 'concept-explanation':
                return this.retrieveConceptual(originalEmbedding.embedding, expandedEmbedding.embedding, maxSources);

            default:
                return this.retrieveBalanced(
                    originalEmbedding.embedding,
                    expandedEmbedding.embedding,
                    maxSources,
                    diversityBoost
                );
        }
    }

    /**
     * Retrieve with hierarchy preference (overviews first, then details)
     */
    private async retrieveHierarchical(embedding: number[], maxSources: number): Promise<ContentSource[]> {
        const allResults = await this.vectorStore.searchSimilar(embedding, maxSources * 2, 0.6);

        // Prioritize overview chunks
        const prioritized = allResults.map(result => {
            let boost = 1.0;

            if (result.metadata?.chunkType === 'overview') boost = 1.3;
            else if (result.metadata?.chunkType === 'title') boost = 1.2;
            else if (result.metadata?.importance > 0.8) boost = 1.1;

            return {
                ...result,
                priorityScore: result.similarity * boost
            };
        });

        return prioritized
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .slice(0, maxSources);
    }

    /**
     * Retrieve instructional content (step-by-step guides)
     */
    private async retrieveInstructional(embedding: number[], maxSources: number): Promise<ContentSource[]> {
        const allResults = await this.vectorStore.searchSimilar(embedding, maxSources * 2, 0.6);

        // Boost instructional content
        const prioritized = allResults.map(result => {
            let boost = 1.0;

            if (result.metadata?.chunkType === 'instruction') boost = 1.4;
            else if (result.contentType === 'assignment') boost = 1.2;
            else if (result.chunkText.toLowerCase().includes('step')) boost = 1.1;

            return {
                ...result,
                priorityScore: result.similarity * boost
            };
        });

        return prioritized
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .slice(0, maxSources);
    }

    /**
     * Retrieve examples and code samples
     */
    private async retrieveExamples(embedding: number[], maxSources: number): Promise<ContentSource[]> {
        const allResults = await this.vectorStore.searchSimilar(embedding, maxSources * 2, 0.6);

        // Boost example content
        const prioritized = allResults.map(result => {
            let boost = 1.0;

            if (result.metadata?.chunkType === 'example') boost = 1.5;
            else if (result.chunkText.includes('```')) boost = 1.3;
            else if (result.chunkText.toLowerCase().includes('example')) boost = 1.2;

            return {
                ...result,
                priorityScore: result.similarity * boost
            };
        });

        return prioritized
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .slice(0, maxSources);
    }

    /**
     * Retrieve conceptual explanations
     */
    private async retrieveConceptual(
        originalEmbedding: number[],
        expandedEmbedding: number[],
        maxSources: number
    ): Promise<ContentSource[]> {
        // Get results from both embeddings
        const [originalResults, expandedResults] = await Promise.all([
            this.vectorStore.searchSimilar(originalEmbedding, maxSources, 0.7),
            this.vectorStore.searchSimilar(expandedEmbedding, maxSources, 0.65)
        ]);

        // Merge and deduplicate
        const combinedResults = this.mergeAndDeduplicateResults(originalResults, expandedResults);

        // Boost conceptual content
        const prioritized = combinedResults.map(result => {
            let boost = 1.0;

            if (result.metadata?.chunkType === 'content') boost = 1.2;
            else if (result.contentType === 'lesson') boost = 1.3;
            else if (result.metadata?.importance > 0.7) boost = 1.1;

            return {
                ...result,
                priorityScore: result.similarity * boost
            };
        });

        return prioritized
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .slice(0, maxSources);
    }

    /**
     * Balanced retrieval with diversity
     */
    private async retrieveBalanced(
        originalEmbedding: number[],
        expandedEmbedding: number[],
        maxSources: number,
        diversityBoost: boolean
    ): Promise<ContentSource[]> {
        const [originalResults, expandedResults] = await Promise.all([
            this.vectorStore.searchSimilarWithPriority(originalEmbedding, maxSources),
            this.vectorStore.searchSimilarWithPriority(expandedEmbedding, Math.ceil(maxSources * 0.7))
        ]);

        let combinedResults = this.mergeAndDeduplicateResults(originalResults, expandedResults);

        if (diversityBoost) {
            combinedResults = this.applyDiversityBoost(combinedResults);
        }

        return combinedResults.slice(0, maxSources);
    }

    /**
     * Merge results from multiple searches and remove duplicates
     */
    private mergeAndDeduplicateResults(
        results1: ContentSource[],
        results2: ContentSource[]
    ): ContentSource[] {
        const seen = new Set<string>();
        const merged: ContentSource[] = [];

        // Add results from first search with higher priority
        for (const result of results1) {
            if (!seen.has(result.id)) {
                seen.add(result.id);
                merged.push({ ...result, priorityScore: result.similarity * 1.1 });
            }
        }

        // Add results from second search
        for (const result of results2) {
            if (!seen.has(result.id)) {
                seen.add(result.id);
                merged.push({ ...result, priorityScore: result.similarity });
            }
        }

        return merged.sort((a, b) => (b.priorityScore || b.similarity) - (a.priorityScore || a.similarity));
    }

    /**
     * Apply diversity boost to avoid too many similar results
     */
    private applyDiversityBoost(results: ContentSource[]): ContentSource[] {
        const diversified: ContentSource[] = [];
        const contentTypeCounts = new Map<string, number>();
        const topicCounts = new Map<string, number>();

        for (const result of results) {
            const contentType = result.contentType;
            const topic = result.metadata?.courseName || 'unknown';

            const contentTypeCount = contentTypeCounts.get(contentType) || 0;
            const topicCount = topicCounts.get(topic) || 0;

            // Apply diversity penalty
            let diversityPenalty = 1.0;
            if (contentTypeCount > 2) diversityPenalty *= 0.9;
            if (topicCount > 1) diversityPenalty *= 0.95;

            const adjustedScore = (result.priorityScore || result.similarity) * diversityPenalty;

            diversified.push({
                ...result,
                priorityScore: adjustedScore
            });

            contentTypeCounts.set(contentType, contentTypeCount + 1);
            topicCounts.set(topic, topicCount + 1);
        }

        return diversified.sort((a, b) => (b.priorityScore || b.similarity) - (a.priorityScore || a.similarity));
    }
}
