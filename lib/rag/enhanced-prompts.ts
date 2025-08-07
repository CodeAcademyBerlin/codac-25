import { ContentSource } from '@/types/rag';
import { QueryIntent } from './enhanced-retrieval';
import { ConversationContext } from './conversation-memory';

export interface PromptContext {
    userQuery: string;
    sources: ContentSource[];
    intent: QueryIntent;
    conversationContext: ConversationContext;
    userRole?: string;
}

export class EnhancedPromptGenerator {
    /**
     * Generate a dynamic system prompt based on context and intent
     */
    generateSystemPrompt(context: PromptContext): string {
        const basePrompt = this.getBasePrompt();
        const intentPrompt = this.getIntentSpecificPrompt(context.intent);
        const contextPrompt = this.getContextualPrompt(context);
        const rolePrompt = this.getRoleSpecificPrompt(context.userRole);

        return [basePrompt, intentPrompt, contextPrompt, rolePrompt]
            .filter(Boolean)
            .join('\n\n');
    }

    /**
     * Generate the user prompt with enhanced context
     */
    generateUserPrompt(context: PromptContext): string {
        const conversationSection = this.buildConversationSection(context.conversationContext);
        const sourcesSection = this.buildSourcesSection(context.sources);
        const querySection = this.buildQuerySection(context.userQuery, context.intent);

        return [conversationSection, sourcesSection, querySection]
            .filter(Boolean)
            .join('\n\n');
    }

    /**
     * Base system prompt
     */
    private getBasePrompt(): string {
        return `You are an expert AI tutor and learning assistant for Code Academy Berlin students. Your role is to provide helpful, accurate, and engaging responses about programming, web development, data science, and career development topics.

Core Responsibilities:
- Answer questions using the provided course materials and context
- Provide clear, step-by-step explanations when appropriate
- Encourage learning and critical thinking
- Cite specific sources when referencing course materials
- Adapt your communication style to the student's level and needs

Communication Style:
- Be encouraging and supportive
- Use clear, accessible language
- Break down complex concepts into digestible parts
- Provide practical examples when helpful
- Suggest next steps or related topics to explore`;
    }

    /**
     * Intent-specific prompt additions
     */
    private getIntentSpecificPrompt(intent: QueryIntent): string {
        switch (intent.type) {
            case 'overview':
                return `Current Query Intent: OVERVIEW REQUEST

Focus on:
- Providing a comprehensive but accessible overview
- Structuring information hierarchically (main concepts → details)
- Highlighting key learning objectives and outcomes
- Connecting topics to the broader curriculum
- Suggesting logical next steps for deeper learning`;

            case 'instruction':
                return `Current Query Intent: INSTRUCTION REQUEST

Focus on:
- Providing clear, step-by-step instructions
- Breaking down complex processes into manageable steps
- Including practical examples and code snippets when relevant
- Anticipating common mistakes and providing tips to avoid them
- Offering alternative approaches when appropriate`;

            case 'example':
                return `Current Query Intent: EXAMPLE REQUEST

Focus on:
- Providing concrete, practical examples
- Explaining the reasoning behind each example
- Showing multiple variations or approaches when helpful
- Connecting examples to broader concepts
- Encouraging hands-on practice and experimentation`;

            case 'explanation':
                return `Current Query Intent: EXPLANATION REQUEST

Focus on:
- Providing thorough conceptual explanations
- Using analogies and metaphors to clarify difficult concepts
- Explaining the "why" behind processes and best practices
- Connecting concepts to real-world applications
- Building understanding progressively from basics to advanced topics`;

            default:
                return `Current Query Intent: GENERAL QUESTION

Focus on:
- Understanding the specific need behind the question
- Providing balanced information covering multiple aspects
- Offering both theoretical understanding and practical application
- Encouraging follow-up questions for deeper exploration`;
        }
    }

    /**
     * Contextual prompt based on conversation and topics
     */
    private getContextualPrompt(context: PromptContext): string {
        let prompt = '';

        // Add conversation context
        if (context.conversationContext.followUpContext) {
            prompt += `Conversation Context: ${context.conversationContext.followUpContext}\n`;
        }

        // Add topic focus
        if (context.conversationContext.topics.length > 0) {
            prompt += `Relevant Topics: ${context.conversationContext.topics.slice(0, 5).join(', ')}\n`;
        }

        // Add user intent patterns
        if (context.conversationContext.userIntent.length > 0) {
            prompt += `User Learning Pattern: ${context.conversationContext.userIntent.join(', ')}\n`;
        }

        // Add semantic summary if available
        if (context.conversationContext.semanticSummary) {
            prompt += `Session Summary: ${context.conversationContext.semanticSummary}\n`;
        }

        if (prompt) {
            return `CONTEXTUAL INFORMATION:
${prompt}
Please consider this context when crafting your response to maintain continuity and relevance.`;
        }

        return '';
    }

    /**
     * Role-specific prompt additions
     */
    private getRoleSpecificPrompt(userRole?: string): string {
        switch (userRole?.toLowerCase()) {
            case 'student':
                return `Student Context:
- Assume the user is actively learning and may need foundational explanations
- Encourage experimentation and hands-on practice
- Provide learning resources and next steps
- Be patient with questions that might seem basic`;

            case 'alumni':
                return `Alumni Context:
- User has completed the program and may need advanced or career-focused guidance
- Focus on practical application and professional development
- Reference industry best practices and current trends
- Provide networking and career advancement tips when relevant`;

            case 'mentor':
                return `Mentor Context:
- User may be helping other students or seeking advanced technical knowledge
- Provide detailed explanations that can be shared with others
- Include teaching tips and common student misconceptions
- Focus on best practices and pedagogical approaches`;

            default:
                return '';
        }
    }

    /**
     * Build conversation section of the prompt
     */
    private buildConversationSection(context: ConversationContext): string {
        if (context.recentMessages.length === 0) {
            return '';
        }

        let section = 'RECENT CONVERSATION:\n';

        // Include recent relevant messages
        const relevantMessages = context.recentMessages.slice(-6); // Last 6 messages max

        for (const message of relevantMessages) {
            const role = message.role === 'user' ? 'Student' : 'Assistant';
            const content = message.content.length > 200
                ? message.content.substring(0, 200) + '...'
                : message.content;

            section += `${role}: ${content}\n`;
        }

        return section;
    }

    /**
     * Build sources section of the prompt
     */
    private buildSourcesSection(sources: ContentSource[]): string {
        if (sources.length === 0) {
            return `AVAILABLE CONTEXT:
No specific course materials found for this query. Please provide general guidance based on your knowledge of programming and web development best practices.`;
        }

        let section = 'RELEVANT COURSE MATERIALS:\n\n';

        sources.forEach((source, index) => {
            const sourceNumber = index + 1;
            const metadata = source.metadata || {};

            // Build hierarchical context
            let hierarchy = '';
            if (metadata.courseName) hierarchy += `Course: ${metadata.courseName}`;
            if (metadata.projectName) hierarchy += ` > Project: ${metadata.projectName}`;
            if (metadata.lessonName) hierarchy += ` > Lesson: ${metadata.lessonName}`;
            if (metadata.assignmentName) hierarchy += ` > Assignment: ${metadata.assignmentName}`;

            section += `[Source ${sourceNumber}] ${hierarchy || `${source.contentType} content`}\n`;
            section += `Content Type: ${source.contentType}`;

            if (metadata.chunkType) {
                section += ` (${metadata.chunkType})`;
            }

            section += `\nContent: ${source.chunkText}\n\n`;
        });

        section += `RESPONSE GUIDELINES:
- Reference sources by number when citing information (e.g., "According to Source 1...")
- If multiple sources provide different perspectives, acknowledge this
- If the query cannot be fully answered with the provided materials, clearly state what additional information would be helpful`;

        return section;
    }

    /**
     * Build query section of the prompt
     */
    private buildQuerySection(userQuery: string, intent: QueryIntent): string {
        let section = `CURRENT QUESTION: ${userQuery}\n`;

        // Add intent information
        section += `Query Type: ${intent.type.toUpperCase()} (confidence: ${Math.round(intent.confidence * 100)}%)\n`;

        if (intent.keywords.length > 0) {
            section += `Key Terms: ${intent.keywords.slice(0, 8).join(', ')}\n`;
        }

        if (intent.topics.length > 0) {
            section += `Related Topics: ${intent.topics.join(', ')}\n`;
        }

        // Add response instructions based on intent
        section += '\nRESPONSE INSTRUCTIONS:\n';

        switch (intent.type) {
            case 'overview':
                section += '- Provide a structured overview with clear sections\n';
                section += '- Start with the big picture, then dive into details\n';
                section += '- Include learning objectives and key takeaways\n';
                break;

            case 'instruction':
                section += '- Provide step-by-step instructions\n';
                section += '- Number the steps clearly\n';
                section += '- Include code examples or practical demonstrations\n';
                section += '- Mention common pitfalls and how to avoid them\n';
                break;

            case 'example':
                section += '- Provide concrete, practical examples\n';
                section += '- Explain the reasoning behind each example\n';
                section += '- Show variations or alternative approaches\n';
                section += '- Encourage hands-on practice\n';
                break;

            case 'explanation':
                section += '- Explain concepts thoroughly but clearly\n';
                section += '- Use analogies or metaphors when helpful\n';
                section += '- Connect to broader concepts and applications\n';
                section += '- Build understanding progressively\n';
                break;

            default:
                section += '- Provide a comprehensive and helpful response\n';
                section += '- Address the specific question asked\n';
                section += '- Offer additional context when relevant\n';
        }

        section += '- End with suggested next steps or follow-up questions\n';
        section += '- Maintain an encouraging and supportive tone\n';

        return section;
    }

    /**
     * Generate follow-up suggestion prompt
     */
    generateFollowUpPrompt(sources: ContentSource[], currentQuery: string, intent: QueryIntent): string {
        const contextSummary = sources.slice(0, 3).map(s => {
            const metadata = s.metadata || {};
            const context = metadata.courseName || metadata.lessonName || s.contentType;
            return `${context}: ${s.chunkText.substring(0, 100)}...`;
        }).join('\n');

        return `Based on this educational content and the student's ${intent.type} question "${currentQuery}", suggest 3 relevant follow-up questions that would help deepen their understanding.

Content Context:
${contextSummary}

Generate questions that:
- Build upon the current topic naturally
- Encourage deeper exploration of the subject
- Are appropriate for a student learning this material
- Use clear, engaging language

Format: Return only the questions, one per line, without numbering.`;
    }
}
