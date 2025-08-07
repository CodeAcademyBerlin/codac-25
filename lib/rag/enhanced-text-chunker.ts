import { RAG_CONFIG } from './config';

export interface EnhancedTextChunk {
    text: string;
    startIndex: number;
    endIndex: number;
    tokenCount: number;
    semanticType: 'title' | 'overview' | 'content' | 'example' | 'instruction' | 'summary';
    importance: number; // 0-1 score
    keywords: string[];
}

export class EnhancedTextChunker {
    private chunkSize: number;

    constructor(chunkSize?: number, _chunkOverlap?: number) {
        this.chunkSize = chunkSize || RAG_CONFIG.chunkSize;
        // chunkOverlap is handled dynamically in semantic chunking
    }

    /**
     * Enhanced semantic chunking that preserves context and meaning
     */
    chunkTextSemantically(text: string): EnhancedTextChunk[] {
        if (!text || text.trim().length === 0) {
            return [];
        }

        // First, identify semantic sections
        const sections = this.identifySemanticSections(text);
        const chunks: EnhancedTextChunk[] = [];

        for (const section of sections) {
            const sectionChunks = this.chunkSection(section);
            chunks.push(...sectionChunks);
        }

        return chunks;
    }

    /**
     * Identify semantic sections in text (headings, paragraphs, lists, etc.)
     */
    private identifySemanticSections(text: string): Array<{
        text: string;
        type: EnhancedTextChunk['semanticType'];
        startIndex: number;
        endIndex: number;
    }> {
        const sections: Array<{
            text: string;
            type: EnhancedTextChunk['semanticType'];
            startIndex: number;
            endIndex: number;
        }> = [];

        // Clean up text
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lines = text.split('\n');

        let currentIndex = 0;
        let currentSection = '';
        let currentType: EnhancedTextChunk['semanticType'] = 'content';
        let sectionStart = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.length === 0) {
                // Empty line - potential section boundary
                if (currentSection.trim().length > 0) {
                    sections.push({
                        text: currentSection.trim(),
                        type: currentType,
                        startIndex: sectionStart,
                        endIndex: currentIndex
                    });
                    currentSection = '';
                    sectionStart = currentIndex + line.length + 1;
                }
            } else {
                const lineType = this.identifyLineType(line);

                // If line type changes significantly, create new section
                if (this.shouldCreateNewSection(currentType, lineType) && currentSection.trim().length > 0) {
                    sections.push({
                        text: currentSection.trim(),
                        type: currentType,
                        startIndex: sectionStart,
                        endIndex: currentIndex
                    });
                    currentSection = line;
                    currentType = lineType;
                    sectionStart = currentIndex;
                } else {
                    if (currentSection.length > 0) {
                        currentSection += '\n';
                    }
                    currentSection += line;
                    if (currentType === 'content') {
                        currentType = lineType;
                    }
                }
            }

            currentIndex += line.length + 1;
        }

        // Add final section
        if (currentSection.trim().length > 0) {
            sections.push({
                text: currentSection.trim(),
                type: currentType,
                startIndex: sectionStart,
                endIndex: currentIndex
            });
        }

        return sections;
    }

    /**
     * Identify the semantic type of a line
     */
    private identifyLineType(line: string): EnhancedTextChunk['semanticType'] {
        // Title patterns
        if (line.match(/^#{1,6}\s+/) || line.match(/^[A-Z][A-Za-z\s]{5,50}:?\s*$/) || line.length < 60 && line.match(/^[A-Z]/)) {
            return 'title';
        }

        // Overview/summary patterns
        if (line.toLowerCase().includes('overview') ||
            line.toLowerCase().includes('summary') ||
            line.toLowerCase().includes('introduction') ||
            line.toLowerCase().includes('objectives')) {
            return 'overview';
        }

        // Instruction patterns
        if (line.match(/^\d+\./) ||
            line.match(/^[-*]\s+/) ||
            line.toLowerCase().includes('step') ||
            line.toLowerCase().includes('instruction') ||
            line.toLowerCase().includes('requirement')) {
            return 'instruction';
        }

        // Example patterns
        if (line.toLowerCase().includes('example') ||
            line.toLowerCase().includes('sample') ||
            line.includes('```') ||
            line.includes('code:')) {
            return 'example';
        }

        return 'content';
    }

    /**
     * Determine if a new section should be created based on type changes
     */
    private shouldCreateNewSection(currentType: EnhancedTextChunk['semanticType'], newType: EnhancedTextChunk['semanticType']): boolean {
        // Always create new section for titles
        if (newType === 'title') return true;

        // Create new section when switching between major types
        const majorTypes = ['title', 'overview', 'instruction', 'example'];
        return majorTypes.includes(currentType) && majorTypes.includes(newType) && currentType !== newType;
    }

    /**
     * Chunk a semantic section while preserving its context
     */
    private chunkSection(section: {
        text: string;
        type: EnhancedTextChunk['semanticType'];
        startIndex: number;
        endIndex: number;
    }): EnhancedTextChunk[] {
        const chunks: EnhancedTextChunk[] = [];
        const tokenCount = this.estimateTokenCount(section.text);

        // If section fits in one chunk, return as-is
        if (tokenCount <= this.chunkSize) {
            return [{
                text: section.text,
                startIndex: section.startIndex,
                endIndex: section.endIndex,
                tokenCount,
                semanticType: section.type,
                importance: this.calculateImportance(section.text, section.type),
                keywords: this.extractKeywords(section.text)
            }];
        }

        // Split large sections intelligently
        const sentences = this.splitIntoSentences(section.text);
        let currentChunk = '';
        let currentTokenCount = 0;
        let chunkStartIndex = section.startIndex;

        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i];
            const sentenceTokenCount = this.estimateTokenCount(sentence);

            if (currentTokenCount + sentenceTokenCount > this.chunkSize && currentChunk.length > 0) {
                // Finalize current chunk
                chunks.push({
                    text: currentChunk.trim(),
                    startIndex: chunkStartIndex,
                    endIndex: chunkStartIndex + currentChunk.length,
                    tokenCount: currentTokenCount,
                    semanticType: section.type,
                    importance: this.calculateImportance(currentChunk, section.type),
                    keywords: this.extractKeywords(currentChunk)
                });

                // Start new chunk with overlap
                const overlapText = this.getSemanticOverlap(currentChunk, sentences, i);
                currentChunk = overlapText + ' ' + sentence;
                currentTokenCount = this.estimateTokenCount(currentChunk);
                chunkStartIndex += currentChunk.length - overlapText.length;
            } else {
                if (currentChunk.length > 0) {
                    currentChunk += ' ';
                }
                currentChunk += sentence;
                currentTokenCount += sentenceTokenCount;
            }
        }

        // Add final chunk
        if (currentChunk.trim().length > 0) {
            chunks.push({
                text: currentChunk.trim(),
                startIndex: chunkStartIndex,
                endIndex: chunkStartIndex + currentChunk.length,
                tokenCount: currentTokenCount,
                semanticType: section.type,
                importance: this.calculateImportance(currentChunk, section.type),
                keywords: this.extractKeywords(currentChunk)
            });
        }

        return chunks;
    }

    /**
     * Get semantic overlap that preserves context
     */
    private getSemanticOverlap(currentChunk: string, _allSentences: string[], _currentIndex: number): string {
        // For instructions and examples, include more context
        const sentences = currentChunk.split(/(?<=[.!?])\s+/);
        const overlapSentences = Math.min(2, sentences.length);

        if (overlapSentences <= 0) return '';

        return sentences.slice(-overlapSentences).join(' ');
    }

    /**
     * Calculate importance score based on content and type
     */
    private calculateImportance(text: string, type: EnhancedTextChunk['semanticType']): number {
        let score = 0.5; // Base score

        // Type-based scoring
        const typeScores = {
            title: 0.9,
            overview: 0.8,
            instruction: 0.7,
            example: 0.6,
            content: 0.5,
            summary: 0.8
        };
        score = typeScores[type] || 0.5;

        // Content-based adjustments
        const importantWords = ['important', 'key', 'main', 'primary', 'essential', 'critical', 'must', 'required'];
        const wordCount = text.toLowerCase().split(/\s+/).length;
        const importantWordCount = importantWords.filter(word =>
            text.toLowerCase().includes(word)
        ).length;

        // Boost score for content with important keywords
        if (importantWordCount > 0) {
            score += Math.min(0.2, importantWordCount * 0.05);
        }

        // Boost score for longer, more detailed content
        if (wordCount > 50) {
            score += Math.min(0.1, (wordCount - 50) * 0.001);
        }

        return Math.min(1.0, score);
    }

    /**
     * Extract keywords from text
     */
    private extractKeywords(text: string): string[] {
        // Simple keyword extraction - in production, you might use NLP libraries
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3);

        // Remove common stop words
        const stopWords = new Set(['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'their', 'would', 'could', 'should']);
        const filteredWords = words.filter(word => !stopWords.has(word));

        // Get word frequency
        const wordFreq = new Map<string, number>();
        filteredWords.forEach(word => {
            wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        });

        // Return top keywords
        return Array.from(wordFreq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);
    }

    /**
     * Split text into sentences with better handling
     */
    private splitIntoSentences(text: string): string[] {
        // Enhanced sentence splitting
        text = text.replace(/\s+/g, ' ').trim();

        // Split on various sentence boundaries
        const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z])|(?<=\n\n)|(?<=:)\s+(?=[A-Z])/);

        return sentences
            .map(s => s.trim())
            .filter(s => s.length > 15); // Filter very short sentences
    }

    /**
     * Estimate token count
     */
    private estimateTokenCount(text: string): number {
        // More accurate token estimation
        const words = text.split(/\s+/).length;
        const chars = text.length;

        // Average of word-based and char-based estimates
        const wordBasedEstimate = Math.ceil(words * 1.3);
        const charBasedEstimate = Math.ceil(chars / 4);

        return Math.ceil((wordBasedEstimate + charBasedEstimate) / 2);
    }

    /**
     * Create hierarchical chunks with enhanced metadata
     */
    createEnhancedHierarchicalChunks(
        title: string,
        description: string | null,
        content: any,
        metadata: Record<string, any>
    ): Array<{
        text: string;
        metadata: Record<string, any>;
        tokenCount: number;
        semanticType: EnhancedTextChunk['semanticType'];
        importance: number;
        keywords: string[];
    }> {
        const chunks: Array<{
            text: string;
            metadata: Record<string, any>;
            tokenCount: number;
            semanticType: EnhancedTextChunk['semanticType'];
            importance: number;
            keywords: string[];
        }> = [];

        // Enhanced title + description chunk
        const overviewText = [title, description].filter(Boolean).join('\n\n');
        if (overviewText.length > 0) {
            chunks.push({
                text: overviewText,
                metadata: { ...metadata, chunkType: 'overview' },
                tokenCount: this.estimateTokenCount(overviewText),
                semanticType: 'overview',
                importance: 0.9, // High importance for overview
                keywords: this.extractKeywords(overviewText)
            });
        }

        // Enhanced content chunks
        let contentText = '';
        if (typeof content === 'string') {
            contentText = content;
        } else if (Array.isArray(content)) {
            contentText = this.extractTextFromPlateContent(content);
        } else if (content && typeof content === 'object') {
            contentText = JSON.stringify(content);
        }

        if (contentText.length > 0) {
            const enhancedChunks = this.chunkTextSemantically(contentText);
            enhancedChunks.forEach((chunk, index) => {
                chunks.push({
                    text: chunk.text,
                    metadata: {
                        ...metadata,
                        chunkType: chunk.semanticType,
                        contentChunkIndex: index,
                        importance: chunk.importance
                    },
                    tokenCount: chunk.tokenCount,
                    semanticType: chunk.semanticType,
                    importance: chunk.importance,
                    keywords: chunk.keywords
                });
            });
        }

        return chunks;
    }

    /**
     * Extract text from Plate.js content with better structure preservation
     */
    private extractTextFromPlateContent(content: any[]): string {
        if (!Array.isArray(content)) return '';

        const extractText = (node: any, depth: number = 0): string => {
            if (typeof node === 'string') return node;
            if (node.text) return node.text;

            if (node.children && Array.isArray(node.children)) {
                const childText = node.children.map((child: any) => extractText(child, depth + 1)).join(' ');

                // Add structure markers based on node type
                if (node.type === 'h1' || node.type === 'h2' || node.type === 'h3') {
                    return `\n\n## ${childText}\n\n`;
                } else if (node.type === 'p') {
                    return `${childText}\n\n`;
                } else if (node.type === 'li') {
                    return `- ${childText}\n`;
                } else if (node.type === 'code_block') {
                    return `\n\`\`\`\n${childText}\n\`\`\`\n\n`;
                }

                return childText;
            }

            return '';
        };

        return content.map(node => extractText(node)).join('').trim();
    }
}
