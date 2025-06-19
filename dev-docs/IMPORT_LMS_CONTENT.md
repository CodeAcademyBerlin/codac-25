# LMS Content Import Script

This script imports content from the `content/` directory into the database following the new schema mapping:

- **Root directories** (web, data, career) → **Courses**
- **Direct subdirectories** (Module-1, Module-2, etc.) → **Projects**
- **Markdown files** → **Lessons**
- **Static assets** → uploadthing bucket (planned)

## Prerequisites

1. **Regenerate Prisma Client** (required for new models):

   ```bash
   npx prisma generate
   ```

2. **Apply Database Schema**:

   ```bash
   npx prisma db push
   ```

3. **Test the import structure** (optional but recommended):
   ```bash
   npx tsx scripts/test-lms-import.ts
   ```

## Running the Import

```bash
npx tsx scripts/import-lms-content.ts
```

## What Gets Imported

Based on the current `content/` directory structure:

- **3 Courses**: career, data, web
- **9 Projects**: Step-1, Step-2, Step-3, Module-1, Module-2, Module-3, etc.
- **34 Lessons**: All markdown files

## Content Structure Mapping

### Current Structure:

```
content/
├── career/           → Course: Career Development
│   ├── Step-1/      → Project: Step 1
│   │   ├── Chapter-1.md → Lesson: Chapter 1
│   │   └── ...
│   └── career.md    → Standalone lesson in "General Lessons" project
├── data/            → Course: Data Science
│   ├── Module-1/    → Project: Module 1
│   │   ├── Project-1.md → Lesson: Project 1
│   │   └── ...
│   └── data.md      → Standalone lesson in "General Lessons" project
└── web/             → Course: Web Development
    ├── Module-1/    → Project: Module 1
    │   ├── Project-1.md → Lesson: Project 1
    │   └── ...
    └── web.md       → Standalone lesson in "General Lessons" project
```

## Features

- **Automatic ordering**: Extracts order from filenames (Module-1, Project-2, Sprint-3, etc.)
- **Frontmatter support**: Uses `order` field from markdown frontmatter if available
- **Course categorization**: Maps directory names to course categories
- **Lesson type detection**: Automatically detects lesson types based on content
- **Error handling**: Robust error handling with detailed logging
- **Markdown conversion**: Converts markdown to PlateJS format for rich editing

## Course Categories

- `web` → WEB_DEVELOPMENT
- `data` → DATA_SCIENCE
- `career` → CAREER_DEVELOPMENT
- `ux` → UX_UI_DESIGN
- `marketing` → DIGITAL_MARKETING

## Lesson Types

Automatically detected based on content:

- **VIDEO**: Contains "video" or "youtube"
- **QUIZ**: Contains "quiz" or "question"
- **EXERCISE**: Contains "exercise" or "practice"
- **TEXT**: Default type

## Static Assets (Planned)

The script will eventually handle static assets by:

1. Reading all files in `assets/` directories
2. Uploading files to uploadthing using the configured file router
3. Storing uploaded URLs for reference in lessons/projects
4. Updating markdown content to reference uploaded asset URLs

## Database Schema

The import creates records in these tables:

- `courses` - Top-level course information
- `projects` - Projects within courses
- `lessons` - Individual lessons within projects
- `users` - Creates an `lms-import` admin user if needed

## Troubleshooting

### "Course model not found" Error

Run the prerequisite commands to regenerate the Prisma client:

```bash
npx prisma generate
npx prisma db push
```

### Permission Errors on Windows

If you get EPERM errors during `prisma generate`, try:

1. Close your IDE/editor
2. Run the command from a fresh terminal
3. Or restart your development server

### Order Issues

If items appear in wrong order:

- Add `order: <number>` to the frontmatter of markdown files
- Or rename files to include numbers (e.g., `01-intro.md`, `02-basics.md`)
