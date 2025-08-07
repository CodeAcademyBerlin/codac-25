import { generateText, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

import { logger } from '@/lib/logger';
import { ContentSource, RAGQueryResult, ChatMessage } from '@/types/rag';
import { createEmbeddingProvider } from './embedding-providers';
import { VectorStore } from './vector-store';
import { ChatService } from './chat-service';
import { RAG_CONFIG, SYSTEM_PROMPTS } from './config';

// import { RAGAnalytics } from './analytics';

export class RAGEngine {
    private embeddingProvider;
    private vectorStore;
    private chatService;
    // private analytics: RAGAnalytics;
    private openai;

    constructor() {
        this.embeddingProvider = createEmbeddingProvider();
        this.vectorStore = new VectorStore();
        this.chatService = new ChatService();
        // this.analytics = new RAGAnalytics(); // Disabled for now

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is required for RAG responses');
        }
        this.openai = createOpenAI({ apiKey });
    }

    /**
     * Process a user query and generate a RAG response
     */
    async query(
        userQuery: string,
        sessionId: string,
        userId: string,
        options?: {
            maxSources?: number;
            includeConversationContext?: boolean;
            model?: string;
        }
    ): Promise<RAGQueryResult> {
        const startTime = Date.now();
        logger.info(`Processing RAG query for user ${userId}: "${userQuery.substring(0, 100)}..."`);

        try {
            // Step 1: Generate embedding for the user query
            const queryEmbedding = await this.embeddingProvider.generateEmbedding(userQuery);

            // Step 2: Retrieve relevant content sources
            const maxSources = options?.maxSources || RAG_CONFIG.maxRetrievalResults;
            const sources = await this.vectorStore.searchSimilarWithPriority(
                queryEmbedding.embedding,
                maxSources,
                RAG_CONFIG.similarityThreshold
            );

            // Step 3: Get conversation context if requested
            let conversationContext: ChatMessage[] = [];
            if (options?.includeConversationContext !== false) {
                conversationContext = await this.chatService.getConversationContext(sessionId, 5);
            }

            // Step 4: Build context-aware prompt
            const prompt = this.buildRAGPrompt(userQuery, sources, conversationContext);

            // Step 5: Generate response using LLM
            const model = options?.model || 'gpt-4o-mini';
            const result = await generateText({
                model: this.openai(model),
                messages: [
                    { role: 'system', content: SYSTEM_PROMPTS.rag },
                    { role: 'user', content: prompt }
                ],
                maxTokens: 1000,
                temperature: 0.7,
            });

            const response = result.text;
            const tokenCount = result.usage?.totalTokens || 0;

            // Step 6: Store the conversation
            await this.chatService.addMessage(sessionId, 'user', userQuery);
            await this.chatService.addMessage(sessionId, 'assistant', response, sources, tokenCount);

            const duration = Date.now() - startTime;
            logger.info(`RAG query completed in ${duration}ms. Sources: ${sources.length}, Tokens: ${tokenCount}`);

            return {
                sources,
                response,
                tokenCount
            };

        } catch (error) {
            logger.error('RAG query failed:', error instanceof Error ? error : undefined);

            // Store user message and error response
            await this.chatService.addMessage(sessionId, 'user', userQuery);
            await this.chatService.addMessage(
                sessionId,
                'assistant',
                "I'm sorry, I encountered an error while processing your question. Please try again or rephrase your question.",
                [],
                0
            );

            throw error;
        }
    }

    /**
     * Stream a RAG response for real-time chat
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
    ): AsyncGenerator<{ type: 'sources' | 'content' | 'done'; data: any }> {
        logger.info(`Streaming RAG query for user ${userId}: "${userQuery.substring(0, 100)}..."`);

        try {
            // Step 1: Generate embedding for the user query
            const queryEmbedding = await this.embeddingProvider.generateEmbedding(userQuery);

            // Step 2: Retrieve relevant content sources
            const maxSources = options?.maxSources || RAG_CONFIG.maxRetrievalResults;
            const sources = await this.vectorStore.searchSimilarWithPriority(
                queryEmbedding.embedding,
                maxSources,
                RAG_CONFIG.similarityThreshold
            );

            // Yield sources first
            yield { type: 'sources', data: sources };

            // Step 3: Get conversation context
            let conversationContext: ChatMessage[] = [];
            if (options?.includeConversationContext !== false) {
                conversationContext = await this.chatService.getConversationContext(sessionId, 5);
            }

            // Step 4: Build context-aware prompt
            const prompt = this.buildRAGPrompt(userQuery, sources, conversationContext);

            // Step 5: Stream response using LLM
            const model = options?.model || 'gpt-4o-mini';
            const stream = streamText({
                model: this.openai(model),
                messages: [
                    { role: 'system', content: SYSTEM_PROMPTS.rag },
                    { role: 'user', content: prompt }
                ],
                maxTokens: 1000,
                temperature: 0.7,
            });

            let fullResponse = '';
            let tokenCount = 0;

            // Stream the response
            for await (const chunk of stream.textStream) {
                fullResponse += chunk;
                yield { type: 'content', data: chunk };
            }

            // Get final usage stats
            const finalResult = await stream.usage;
            tokenCount = finalResult?.totalTokens || 0;

            // Step 6: Store the conversation
            await this.chatService.addMessage(sessionId, 'user', userQuery);
            await this.chatService.addMessage(sessionId, 'assistant', fullResponse, sources, tokenCount);

            // Yield completion signal
            yield { type: 'done', data: { tokenCount, sources: sources.length } };

        } catch (error) {
            logger.error('RAG streaming query failed:', error instanceof Error ? error : undefined);

            // Store user message and error response
            await this.chatService.addMessage(sessionId, 'user', userQuery);
            await this.chatService.addMessage(
                sessionId,
                'assistant',
                "I'm sorry, I encountered an error while processing your question. Please try again or rephrase your question.",
                [],
                0
            );

            throw error;
        }
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
     * Get suggestions for follow-up questions based on retrieved sources
     */
    async generateFollowUpSuggestions(
        sources: ContentSource[],
        currentQuery: string
    ): Promise<string[]> {
        if (sources.length === 0) {
            return [
                "Can you help me understand the course structure?",
                "What topics are covered in this program?",
                "How do I get started with my learning?"
            ];
        }

        try {
            const contextSummary = sources.slice(0, 3).map(s =>
                `${s.contentType}: ${s.chunkText.substring(0, 100)}...`
            ).join('\n');

            const result = await generateText({
                model: this.openai('gpt-4o-mini'),
                messages: [{
                    role: 'user',
                    content: `Based on this educational content and the user's question "${currentQuery}", suggest 3 follow-up questions a student might ask. Return only the questions, one per line.

Content:
${contextSummary}`
                }],
                maxTokens: 200,
                temperature: 0.8,
            });

            return result.text
                .split('\n')
                .map(q => q.replace(/^\d+\.\s*/, '').trim())
                .filter(q => q.length > 0)
                .slice(0, 3);

        } catch (error) {
            logger.error('Failed to generate follow-up suggestions:', error instanceof Error ? error : undefined);
            return [];
        }
    }

    /**
     * Validate and sanitize user input
     */
    // private validateQuery(query: string): string {
    //     if (!query || typeof query !== 'string') {
    //         throw new Error('Query must be a non-empty string');
    //     }

    //     const trimmed = query.trim();
    //     if (trimmed.length === 0) {
    //         throw new Error('Query cannot be empty');
    //     }

    //     if (trimmed.length > 1000) {
    //         throw new Error('Query is too long (max 1000 characters)');
    //     }

    //     return trimmed;
    // }
}
