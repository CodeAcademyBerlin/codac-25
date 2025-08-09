# Claude Code Setup Guide

This guide will help you configure Claude Code to work with your project using the rules and MCP servers from your Cursor setup.

## 1. Claude Rules Configuration

The project rules have been created in `CLAUDE.md` at the root of your project. This file contains all the coding standards, best practices, and project-specific guidelines that Claude Code will follow when working on your project.

### What's Included in CLAUDE.md:
- **General Principles**: TypeScript, Next.js, React, Shadcn/UI, Tailwind best practices
- **TypeScript Standards**: Prefer types over interfaces, proper generic usage, error handling
- **Next.js Best Practices**: RSC usage, server actions, performance optimization
- **UI and Styling**: Shadcn/UI, Tailwind CSS, responsive design patterns
- **Code Organization**: Project structure, naming conventions, component organization
- **Error Handling**: ServerActionResult pattern, proper error logging
- **Data Management**: Prisma ORM patterns, database operations
- **Security Guidelines**: Input validation, authentication, secure practices
- **Performance Optimization**: Loading states, caching, memoization
- **Layout System**: Unified layout components for consistency

## 2. MCP Server Configuration

### Option A: Global Configuration
Create the MCP configuration file in your Claude Code settings directory:

**Windows:**
```
%APPDATA%\claude-code\mcp.json
```

**macOS:**
```
~/Library/Application Support/claude-code/mcp.json
```

**Linux:**
```
~/.config/claude-code/mcp.json
```

### Option B: Project-Specific Configuration
You can also configure MCP servers per project by copying the `claude-mcp.json` file to your Claude Code settings.

### MCP Configuration Content:
Copy the content from `claude-mcp.json` in this project:

```json
{
  "mcpServers": {
    "shadcn-ui-server": {
      "command": "npx",
      "args": ["-y", "shadcn-ui-mcp-server"]
    },
    "plate": {
      "description": "Plate editors, plugins, components, and docs",
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "shadcn@canary", "registry:mcp"],
      "env": {
        "REGISTRY_URL": "https://platejs.org/r/registry.json"
      }
    }
  }
}
```

## 3. MCP Servers Explained

### Shadcn UI Server
- **Purpose**: Provides access to shadcn/ui components, documentation, and best practices
- **Features**: Component installation, customization, theming support
- **Usage**: Claude can help install and configure shadcn/ui components properly

### Plate Server
- **Purpose**: Specialized support for Plate.js editor components
- **Features**: Access to Plate.js plugins, components, and documentation
- **Usage**: Enhanced assistance with rich text editor development using Plate.js

## 4. Verification Steps

After setting up the configuration:

1. **Restart Claude Code** to load the new MCP servers
2. **Open your project** in Claude Code
3. **Verify Rules Loading**: Claude should automatically use the rules from `CLAUDE.md`
4. **Test MCP Servers**: Ask Claude to help with shadcn/ui or Plate.js components
5. **Check Integration**: Claude should follow your project patterns and use the layout system

## 5. Usage Examples

### Using the Layout System
```typescript
// Claude will suggest using the unified layout components
import { PageContainer, PageHeader, Section, Grid } from "@/components/layout";

export default function MyPage() {
  return (
    <PageContainer>
      <PageHeader title="My Page" description="Page description" />
      <Section>
        <Grid cols="3">
          {/* Content */}
        </Grid>
      </Section>
    </PageContainer>
  );
}
```

### Following Error Handling Patterns
```typescript
// Claude will follow the established ServerActionResult pattern
import { ServerActionResult } from "@/lib/server-action-utils";

export async function myServerAction(): Promise<ServerActionResult<User>> {
  try {
    // Implementation
    return { success: true, data: user };
  } catch (error) {
    return handleServerActionError(error, "Failed to create user");
  }
}
```

## 6. Troubleshooting

### MCP Servers Not Loading
1. Check the MCP configuration file path
2. Ensure Node.js and npm are installed
3. Verify internet connection for downloading MCP servers
4. Check Claude Code logs for error messages

### Rules Not Being Applied
1. Ensure `CLAUDE.md` is in the project root
2. Restart Claude Code after adding the file
3. Check that the file format is correct (Markdown with proper structure)

### Project-Specific Issues
1. Ensure all dependencies are installed (`npm install` or `pnpm install`)
2. Check that TypeScript configuration is correct
3. Verify database connection (for Prisma operations)
4. Ensure environment variables are properly set

## 7. Additional Configuration

### Environment Variables
Make sure your `.env` file includes all necessary variables:
```
DATABASE_URL="your-database-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
```

### Package Scripts
The following scripts are available and Claude will use them when appropriate:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run ts:check` - TypeScript type checking
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push database schema

## 8. Next Steps

1. **Test the Configuration**: Ask Claude to help with a simple component or feature
2. **Verify Rule Compliance**: Check that generated code follows your established patterns
3. **Use MCP Features**: Try asking for shadcn/ui component help or Plate.js assistance
4. **Iterate and Improve**: Adjust rules in `CLAUDE.md` as needed for your project

Your Claude Code setup is now configured to match your Cursor environment with all the same rules, patterns, and tooling support!