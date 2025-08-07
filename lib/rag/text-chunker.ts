import { RAG_CONFIG } from './config';

export interface TextChunk {
    text: string;
    startIndex: number;
    endIndex: number;
    tokenCount: number;
}

export class TextChunker {
    private chunkSize: number;
    private chunkOverlap: number;

    constructor(chunkSize?: number, chunkOverlap?: number) {
        this.chunkSize = chunkSize || RAG_CONFIG.chunkSize;
        this.chunkOverlap = chunkOverlap || RAG_CONFIG.chunkOverlap;
    }

    /**
     * Split text into overlapping chunks
     */
    chunkText(text: string): TextChunk[] {
        if (!text || text.trim().length === 0) {
            return [];
        }

        const sentences = this.splitIntoSentences(text);
        const chunks: TextChunk[] = [];
        let currentChunk = '';
        let currentTokenCount = 0;
        let startIndex = 0;

        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i];
            const sentenceTokenCount = this.estimateTokenCount(sentence);

            // If adding this sentence would exceed chunk size, finalize current chunk
            if (currentTokenCount + sentenceTokenCount > this.chunkSize && currentChunk.length > 0) {
                chunks.push({
                    text: currentChunk.trim(),
                    startIndex,
                    endIndex: startIndex + currentChunk.length,
                    tokenCount: currentTokenCount
                });

                // Start new chunk with overlap
                const overlapText = this.getOverlapText(currentChunk, this.chunkOverlap);
                currentChunk = overlapText + ' ' + sentence;
                currentTokenCount = this.estimateTokenCount(currentChunk);
                startIndex = startIndex + currentChunk.length - overlapText.length;
            } else {
                // Add sentence to current chunk
                if (currentChunk.length > 0) {
                    currentChunk += ' ';
                }
                currentChunk += sentence;
                currentTokenCount += sentenceTokenCount;
            }
        }

        // Add the last chunk if it has content
        if (currentChunk.trim().length > 0) {
            chunks.push({
                text: currentChunk.trim(),
                startIndex,
                endIndex: startIndex + currentChunk.length,
                tokenCount: currentTokenCount
            });
        }

        return chunks;
    }

    /**
     * Split text into sentences using multiple delimiters
     */
    private splitIntoSentences(text: string): string[] {
        // Clean up the text
        text = text.replace(/\s+/g, ' ').trim();

        // Split on sentence boundaries
        const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z])|(?<=\n\n)/);

        // Filter out empty sentences and very short ones
        return sentences
            .map(s => s.trim())
            .filter(s => s.length > 10);
    }

    /**
     * Get overlap text from the end of a chunk
     */
    private getOverlapText(text: string, overlapTokens: number): string {
        const words = text.split(/\s+/);
        const overlapWords = Math.min(Math.floor(overlapTokens * 0.75), words.length);

        if (overlapWords <= 0) return '';

        return words.slice(-overlapWords).join(' ');
    }

    /**
     * Estimate token count (rough approximation)
     */
    private estimateTokenCount(text: string): number {
        // Rough estimation: ~4 characters per token for English text
        return Math.ceil(text.length / 4);
    }

    /**
     * Chunk structured content (like Plate.js JSON)
     */
    chunkStructuredContent(content: any[]): TextChunk[] {
        const plainText = this.extractTextFromPlateContent(content);
        return this.chunkText(plainText);
    }

    /**
     * Extract plain text from Plate.js content structure
     */
    private extractTextFromPlateContent(content: any[]): string {
        if (!Array.isArray(content)) return '';

        const extractText = (node: any): string => {
            if (typeof node === 'string') return node;

            if (node.text) return node.text;

            if (node.children && Array.isArray(node.children)) {
                return node.children.map(extractText).join(' ');
            }

            return '';
        };

        return content.map(extractText).join('\n').trim();
    }

    /**
     * Create hierarchical chunks with metadata preservation
     */
    createHierarchicalChunks(
        title: string,
        description: string | null,
        content: any,
        metadata: Record<string, any>
    ): Array<{ text: string; metadata: Record<string, any>; tokenCount: number }> {
        const chunks: Array<{ text: string; metadata: Record<string, any>; tokenCount: number }> = [];

        // Title + description chunk (high-level overview)
        const overviewText = [title, description].filter(Boolean).join('\n\n');
        if (overviewText.length > 0) {
            chunks.push({
                text: overviewText,
                metadata: { ...metadata, chunkType: 'overview' },
                tokenCount: this.estimateTokenCount(overviewText)
            });
        }

        // Content chunks
        let contentText = '';
        if (typeof content === 'string') {
            contentText = content;
        } else if (Array.isArray(content)) {
            contentText = this.extractTextFromPlateContent(content);
        } else if (content && typeof content === 'object') {
            contentText = JSON.stringify(content);
        }

        if (contentText.length > 0) {
            const textChunks = this.chunkText(contentText);
            textChunks.forEach((chunk, index) => {
                chunks.push({
                    text: chunk.text,
                    metadata: {
                        ...metadata,
                        chunkType: 'content',
                        contentChunkIndex: index
                    },
                    tokenCount: chunk.tokenCount
                });
            });
        }

        return chunks;
    }
}
