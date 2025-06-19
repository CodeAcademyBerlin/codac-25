# Export Docs to Markdown

This guide explains how to export documents from your app's database back to markdown files, recreating the original folder structure.

## Overview

The export script allows you to:

- Convert PlateJS documents back to markdown format
- Recreate the hierarchical folder structure
- Include metadata in frontmatter
- Filter exports by author or document type
- Sync changes made in the editor back to files

## Usage

### Basic Export (All Documents)

```bash
# Export all documents to ./exported-content
pnpm export:docs

# Or specify a custom directory
npx tsx scripts/export-docs-to-markdown.ts ./my-export-folder
```

### Export Options

#### Export Only LMS Content

```bash
# Export only the imported LMS content
npx tsx scripts/export-docs-to-markdown.ts ./lms-backup --lms-only
```

#### Include Metadata

```bash
# Include export metadata in frontmatter
npx tsx scripts/export-docs-to-markdown.ts ./exports --metadata
```

#### Combined Options

```bash
# Export LMS content with metadata to a specific folder
npx tsx scripts/export-docs-to-markdown.ts ./lms-with-metadata --lms-only --metadata
```

## Command Line Arguments

| Argument      | Description                            | Default              |
| ------------- | -------------------------------------- | -------------------- |
| `[directory]` | Output directory path                  | `./exported-content` |
| `--lms-only`  | Export only LMS imported content       | Export all           |
| `--metadata`  | Include export metadata in frontmatter | No metadata          |

## Output Structure

The script recreates the original folder hierarchy:

```
exported-content/
├── lms-content/
│   ├── career/
│   │   ├── step-1/
│   │   │   ├── choose-your-destiny.md
│   │   │   ├── goal-setting.md
│   │   │   └── ...
│   │   ├── step-2/
│   │   └── step-3/
│   ├── data/
│   │   ├── module-1/
│   │   │   ├── project-1/
│   │   │   └── project-2/
│   │   └── module-2/
│   └── web/
│       ├── module-1/
│       ├── module-2/
│       └── module-3/
├── welcome.md
└── lms-guideline.md
```

## Frontmatter Format

### Basic Export

```yaml
---
title: "Document Title"
---
```

### With Metadata

```yaml
---
title: "Document Title"
exportedAt: "2024-01-15T10:30:00.000Z"
originalId: "cmc27ph9g00017zogk4pmue6p"
createdAt: "2024-01-15T09:00:00.000Z"
updatedAt: "2024-01-15T10:25:00.000Z"
---
```

## Use Cases

### 1. **Backup Content**

Export all documents as a backup:

```bash
pnpm export:docs ./backup-$(date +%Y%m%d)
```

### 2. **Sync Edited Content**

Export LMS content after editing:

```bash
npx tsx scripts/export-docs-to-markdown.ts ./content-updated --lms-only
```

### 3. **Version Control**

Export for version control with metadata:

```bash
npx tsx scripts/export-docs-to-markdown.ts ./repo/content --metadata
```

### 4. **Content Migration**

Export to migrate to another system:

```bash
npx tsx scripts/export-docs-to-markdown.ts ./migration-export
```

## Features

- **Folder Structure**: Preserves hierarchical organization
- **Content Conversion**: PlateJS → Markdown using official plugins
- **Filename Sanitization**: Safe filenames for all operating systems
- **Metadata Preservation**: Optional export metadata in frontmatter
- **Selective Export**: Filter by author or document type
- **Progress Logging**: Detailed console output during export

## Technical Details

### Content Conversion

- Uses PlateJS `MarkdownPlugin.serialize()` for accurate conversion
- Preserves formatting, links, images, and other rich content
- Handles code blocks, tables, and other complex elements

### File Naming

- Titles are sanitized for safe filenames
- Invalid characters replaced with hyphens
- Consistent lowercase naming

### Error Handling

- Graceful handling of conversion errors
- Detailed error messages for troubleshooting
- Partial exports continue even if individual files fail

## Troubleshooting

### Common Issues

#### Empty Export

- Check if documents exist in database
- Verify author filter is correct
- Ensure database connection is working

#### Conversion Errors

- Some rich content may not convert perfectly
- Check console for specific conversion warnings
- Manual review of complex documents may be needed

#### Permission Errors

- Ensure write permissions for output directory
- Check disk space availability
- Verify directory path is valid

## Integration with Git

For version control integration:

```bash
# Export to your content directory
npx tsx scripts/export-docs-to-markdown.ts ./content --lms-only

# Add to git
git add content/
git commit -m "Export updated LMS content from editor"
```

This allows you to track changes made in the PlateJS editor using standard git workflows.
