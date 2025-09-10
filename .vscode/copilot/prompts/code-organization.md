# Code Organization

- Structure files logically, group related code
- Prefer named exports for components
- Favor small, single-purpose components
- Separate presentational/container components
- Use kebab-case for files, PascalCase for components

## Project Structure

- /actions: server mutations
- /app: Next.js App Router
- /components: UI components by feature
- /data: queries
- /hooks: custom hooks
- /lib: shared utils
- /public: static assets
- /schemas: validation
- /types: types
- /prisma: schema/migrations

## Component Organization

- Group by feature
- Use index files for imports
- Co-locate related files when beneficial
