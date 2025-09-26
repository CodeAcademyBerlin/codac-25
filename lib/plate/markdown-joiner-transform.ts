/**
 * Transform function to join markdown content
 */
export function markdownJoinerTransform(content: string[]): string {
  return content
    .filter(Boolean)
    .join('\n\n');
}