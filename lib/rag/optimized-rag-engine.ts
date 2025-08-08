import { generateText, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { DirectGeminiProvider } from './gemini-provider';

import { logger } from '@/lib/logger';
import { ContentSource, RAGQueryResult, ChatMessage } from '@/types/rag';
import { createEmbeddingProvider } from './embedding-providers';
import { VectorStore } from './vector-store';
import { ChatService } from './chat-service';
import { RAG_CONFIG, SYSTEM_PROMPTS } from './config';
import { ragCache } from './cache';
import { RAGAnalytics } from './analytics';
import { EnhancedRetrievalEngine } from './enhanced-retrieval';
import { ConversationMemory } from './conversation-memory';
import { EnhancedPromptGenerator } from './enhanced-prompts';

/**
 * Optimized RAG Engine with caching, analytics, and performance improvements
 */
export class OptimizedRAGEngine {
    private embeddingProvider;
    private vectorStore;
    private chatService;
    private analytics;
    private llmProvider;
    private directGeminiProvider?: DirectGeminiProvider;
    private providerType: 'openai' | 'gemini' | 'local';
    private enhancedRetrieval: EnhancedRetrievalEngine;
    private conversationMemory: ConversationMemory;
    private promptGenerator: EnhancedPromptGenerator;

    constructor() {
        this.embeddingProvider = createEmbeddingProvider();
        this.vectorStore = new VectorStore();
        this.chatService = new ChatService();
        this.analytics = new RAGAnalytics();
        this.enhancedRetrieval = new EnhancedRetrievalEngine();
        this.conversationMemory = new ConversationMemory();
        this.promptGenerator = new EnhancedPromptGenerator();

        // Determine which LLM provider to use
        const openaiKey = process.env.OPENAI_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;

        if (openaiKey) {
            this.providerType = 'openai';
            this.llmProvider = createOpenAI({ apiKey: openaiKey });
        } else if (geminiKey) {
            this.providerType = 'gemini';
            // Use direct Gemini provider instead of AI SDK due to compatibility issues
            this.directGeminiProvider = new DirectGeminiProvider(geminiKey);
            this.llmProvider = null; // Not using AI SDK for Gemini
        } else {
            // Fallback to local mode for development
            console.warn('No API keys found. Using local development mode with mock responses.');
            this.providerType = 'local';
            this.llmProvider = null;
        }

        logger.info(`RAG Engine initialized with ${this.providerType} provider`);
    }

    /**
     * Process a user query with caching and analytics
     */
    async query(
        userQuery: string,
        sessionId: string,
        userId: string,
        options?: {
            maxSources?: number;
            includeConversationContext?: boolean;
            model?: string;
            userRole?: string;
        }
    ): Promise<RAGQueryResult> {
        const startTime = Date.now();
        logger.info(`Processing enhanced RAG query for user ${userId}: "${userQuery.substring(0, 100)}..."`);

        try {
            // Step 1: Enhanced retrieval with intent analysis
            const retrievalResult = await this.enhancedRetrieval.retrieveEnhanced(userQuery, {
                maxSources: options?.maxSources || RAG_CONFIG.maxRetrievalResults,
                includeIntent: true,
                diversityBoost: true
            });

            const { sources, intent, expandedQuery } = retrievalResult;
            logger.debug(`Query intent: ${intent.type} (${Math.round(intent.confidence * 100)}%)`);
            logger.debug(`Found ${sources.length} sources using ${retrievalResult.searchStrategy} strategy`);

            // Step 2: Get enhanced conversation context
            const conversationContext = await this.conversationMemory.getEnhancedContext(
                sessionId,
                userQuery,
                {
                    includeSemanticSimilar: true,
                    maxMessages: 8,
                    focusOnTopics: intent.topics
                }
            );

            // Step 3: Generate dynamic prompts
            const promptContext = {
                userQuery,
                sources,
                intent,
                conversationContext,
                userRole: options?.userRole
            };

            const systemPrompt = this.promptGenerator.generateSystemPrompt(promptContext);
            const userPrompt = this.promptGenerator.generateUserPrompt(promptContext);

            // Step 4: Generate response using LLM with enhanced prompts
            let result;
            if (this.providerType === 'local') {
                result = {
                    text: `I'm running in local development mode. Based on the available course materials, I can help you with questions about the courses and content. However, I need a proper API key (OpenAI or Gemini) to provide detailed responses.\n\nYour query was: "${userQuery}"\n\nTo enable full functionality, please add either OPENAI_API_KEY or GEMINI_API_KEY to your .env file.`,
                    usage: { totalTokens: 50 }
                };
            } else if (this.providerType === 'gemini' && this.directGeminiProvider) {
                result = await this.directGeminiProvider.generateText([
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ], {
                    maxTokens: 1200,
                    temperature: 0.7
                });
            } else {
                const model = this.getModel(options?.model);
                result = await generateText({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    maxTokens: 1200,
                    temperature: 0.7,
                });
            }

            const response = result.text;
            const tokenCount = result.usage?.totalTokens || 0;
            const responseTime = Date.now() - startTime;

            // Step 5: Generate enhanced follow-up suggestions
            const suggestions = await this.generateEnhancedFollowUpSuggestions(sources, userQuery, intent);

            // Step 6: Store conversation with enhanced memory
            const userMessage = await this.chatService.addMessage(sessionId, 'user', userQuery);
            const assistantMessage = await this.chatService.addMessage(sessionId, 'assistant', response, sources, tokenCount);

            // Add to conversation memory
            await this.conversationMemory.addMessage(sessionId, userMessage);
            await this.conversationMemory.addMessage(sessionId, assistantMessage);

            // Step 7: Track enhanced analytics
            // await this.analytics.trackQuery(
            //     userQuery,
            //     responseTime,
            //     tokenCount,
            //     sources.length,
            //     sources.length > 0 ? sources.reduce((sum, s) => sum + s.similarity, 0) / sources.length : 0,
            //     userId,
            //     sessionId
            // );

            logger.info(`Enhanced RAG query completed in ${responseTime}ms. Intent: ${intent.type}, Sources: ${sources.length}, Tokens: ${tokenCount}`);

            return {
                sources,
                response,
                tokenCount,
                suggestions,
                metadata: {
                    intent: intent.type,
                    confidence: intent.confidence,
                    searchStrategy: retrievalResult.searchStrategy,
                    expandedQuery,
                    conversationTopics: conversationContext.topics
                }
            };

        } catch (error) {
            // const responseTime = Date.now() - startTime;
            // logger.error('Enhanced RAG query failed:', error instanceof Error ? error : new Error(String(error)));

            // await this.analytics.trackQuery(userQuery, responseTime, 0, 0, 0, userId, sessionId);

            const userMessage = await this.chatService.addMessage(sessionId, 'user', userQuery);
            const errorMessage = await this.chatService.addMessage(
                sessionId,
                'assistant',
                "I'm sorry, I encountered an error while processing your question. Please try again or rephrase your question.",
                [],
                0
            );

            // Still add to memory for context
            await this.conversationMemory.addMessage(sessionId, userMessage);
            await this.conversationMemory.addMessage(sessionId, errorMessage);

            throw error instanceof Error ? error : new Error(String(error));
        }
    }

    /**
     * Stream a RAG response with optimizations
     */
    async *streamQuery(
        userQuery: string,
        sessionId: string,
        userId: string,
        options?: {
            maxSources?: number;
            includeConversationContext?: boolean;
            model?: string;
        }
    ): AsyncGenerator<{ type: 'sources' | 'content' | 'done' | 'suggestions'; data: any }> {
        const startTime = Date.now();
        logger.info(`Streaming optimized RAG query for user ${userId}: "${userQuery.substring(0, 100)}..."`);

        try {
            // Step 1: Get embedding (with caching)
            let queryEmbedding = ragCache.getQueryEmbedding(userQuery);
            if (!queryEmbedding) {
                const embeddingResult = await this.embeddingProvider.generateEmbedding(userQuery);
                queryEmbedding = {
                    embedding: embeddingResult.embedding,
                    tokenCount: embeddingResult.tokenCount
                };
                ragCache.setQueryEmbedding(userQuery, queryEmbedding.embedding, queryEmbedding.tokenCount);
            }

            // Step 2: Get sources (with caching)
            const maxSources = options?.maxSources || RAG_CONFIG.maxRetrievalResults;
            let sources = ragCache.getSimilarityResults(
                queryEmbedding.embedding,
                maxSources,
                RAG_CONFIG.similarityThreshold
            );

            if (!sources) {
                sources = await this.vectorStore.searchSimilarWithPriority(
                    queryEmbedding.embedding,
                    maxSources,
                    RAG_CONFIG.similarityThreshold
                );
                ragCache.setSimilarityResults(queryEmbedding.embedding, maxSources, RAG_CONFIG.similarityThreshold, sources);
            }

            // Yield sources first
            yield { type: 'sources', data: sources };

            // Step 3: Get conversation context
            let conversationContext: ChatMessage[] = [];
            if (options?.includeConversationContext !== false) {
                conversationContext = await this.chatService.getConversationContext(sessionId, 5);
            }

            // Step 4: Build prompt and stream response
            const prompt = this.buildRAGPrompt(userQuery, sources, conversationContext);

            let fullResponse = '';
            let tokenCount = 0;

            if (this.providerType === 'local') {
                // Mock streaming response for local development
                const mockResponse = `I'm running in local development mode. Based on the available course materials, I can help you with questions about the courses and content. However, I need a proper API key (OpenAI or Gemini) to provide detailed responses.\n\nYour query was: "${userQuery}"\n\nTo enable full functionality, please add either OPENAI_API_KEY or GEMINI_API_KEY to your .env file.`;

                // Simulate streaming by yielding chunks
                const words = mockResponse.split(' ');
                for (let i = 0; i < words.length; i += 3) {
                    const chunk = words.slice(i, i + 3).join(' ') + ' ';
                    fullResponse += chunk;
                    yield { type: 'content', data: chunk };
                    // Small delay to simulate streaming
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                tokenCount = 50;
            } else if (this.providerType === 'gemini' && this.directGeminiProvider) {
                // Use direct Gemini provider for streaming
                const streamGenerator = this.directGeminiProvider.streamText([
                    { role: 'system', content: SYSTEM_PROMPTS.rag },
                    { role: 'user', content: prompt }
                ], {
                    maxTokens: 1000,
                    temperature: 0.7
                });

                for await (const chunk of streamGenerator) {
                    fullResponse += chunk;
                    yield { type: 'content', data: chunk };
                }

                // Estimate token count (rough approximation)
                tokenCount = Math.ceil(fullResponse.length / 4);
            } else {
                // Use AI SDK for OpenAI streaming
                const model = this.getModel(options?.model);
                const stream = streamText({
                    model,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPTS.rag },
                        { role: 'user', content: prompt }
                    ],
                    maxTokens: 1000,
                    temperature: 0.7,
                });

                // Stream the response
                for await (const chunk of stream.textStream) {
                    fullResponse += chunk;
                    yield { type: 'content', data: chunk };
                }

                // Get final usage stats
                const finalResult = await stream.usage;
                tokenCount = finalResult?.totalTokens || 0;
            }
            const responseTime = Date.now() - startTime;

            // Step 5: Get or generate suggestions
            let suggestions = ragCache.getFollowUpSuggestions(sources, userQuery);
            if (!suggestions) {
                if (this.providerType === 'local') {
                    // Mock suggestions for local development
                    suggestions = [
                        "Can you tell me more about the course structure?",
                        "What are the learning objectives?",
                        "How can I get started with the first lesson?"
                    ];
                } else {
                    suggestions = await this.generateFollowUpSuggestions(sources, userQuery);
                }
                ragCache.setFollowUpSuggestions(sources, userQuery, suggestions);
            }

            // Yield suggestions
            yield { type: 'suggestions', data: suggestions };

            // Step 6: Store conversation and track analytics
            await this.chatService.addMessage(sessionId, 'user', userQuery);
            await this.chatService.addMessage(sessionId, 'assistant', fullResponse, sources, tokenCount);

            // await this.analytics.trackQuery(
            //     userQuery,
            //     responseTime,
            //     tokenCount,
            //     sources.length,
            //     sources.length > 0 ? sources.reduce((sum, s) => sum + s.similarity, 0) / sources.length : 0,
            //     userId,
            //     sessionId
            // );

            // Yield completion signal
            yield { type: 'done', data: { tokenCount, sources: sources.length, responseTime } };

        } catch (error) {
            logger.error('Optimized RAG streaming query failed:', error instanceof Error ? error : new Error(String(error)));
            logger.error('Error details:', error instanceof Error ? error : new Error(String(error)));

            // const responseTime = Date.now() - startTime;
            // await this.analytics.trackQuery(userQuery, responseTime, 0, 0, 0, userId, sessionId);

            await this.chatService.addMessage(sessionId, 'user', userQuery);
            await this.chatService.addMessage(
                sessionId,
                'assistant',
                "I'm sorry, I encountered an error while processing your question. Please try again or rephrase your question.",
                [],
                0
            );

            throw error instanceof Error ? error : new Error(String(error));
        }
    }

    /**
     * Get the appropriate model based on provider type
     */
    private getModel(requestedModel?: string): any {
        if (this.providerType === 'openai' && this.llmProvider) {
            const model = requestedModel || 'gpt-4o-mini';
            return this.llmProvider(model);
        } else if (this.providerType === 'gemini' && this.llmProvider) {
            // Map OpenAI model names to Gemini equivalents
            let model = 'gemini-1.5-flash';
            if (requestedModel === 'gpt-4o' || requestedModel === 'gpt-4') {
                model = 'gemini-1.5-pro';
            }
            return this.llmProvider(model);
        } else if (this.providerType === 'local') {
            // Return a mock model for local development
            return null;
        }
        throw new Error(`Unsupported provider type: ${this.providerType}`);
    }

    /**
     * Build a context-aware prompt for the LLM
     */
    private buildRAGPrompt(
        userQuery: string,
        sources: ContentSource[],
        conversationContext: ChatMessage[]
    ): string {
        let prompt = '';

        // Add conversation context if available
        if (conversationContext.length > 0) {
            prompt += 'Previous conversation context:\n';
            conversationContext.forEach(msg => {
                if (msg.role !== 'system') {
                    prompt += `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.content}\n`;
                }
            });
            prompt += '\n';
        }

        // Add retrieved context
        if (sources.length > 0) {
            prompt += 'Relevant course materials:\n\n';

            sources.forEach((source, index) => {
                prompt += `[Source ${index + 1}] ${this.formatSourceContext(source)}\n\n`;
            });
        } else {
            prompt += 'No specific course materials found for this query.\n\n';
        }

        // Add the current user query
        prompt += `Current question: ${userQuery}\n\n`;

        // Add instructions
        if (sources.length > 0) {
            prompt += 'Please provide a helpful response based on the course materials above. ';
            prompt += 'Reference specific sources when relevant (e.g., "According to the lesson on..."). ';
            prompt += 'If the question cannot be fully answered with the provided materials, mention what additional information might be helpful.';
        } else {
            prompt += SYSTEM_PROMPTS.noContext;
        }

        return prompt;
    }

    /**
     * Format source context for the prompt
     */
    private formatSourceContext(source: ContentSource): string {
        const metadata = source.metadata;
        let context = '';

        // Add hierarchical context
        if (metadata.courseName) {
            context += `Course: ${metadata.courseName}`;
        }
        if (metadata.projectName) {
            context += ` > Project: ${metadata.projectName}`;
        }
        if (metadata.lessonName) {
            context += ` > Lesson: ${metadata.lessonName}`;
        }
        if (metadata.assignmentName) {
            context += ` > Assignment: ${metadata.assignmentName}`;
        }

        context += `\nType: ${source.contentType}`;

        if (metadata.chunkType) {
            context += ` (${metadata.chunkType})`;
        }

        context += `\nContent: ${source.chunkText}`;

        // Add additional metadata if relevant
        if (metadata.lessonType) {
            context += `\nLesson Type: ${metadata.lessonType}`;
        }
        if (metadata.assignmentType) {
            context += `\nAssignment Type: ${metadata.assignmentType}`;
        }
        if (metadata.dueDate) {
            context += `\nDue Date: ${metadata.dueDate}`;
        }
        if (metadata.resourceUrl) {
            context += `\nResource URL: ${metadata.resourceUrl}`;
        }

        return context;
    }

    /**
     * Generate enhanced follow-up suggestions
     */
    private async generateEnhancedFollowUpSuggestions(
        sources: ContentSource[],
        currentQuery: string,
        intent: any
    ): Promise<string[]> {
        if (sources.length === 0) {
            return [
                "Can you help me understand the course structure?",
                "What topics are covered in this program?",
                "How do I get started with my learning?"
            ];
        }

        try {
            if (this.providerType === 'local') {
                return [
                    "Can you explain this topic in more detail?",
                    "What are some practical examples?",
                    "How does this relate to other concepts?"
                ];
            }

            const suggestionPrompt = this.promptGenerator.generateFollowUpPrompt(sources, currentQuery, intent);

            let result;
            if (this.providerType === 'gemini' && this.directGeminiProvider) {
                result = await this.directGeminiProvider.generateText([{
                    role: 'user',
                    content: suggestionPrompt
                }], {
                    maxTokens: 200,
                    temperature: 0.8
                });
            } else {
                const model = this.getModel();
                result = await generateText({
                    model,
                    messages: [{ role: 'user', content: suggestionPrompt }],
                    maxTokens: 200,
                    temperature: 0.8,
                });
            }

            return result.text
                .split('\n')
                .map(q => q.replace(/^\d+\.\s*/, '').trim())
                .filter(q => q.length > 0)
                .slice(0, 3);

        } catch (error) {
            logger.error('Failed to generate enhanced follow-up suggestions:', error instanceof Error ? error : new Error(String(error)));
            return [];
        }
    }

    /**
     * Legacy method for backward compatibility
     */
    async generateFollowUpSuggestions(
        sources: ContentSource[],
        currentQuery: string
    ): Promise<string[]> {
        return this.generateEnhancedFollowUpSuggestions(sources, currentQuery, {
            type: 'question',
            confidence: 0.7,
            keywords: [],
            topics: []
        });
    }

    /**
     * Get performance metrics
     */
    async getPerformanceMetrics(): Promise<{
        cacheStats: any;
        analyticsOverview: any;
    }> {
        return {
            cacheStats: ragCache.getStats(),
            analyticsOverview: await this.analytics.getUsageMetrics(
                new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                new Date()
            )
        };
    }

    /**
     * Clear caches for maintenance
     */
    clearCaches(): void {
        ragCache.clear();
        logger.info('RAG caches cleared');
    }

    /**
     * Invalidate caches for specific content
     */
    invalidateContentCache(contentId: string): void {
        ragCache.invalidateContentCache(contentId);
        logger.info(`Cache invalidated for content ${contentId}`);
    }
}
