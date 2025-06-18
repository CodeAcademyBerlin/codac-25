# Import LMS Content to Docs System

This guide will help you import the LMS content from the `/content` folder into your app's `/docs` system so it can be edited with the PlateJS editor.

## Overview

The import script will:

1. Read all markdown files from the `/content` folder
2. Parse frontmatter metadata from each file
3. Convert markdown content to PlateJS format
4. Create a hierarchical folder structure in the docs system
5. Maintain the original course organization

## Prerequisites

Make sure you have the required dependencies:

```bash
pnpm add gray-matter
```

## Running the Import

1. **Create the import user** (if not exists):
   The script will automatically create an `lms-import` user for authoring the imported content.

2. **Run the import script**:

   ```bash
   tsx scripts/import-lms-content.ts
   ```

3. **Access the imported content**:
   Navigate to `/docs` in your app to see the imported LMS content organized under "LMS Content" folder.

## What Gets Imported

### Structure

- **Root folder**: `LMS Content` (created automatically)
- **Course folders**: `career`, `data`, `web`, etc.
- **Module folders**: `Module-1`, `Module-2`, etc.
- **Project folders**: `Project-1`, `Project-2`, etc.
- **Lesson files**: All `.md` files converted to editable documents

### Content Processing

- **Frontmatter**: Title, order, access, and other metadata are parsed
- **Markdown**: Converted to PlateJS-compatible format
- **Assets**: Referenced but not imported (manual copy needed)
- **Links**: Internal links may need adjustment after import

## Post-Import Steps

1. **Review imported content**: Check that all content imported correctly
2. **Fix internal links**: Update any broken internal references
3. **Import assets**: Manually copy assets folder to public directory if needed
4. **Test editor functionality**: Ensure PlateJS editor works with imported content
5. **Set permissions**: Configure document permissions as needed

## Troubleshooting

### Common Issues

- **Import errors**: Check that all markdown files have valid frontmatter
- **Missing content**: Verify PlateJS markdown plugin is properly configured
- **Permission errors**: Ensure database is accessible and writable

### Manual Fixes

If some content doesn't import correctly, you can:

1. Edit documents directly in the `/docs` interface
2. Re-run the import for specific files
3. Use the markdown import feature in the editor toolbar

## File Organization After Import

```
LMS Content/
├── career/
│   ├── career.md → "Welcome to the Career Services"
│   ├── Step-1/
│   │   ├── Step-1.md → "Step 1"
│   │   └── [chapters...]
│   └── [other steps...]
├── data/
│   ├── data.md → "Data Science Course"
│   ├── Machine-Learning-Fundamentals.md
│   ├── Module-1/
│   │   ├── Module-1.md
│   │   └── [projects...]
│   └── [other modules...]
├── web/
│   ├── web.md → "Web Development Course"
│   ├── Module-1/
│   │   ├── Module-1.md
│   │   └── [projects...]
│   └── [other modules...]
├── welcome.md → "Hello World!"
└── guidelines.md → "Guidelines"
```

The imported content will be fully editable using the PlateJS editor while maintaining the original LMS structure and content.
