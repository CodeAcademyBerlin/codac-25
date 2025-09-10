# Accessibility Review & Enhancement

Context:

- File: {{file}}
- Component: {{selection}}

Requirements:

- Meet WCAG 2.1 AA standards
- Support keyboard navigation
- Work with screen readers
- Handle color contrast requirements
- Provide appropriate aria attributes

Check these accessibility concerns:

1. Semantic HTML (use proper heading levels, lists, etc.)
2. Keyboard navigation and focus management
3. ARIA roles, states, and properties
4. Text alternatives for non-text content
5. Color contrast ratios (minimum 4.5:1 for normal text)
6. Form labels and error messages
7. Responsive behavior at various zoom levels

Reference:

- Use radix-ui primitives for complex interactive components
- Ensure sufficient color contrast with Tailwind's text-\* classes
- Add skip links for keyboard users
- Test with screen readers and keyboard-only navigation
