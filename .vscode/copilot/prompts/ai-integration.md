# AI Feature Implementation

Context:

- File: {{file}}
- Selection: {{selection}}
- AI feature type: {{input:type|completion|analysis|generation|search}}

Requirements:

- Follow Vercel AI SDK patterns
- Add appropriate error handling and fallbacks
- Implement user-friendly UX for AI interactions
- Consider rate limiting and cost management
- Respect user privacy and data handling guidelines

Implementation guide:

1. Define clear AI feature boundaries and requirements
2. Design the user experience (input, processing, output)
3. Implement with appropriate client/server split
4. Add fallbacks and graceful degradation
5. Include comprehensive error handling

Security considerations:

- Validate and sanitize all user inputs
- Add rate limiting to prevent abuse
- Don't expose API keys in client-side code
- Use streaming for responsive UX during processing

Reference implementation:

- See `components/editor/ai-suggestions.tsx`
- See `lib/ai/generation-utils.ts`
