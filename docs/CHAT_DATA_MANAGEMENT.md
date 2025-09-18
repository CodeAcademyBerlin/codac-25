# Chat Data Management

This document explains how to export and import chat data for database reinitialization and backup purposes.

## Overview

The chat data management system provides tools to:

- Export existing chat conversations, participants, and messages to JSON files
- Import chat data from JSON files to restore or seed the database
- Maintain data consistency during database reinitialization

## Export Chat Data

### Usage

```bash
# Export current chat data to JSON files
pnpm tsx scripts/export-chat-data.ts
```

### Output Files

The export script creates two files in `prisma/seed/data/`:

1. **`chat-data.json`** - Complete export including:

   - All conversations with metadata
   - All conversation participants with roles and timestamps
   - Chat messages (limited to last 1000 for file size management)
   - Export metadata (timestamp, counts)

2. **`chat-data-summary.json`** - Summary statistics including:
   - Export timestamp
   - Total counts for conversations, participants, and messages
   - Conversation types breakdown (GROUP, DIRECT, CHANNEL)
   - Message distribution per conversation

## Import Chat Data

### Usage

```bash
# Interactive seed manager
pnpm tsx prisma/seed/seed.ts

# Select option 7: Chat Data
# Or use 'a' to seed all data (includes chat data)
```

## Best Practices

1. **Regular Exports**: Export chat data regularly, especially before major changes
2. **Version Control**: Commit exported JSON files to track data evolution
3. **User Dependencies**: Ensure users exist before importing chat data
4. **Message Limits**: Export script limits to 1000 recent messages for performance

## File Locations

- **Export Script**: `scripts/export-chat-data.ts`
- **Import Seeder**: `prisma/seed/seeders/chat.ts`
- **Data Files**: `prisma/seed/data/chat-data.json`
- **Summary**: `prisma/seed/data/chat-data-summary.json`
