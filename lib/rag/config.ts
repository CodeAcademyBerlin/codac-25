import { RAGConfig } from '@/types/rag';

export const RAG_CONFIG: RAGConfig = {
    embeddingProvider: (process.env.EMBEDDING_PROVIDER as 'local' | 'gemini') || 'gemini',
    vectorDimensions: 768,
    chunkSize: 800, // tokens
    chunkOverlap: 100, // tokens
    maxRetrievalResults: 5,
    similarityThreshold: 0.7
};

export const CONTENT_TYPE_PRIORITIES = {
    lesson: 1.0,
    assignment: 0.9,
    project: 0.8,
    course: 0.7,
    resource: 0.6
} as const;

export const SYSTEM_PROMPTS = {
    rag: `You are a helpful AI assistant for students learning through an LMS platform. 
Your role is to answer questions about course content, lessons, assignments, and learning materials.

Guidelines:
- Always base your answers on the provided context from the course materials
- If you don't have enough information in the context, say so clearly
- Provide specific references to lessons, courses, or assignments when relevant
- Be encouraging and supportive in your responses
- Break down complex topics into digestible explanations
- Suggest related topics or next steps when appropriate

Context will be provided from the following sources:
- Course descriptions and overviews
- Lesson content and materials
- Assignment instructions and requirements
- Project descriptions and resources

Always cite your sources by mentioning the specific lesson, course, or assignment you're referencing.`,

    noContext: `I don't have enough information in the course materials to answer that question accurately. 
Could you please:
1. Rephrase your question to be more specific
2. Ask about content from a particular course or lesson
3. Check if you're looking for information that might be in a different section of the platform

I'm here to help with questions about your coursework and learning materials!`
} as const;
