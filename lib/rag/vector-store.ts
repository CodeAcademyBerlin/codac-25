import { prisma } from '@/lib/db/prisma';
import { ContentChunk, ContentSource } from '@/types/rag';
import { RAG_CONFIG, CONTENT_TYPE_PRIORITIES } from './config';

export class VectorStore {
    /**
     * Store content chunks with their embeddings
     */
    async storeEmbeddings(chunks: (ContentChunk & { embedding: number[] })[]): Promise<void> {
        // Use Prisma's upsert for better type safety
        for (const chunk of chunks) {
            await prisma.contentEmbedding.upsert({
                where: { id: chunk.id },
                update: {
                    chunkText: chunk.chunkText,
                    embedding: chunk.embedding,
                    metadata: chunk.metadata,
                    tokenCount: chunk.tokenCount
                },
                create: {
                    id: chunk.id,
                    contentType: chunk.contentType,
                    contentId: chunk.contentId,
                    chunkIndex: chunk.chunkIndex,
                    chunkText: chunk.chunkText,
                    embedding: chunk.embedding,
                    metadata: chunk.metadata,
                    tokenCount: chunk.tokenCount
                }
            });
        }
    }

    /**
     * Search for similar content using vector similarity (application-level calculation)
     */
    async searchSimilar(
        queryEmbedding: number[],
        limit: number = RAG_CONFIG.maxRetrievalResults,
        threshold: number = RAG_CONFIG.similarityThreshold
    ): Promise<ContentSource[]> {
        // Get all embeddings for now - in production with pgvector this would be optimized
        const allEmbeddings = await prisma.contentEmbedding.findMany({
            where: {
                embedding: {
                    not: undefined
                }
            },
            select: {
                id: true,
                contentType: true,
                contentId: true,
                chunkText: true,
                metadata: true,
                embedding: true
            }
        });

        // Calculate cosine similarity in application
        const results = allEmbeddings
            .map(row => {
                const similarity = this.cosineSimilarity(queryEmbedding, row.embedding as number[]);
                return {
                    id: row.id,
                    contentType: row.contentType,
                    contentId: row.contentId,
                    chunkText: row.chunkText,
                    metadata: (row.metadata as Record<string, any>) || {},
                    similarity
                };
            })
            .filter(result => result.similarity > threshold)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);

        return results;
    }

    /**
     * Search with content type prioritization
     */
    async searchSimilarWithPriority(
        queryEmbedding: number[],
        limit: number = RAG_CONFIG.maxRetrievalResults,
        threshold: number = RAG_CONFIG.similarityThreshold
    ): Promise<ContentSource[]> {
        const results = await this.searchSimilar(queryEmbedding, limit * 2, threshold);

        // Apply content type prioritization
        const prioritizedResults = results
            .map(result => {
                const priority = CONTENT_TYPE_PRIORITIES[result.contentType as keyof typeof CONTENT_TYPE_PRIORITIES] || 0.5;
                const priorityScore = result.similarity * priority;
                return { ...result, priorityScore };
            })
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .slice(0, limit);

        return prioritizedResults;
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) {
            throw new Error('Vectors must have the same length');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Delete embeddings for specific content
     */
    async deleteContentEmbeddings(contentType: string, contentId: string): Promise<void> {
        await prisma.contentEmbedding.deleteMany({
            where: {
                contentType,
                contentId
            }
        });
    }

    /**
     * Get embedding statistics
     */
    async getStats(): Promise<{
        totalEmbeddings: number;
        byContentType: Record<string, number>;
        averageChunksPerContent: number;
    }> {
        const [totalCount, groupedData] = await Promise.all([
            prisma.contentEmbedding.count(),
            prisma.contentEmbedding.groupBy({
                by: ['contentType'],
                _count: true
            })
        ]);

        const byContentType: Record<string, number> = {};
        groupedData.forEach(row => {
            byContentType[row.contentType] = row._count;
        });

        // Calculate average chunks per content
        const uniqueContent = await prisma.contentEmbedding.groupBy({
            by: ['contentType', 'contentId'],
            _count: true
        });

        const averageChunksPerContent = uniqueContent.length > 0
            ? totalCount / uniqueContent.length
            : 0;

        return {
            totalEmbeddings: totalCount,
            byContentType,
            averageChunksPerContent
        };
    }
}
