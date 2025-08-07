import { EmbeddingProvider, EmbeddingResult } from '@/types/rag';

/**
 * Local embedding provider using a simple TF-IDF approach for development
 * In a real scenario, you'd use a local model like sentence-transformers
 */
export class LocalEmbeddingProvider implements EmbeddingProvider {
    private readonly dimensions = 768;

    async generateEmbedding(text: string): Promise<EmbeddingResult> {
        // Simple mock embedding for development - replace with actual local model
        const embedding = this.createMockEmbedding(text);
        const tokenCount = this.estimateTokenCount(text);

        return {
            embedding,
            tokenCount
        };
    }

    async generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
        return Promise.all(texts.map(text => this.generateEmbedding(text)));
    }

    private createMockEmbedding(text: string): number[] {
        // Create a deterministic embedding based on text content
        // This is for development only - replace with actual embedding model
        const words = text.toLowerCase().split(/\s+/);
        const embedding = new Array(this.dimensions).fill(0);

        words.forEach((word) => {
            const hash = this.simpleHash(word);
            for (let i = 0; i < this.dimensions; i++) {
                embedding[i] += Math.sin(hash + i) * 0.1;
            }
        });

        // Normalize the vector
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return embedding.map(val => val / magnitude);
    }

    private simpleHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    private estimateTokenCount(text: string): number {
        // Rough estimation: ~4 characters per token
        return Math.ceil(text.length / 4);
    }
}

/**
 * Gemini embedding provider for production use
 */
export class GeminiEmbeddingProvider implements EmbeddingProvider {
    private apiKey: string;
    private model = 'text-embedding-004';

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
        if (!this.apiKey) {
            throw new Error('Gemini API key is required');
        }
    }

    async generateEmbedding(text: string): Promise<EmbeddingResult> {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:embedContent?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: `models/${this.model}`,
                        content: {
                            parts: [{ text }]
                        }
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            return {
                embedding: data.embedding.values,
                tokenCount: this.estimateTokenCount(text)
            };
        } catch (error) {
            console.error('Error generating Gemini embedding:', error);
            throw error;
        }
    }

    async generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
        // Batch process with rate limiting
        const results: EmbeddingResult[] = [];
        const batchSize = 10; // Adjust based on API limits

        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(text => this.generateEmbedding(text))
            );
            results.push(...batchResults);

            // Rate limiting delay
            if (i + batchSize < texts.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return results;
    }

    private estimateTokenCount(text: string): number {
        // Rough estimation for Gemini
        return Math.ceil(text.length / 4);
    }
}

/**
 * Factory function to create embedding provider based on environment
 */
export function createEmbeddingProvider(provider?: 'local' | 'gemini'): EmbeddingProvider {
    const providerType = provider || process.env.EMBEDDING_PROVIDER || 'gemini';

    switch (providerType) {
        case 'gemini':
            return new GeminiEmbeddingProvider();
        case 'local':
        default:
            return new LocalEmbeddingProvider();
    }
}
