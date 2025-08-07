import { logger } from '@/lib/logger';

export interface GeminiResponse {
    text: string;
    usage?: {
        totalTokens: number;
    };
}

export class DirectGeminiProvider {
    private apiKey: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
        if (!this.apiKey) {
            throw new Error('Gemini API key is required');
        }
    }

    async generateText(messages: Array<{ role: string; content: string }>, options: {
        maxTokens?: number;
        temperature?: number;
    } = {}): Promise<GeminiResponse> {
        try {
            // Convert messages to Gemini format
            const systemMessage = messages.find(m => m.role === 'system')?.content || '';
            const userMessage = messages.find(m => m.role === 'user')?.content || '';

            // Combine system and user messages
            const fullPrompt = systemMessage ? `${systemMessage}\n\n${userMessage}` : userMessage;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: fullPrompt
                            }]
                        }],
                        generationConfig: {
                            maxOutputTokens: options.maxTokens || 1000,
                            temperature: options.temperature || 0.7
                        }
                    })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                logger.error('Gemini API error:', new Error(`${response.status} ${response.statusText}: ${errorText}`));
                throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                logger.error('Invalid Gemini API response:', data);
                throw new Error('Invalid response from Gemini API');
            }

            const text = data.candidates[0].content.parts[0].text || '';
            const tokenCount = data.usageMetadata?.totalTokenCount || 0;

            return {
                text,
                usage: {
                    totalTokens: tokenCount
                }
            };

        } catch (error) {
            logger.error('Error in DirectGeminiProvider:', error instanceof Error ? error : undefined);
            throw error;
        }
    }

    async *streamText(messages: Array<{ role: string; content: string }>, options: {
        maxTokens?: number;
        temperature?: number;
    } = {}): AsyncGenerator<string> {
        // For now, we'll simulate streaming by yielding the full response in chunks
        // In a production setup, you'd use the streaming API
        const result = await this.generateText(messages, options);

        // Split response into words and yield them progressively
        const words = result.text.split(' ');
        for (let i = 0; i < words.length; i += 3) {
            const chunk = words.slice(i, i + 3).join(' ') + ' ';
            yield chunk;
            // Small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
}
