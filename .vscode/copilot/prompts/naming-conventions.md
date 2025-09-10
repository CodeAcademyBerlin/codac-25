# Naming Conventions

- PascalCase for components/types
- camelCase for variables/functions
- kebab-case for files/dirs
- UPPERCASE for env/constants
- No magic numbers; use named constants
- Function names start with verbs

## Examples

- Components: UserProfile (PascalCase)
- Files: user-profile.tsx (kebab-case)
- Hooks: useUserProfile (camelCase)
- Server actions: createUser (camelCase), create-user.ts (kebab-case)
- Types: UserProfile, ServerActionResult (PascalCase)
- Vars: isLoading, hasError (camelCase)
- Consts: MAX_FILE_SIZE (UPPERCASE)
- Prisma: snake_case DB, camelCase client
