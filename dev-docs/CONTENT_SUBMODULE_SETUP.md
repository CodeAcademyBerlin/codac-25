# Content Submodule Setup Guide

This guide explains how to set up and manage the content submodule for the CODAC LMS platform.

## Overview

The content submodule contains all the course materials, lessons, and projects that are imported into the LMS. This approach provides several benefits:

- **Separation of Concerns**: Content is managed independently from the application code
- **Version Control**: Track content changes separately from application changes
- **Collaboration**: Multiple content authors can work without affecting the main codebase
- **Easy Updates**: Pull latest content without redeploying the application

## Quick Setup

### 1. Check Current Status

```bash
pnpm content:status
```

This will tell you if the content submodule is properly configured.

### 2. Set Up the Submodule (First Time)

```bash
pnpm content:setup
```

This command will:
- Add the content submodule if it doesn't exist
- Initialize the submodule
- Update to the latest content

### 3. Update Content

```bash
pnpm content:update
```

This pulls the latest content from the remote repository.

## Manual Setup

If the automated scripts don't work, you can set up the submodule manually:

```bash
# Add the submodule
git submodule add https://github.com/CodeAcademyBerlin/content.git content

# Initialize and update
git submodule update --init --recursive
```

## Content Structure

The content submodule follows this structure:

```
content/
├── web/                  # Web development courses
│   ├── Module-1/        # Course modules
│   ├── Module-2/
│   └── web.md           # Course overview
├── data/                 # Data science courses
│   ├── Module-1/
│   ├── Module-2/
│   └── data.md          # Course overview
├── career/               # Career development
│   ├── career.md        # Career content
│   └── resources/       # Career resources
├── assets/               # Images and media files
│   ├── images/
│   └── videos/
└── *.md                 # General content files
```

## Importing Content

The LMS content is automatically imported when you run:

```bash
pnpm db:seed:lms
```

This process:

1. **Validates the submodule**: Checks that the content submodule exists and is properly configured
2. **Reads markdown files**: Processes all `.md` files in the content directory
3. **Converts to Plate.js**: Transforms markdown content to the Plate.js format used by the editor
4. **Creates database records**: Generates courses, projects, and lessons in the database
5. **Maintains hierarchy**: Preserves the folder structure and ordering

## Troubleshooting

### Submodule Not Found

If you get an error about the content submodule not being found:

```bash
# Check if the submodule is properly registered
git submodule status

# If not registered, add it
git submodule add https://github.com/CodeAcademyBerlin/content.git content
git submodule update --init --recursive
```

### Content Not Updating

If content changes aren't appearing:

```bash
# Update the submodule to latest
git submodule update --remote --merge

# Re-seed the database
pnpm db:seed:lms
```

### Permission Issues

If you get permission errors:

```bash
# Check your git configuration
git config --list | grep user

# Set up your git credentials if needed
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Development Workflow

### For Content Authors

1. Clone the content repository separately:
   ```bash
   git clone https://github.com/CodeAcademyBerlin/content.git
   cd content
   ```

2. Make your content changes
3. Commit and push your changes
4. Update the submodule in the main project:
   ```bash
   cd /path/to/codac-25
   pnpm content:update
   pnpm db:seed:lms
   ```

### For Application Developers

1. When you pull the main repository, also update submodules:
   ```bash
   git pull
   git submodule update --init --recursive
   ```

2. After content updates, re-seed the database:
   ```bash
   pnpm db:seed:lms
   ```

## Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm content:status` | Check submodule status |
| `pnpm content:setup` | Set up submodule (first time) |
| `pnpm content:update` | Update to latest content |
| `pnpm db:seed:lms` | Import content to database |
| `pnpm db:seed:clean` | Clean imported content |

## Advanced Configuration

### Custom Content Repository

If you want to use a different content repository:

1. Remove the existing submodule:
   ```bash
   git submodule deinit content
   git rm content
   rm -rf .git/modules/content
   ```

2. Add your custom repository:
   ```bash
   git submodule add <your-repo-url> content
   git submodule update --init --recursive
   ```

### Local Content Development

For local content development without affecting the main repository:

```bash
# Create a local branch in the content submodule
cd content
git checkout -b local-content
# Make your changes
git add .
git commit -m "Local content changes"
```

## Best Practices

1. **Always check submodule status** before seeding
2. **Update content regularly** to get the latest materials
3. **Test content imports** in development before production
4. **Backup content** before major changes
5. **Use meaningful commit messages** when updating content

## Support

If you encounter issues:

1. Check this documentation
2. Review the main README.md
3. Check the content repository for specific content issues
4. Open an issue in the main repository for application-related problems
